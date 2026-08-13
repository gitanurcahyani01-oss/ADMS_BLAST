import prisma from '../prisma.js';
import { logAudit } from '../utils/auditLogger.js';

export const REFERRAL_RATES = {
  bulanan: {
    planName: 'Paket 1 Bulan',
    originalPrice: 99000,
    buyerDiscount: 10000,
    finalPrice: 89000,
    commissionAmount: 20000,
  },
  '3bulan': {
    planName: 'Paket 3 Bulan',
    originalPrice: 299000,
    buyerDiscount: 25000,
    finalPrice: 274000,
    commissionAmount: 50000,
  },
  '1tahun': {
    planName: 'Paket 1 Tahun',
    originalPrice: 888000,
    buyerDiscount: 50000,
    finalPrice: 838000,
    commissionAmount: 150000,
  },
};

/**
 * GET /api/referrals/validate/:code?planCode=...
 * Validate referral code and calculate discount
 */
export const validateReferralCode = async (req, res) => {
  try {
    const rawCode = req.params.code?.trim().toUpperCase();
    const planCode = (req.query.planCode || 'bulanan').toLowerCase();

    if (!rawCode) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Kode referral wajib diisi.',
      });
    }

    const referrer = await prisma.user.findUnique({
      where: { referralCode: rawCode },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        referralCode: true,
      },
    });

    if (!referrer || referrer.status === 'REVOKED') {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Kode referral tidak ditemukan atau tidak aktif.',
      });
    }

    const rate = REFERRAL_RATES[planCode] || REFERRAL_RATES.bulanan;

    return res.json({
      success: true,
      valid: true,
      data: {
        referralCode: referrer.referralCode,
        referrerName: referrer.name,
        planCode,
        planName: rate.planName,
        originalPrice: rate.originalPrice,
        buyerDiscount: rate.buyerDiscount,
        finalPrice: rate.finalPrice,
        discountFormatted: `-Rp ${rate.buyerDiscount.toLocaleString('id-ID')}`,
        finalPriceFormatted: `Rp ${rate.finalPrice.toLocaleString('id-ID')}`,
      },
    });
  } catch (error) {
    console.error('Error validating referral code:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memvalidasi kode referral.',
      error: error.message,
    });
  }
};

/**
 * GET /api/referrals/me
 * Get current user's referral stats, wallet balance, and payout history
 */
export const getReferralStats = async (req, res) => {
  try {
    const userId = req.user.id;

    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        walletBalance: true,
      },
    });

    // Ensure referral code exists
    if (!user.referralCode) {
      const cleanName = user.name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'USER';
      const code = `${cleanName}${Math.floor(1000 + Math.random() * 9000)}`;
      user = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
        select: {
          id: true,
          name: true,
          email: true,
          referralCode: true,
          walletBalance: true,
        },
      });
    }

    // Fetch rewards list
    const rewards = await prisma.referralReward.findMany({
      where: { referrerId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        referredUser: {
          select: {
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    // Fetch payout requests
    const payouts = await prisma.payoutRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    const totalInvited = rewards.length;
    const successfulReferrals = rewards.filter((r) => r.status === 'APPROVED' || r.status === 'PAID').length;
    const totalEarned = rewards
      .filter((r) => r.status === 'APPROVED' || r.status === 'PAID')
      .reduce((sum, r) => sum + r.commissionAmount, 0);

    return res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: `http://localhost:5173/harga?ref=${user.referralCode}`,
        walletBalance: user.walletBalance || 0,
        walletBalanceFormatted: `Rp ${(user.walletBalance || 0).toLocaleString('id-ID')}`,
        stats: {
          totalInvited,
          successfulReferrals,
          totalEarned,
          totalEarnedFormatted: `Rp ${totalEarned.toLocaleString('id-ID')}`,
        },
        rewards,
        payouts,
      },
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data afiliasi.',
      error: error.message,
    });
  }
};

/**
 * POST /api/referrals/payout
 * Request commission payout to bank/e-wallet
 */
export const requestPayout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { amount, bankName, accountNumber, accountHolder } = req.body;

    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount < 50000) {
      return res.status(400).json({
        success: false,
        message: 'Minimal penarikan komisi adalah Rp 50.000.',
      });
    }

    if (!bankName || !accountNumber || !accountHolder) {
      return res.status(400).json({
        success: false,
        message: 'Lengkapi nama bank/e-wallet, nomor rekening, dan nama pemilik rekening.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.walletBalance < numAmount) {
      return res.status(400).json({
        success: false,
        message: `Saldo komisi Anda (Rp ${(user?.walletBalance || 0).toLocaleString('id-ID')}) tidak mencukupi untuk penarikan Rp ${numAmount.toLocaleString('id-ID')}.`,
      });
    }

    // Execute in transaction: deduct balance & create payout request
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: numAmount } },
      });

      const payout = await tx.payoutRequest.create({
        data: {
          userId,
          amount: numAmount,
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountHolder: accountHolder.trim(),
          status: 'PENDING',
        },
      });

      return { updatedUser, payout };
    });

    await logAudit({
      actorId: userId,
      action: 'REQUEST_PAYOUT',
      module: 'referral',
      details: `User ${user.name} mengajukan penarikan saldo komisi sebesar Rp ${numAmount.toLocaleString('id-ID')} ke ${bankName} ${accountNumber} a.n ${accountHolder}.`,
      req,
    });

    return res.status(201).json({
      success: true,
      message: 'Permohonan penarikan saldo komisi berhasil diajukan. Admin akan memproses transfer dalam 1x24 jam.',
      data: result.payout,
    });
  } catch (error) {
    console.error('Error requesting payout:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengajukan penarikan komisi.',
      error: error.message,
    });
  }
};

/**
 * GET /api/referrals/admin/overview (Super Admin only)
 */
export const getAdminReferralOverview = async (req, res) => {
  try {
    const [totalRewards, totalPayouts, pendingPayouts, allPayouts, recentRewards] =
      await Promise.all([
        prisma.referralReward.count(),
        prisma.payoutRequest.count(),
        prisma.payoutRequest.count({ where: { status: 'PENDING' } }),
        prisma.payoutRequest.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
          },
        }),
        prisma.referralReward.findMany({
          take: 20,
          orderBy: { createdAt: 'desc' },
          include: {
            referrer: { select: { name: true, email: true } },
            referredUser: { select: { name: true, email: true } },
          },
        }),
      ]);

    return res.json({
      success: true,
      data: {
        summary: {
          totalRewards,
          totalPayouts,
          pendingPayouts,
        },
        payouts: allPayouts,
        rewards: recentRewards,
      },
    });
  } catch (error) {
    console.error('Error fetching admin referral overview:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data afiliasi global.',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/referrals/admin/payout/:id (Super Admin only)
 * Approve or Reject Payout
 */
export const processAdminPayout = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body; // 'APPROVE' or 'REJECT'

    const payout = await prisma.payoutRequest.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: 'Permohonan penarikan tidak ditemukan.',
      });
    }

    if (payout.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Permohonan penarikan ini sudah berstatus ${payout.status}.`,
      });
    }

    if (action === 'APPROVE') {
      const updated = await prisma.payoutRequest.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          notes: notes || 'Transfer komisi berhasil diselesaikan oleh Admin.',
          processedAt: new Date(),
        },
      });

      return res.json({
        success: true,
        message: 'Penarikan komisi disetujui dan ditandai selesai.',
        data: updated,
      });
    } else if (action === 'REJECT') {
      // Refund balance to user
      const updated = await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: payout.userId },
          data: { walletBalance: { increment: payout.amount } },
        });

        return tx.payoutRequest.update({
          where: { id },
          data: {
            status: 'REJECTED',
            notes: notes || 'Penarikan ditolak oleh Admin. Saldo telah dikembalikan ke dompet user.',
            processedAt: new Date(),
          },
        });
      });

      return res.json({
        success: true,
        message: 'Penarikan komisi ditolak. Saldo dikembalikan ke akun pengguna.',
        data: updated,
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Aksi tidak valid (hanya APPROVE atau REJECT).',
    });
  } catch (error) {
    console.error('Error processing admin payout:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memproses penarikan komisi.',
      error: error.message,
    });
  }
};
