import prisma from '../prisma.js';

// GET /api/audit-logs - List audit trail logs
export const getAuditLogs = async (req, res) => {
  try {
    const { limit = 50, page = 1, module, action } = req.query;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const isAdmin = req.user.role === 'ADMIN';

    if (!isSuperAdmin && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Log audit keamanan hanya untuk Super Admin dan Admin.',
      });
    }

    const take = parseInt(limit, 10) || 50;
    const skip = ((parseInt(page, 10) || 1) - 1) * take;

    const where = {};
    if (module) where.module = module;
    if (action) where.action = action;

    // Admin scoping: limit to actors or target users in Admin's workspace
    if (isAdmin) {
      const currentWsId = req.workspace?.id || req.user.currentWorkspaceId;
      if (currentWsId) {
        where.OR = [
          {
            actor: {
              workspaceMembers: {
                some: { workspaceId: currentWsId },
              },
            },
          },
          {
            targetUser: {
              workspaceMembers: {
                some: { workspaceId: currentWsId },
              },
            },
          },
        ];
      }
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        take,
        skip,
        orderBy: { createdAt: 'desc' },
        include: {
          actor: { select: { name: true, email: true, role: true } },
          targetUser: { select: { name: true, email: true, role: true } },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        total,
        page: parseInt(page, 10),
        totalPages: Math.ceil(total / take),
        logs,
        scope: isSuperAdmin ? 'GLOBAL' : 'WORKSPACE',
      },
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil riwayat log audit.',
      error: error.message,
    });
  }
};
