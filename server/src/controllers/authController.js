import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';
import { logAudit } from '../utils/auditLogger.js';
import { getUserPermissions } from '../middleware/auth.js';

/**
 * Helper to build safe user payload
 */
const buildUserPayload = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  avatar: user.avatar,
  phone: user.phone,
  currentWorkspaceId: user.currentWorkspaceId,
  lastLoginAt: user.lastLoginAt,
  createdAt: user.createdAt,
});

/**
 * POST /api/auth/register
 * Register a new User with automated Workspace provisioning
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, companyName, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nama, email, dan password wajib diisi.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const workspaceName = companyName?.trim() || `${name.trim()}'s Workspace`;
    const slugBase = workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    // Create User, Workspace, WorkspaceUser & free Subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User (Suspended until payment & admin activation)
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          phone: phone?.trim() || null,
          role: 'USER',
          status: 'SUSPENDED',
        },
      });

      // 2. Create Workspace
      const newWorkspace = await tx.workspace.create({
        data: {
          name: workspaceName,
          slug,
          ownerId: newUser.id,
          status: 'SUSPENDED',
        },
      });

      // 3. Add to WorkspaceUser
      await tx.workspaceUser.create({
        data: {
          workspaceId: newWorkspace.id,
          userId: newUser.id,
          role: 'USER',
          status: 'SUSPENDED',
        },
      });

      // 4. Update currentWorkspaceId on User
      const updatedUser = await tx.user.update({
        where: { id: newUser.id },
        data: { currentWorkspaceId: newWorkspace.id },
      });

      // 5. Connect Initial Pending Subscription
      const defaultPlan = await tx.subscriptionPlan.findFirst({
        where: { isActive: true },
      });

      if (defaultPlan) {
        await tx.subscription.create({
          data: {
            workspaceId: newWorkspace.id,
            planId: defaultPlan.id,
            status: 'EXPIRED',
          },
        });
      }

      // 6. Assign USER role in UserRole
      const userRoleRecord = await tx.role.findUnique({
        where: { code: 'USER' },
      });

      if (userRoleRecord) {
        await tx.userRole.create({
          data: {
            userId: newUser.id,
            roleId: userRoleRecord.id,
          },
        });
      }

      return { user: updatedUser, workspace: newWorkspace };
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: result.user.id,
        role: result.user.role,
        email: result.user.email,
        workspaceId: result.workspace.id,
      },
      process.env.JWT_SECRET || 'adms_blast_default_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Audit log
    await logAudit({
      actorId: result.user.id,
      workspaceId: result.workspace.id,
      action: 'REGISTER',
      module: 'auth',
      details: `User ${result.user.name} (${result.user.email}) mendaftar dan membuat workspace '${result.workspace.name}'.`,
      req,
    });

    const permissions = await getUserPermissions(result.user);

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil. Selamat datang di ADMS Blast!',
      data: {
        token,
        user: buildUserPayload(result.user),
        activeWorkspace: result.workspace,
        workspaces: [result.workspace],
        permissions,
      },
    });
  } catch (error) {
    console.error('Error on register:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat proses pendaftaran.',
      error: error.message,
    });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        workspaceMembers: {
          include: {
            workspace: {
              include: {
                subscription: {
                  include: {
                    plan: true,
                  },
                },
              },
            },
          },
        },
        ownedWorkspaces: {
          include: {
            subscription: {
              include: {
                plan: true,
              },
            },
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email atau password salah.',
      });
    }

    if (user.status === 'REVOKED') {
      await logAudit({
        actorId: user.id,
        action: 'LOGIN_BLOCKED_REVOKED',
        module: 'auth',
        details: `Percobaan login ditolak karena akun telah dicabut (Revoked).`,
        req,
      });

      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_REVOKED',
        message: 'Akses akun Anda telah dicabut oleh Super Admin. Anda tidak dapat login.',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: 'Akun Anda sedang dinonaktifkan sementara. Hubungi Super Admin.',
      });
    }

    // Resolve workspaces
    const workspacesMap = new Map();
    user.ownedWorkspaces.forEach((w) => workspacesMap.set(w.id, w));
    user.workspaceMembers.forEach((wm) => {
      if (wm.workspace) workspacesMap.set(wm.workspace.id, wm.workspace);
    });
    const workspaces = Array.from(workspacesMap.values());

    let activeWorkspace = null;
    if (user.currentWorkspaceId && workspacesMap.has(user.currentWorkspaceId)) {
      activeWorkspace = workspacesMap.get(user.currentWorkspaceId);
    } else if (workspaces.length > 0) {
      activeWorkspace = workspaces[0];
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        ...(activeWorkspace ? { currentWorkspaceId: activeWorkspace.id } : {}),
      },
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        workspaceId: activeWorkspace?.id || null,
      },
      process.env.JWT_SECRET || 'adms_blast_default_jwt_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const permissions = await getUserPermissions(user);

    // Audit log
    await logAudit({
      actorId: user.id,
      workspaceId: activeWorkspace?.id || null,
      action: 'LOGIN',
      module: 'auth',
      details: `User ${user.name} (${user.role}) berhasil login ke sistem.`,
      req,
    });

    return res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        token,
        user: buildUserPayload(user),
        activeWorkspace,
        workspaces,
        permissions,
      },
    });
  } catch (error) {
    console.error('Error on login:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat proses login.',
      error: error.message,
    });
  }
};

/**
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        workspaceMembers: {
          include: {
            workspace: {
              include: {
                subscription: {
                  include: {
                    plan: true,
                  },
                },
              },
            },
          },
        },
        ownedWorkspaces: {
          include: {
            subscription: {
              include: {
                plan: true,
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

    const workspacesMap = new Map();
    user.ownedWorkspaces.forEach((w) => workspacesMap.set(w.id, w));
    user.workspaceMembers.forEach((wm) => {
      if (wm.workspace) workspacesMap.set(wm.workspace.id, wm.workspace);
    });
    const workspaces = Array.from(workspacesMap.values());

    return res.json({
      success: true,
      data: {
        user: buildUserPayload(user),
        activeWorkspace: req.workspace,
        workspaces,
        permissions: req.permissions,
      },
    });
  } catch (error) {
    console.error('Error on getMe:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data sesi profil.',
    });
  }
};

/**
 * POST /api/auth/switch-workspace
 */
export const switchWorkspace = async (req, res) => {
  try {
    const { workspaceId } = req.body;

    if (!workspaceId) {
      return res.status(400).json({
        success: false,
        message: 'ID Workspace wajib disertakan.',
      });
    }

    // Super Admin can switch to any workspace
    let targetWorkspace = null;
    if (req.user.role === 'SUPER_ADMIN') {
      targetWorkspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
          subscription: {
            include: { plan: true },
          },
        },
      });
    } else {
      // Regular user/admin must be member or owner
      const member = await prisma.workspaceUser.findFirst({
        where: { workspaceId, userId: req.user.id, status: 'ACTIVE' },
        include: {
          workspace: {
            include: {
              subscription: {
                include: { plan: true },
              },
            },
          },
        },
      });

      if (!member) {
        const owned = await prisma.workspace.findFirst({
          where: { id: workspaceId, ownerId: req.user.id },
          include: {
            subscription: {
              include: { plan: true },
            },
          },
        });
        targetWorkspace = owned;
      } else {
        targetWorkspace = member.workspace;
      }
    }

    if (!targetWorkspace) {
      return res.status(403).json({
        success: false,
        message: 'Akses ke workspace tersebut tidak diizinkan atau workspace tidak ditemukan.',
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { currentWorkspaceId: targetWorkspace.id },
    });

    await logAudit({
      actorId: req.user.id,
      workspaceId: targetWorkspace.id,
      action: 'SWITCH_WORKSPACE',
      module: 'workspace',
      details: `User ${req.user.name} beralih ke workspace '${targetWorkspace.name}'.`,
      req,
    });

    return res.json({
      success: true,
      message: `Berhasil beralih ke workspace ${targetWorkspace.name}.`,
      data: {
        activeWorkspace: targetWorkspace,
      },
    });
  } catch (error) {
    console.error('Error on switchWorkspace:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal beralih workspace.',
    });
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    if (req.user) {
      await logAudit({
        actorId: req.user.id,
        workspaceId: req.workspace?.id || null,
        action: 'LOGOUT',
        module: 'auth',
        details: `User ${req.user.name} logout dari sistem.`,
        req,
      });
    }

    return res.json({
      success: true,
      message: 'Logout berhasil.',
    });
  } catch (error) {
    console.error('Error on logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memproses logout.',
    });
  }
};
