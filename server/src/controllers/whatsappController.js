import prisma from '../prisma.js';
import whatsappManager from '../whatsapp/WhatsAppManager.js';

/**
 * GET /api/whatsapp/devices
 * List all WhatsApp devices in the active workspace
 */
export const getDevices = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'SUPER_ADMIN';
    const where = isSuperAdmin && !req.query.workspaceOnly ? {} : { workspaceId: req.workspace?.id };

    const devices = await prisma.device.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        workspace: {
          select: { id: true, name: true },
        },
      },
    });

    // Merge real-time memory state with DB record
    const mergedDevices = devices.map((d) => {
      const liveState = whatsappManager.getDeviceState(d.id);
      return {
        ...d,
        status: liveState.status !== 'DISCONNECTED' ? liveState.status : d.status,
        battery: liveState.battery || d.battery,
        phoneNumber: liveState.phoneNumber || d.phoneNumber,
        qrCode: liveState.qrCode || null,
      };
    });

    let maxAllowed = 999;
    let planName = 'Super Admin VIP';
    if (!isSuperAdmin && req.workspace) {
      const subscription = await prisma.subscription.findUnique({
        where: { workspaceId: req.workspace.id },
        include: { plan: true },
      });
      maxAllowed = subscription?.plan?.maxWhatsApp || 5;
      planName = subscription?.plan?.name || 'Paket 1 Bulan';
    }

    return res.json({
      success: true,
      data: {
        devices: mergedDevices,
        maxAllowed,
        planName,
        currentCount: mergedDevices.length,
      },
    });
  } catch (error) {
    console.error('Error fetching WhatsApp devices:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar perangkat WhatsApp.',
      error: error.message,
    });
  }
};

/**
 * POST /api/whatsapp/devices
 * Create a new WhatsApp device & trigger QR Code generation
 */
export const createDevice = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Nama perangkat WhatsApp wajib diisi.',
      });
    }

    const workspaceId = req.workspace?.id;

    // Check subscription plan limit (unless Super Admin)
    if (req.user.role !== 'SUPER_ADMIN' && req.workspace) {
      const subscription = await prisma.subscription.findUnique({
        where: { workspaceId: req.workspace.id },
        include: { plan: true },
      });

      const maxLimit = subscription?.plan?.maxWhatsApp || 5;
      const currentCount = await prisma.device.count({
        where: { workspaceId: req.workspace.id },
      });

      if (currentCount >= maxLimit) {
        return res.status(403).json({
          success: false,
          message: `Limit nomor WhatsApp untuk ${subscription?.plan?.name || 'paket Anda'} (${maxLimit} nomor) telah tercapai. Silakan hubungi admin atau upgrade paket Anda untuk menambah hingga 20 nomor.`,
        });
      }
    }

    const device = await prisma.device.create({
      data: {
        name: name.trim(),
        phoneNumber: 'Belum Terhubung',
        status: 'PAIRING',
        workspaceId,
        platform: 'WhatsApp Multi-Device Cloud',
      },
    });

    // Start session and generate QR Code
    const sessionResult = await whatsappManager.initSession(device.id, workspaceId);

    return res.status(201).json({
      success: true,
      message: 'Perangkat baru berhasil dibuat. Silakan scan QR Code untuk menghubungkan.',
      data: {
        device: {
          ...device,
          qrCode: sessionResult.qrCode,
        },
      },
    });
  } catch (error) {
    console.error('Error creating WhatsApp device:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal membuat perangkat WhatsApp baru.',
      error: error.message,
    });
  }
};

/**
 * GET /api/whatsapp/devices/:deviceId/qr
 * Fetch live QR Code and status
 */
export const getDeviceQR = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await prisma.device.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Perangkat tidak ditemukan.',
      });
    }

    let liveState = whatsappManager.getDeviceState(deviceId);

    // If socket is not running or disconnected, trigger initSession
    if (liveState.status === 'DISCONNECTED') {
      liveState = await whatsappManager.initSession(deviceId, device.workspaceId);
    }

    return res.json({
      success: true,
      data: {
        status: liveState.status,
        qrCode: liveState.qrCode,
        phoneNumber: liveState.phoneNumber || device.phoneNumber,
        battery: liveState.battery,
      },
    });
  } catch (error) {
    console.error('Error fetching QR code:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil QR Code perangkat.',
      error: error.message,
    });
  }
};

/**
 * POST /api/whatsapp/devices/:deviceId/disconnect
 * Disconnect & Logout session
 */
export const disconnectDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const result = await whatsappManager.disconnectSession(deviceId, req.workspace?.id);

    return res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error('Error disconnecting device:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memutuskan koneksi perangkat.',
      error: error.message,
    });
  }
};

/**
 * DELETE /api/whatsapp/devices/:deviceId
 * Delete device permanently
 */
export const deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    await whatsappManager.disconnectSession(deviceId, req.workspace?.id);
    await prisma.device.delete({
      where: { id: deviceId },
    });

    return res.json({
      success: true,
      message: 'Perangkat berhasil dihapus dari sistem.',
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal menghapus perangkat.',
      error: error.message,
    });
  }
};

/**
 * POST /api/whatsapp/send-test
 * Send live test message
 */
export const sendTestMessage = async (req, res) => {
  try {
    const { deviceId, phoneNumber, message } = req.body;

    if (!deviceId || !phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        message: 'Device ID, nomor tujuan, dan pesan wajib diisi.',
      });
    }

    const result = await whatsappManager.sendMessage(deviceId, phoneNumber, message);

    return res.json({
      success: true,
      message: 'Pesan uji coba berhasil dikirim via WhatsApp!',
      data: result,
    });
  } catch (error) {
    console.error('Error sending test message:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Gagal mengirim pesan WhatsApp.',
    });
  }
};
