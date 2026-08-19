import prisma from '../prisma.js';
import broadcastQueue from '../whatsapp/BroadcastQueue.js';
import { normalizePhone } from './contactController.js';

/**
 * GET /api/broadcasts
 * List all broadcast campaigns for the active workspace
 */
export const getBroadcasts = async (req, res) => {
  try {
    const workspaceId = req.workspace?.id;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const where = isSuperAdmin && !req.query.workspaceOnly ? {} : { workspaceId };

    const campaigns = await prisma.blastCampaign.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        device: { select: { id: true, name: true, phoneNumber: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        _count: {
          select: { logs: true },
        },
      },
    });

    return res.json({
      success: true,
      data: { campaigns },
    });
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat daftar kampanye broadcast.',
      error: error.message,
    });
  }
};

/**
 * POST /api/broadcasts
 * Create a new broadcast campaign with media, spintax, and scheduling
 */
export const createBroadcast = async (req, res) => {
  try {
    const workspaceId = req.workspace?.id;
    const {
      title,
      message,
      deviceIds = [],
      targetType = 'ALL_CONTACTS', // ALL_CONTACTS, LIST, MANUAL
      listId,
      manualRecipients = [],
      minDelay = 5,
      maxDelay = 12,
      mediaUrl,
      mediaType,
      fileName,
      scheduledAt,
      autoStart = true,
    } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Judul kampanye dan template pesan wajib diisi.',
      });
    }

    // Resolve recipients list
    let recipients = [];

    if (targetType === 'MANUAL' && Array.isArray(manualRecipients)) {
      recipients = manualRecipients
        .map((r) => ({
          name: r.name?.trim() || 'Pelanggan',
          phone: normalizePhone(r.phone),
        }))
        .filter((r) => r.phone && r.phone.length >= 9);
    } else if (targetType === 'LIST' && listId) {
      const listRelations = await prisma.contactListRelation.findMany({
        where: { listId },
        include: { contact: true },
      });
      recipients = listRelations.map((lr) => ({
        name: lr.contact.name,
        phone: lr.contact.phone,
      }));
    } else {
      // ALL_CONTACTS
      const contacts = await prisma.contact.findMany({
        where: { workspaceId },
        select: { name: true, phone: true },
      });
      recipients = contacts.map((c) => ({
        name: c.name,
        phone: c.phone,
      }));
    }

    if (recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada nomor penerima yang valid untuk kampanye ini.',
      });
    }

    // Check Plan Limits (maxBroadcasts, maxMessages)
    if (req.user.role !== 'SUPER_ADMIN' && req.workspace) {
      const subscription = await prisma.subscription.findUnique({
        where: { workspaceId },
        include: { plan: true },
      });

      if (subscription?.plan) {
        if (recipients.length > subscription.plan.maxMessages) {
          return res.status(403).json({
            success: false,
            message: `Jumlah target (${recipients.length}) melebihi kuota pesan per kampanye pada paket ${subscription.plan.name} (${subscription.plan.maxMessages} pesan).`,
          });
        }
      }
    }

    const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();
    const initialStatus = isScheduled ? 'SCHEDULED' : autoStart ? 'RUNNING' : 'DRAFT';

    // Auto-Assign ALL connected devices if deviceIds is empty (Enables automatic Round-Robin)
    let finalDeviceIds = Array.isArray(deviceIds) ? deviceIds : [];
    
    if (finalDeviceIds.length === 0) {
      const activeDevices = await prisma.device.findMany({
        where: { workspaceId, status: 'CONNECTED' },
        select: { id: true }
      });
      finalDeviceIds = activeDevices.map(d => d.id);
      
      if (finalDeviceIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada perangkat WhatsApp yang aktif (CONNECTED). Silakan hubungkan minimal 1 perangkat terlebih dahulu.',
        });
      }
    }

    // Create Campaign in PostgreSQL
    const campaign = await prisma.blastCampaign.create({
      data: {
        workspaceId,
        title: title.trim(),
        message: message.trim(),
        totalTarget: recipients.length,
        sentCount: 0,
        failedCount: 0,
        pendingCount: recipients.length,
        status: initialStatus,
        deviceIds: finalDeviceIds,
        minDelay: parseInt(minDelay) || 5,
        maxDelay: parseInt(maxDelay) || 12,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        fileName: fileName || null,
        scheduledAt: isScheduled ? new Date(scheduledAt) : null,
        createdById: req.user.id,
      },
    });

    // Populate queued blast logs
    await prisma.blastLog.createMany({
      data: recipients.map((r) => ({
        campaignId: campaign.id,
        recipient: r.phone,
        name: r.name,
        message: campaign.message,
        status: 'QUEUED',
      })),
    });

    // Auto-start immediately if not scheduled
    if (!isScheduled && autoStart) {
      broadcastQueue.startCampaign(campaign.id, workspaceId).catch((err) => {
        console.error('Error auto-starting campaign:', err.message);
      });
    }

    return res.status(201).json({
      success: true,
      message: isScheduled
        ? `Kampanye "${campaign.title}" berhasil dijadwalkan untuk tanggal ${new Date(scheduledAt).toLocaleString('id-ID')}.`
        : `Kampanye "${campaign.title}" (${recipients.length} target) berhasil dibuat dan mulai dikirim.`,
      data: { campaign },
    });
  } catch (error) {
    console.error('Error creating broadcast:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat kampanye broadcast.',
      error: error.message,
    });
  }
};

/**
 * POST /api/broadcasts/:id/start
 */
export const startBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await broadcastQueue.startCampaign(id, req.workspace?.id);
    return res.json(result);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Gagal memulai kampanye.',
    });
  }
};

/**
 * POST /api/broadcasts/:id/pause
 */
export const pauseBroadcast = (req, res) => {
  const { id } = req.params;
  const result = broadcastQueue.pauseCampaign(id);
  return res.json(result);
};

/**
 * POST /api/broadcasts/:id/resume
 */
export const resumeBroadcast = (req, res) => {
  const { id } = req.params;
  const result = broadcastQueue.resumeCampaign(id);
  return res.json(result);
};

/**
 * POST /api/broadcasts/:id/cancel
 */
export const cancelBroadcast = (req, res) => {
  const { id } = req.params;
  const result = broadcastQueue.cancelCampaign(id);
  return res.json(result);
};

/**
 * GET /api/broadcasts/:id/progress
 */
export const getProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const progress = await broadcastQueue.getProgress(id);

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Kampanye tidak ditemukan.',
      });
    }

    return res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil progres pengiriman.',
    });
  }
};

/**
 * GET /api/broadcasts/:id/logs
 */
export const getBroadcastLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where = { campaignId: id };
    if (status) where.status = status;

    const [logs, total] = await Promise.all([
      prisma.blastLog.findMany({
        where,
        orderBy: { sentAt: 'desc' },
        skip,
        take,
      }),
      prisma.blastLog.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        logs,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / take) || 1,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat log pesan kampanye.',
    });
  }
};

/**
 * DELETE /api/broadcasts/:id
 */
export const deleteBroadcast = async (req, res) => {
  try {
    const { id } = req.params;
    broadcastQueue.cancelCampaign(id);

    await prisma.blastCampaign.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Kampanye broadcast berhasil dihapus.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus kampanye.',
    });
  }
};
