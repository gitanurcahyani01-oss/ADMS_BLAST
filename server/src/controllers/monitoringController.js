import prisma from '../prisma.js';

// GET /api/monitoring/stats - Get dashboard summary metrics (Strictly isolated by workspace)
export const getMonitoringStats = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const workspaceId = req.workspace?.id;

    if (isSuperAdmin && !req.query.workspaceOnly) {
      // Global stats for Super Admin
      const [
        totalUsers,
        totalAdmins,
        totalDevices,
        connectedDevices,
        totalCampaigns,
        totalLogs,
        sentLogs,
        failedLogs,
        deliveredLogs,
        readLogs,
        recentCampaigns,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: 'ADMIN', status: 'ACTIVE' } }),
        prisma.device.count(),
        prisma.device.count({ where: { status: 'CONNECTED' } }),
        prisma.blastCampaign.count(),
        prisma.blastLog.count(),
        prisma.blastLog.count({ where: { status: 'SENT' } }),
        prisma.blastLog.count({ where: { status: 'FAILED' } }),
        prisma.blastLog.count({ where: { status: 'DELIVERED' } }),
        prisma.blastLog.count({ where: { status: 'READ' } }),
        prisma.blastCampaign.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            device: { select: { name: true, phoneNumber: true } },
            createdBy: { select: { name: true, email: true } },
          },
        }),
      ]);

      const successfulMessages = sentLogs + deliveredLogs + readLogs;
      const successRate = totalLogs > 0 ? ((successfulMessages / totalLogs) * 100).toFixed(1) : '100.0';

      return res.json({
        success: true,
        data: {
          summary: {
            totalUsers,
            activeAdmins: totalAdmins,
            totalDevices,
            connectedDevices,
            totalCampaigns,
            totalMessages: totalLogs,
            sentCount: successfulMessages,
            failedCount: failedLogs,
            successRate: `${successRate}%`,
          },
          recentCampaigns,
        },
      });
    }

    // Workspace-specific stats for Admin / User Client
    const [
      totalDevices,
      connectedDevices,
      totalCampaigns,
      totalLogs,
      sentLogs,
      failedLogs,
      deliveredLogs,
      readLogs,
      recentCampaigns,
    ] = await Promise.all([
      prisma.device.count({ where: { workspaceId } }),
      prisma.device.count({ where: { workspaceId, status: 'CONNECTED' } }),
      prisma.blastCampaign.count({ where: { workspaceId } }),
      prisma.blastLog.count({ where: { campaign: { workspaceId } } }),
      prisma.blastLog.count({ where: { campaign: { workspaceId }, status: 'SENT' } }),
      prisma.blastLog.count({ where: { campaign: { workspaceId }, status: 'FAILED' } }),
      prisma.blastLog.count({ where: { campaign: { workspaceId }, status: 'DELIVERED' } }),
      prisma.blastLog.count({ where: { campaign: { workspaceId }, status: 'READ' } }),
      prisma.blastCampaign.findMany({
        where: { workspaceId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          device: { select: { name: true, phoneNumber: true } },
          createdBy: { select: { name: true, email: true } },
        },
      }),
    ]);

    const successfulMessages = sentLogs + deliveredLogs + readLogs;
    const successRate = totalLogs > 0 ? ((successfulMessages / totalLogs) * 100).toFixed(1) : '100.0';

    return res.json({
      success: true,
      data: {
        summary: {
          totalUsers: 1,
          activeAdmins: 1,
          totalDevices,
          connectedDevices,
          totalCampaigns,
          totalMessages: totalLogs,
          sentCount: successfulMessages,
          failedCount: failedLogs,
          successRate: `${successRate}%`,
        },
        recentCampaigns,
      },
    });
  } catch (error) {
    console.error('Error fetching monitoring stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik monitoring.',
      error: error.message,
    });
  }
};

// GET /api/monitoring/devices - List devices (scoped by workspace for clients)
export const getDevices = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const workspaceId = req.workspace?.id;
    const where = isSuperAdmin && !req.query.workspaceOnly ? {} : { workspaceId };

    const devices = await prisma.device.findMany({
      where,
      orderBy: { lastActive: 'desc' },
      include: {
        _count: {
          select: { campaigns: true },
        },
      },
    });

    return res.json({
      success: true,
      data: { devices },
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data perangkat.',
      error: error.message,
    });
  }
};

// GET /api/monitoring/logs - Get blast message history (scoped by workspace for clients)
export const getBlastLogs = async (req, res) => {
  try {
    const { status, search, limit = 50, page = 1 } = req.query;
    const take = parseInt(limit, 10) || 50;
    const skip = ((parseInt(page, 10) || 1) - 1) * take;

    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const workspaceId = req.workspace?.id;

    const where = {};
    if (!isSuperAdmin || req.query.workspaceOnly) {
      where.campaign = { workspaceId };
    }

    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { recipient: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.blastLog.count({ where }),
      prisma.blastLog.findMany({
        where,
        take,
        skip,
        orderBy: { sentAt: 'desc' },
        include: {
          campaign: {
            select: { title: true },
          },
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
      },
    });
  } catch (error) {
    console.error('Error fetching blast logs:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil log pengiriman blast.',
      error: error.message,
    });
  }
};
