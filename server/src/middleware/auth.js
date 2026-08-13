import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

/**
 * Helper to fetch all permission codes for a user based on assigned roles
 */
export const getUserPermissions = async (user) => {
  // Super Admin inherently has full access
  if (user.role === 'SUPER_ADMIN') {
    const allPermissions = await prisma.permission.findMany({ select: { code: true } });
    return allPermissions.map((p) => p.code);
  }

  // Find permissions from system role and custom assigned roles
  const userRoles = await prisma.userRole.findMany({
    where: { userId: user.id },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  const permissionSet = new Set();

  // If user role exists in Role table
  const defaultRole = await prisma.role.findUnique({
    where: { code: user.role },
    include: {
      permissions: {
        include: {
          permission: true,
        },
      },
    },
  });

  if (defaultRole?.permissions) {
    defaultRole.permissions.forEach((rp) => {
      if (rp.permission?.code) permissionSet.add(rp.permission.code);
    });
  }

  userRoles.forEach((ur) => {
    ur.role?.permissions?.forEach((rp) => {
      if (rp.permission?.code) permissionSet.add(rp.permission.code);
    });
  });

  return Array.from(permissionSet);
};

/**
 * Authentication Middleware
 * Validates JWT, status, loads workspace and permissions
 */
export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token autentikasi tidak ditemukan. Silakan login terlebih dahulu.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'adms_blast_default_jwt_secret');

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        workspaceMembers: {
          include: {
            workspace: {
              include: {
                subscription: {
                  include: { plan: true },
                },
              },
            },
          },
        },
        ownedWorkspaces: {
          include: {
            subscription: {
              include: { plan: true },
            },
          },
        },
      },
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna tidak ditemukan atau akun telah dihapus.',
      });
    }

    if (user.status === 'REVOKED') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_REVOKED',
        message: 'Akses akun Anda telah dicabut oleh Super Admin.',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_SUSPENDED',
        message: 'Akun Anda sedang ditangguhkan sementara. Hubungi Super Admin.',
      });
    }

    // Resolve Active Workspace
    let activeWorkspace = null;
    if (user.currentWorkspaceId) {
      activeWorkspace =
        user.workspaceMembers.find((wm) => wm.workspaceId === user.currentWorkspaceId)?.workspace ||
        user.ownedWorkspaces.find((w) => w.id === user.currentWorkspaceId) ||
        null;
    }

    if (!activeWorkspace) {
      if (user.workspaceMembers.length > 0) {
        activeWorkspace = user.workspaceMembers[0].workspace;
      } else if (user.ownedWorkspaces.length > 0) {
        activeWorkspace = user.ownedWorkspaces[0];
      }
    }

    // Load granular permissions
    const permissions = await getUserPermissions(user);

    req.user = user;
    req.permissions = permissions;
    req.workspace = activeWorkspace;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_EXPIRED',
        message: 'Sesi Anda telah kedaluwarsa. Silakan login kembali.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid.',
    });
  }
};

/**
 * Role Check Middleware
 * Enforces one or more allowed roles
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Tidak terautentikasi.',
      });
    }

    // SUPER_ADMIN has global access
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_ROLE',
        message: `Akses ditolak. Fitur ini memerlukan role: ${allowedRoles.join(' atau ')}.`,
      });
    }

    next();
  };
};

/**
 * Super Admin strictly only
 */
export const requireSuperAdmin = requireRole('SUPER_ADMIN');

/**
 * Granular Permission Check Middleware
 */
export const requirePermission = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Tidak terautentikasi.',
      });
    }

    // Super Admin has global override
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    const hasAll = requiredPermissions.every((perm) => req.permissions.includes(perm));

    if (!hasAll) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_PERMISSION',
        message: `Akses ditolak. Anda tidak memiliki permission: ${requiredPermissions.join(', ')}.`,
        requiredPermissions,
      });
    }

    next();
  };
};

/**
 * Require active workspace context
 */
export const requireWorkspace = (req, res, next) => {
  if (req.user?.role === 'SUPER_ADMIN') {
    return next();
  }

  if (!req.workspace) {
    return res.status(400).json({
      success: false,
      code: 'NO_ACTIVE_WORKSPACE',
      message: 'Tidak ada workspace aktif. Silakan pilih atau buat workspace terlebih dahulu.',
    });
  }

  if (req.workspace.status === 'SUSPENDED') {
    return res.status(403).json({
      success: false,
      code: 'WORKSPACE_SUSPENDED',
      message: 'Workspace ini sedang ditangguhkan. Hubungi Administrator.',
    });
  }

  next();
};
