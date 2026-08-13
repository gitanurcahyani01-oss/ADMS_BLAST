import prisma from '../prisma.js';

/**
 * GET /api/auto-reply
 * List all rules for the active workspace
 */
export const getAutoReplyRules = async (req, res) => {
  try {
    const workspaceId = req.workspace?.id;
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const where = isSuperAdmin && !req.query.workspaceOnly ? {} : { workspaceId };

    const rules = await prisma.autoReplyRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        device: { select: { id: true, name: true, phoneNumber: true } },
      },
    });

    return res.json({
      success: true,
      data: { rules },
    });
  } catch (error) {
    console.error('Error fetching auto-reply rules:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memuat aturan auto-reply.',
      error: error.message,
    });
  }
};

/**
 * POST /api/auto-reply
 * Create new auto-reply rule
 */
export const createAutoReplyRule = async (req, res) => {
  try {
    const workspaceId = req.workspace?.id;
    const {
      keyword,
      matchType = 'CONTAINS', // EXACT, CONTAINS, STARTS_WITH, DEFAULT
      responseMessage,
      deviceId,
      mediaUrl,
      mediaType,
      fileName,
    } = req.body;

    if (!keyword && matchType !== 'DEFAULT') {
      return res.status(400).json({
        success: false,
        message: 'Kata kunci (keyword) wajib diisi untuk jenis pencocokan ini.',
      });
    }

    if (!responseMessage || !responseMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Pesan balasan bot wajib diisi.',
      });
    }

    const rule = await prisma.autoReplyRule.create({
      data: {
        workspaceId,
        keyword: keyword?.trim() || 'DEFAULT_REPLY',
        matchType,
        responseMessage: responseMessage.trim(),
        deviceId: deviceId || null,
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
        fileName: fileName || null,
        isActive: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Aturan auto-reply untuk "${rule.keyword}" berhasil dibuat.`,
      data: { rule },
    });
  } catch (error) {
    console.error('Error creating auto-reply rule:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat aturan auto-reply.',
      error: error.message,
    });
  }
};

/**
 * PUT /api/auto-reply/:id
 * Update rule or toggle active state
 */
export const updateAutoReplyRule = async (req, res) => {
  try {
    const { id } = req.params;
    const workspaceId = req.workspace?.id;
    const { keyword, matchType, responseMessage, deviceId, mediaUrl, mediaType, fileName, isActive } = req.body;

    const dataToUpdate = {};
    if (keyword !== undefined) dataToUpdate.keyword = keyword.trim();
    if (matchType !== undefined) dataToUpdate.matchType = matchType;
    if (responseMessage !== undefined) dataToUpdate.responseMessage = responseMessage.trim();
    if (deviceId !== undefined) dataToUpdate.deviceId = deviceId || null;
    if (mediaUrl !== undefined) dataToUpdate.mediaUrl = mediaUrl || null;
    if (mediaType !== undefined) dataToUpdate.mediaType = mediaType || null;
    if (fileName !== undefined) dataToUpdate.fileName = fileName || null;
    if (isActive !== undefined) dataToUpdate.isActive = Boolean(isActive);

    const rule = await prisma.autoReplyRule.update({
      where: { id },
      data: dataToUpdate,
    });

    return res.json({
      success: true,
      message: 'Aturan auto-reply berhasil diperbarui.',
      data: { rule },
    });
  } catch (error) {
    console.error('Error updating auto-reply rule:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui aturan auto-reply.',
    });
  }
};

/**
 * DELETE /api/auto-reply/:id
 */
export const deleteAutoReplyRule = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.autoReplyRule.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Aturan auto-reply berhasil dihapus.',
    });
  } catch (error) {
    console.error('Error deleting auto-reply rule:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus aturan auto-reply.',
    });
  }
};
