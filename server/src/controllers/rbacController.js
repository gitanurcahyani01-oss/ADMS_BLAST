import prisma from '../prisma.js';

/**
 * GET /api/rbac/permissions
 * List all available system permissions grouped by module
 */
export const getAllPermissions = async (req, res) => {
  try {
    const permissions = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { code: 'asc' }],
    });

    const grouped = permissions.reduce((acc, curr) => {
      if (!acc[curr.module]) acc[curr.module] = [];
      acc[curr.module].push(curr);
      return acc;
    }, {});

    return res.json({
      success: true,
      data: {
        total: permissions.length,
        permissions,
        grouped,
      },
    });
  } catch (error) {
    console.error('Error on getAllPermissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat daftar permissions.',
    });
  }
};

/**
 * GET /api/rbac/roles
 * List all system & custom roles with their permissions
 */
export const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            userRoles: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formattedRoles = roles.map((role) => ({
      id: role.id,
      name: role.name,
      code: role.code,
      description: role.description,
      isSystem: role.isSystem,
      userCount: role._count.userRoles,
      permissions: role.permissions.map((rp) => rp.permission.code),
      createdAt: role.createdAt,
    }));

    return res.json({
      success: true,
      data: {
        roles: formattedRoles,
      },
    });
  } catch (error) {
    console.error('Error on getAllRoles:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat data roles.',
    });
  }
};

/**
 * GET /api/rbac/my-permissions
 * Get current user's effective permissions
 */
export const getMyPermissions = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: {
        role: req.user.role,
        permissions: req.permissions,
      },
    });
  } catch (error) {
    console.error('Error on getMyPermissions:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil permissions pengguna.',
    });
  }
};
