import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  makeCacheableSignalKeyStore,
  Browsers,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import prisma from '../prisma.js';
import { logAudit } from '../utils/auditLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSIONS_DIR = path.resolve(__dirname, '../../sessions');
const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure directories exist
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Spintax Helper
 */
const parseSpintax = (text) => {
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

class WhatsAppManager {
  constructor() {
    this.sessions = new Map(); // deviceId -> WASocket
    this.deviceStates = new Map(); // deviceId -> { status, qrCode, phoneNumber, battery, updatedAt }
    this.logger = pino({ level: 'silent' });
  }

  /**
   * Normalize phone number to international WhatsApp JID
   */
  formatJID(phone) {
    if (!phone) return null;
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    } else if (clean.startsWith('8')) {
      clean = '62' + clean;
    }
    return `${clean}@s.whatsapp.net`;
  }

  /**
   * Extract human-readable phone number from JID
   */
  formatPhoneFromJID(jid) {
    if (!jid) return '';
    const number = jid.split('@')[0].split(':')[0];
    return `+${number}`;
  }

  /**
   * Get device session directory
   */
  getSessionPath(deviceId) {
    return path.join(SESSIONS_DIR, `device_${deviceId}`);
  }

  /**
   * Get real-time status of a device
   */
  getDeviceState(deviceId) {
    const state = this.deviceStates.get(deviceId) || {
      status: 'DISCONNECTED',
      qrCode: null,
      phoneNumber: null,
      battery: 100,
      updatedAt: new Date(),
    };
    return state;
  }

  /**
   * Initialize or restore WhatsApp Multi-Device session for a device
   */
  async initSession(deviceId, workspaceId = null) {
    try {
      const sessionDir = this.getSessionPath(deviceId);
      const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
      const { version } = await fetchLatestBaileysVersion().catch(() => ({ version: [2, 3000, 1015901307] }));

      // If already connected and socket is live
      const existingSock = this.sessions.get(deviceId);
      const existingState = this.deviceStates.get(deviceId);
      if (existingSock && existingState?.status === 'CONNECTED') {
        return {
          status: 'CONNECTED',
          qrCode: null,
          phoneNumber: existingState.phoneNumber,
        };
      }

      // Close previous dead socket if exists
      if (existingSock) {
        try {
          existingSock.ev.removeAllListeners();
          existingSock.end();
        } catch (_) {}
      }

      // Set initial status
      this.deviceStates.set(deviceId, {
        status: 'PAIRING',
        qrCode: existingState?.qrCode || null,
        phoneNumber: null,
        battery: 100,
        updatedAt: new Date(),
      });

      // Initialize Baileys socket
      const sock = makeWASocket({
        version,
        logger: this.logger,
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, this.logger),
        },
        browser: Browsers.ubuntu('Chrome'),
        syncFullHistory: false,
        generateHighQualityLinkPreview: false,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
        emitOwnEvents: false,
        retryRequestDelayMs: 250,
      });

      this.sessions.set(deviceId, sock);

      // Event: Credentials Update
      sock.ev.on('creds.update', saveCreds);

      // Event: Connection Update
      sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // 1. QR Code generated
        if (qr) {
          try {
            const qrDataUrl = await QRCode.toDataURL(qr, {
              margin: 2,
              width: 320,
              color: {
                dark: '#07101E',
                light: '#FFFFFF',
              },
            });

            this.deviceStates.set(deviceId, {
              status: 'PAIRING',
              qrCode: qrDataUrl,
              phoneNumber: null,
              battery: 100,
              updatedAt: new Date(),
            });

            await prisma.device.updateMany({
              where: { id: deviceId },
              data: { status: 'PAIRING' },
            }).catch(() => {});
          } catch (qrErr) {
            console.error('Failed to generate QR Data URL:', qrErr);
          }
        }

        // 2. Connection Opened
        if (connection === 'open') {
          const userJid = sock.user?.id || '';
          const phoneFormatted = this.formatPhoneFromJID(userJid);

          this.deviceStates.set(deviceId, {
            status: 'CONNECTED',
            qrCode: null,
            phoneNumber: phoneFormatted,
            battery: 100,
            updatedAt: new Date(),
          });

          await prisma.device.updateMany({
            where: { id: deviceId },
            data: {
              status: 'CONNECTED',
              phoneNumber: phoneFormatted,
              platform: 'WhatsApp Multi-Device Cloud',
              lastActive: new Date(),
            },
          }).catch(() => {});

          await logAudit({
            workspaceId,
            action: 'WHATSAPP_CONNECTED',
            module: 'whatsapp',
            details: `Nomor WhatsApp ${phoneFormatted} berhasil terhubung pada perangkat ID ${deviceId}.`,
          });

          console.log(`✅ WhatsApp Device [${deviceId}] CONNECTED (${phoneFormatted})`);
        }

        // 3. Connection Closed
        if (connection === 'close') {
          const statusCode = lastDisconnect?.error?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

          console.log(`⚠️ WhatsApp Device [${deviceId}] Disconnect statusCode: ${statusCode} (Reconnect: ${shouldReconnect})`);

          if (shouldReconnect) {
            const delay = statusCode === 515 ? 500 : 2000;
            setTimeout(() => {
              this.initSession(deviceId, workspaceId);
            }, delay);
          } else {
            this.sessions.delete(deviceId);
            this.deviceStates.set(deviceId, {
              status: 'DISCONNECTED',
              qrCode: null,
              phoneNumber: null,
              battery: 0,
              updatedAt: new Date(),
            });

            await prisma.device.updateMany({
              where: { id: deviceId },
              data: { status: 'DISCONNECTED' },
            }).catch(() => {});

            try {
              if (fs.existsSync(sessionDir)) {
                fs.rmSync(sessionDir, { recursive: true, force: true });
              }
            } catch (rmErr) {}
          }
        }
      });

      // Event: Incoming Messages (AUTO-REPLY CHATBOT ENGINE)
      sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
          // Ignore status broadcast or outgoing messages
          if (!msg.message || msg.key.fromMe) continue;
          
          const remoteJid = msg.key.remoteJid;
          if (!remoteJid || remoteJid.endsWith('@g.us')) continue; // skip groups

          // Extract text content
          const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            '';

          if (!text.trim()) continue;

          const incomingText = text.trim();
          const cleanPhone = remoteJid.replace(/[^0-9]/g, '');

          // Find active auto-reply rules
          try {
            const rules = await prisma.autoReplyRule.findMany({
              where: {
                isActive: true,
                OR: [
                  { deviceId },
                  { deviceId: null, workspaceId: workspaceId || undefined },
                ],
              },
            });

            if (rules.length === 0) continue;

            // Find matching rule
            let matchedRule = null;

            // 1. Try Exact match
            matchedRule = rules.find(
              (r) => r.matchType === 'EXACT' && r.keyword.toLowerCase().trim() === incomingText.toLowerCase()
            );

            // 2. Try Starts With
            if (!matchedRule) {
              matchedRule = rules.find(
                (r) => r.matchType === 'STARTS_WITH' && incomingText.toLowerCase().startsWith(r.keyword.toLowerCase().trim())
              );
            }

            // 3. Try Contains
            if (!matchedRule) {
              matchedRule = rules.find(
                (r) => r.matchType === 'CONTAINS' && incomingText.toLowerCase().includes(r.keyword.toLowerCase().trim())
              );
            }

            // 4. Try Default Fallback
            if (!matchedRule) {
              matchedRule = rules.find((r) => r.matchType === 'DEFAULT');
            }

            if (matchedRule) {
              console.log(`🤖 Auto-Reply Triggered for [${cleanPhone}] via Rule: "${matchedRule.keyword}"`);

              // Resolve contact name if available in DB
              const contact = await prisma.contact.findFirst({
                where: { phone: cleanPhone },
              });

              const recipientName = contact?.name || msg.pushName || 'Kak';

              // Format Spintax and variables
              let replyText = parseSpintax(matchedRule.responseMessage);
              replyText = replyText.replace(/\{\{\s*name\s*\}\}/gi, recipientName);
              replyText = replyText.replace(/\{\{\s*phone\s*\}\}/gi, cleanPhone);

              // Send Reply
              await this.sendMessage(deviceId, cleanPhone, replyText, {
                imageUrl: matchedRule.mediaType === 'image' ? matchedRule.mediaUrl : null,
                documentUrl: matchedRule.mediaType === 'document' ? matchedRule.mediaUrl : null,
                fileName: matchedRule.fileName,
              });

              // Increment counter
              await prisma.autoReplyRule.update({
                where: { id: matchedRule.id },
                data: { triggerCount: { increment: 1 } },
              }).catch(() => {});
            }
          } catch (replyErr) {
            console.error('Error executing Auto-Reply:', replyErr.message);
          }
        }
      });

      // Wait up to 2 seconds for QR to be available
      let waitCount = 0;
      while (!this.deviceStates.get(deviceId)?.qrCode && waitCount < 10) {
        await new Promise((r) => setTimeout(r, 200));
        waitCount++;
      }

      return {
        status: this.deviceStates.get(deviceId)?.status || 'PAIRING',
        qrCode: this.deviceStates.get(deviceId)?.qrCode || null,
      };
    } catch (error) {
      console.error(`❌ Error initializing WhatsApp session for device [${deviceId}]:`, error);
      this.deviceStates.set(deviceId, {
        status: 'DISCONNECTED',
        qrCode: null,
        phoneNumber: null,
        error: error.message,
        updatedAt: new Date(),
      });
      return {
        status: 'DISCONNECTED',
        error: error.message,
      };
    }
  }

  /**
   * Send WhatsApp text, image, or document message
   */
  async sendMessage(deviceId, toPhoneNumber, message, options = {}) {
    let sock = this.sessions.get(deviceId);
    let state = this.deviceStates.get(deviceId);

    // Auto-wake dormant session if not in memory
    if (!sock || state?.status !== 'CONNECTED') {
      console.log(`🔄 [WhatsAppManager] Device [${deviceId}] not in active memory. Auto-waking session...`);
      await this.initSession(deviceId, options.workspaceId || null);
      // Wait up to 3 seconds for session to open
      let waitCount = 0;
      while (this.deviceStates.get(deviceId)?.status !== 'CONNECTED' && waitCount < 15) {
        await new Promise((r) => setTimeout(r, 200));
        waitCount++;
      }
      sock = this.sessions.get(deviceId);
      state = this.deviceStates.get(deviceId);
    }

    if (!sock || state?.status !== 'CONNECTED') {
      throw new Error(`Perangkat WhatsApp sedang tidak terhubung (Offline). Silakan scan QR ulang.`);
    }

    const jid = this.formatJID(toPhoneNumber);
    if (!jid) {
      throw new Error('Nomor telepon tujuan tidak valid.');
    }

    let payload = { text: message };

    if (options.imageUrl) {
      // Check if local file exists or remote URL
      const localPath = options.imageUrl.startsWith('http')
        ? path.join(UPLOADS_DIR, path.basename(options.imageUrl))
        : options.imageUrl;

      if (fs.existsSync(localPath)) {
        payload = {
          image: fs.readFileSync(localPath),
          caption: message,
        };
      } else {
        payload = {
          image: { url: options.imageUrl },
          caption: message,
        };
      }
    } else if (options.videoUrl) {
      const localPath = options.videoUrl.startsWith('http')
        ? path.join(UPLOADS_DIR, path.basename(options.videoUrl))
        : options.videoUrl;

      if (fs.existsSync(localPath)) {
        payload = {
          video: fs.readFileSync(localPath),
          caption: message,
        };
      } else {
        payload = {
          video: { url: options.videoUrl },
          caption: message,
        };
      }
    } else if (options.documentUrl) {
      const localPath = options.documentUrl.startsWith('http')
        ? path.join(UPLOADS_DIR, path.basename(options.documentUrl))
        : options.documentUrl;

      const fileName = options.fileName || path.basename(options.documentUrl) || 'document.pdf';

      if (fs.existsSync(localPath)) {
        payload = {
          document: fs.readFileSync(localPath),
          mimetype: 'application/pdf',
          fileName,
          caption: message,
        };
      } else {
        payload = {
          document: { url: options.documentUrl },
          mimetype: 'application/pdf',
          fileName,
          caption: message,
        };
      }
    }

    try {
      const sent = await sock.sendMessage(jid, payload);
      return {
        success: true,
        messageId: sent.key.id,
        timestamp: sent.messageTimestamp,
        recipient: toPhoneNumber,
      };
    } catch (sendErr) {
      // If socket closed or temporary hiccup, retry once with fresh handshake
      if (sendErr.message?.includes('Closed') || sendErr.message?.includes('closed') || sendErr?.output?.statusCode === 428) {
        console.log(`⚠️ Socket connection closed for [${deviceId}]. Reconnecting and retrying send...`);
        await this.initSession(deviceId, options.workspaceId || null);
        await new Promise((r) => setTimeout(r, 2500));
        const retrySock = this.sessions.get(deviceId);
        if (retrySock && this.deviceStates.get(deviceId)?.status === 'CONNECTED') {
          const sentRetry = await retrySock.sendMessage(jid, payload);
          return {
            success: true,
            messageId: sentRetry.key.id,
            timestamp: sentRetry.messageTimestamp,
            recipient: toPhoneNumber,
          };
        }
      }
      throw sendErr;
    }
  }

  /**
   * Disconnect & Logout WhatsApp session
   */
  async disconnectSession(deviceId, workspaceId = null) {
    const sock = this.sessions.get(deviceId);
    if (sock) {
      try {
        await sock.logout();
      } catch (err) {
        try {
          sock.end();
        } catch (_) {}
      }
      this.sessions.delete(deviceId);
    }

    this.deviceStates.set(deviceId, {
      status: 'DISCONNECTED',
      qrCode: null,
      phoneNumber: null,
      battery: 0,
      updatedAt: new Date(),
    });

    const sessionDir = this.getSessionPath(deviceId);
    if (fs.existsSync(sessionDir)) {
      try {
        fs.rmSync(sessionDir, { recursive: true, force: true });
      } catch (e) {}
    }

    await prisma.device.updateMany({
      where: { id: deviceId },
      data: { status: 'DISCONNECTED' },
    }).catch(() => {});

    await logAudit({
      workspaceId,
      action: 'WHATSAPP_DISCONNECTED',
      module: 'whatsapp',
      details: `Perangkat WhatsApp ID ${deviceId} diputuskan (Logged Out).`,
    });

    return { success: true, message: 'Perangkat WhatsApp berhasil diputuskan.' };
  }

  /**
   * Auto-restore all active sessions on server boot
   */
  async restoreAllSessions() {
    try {
      const activeDevices = await prisma.device.findMany({
        where: { status: 'CONNECTED' },
      });

      console.log(`🔄 Restoring ${activeDevices.length} connected WhatsApp device session(s)...`);

      for (const device of activeDevices) {
        const sessionDir = this.getSessionPath(device.id);
        if (fs.existsSync(sessionDir)) {
          this.initSession(device.id, device.workspaceId).catch((err) => {
            console.error(`Failed to restore device [${device.id}]:`, err.message);
          });
        } else {
          await prisma.device.update({
            where: { id: device.id },
            data: { status: 'DISCONNECTED' },
          });
        }
      }
    } catch (error) {
      console.error('Error during WhatsApp session restoration:', error.message);
    }
  }
}

export const whatsappManager = new WhatsAppManager();
export default whatsappManager;
