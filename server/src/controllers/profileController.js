import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * GET /api/profile/me
 * Get current user profile, workspace, and subscription status
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        currentWorkspaceId: true,
        workspaceMembers: {
          include: {
            workspace: {
              include: {
                subscription: {
                  include: { plan: true },
                },
                _count: {
                  select: { devices: true, contacts: true, campaigns: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    const currentWorkspace =
      user.workspaceMembers.find((m) => m.workspaceId === user.currentWorkspaceId)?.workspace ||
      user.workspaceMembers[0]?.workspace;

    const subscription = currentWorkspace?.subscription;
    let daysLeft = 0;
    let isExpired = true;

    if (subscription?.expiresAt) {
      const diff = new Date(subscription.expiresAt).getTime() - new Date().getTime();
      daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      isExpired = diff <= 0;
    }

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
        workspace: {
          id: currentWorkspace?.id,
          name: currentWorkspace?.name,
          slug: currentWorkspace?.slug,
          status: currentWorkspace?.status,
          deviceCount: currentWorkspace?._count?.devices || 0,
          contactCount: currentWorkspace?._count?.contacts || 0,
          campaignCount: currentWorkspace?._count?.campaigns || 0,
        },
        subscription: {
          planName: subscription?.plan?.name || 'Paket Langganan',
          status: subscription?.status || 'INACTIVE',
          startsAt: subscription?.startsAt,
          expiresAt: subscription?.expiresAt,
          daysLeft,
          isExpired,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data profil.',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/profile/update-info
 * Update user name, phone, and workspace name
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { name, phone, workspaceName } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama lengkap wajib diisi.',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: name.trim(),
        phone: phone ? phone.trim() : undefined,
      },
    });

    if (workspaceName && workspaceName.trim() && updatedUser.currentWorkspaceId) {
      await prisma.workspace.update({
        where: { id: updatedUser.currentWorkspaceId },
        data: { name: workspaceName.trim() },
      });
    }

    await logAudit({
      actorId: userId,
      action: 'UPDATE_PROFILE',
      module: 'profile',
      details: `User ${updatedUser.name} memperbarui data profil akun.`,
      req,
    });

    return res.json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      data: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil.',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/profile/change-password
 * Change password with old password verification
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini dan password baru wajib diisi.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password baru minimal harus 6 karakter.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Password saat ini (password lama) yang Anda masukkan salah.',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    await logAudit({
      actorId: userId,
      action: 'CHANGE_PASSWORD',
      module: 'profile',
      details: `User ${user.name} (${user.email}) berhasil mengubah password akun.`,
      req,
    });

    return res.json({
      success: true,
      message: 'Password berhasil diubah. Silakan gunakan password baru pada login berikutnya.',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah password.',
      error: error.message,
    });
  }
};
