import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import whatsappManager from '../whatsapp/WhatsAppManager.js';
import { REFERRAL_RATES } from './referralController.js';

const PRICING_PLANS = {
  bulanan: {
    code: 'bulanan',
    name: 'Paket 1 Bulan',
    price: 99000,
    priceFormatted: 'Rp 99.000',
    durationDays: 30,
    features: [
      '1–5 Nomor WhatsApp Multi-Device',
      'Database Kontak 50.000 Leads',
      'Unlimited Pesan Broadcast',
      'Smart Auto-Reply Chatbot 24/7',
      'Shared Team Inbox & Multi CS',
    ],
  },
  '3bulan': {
    code: '3bulan',
    name: 'Paket 3 Bulan',
    price: 299000,
    priceFormatted: 'Rp 299.000',
    durationDays: 90,
    badge: 'Pilihan Populer',
    features: [
      '5–10 Nomor WhatsApp Multi-Device',
      'Database Kontak 100.000 Leads',
      'Unlimited Pesan Broadcast',
      'Smart Auto-Reply Chatbot 24/7',
      'Shared Team Inbox & Multi CS',
    ],
  },
  '1tahun': {
    code: '1tahun',
    name: 'Paket 1 Tahun',
    price: 888000,
    priceFormatted: 'Rp 888.000',
    durationDays: 365,
    badge: 'Diskon 60% (Best Value)',
    features: [
      '10–20 Nomor WhatsApp Multi-Device',
      'Database Kontak 200.000 Leads',
      'Unlimited Pesan Broadcast',
      'Smart Auto-Reply Chatbot 24/7',
      'Shared Team Inbox & Multi CS',
      'Prioritas Customer Care & Bantuan Setup',
    ],
  },
};

/**
 * POST /api/orders/checkout
 * Handle self-serve checkout and register tenant workspace with optional Referral Code
 */
export const createOrder = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      workspaceName,
      password,
      planCode = 'bulanan',
      referralCode,
    } = req.body;

    if (!name || !email || !phone || !workspaceName || !password) {
      return res.status(400).json({
        success: false,
        message: 'Mohon lengkapi semua kolom: Nama, Email, No. WhatsApp, Nama Bisnis/Tenant, dan Password.',
      });
    }

    const selectedPlan = PRICING_PLANS[planCode.toLowerCase()] || PRICING_PLANS.bulanan;
    const cleanEmail = email.toLowerCase().trim();

    // Check referral code validity
    let referrer = null;
    let buyerDiscount = 0;
    let commissionAmount = 0;
    let finalAmount = selectedPlan.price;

    if (referralCode && referralCode.trim()) {
      const rawRef = referralCode.trim().toUpperCase();
      referrer = await prisma.user.findUnique({
        where: { referralCode: rawRef },
      });

      if (referrer && referrer.email !== cleanEmail) {
        const rate = REFERRAL_RATES[planCode.toLowerCase()] || REFERRAL_RATES.bulanan;
        buyerDiscount = rate.buyerDiscount;
        commissionAmount = rate.commissionAmount;
        finalAmount = rate.finalPrice;
      }
    }

    // Check if user already exists
    let existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        workspaceMembers: {
          include: {
            workspace: {
              include: { subscription: true },
            },
          },
        },
      },
    });

    let user = existingUser;
    let workspace = null;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const datePrefix = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const invoiceNumber = `INV-ADMS-${datePrefix}-${randomSuffix}`;

    if (!user) {
      // 1. Generate unique referral code for the new user
      const cleanName = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8) || 'USER';
      const myReferralCode = `${cleanName}${Math.floor(1000 + Math.random() * 9000)}`;

      // 2. Create New User
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          password: hashedPassword,
          role: 'USER',
          status: 'SUSPENDED', // Suspended until payment verified
          referralCode: myReferralCode,
          referredById: referrer ? referrer.id : null,
        },
      });

      // 3. Create Workspace
      const slug =
        workspaceName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 30) + `-${randomSuffix}`;

      workspace = await prisma.workspace.create({
        data: {
          name: workspaceName.trim(),
          slug,
          ownerId: user.id,
          status: 'SUSPENDED',
        },
      });

      // 4. Link User to Workspace as Admin
      await prisma.workspaceUser.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          role: 'ADMIN',
          status: 'SUSPENDED',
        },
      });

      // Update current workspace
      await prisma.user.update({
        where: { id: user.id },
        data: { currentWorkspaceId: workspace.id },
      });

      // 5. Create Initial Pending Subscription
      const defaultDbPlan = await prisma.subscriptionPlan.findFirst({
        where: { isActive: true },
      });

      await prisma.subscription.create({
        data: {
          workspaceId: workspace.id,
          planId: defaultDbPlan?.id || '',
          status: 'EXPIRED',
          startsAt: new Date(),
          expiresAt: new Date(),
        },
      });
    } else {
      // Use existing workspace
      workspace = user.workspaceMembers[0]?.workspace;
    }

    // 6. Record Referral Reward (Pending approval upon payment)
    if (referrer && referrer.id !== user.id) {
      await prisma.referralReward.create({
        data: {
          referrerId: referrer.id,
          referredUserId: user.id,
          invoiceNumber,
          planCode: selectedPlan.code,
          planName: selectedPlan.name,
          buyerDiscount,
          commissionAmount,
          status: 'PENDING',
        },
      });
    }

    const amountFormatted = `Rp ${finalAmount.toLocaleString('id-ID')}`;

    // 7. Create Audit Log for Order
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'CREATE_ORDER_INVOICE',
        module: 'order',
        details: `Pesanan baru dibuat untuk ${user.name} (${user.email}) - ${selectedPlan.name} senilai ${amountFormatted} (Diskon: Rp ${buyerDiscount.toLocaleString('id-ID')}). No. Invoice: ${invoiceNumber}`,
        workspaceId: workspace?.id,
      },
    });

    const adminWhatsApp = '6281121191933'; // Official CS & Admin WhatsApp (081121191933)

    // Kirim notifikasi WA otomatis ke Admin jika ada perangkat yang terhubung
    (async () => {
      try {
        const activeDevice = await prisma.device.findFirst({
          where: { status: 'CONNECTED' },
        });

        if (activeDevice) {
          const adminNotifText =
            `🔔 *NOTIFIKASI ORDER BARU - ADMS BLAST*\n\n` +
            `Ada pesanan paket langganan baru masuk ke sistem:\n` +
            `• *No. Invoice:* ${invoiceNumber}\n` +
            `• *Pelanggan:* ${user.name}\n` +
            `• *Email:* ${user.email}\n` +
            `• *No. WhatsApp:* ${user.phone || '-'}\n` +
            `• *Paket:* ${selectedPlan.name}\n` +
            `• *Total Tagihan:* ${amountFormatted}` +
            (buyerDiscount > 0 ? ` (Diskon Referral: Rp ${buyerDiscount.toLocaleString('id-ID')})` : '') +
            (referrer ? `\n• *Kode Referral:* ${referrer.referralCode} (a.n ${referrer.name})` : '') +
            `\n• *Tenant Workspace:* ${workspaceName || workspace?.name}\n` +
            `• *Waktu:* ${new Date().toLocaleString('id-ID')} WIB\n\n` +
            `Segera cek mutasi pembayaran QRIS dan aktifkan akun pelanggan di:\n` +
            `👉 http://localhost:5173/dashboard/users`;

          await whatsappManager.sendMessage(activeDevice.id, adminWhatsApp, adminNotifText);
          console.log(`[OrderNotification] Sent new order WA alert for ${invoiceNumber} to Admin ${adminWhatsApp}`);
        }
      } catch (notifErr) {
        console.warn('[OrderNotification] Could not send WA alert to admin:', notifErr.message);
      }
    })();

    return res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat. Silakan selesaikan pembayaran.',
      data: {
        invoiceNumber,
        amount: finalAmount,
        amountFormatted,
        buyerDiscount,
        originalPrice: selectedPlan.price,
        plan: selectedPlan,
        customer: {
          name: user.name,
          email: user.email,
          phone: user.phone,
          workspaceName: workspace?.name || workspaceName,
        },
      },
    });
  } catch (error) {
    console.error('Error during checkout order creation:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memproses pemesanan.',
      error: error.message,
    });
  }
};

/**
 * GET /api/orders/invoice/:invoiceNumber
 * Retrieve public order details for the payment / invoice page
 */
export const getInvoiceDetails = async (req, res) => {
  try {
    const { invoiceNumber } = req.params;

    const orderLog = await prisma.auditLog.findFirst({
      where: {
        action: 'CREATE_ORDER_INVOICE',
        details: { contains: invoiceNumber },
      },
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            status: true,
            referralCode: true,
          },
        },
        workspace: {
          include: {
            subscription: {
              include: { plan: true },
            },
          },
        },
      },
    });

    if (!orderLog) {
      return res.status(404).json({
        success: false,
        message: 'Invoice tidak ditemukan.',
      });
    }

    // Check if there is a referral reward associated with this invoice
    const referralReward = await prisma.referralReward.findFirst({
      where: { invoiceNumber },
    });

    const isPaid = orderLog.actor?.status === 'ACTIVE';
    let planName = 'Paket 1 Bulan';
    let amount = 99000;
    let buyerDiscount = referralReward ? referralReward.buyerDiscount : 0;

    if (orderLog.details.includes('1 Tahun')) {
      planName = 'Paket 1 Tahun';
      amount = 888000;
    } else if (orderLog.details.includes('3 Bulan')) {
      planName = 'Paket 3 Bulan';
      amount = 299000;
    }

    const finalAmount = amount - buyerDiscount;
    const amountFormatted = `Rp ${finalAmount.toLocaleString('id-ID')}`;

    return res.json({
      success: true,
      data: {
        invoiceNumber,
        isPaid,
        status: isPaid ? 'PAID' : 'PENDING_PAYMENT',
        amount: finalAmount,
        amountFormatted,
        buyerDiscount,
        plan: { name: planName },
        customer: {
          name: orderLog.actor?.name,
          email: orderLog.actor?.email,
          phone: orderLog.actor?.phone,
          workspaceName: orderLog.workspace?.name,
        },
        createdAt: orderLog.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data invoice.',
    });
  }
};

export const getInvoice = getInvoiceDetails;
