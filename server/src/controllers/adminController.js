import bcrypt from 'bcryptjs';
import prisma from '../prisma.js';
import subscriptionWorker from '../workers/subscriptionWorker.js';

// GET /api/admin/users - List users based on RBAC scoping
export const getAllUsers = async (req, res) => {
  try {
    const { role, status, search, workspaceId } = req.query;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const isAdmin = req.user.role === 'ADMIN';

    // Users are forbidden from accessing users management
    if (!isSuperAdmin && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Fitur manajemen pengguna hanya untuk Super Admin dan Admin.',
      });
    }

    const where = { deletedAt: null };

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Super Admin and Admin can both view all registered users across workspaces,
    // with optional workspace filtering.
    if (workspaceId) {
      where.workspaceMembers = {
        some: { workspaceId },
      };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        avatar: true,
        phone: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        workspaceMembers: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                status: true,
                subscription: {
                  include: {
                    plan: { select: { name: true, code: true } },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Return workspaces list for filtering
    const allWorkspaces = await prisma.workspace.findMany({
      select: { id: true, name: true, status: true },
      orderBy: { name: 'asc' },
    });

    return res.json({
      success: true,
      data: {
        users,
        workspaces: allWorkspaces,
        scope: isSuperAdmin ? 'GLOBAL' : 'WORKSPACE',
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar pengguna.',
      error: error.message,
    });
  }
};

// POST /api/admin/users - Create new user / member
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role = 'USER', phone, workspaceId } = req.body;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSuperAdmin && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak.',
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi.',
      });
    }

    // Role Assignment Enforcement:
    // Admin can ONLY create 'USER' role
    // Super Admin can create any role
    let chosenRole = 'USER';
    if (isSuperAdmin) {
      const validRoles = ['SUPER_ADMIN', 'ADMIN', 'USER'];
      chosenRole = validRoles.includes(role) ? role : 'USER';
    } else {
      chosenRole = 'USER'; // Force USER for Admin
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar.',
      });
    }

    const targetWsId = isSuperAdmin ? workspaceId : req.workspace?.id || req.user.currentWorkspaceId;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: chosenRole,
        status: 'ACTIVE',
        phone: phone?.trim() || null,
        currentWorkspaceId: targetWsId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        phone: true,
        createdAt: true,
      },
    });

    // Link user role
    const roleRecord = await prisma.role.findUnique({
      where: { code: chosenRole },
    });
    if (roleRecord) {
      await prisma.userRole.create({
        data: {
          userId: newUser.id,
          roleId: roleRecord.id,
        },
      });
    }

    // Link workspace membership if workspace exists
    if (targetWsId) {
      await prisma.workspaceUser.create({
        data: {
          userId: newUser.id,
          workspaceId: targetWsId,
          role: chosenRole === 'ADMIN' ? 'ADMIN' : 'MEMBER',
        },
      });
    }

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        targetUserId: newUser.id,
        action: 'CREATE_USER',
        module: 'users',
        details: `${req.user.role} ${req.user.name} membuat pengguna baru: ${newUser.name} (${newUser.email}) role ${newUser.role}.`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.status(201).json({
      success: true,
      message: `Pengguna ${newUser.name} berhasil ditambahkan.`,
      data: { user: newUser },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menambahkan pengguna baru.',
      error: error.message,
    });
  }
};

// PATCH /api/admin/users/:id/revoke - Revoke access (Super Admin only)
export const revokeAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Hanya Super Admin yang berhak mencabut akses akun permanen.',
      });
    }

    const { id } = req.params;
    const { reason = 'Dicabut oleh Super Admin' } = req.body;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat mencabut akses akun Anda sendiri.',
      });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status: 'REVOKED' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        targetUserId: targetUser.id,
        action: 'REVOKE_USER',
        module: 'users',
        details: `Super Admin ${req.user.name} MENCABUT HAK AKSES ${targetUser.name} (${targetUser.email}). Alasan: ${reason}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.json({
      success: true,
      message: `Hak akses ${targetUser.name} telah berhasil dicabut (REVOKED).`,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Error revoking user:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mencabut hak akses pengguna.',
      error: error.message,
    });
  }
};

// PATCH /api/admin/users/:id/status - Update user status (ACTIVE, SUSPENDED)
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, durationDays = 30 } = req.body;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSuperAdmin && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    if (!['ACTIVE', 'SUSPENDED', 'REVOKED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status tidak valid. Pilihan: ACTIVE, SUSPENDED, REVOKED.',
      });
    }

    if (id === req.user.id && status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat mengubah status akun Anda sendiri.',
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { workspaceMembers: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    // Admin safety check: Cannot modify Super Admin or other Admins
    if (isAdmin) {
      if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin tidak dapat mengubah status Super Admin atau sesama Admin.',
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    const targetWsId = targetUser.workspaceMembers[0]?.workspaceId || targetUser.currentWorkspaceId;
    let subscriptionResult = null;

    if (targetWsId) {
      if (status === 'ACTIVE') {
        subscriptionResult = await subscriptionWorker.activateOrExtendSubscription(
          targetWsId,
          parseInt(durationDays) || 30,
          req.user
        );

        // Approve pending referral reward and credit affiliate wallet
        try {
          const pendingRewards = await prisma.referralReward.findMany({
            where: {
              referredUserId: targetUser.id,
              status: 'PENDING',
            },
          });

          for (const reward of pendingRewards) {
            await prisma.$transaction([
              prisma.referralReward.update({
                where: { id: reward.id },
                data: { status: 'APPROVED' },
              }),
              prisma.user.update({
                where: { id: reward.referrerId },
                data: { walletBalance: { increment: reward.commissionAmount } },
              }),
            ]);
            console.log(`[Referral] Approved reward of Rp ${reward.commissionAmount} to referrer ${reward.referrerId}`);
          }
        } catch (refErr) {
          console.warn('[Referral] Error approving reward:', refErr.message);
        }
      } else if (status === 'SUSPENDED') {
        await prisma.workspace.update({
          where: { id: targetWsId },
          data: { status: 'SUSPENDED' },
        });
        await prisma.subscription.updateMany({
          where: { workspaceId: targetWsId },
          data: { status: 'EXPIRED' },
        });
      }
    }

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        targetUserId: targetUser.id,
        action: `CHANGE_STATUS_${status}`,
        module: 'users',
        details: `${req.user.role} ${req.user.name} mengubah status ${targetUser.name} menjadi ${status}.${
          status === 'ACTIVE' && subscriptionResult
            ? ` Masa aktif diperpanjang ${durationDays} hari (Hingga: ${new Date(
                subscriptionResult.expiresAt
              ).toLocaleDateString('id-ID')}).`
            : ''
        }${reason ? ` Alasan: ${reason}` : ''}`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.json({
      success: true,
      message:
        status === 'ACTIVE'
          ? `Akun ${targetUser.name} berhasil diaktifkan dengan masa aktif ${durationDays} hari.`
          : `Status pengguna berhasil diubah menjadi ${status}.`,
      data: { user: updatedUser, subscription: subscriptionResult },
    });
  } catch (error) {
    console.error('Error updating status:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah status pengguna.',
      error: error.message,
    });
  }
};

// PATCH /api/admin/users/:id/role - Update user role (Strictly Super Admin Only)
export const updateRole = async (req, res) => {
  try {
    if (req.user.role !== 'SUPER_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Hanya Super Admin yang memiliki wewenang untuk mengubah peran (Role) pengguna.',
      });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!['SUPER_ADMIN', 'ADMIN', 'USER'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role tidak valid. Pilihan: SUPER_ADMIN, ADMIN, USER.',
      });
    }

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat mengubah role akun Anda sendiri.',
      });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        updatedAt: true,
      },
    });

    // Update UserRole
    const roleRecord = await prisma.role.findUnique({ where: { code: role } });
    if (roleRecord) {
      await prisma.userRole.deleteMany({ where: { userId: id } });
      await prisma.userRole.create({
        data: {
          userId: id,
          roleId: roleRecord.id,
        },
      });
    }

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        targetUserId: targetUser.id,
        action: 'CHANGE_ROLE',
        module: 'rbac',
        details: `Super Admin ${req.user.name} mengubah role ${targetUser.name} dari ${targetUser.role} menjadi ${role}.`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.json({
      success: true,
      message: `Role ${targetUser.name} berhasil diubah menjadi ${role}.`,
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error('Error updating role:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah role pengguna.',
      error: error.message,
    });
  }
};

// DELETE /api/admin/users/:id - Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSuperAdmin && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    }

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun Anda sendiri.',
      });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { workspaceMembers: true },
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan.',
      });
    }

    // Admin safety check: Cannot delete Super Admin or Admin, must be in same workspace
    if (isAdmin) {
      if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN') {
        return res.status(403).json({
          success: false,
          message: 'Admin tidak dapat menghapus akun Super Admin atau sesama Admin.',
        });
      }

      const currentWsId = req.workspace?.id || req.user.currentWorkspaceId;
      const isMember = targetUser.workspaceMembers.some((wm) => wm.workspaceId === currentWsId);
      if (!isMember) {
        return res.status(403).json({
          success: false,
          message: 'Pengguna tidak berada di dalam workspace Anda.',
        });
      }
    }

    await prisma.user.delete({ where: { id } });

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: req.user.id,
        targetUserId: null,
        action: 'DELETE_USER',
        module: 'users',
        details: `${req.user.role} ${req.user.name} menghapus pengguna ${targetUser.name} (${targetUser.email}).`,
        ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      },
    });

    return res.json({
      success: true,
      message: `Pengguna ${targetUser.name} telah berhasil dihapus.`,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus pengguna.',
      error: error.message,
    });
  }
};
