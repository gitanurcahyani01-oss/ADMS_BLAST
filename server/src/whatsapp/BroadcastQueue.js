import prisma from '../prisma.js';
import whatsappManager from './WhatsAppManager.js';
import { logAudit } from '../utils/auditLogger.js';

/**
 * Spintax Parser
 * Example: "{Halo|Hai|Selamat Pagi} Kak {{name}}" -> "Halo Kak Budi"
 */
export const parseSpintax = (text) => {
  if (!text) return '';
  const spintaxRegex = /\{([^{}]+)\}/g;
  let matches;
  let parsed = text;

  while ((matches = spintaxRegex.exec(parsed)) !== null) {
    const options = matches[1].split('|');
    const chosen = options[Math.floor(Math.random() * options.length)];
    parsed = parsed.replace(matches[0], chosen);
  }

  return parsed;
};

/**
 * Variable Replacer
 * Replaces {{name}}, {{phone}}, {{email}}, and custom fields
 */
export const replaceVariables = (template, contact) => {
  if (!template) return '';
  let text = template;

  text = text.replace(/\{\{\s*name\s*\}\}/gi, contact.name || 'Kak');
  text = text.replace(/\{\{\s*phone\s*\}\}/gi, contact.phone || '');
  text = text.replace(/\{\{\s*email\s*\}\}/gi, contact.email || '');

  if (contact.customFields && typeof contact.customFields === 'object') {
    Object.keys(contact.customFields).forEach((key) => {
      const reg = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'gi');
      text = text.replace(reg, contact.customFields[key] || '');
    });
  }

  return text;
};

class BroadcastQueue {
  constructor() {
    this.activeWorkers = new Map(); // campaignId -> { status, shouldPause, shouldCancel, currentRecipient }
  }

  /**
   * Helper sleep promise
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get real-time campaign progress
   */
  async getProgress(campaignId) {
    const campaign = await prisma.blastCampaign.findUnique({
      where: { id: campaignId },
      include: {
        _count: {
          select: { logs: true },
        },
      },
    });

    if (!campaign) return null;

    const workerState = this.activeWorkers.get(campaignId);
    const total = campaign.totalTarget || campaign._count.logs || 0;
    const processed = campaign.sentCount + campaign.failedCount;
    const percentage = total > 0 ? Math.min(100, Math.round((processed / total) * 100)) : 0;

    return {
      id: campaign.id,
      title: campaign.title,
      status: workerState?.status || campaign.status,
      totalTarget: total,
      sentCount: campaign.sentCount,
      failedCount: campaign.failedCount,
      pendingCount: Math.max(0, total - processed),
      percentage,
      currentRecipient: workerState?.currentRecipient || null,
      deviceIds: campaign.deviceIds,
      minDelay: campaign.minDelay,
      maxDelay: campaign.maxDelay,
    };
  }

  /**
   * Start or execute a broadcast campaign in background
   */
  async startCampaign(campaignId, workspaceId = null) {
    const campaign = await prisma.blastCampaign.findUnique({
      where: { id: campaignId },
      include: {
        logs: {
          where: { status: 'QUEUED' },
          orderBy: { id: 'asc' },
        },
      },
    });

    if (!campaign) {
      throw new Error('Kampanye blast tidak ditemukan.');
    }

    // Resolve target devices (Multi-device rotation)
    const rawDeviceIds = campaign.deviceIds?.length > 0 ? campaign.deviceIds : campaign.deviceId ? [campaign.deviceId] : [];

    // Filter & auto-wake target devices
    const connectedDeviceIds = [];
    for (const devId of rawDeviceIds) {
      let state = whatsappManager.getDeviceState(devId);
      if (state.status !== 'CONNECTED') {
        console.log(`🔄 [BroadcastQueue] Device [${devId}] is currently ${state.status}. Auto-restoring session...`);
        await whatsappManager.initSession(devId, workspaceId);
        // Wait up to 3 seconds for handshake
        let waitCount = 0;
        while (whatsappManager.getDeviceState(devId)?.status !== 'CONNECTED' && waitCount < 15) {
          await this.sleep(200);
          waitCount++;
        }
        state = whatsappManager.getDeviceState(devId);
      }

      if (state.status === 'CONNECTED') {
        connectedDeviceIds.push(devId);
      }
    }

    if (connectedDeviceIds.length === 0) {
      await prisma.blastCampaign.update({
        where: { id: campaignId },
        data: { status: 'FAILED' },
      });
      throw new Error('Tidak ada perangkat WhatsApp yang terhubung (Online) untuk menjalankan blast ini. Silakan periksa status perangkat di menu Perangkat WhatsApp.');
    }

    // Initialize worker state
    const workerState = {
      status: 'RUNNING',
      shouldPause: false,
      shouldCancel: false,
      currentRecipient: null,
    };
    this.activeWorkers.set(campaignId, workerState);

    await prisma.blastCampaign.update({
      where: { id: campaignId },
      data: { status: 'RUNNING' },
    });

    // Run queue in background asynchronously
    (async () => {
      console.log(`🚀 Starting Broadcast Worker for Campaign [${campaign.title}] - ${campaign.logs.length} recipients...`);
      let sentTotal = campaign.sentCount;
      let failedTotal = campaign.failedCount;
      let deviceIndex = 0;

      for (const log of campaign.logs) {
        // Handle cancel
        if (workerState.shouldCancel) {
          console.log(`🛑 Campaign [${campaignId}] Cancelled by user.`);
          await prisma.blastCampaign.update({
            where: { id: campaignId },
            data: { status: 'CANCELLED' },
          });
          break;
        }

        // Handle pause loop
        while (workerState.shouldPause) {
          workerState.status = 'PAUSED';
          await this.sleep(1000);
          if (workerState.shouldCancel) break;
        }
        if (workerState.shouldCancel) break;
        workerState.status = 'RUNNING';

        // Select device via Round-Robin
        const activeDeviceId = connectedDeviceIds[deviceIndex % connectedDeviceIds.length];
        deviceIndex++;

        // Personalize message with Spintax & Variables
        const rawMessage = log.message || campaign.message;
        const spintaxMessage = parseSpintax(rawMessage);
        const finalMessage = replaceVariables(spintaxMessage, {
          name: log.name,
          phone: log.recipient,
        });

        workerState.currentRecipient = {
          name: log.name,
          phone: log.recipient,
          deviceId: activeDeviceId,
        };

        try {
          // Send message via Baileys
          await whatsappManager.sendMessage(activeDeviceId, log.recipient, finalMessage, {
            imageUrl: campaign.mediaType === 'image' ? campaign.mediaUrl : null,
            videoUrl: campaign.mediaType === 'video' ? campaign.mediaUrl : null,
            documentUrl: campaign.mediaType === 'document' ? campaign.mediaUrl : null,
            fileName: campaign.fileName,
          });


          sentTotal++;
          await prisma.blastLog.update({
            where: { id: log.id },
            data: {
              status: 'SENT',
              deviceId: activeDeviceId,
              message: finalMessage,
              sentAt: new Date(),
            },
          });
        } catch (sendErr) {
          failedTotal++;
          console.error(`❌ Failed to send to ${log.recipient}:`, sendErr.message);
          await prisma.blastLog.update({
            where: { id: log.id },
            data: {
              status: 'FAILED',
              deviceId: activeDeviceId,
              message: finalMessage,
              errorReason: sendErr.message,
              sentAt: new Date(),
            },
          });
        }

        // Update campaign counters in DB
        await prisma.blastCampaign.update({
          where: { id: campaignId },
          data: {
            sentCount: sentTotal,
            failedCount: failedTotal,
            pendingCount: Math.max(0, campaign.totalTarget - (sentTotal + failedTotal)),
          },
        });

        // Calculate Anti-Banned Random Delay (e.g. 5s to 12s)
        const minD = campaign.minDelay || 5;
        const maxD = campaign.maxDelay || 12;
        const delaySeconds = Math.floor(Math.random() * (maxD - minD + 1) + minD);

        await this.sleep(delaySeconds * 1000);
      }

      // Mark completed if not cancelled
      if (!workerState.shouldCancel) {
        await prisma.blastCampaign.update({
          where: { id: campaignId },
          data: {
            status: 'COMPLETED',
            pendingCount: 0,
          },
        });
        console.log(`✅ Campaign [${campaign.title}] COMPLETED! Sent: ${sentTotal}, Failed: ${failedTotal}`);
      }

      this.activeWorkers.delete(campaignId);
    })().catch((err) => {
      console.error(`💥 Fatal error in broadcast worker for [${campaignId}]:`, err);
      this.activeWorkers.delete(campaignId);
    });

    return {
      success: true,
      message: `Kampanye broadcast "${campaign.title}" berhasil dimulai.`,
    };
  }

  /**
   * Pause running campaign
   */
  pauseCampaign(campaignId) {
    const worker = this.activeWorkers.get(campaignId);
    if (worker) {
      worker.shouldPause = true;
      worker.status = 'PAUSED';
      prisma.blastCampaign.update({
        where: { id: campaignId },
        data: { status: 'PAUSED' },
      }).catch(() => { });
      return { success: true, message: 'Kampanye berhasil dijeda (Paused).' };
    }
    return { success: false, message: 'Kampanye tidak sedang berjalan aktif.' };
  }

  /**
   * Resume paused campaign
   */
  resumeCampaign(campaignId) {
    const worker = this.activeWorkers.get(campaignId);
    if (worker) {
      worker.shouldPause = false;
      worker.status = 'RUNNING';
      prisma.blastCampaign.update({
        where: { id: campaignId },
        data: { status: 'RUNNING' },
      }).catch(() => { });
      return { success: true, message: 'Kampanye dilanjutkan (Resumed).' };
    }
    // If not in memory, start from DB
    return this.startCampaign(campaignId);
  }

  /**
   * Cancel campaign
   */
  cancelCampaign(campaignId) {
    const worker = this.activeWorkers.get(campaignId);
    if (worker) {
      worker.shouldCancel = true;
      worker.status = 'CANCELLED';
    }
    prisma.blastCampaign.update({
      where: { id: campaignId },
      data: { status: 'CANCELLED' },
    }).catch(() => { });

    return { success: true, message: 'Kampanye berhasil dibatalkan.' };
  }
}

export const broadcastQueue = new BroadcastQueue();
export default broadcastQueue;
