import prisma from '../prisma.js';
import whatsappManager from '../whatsapp/WhatsAppManager.js';

class SubscriptionWorker {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }

  start(intervalMs = 30000) {
    if (this.interval) return;
    console.log('⏰ Auto-Expiry & Renewal Reminder Worker started (checking every 30s)...');
    // Run immediately once, then on interval
    this.checkExpiredSubscriptions();
    this.checkSubscriptionReminders();
    this.interval = setInterval(() => {
      this.checkExpiredSubscriptions();
      this.checkSubscriptionReminders();
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async checkExpiredSubscriptions() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const now = new Date();

      // Find all subscriptions that have passed expiresAt and are still marked ACTIVE or TRIAL
      const expiredSubscriptions = await prisma.subscription.findMany({
        where: {
          status: { in: ['ACTIVE', 'TRIAL'] },
          expiresAt: {
            lte: now,
          },
        },
        include: {
          workspace: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      for (const sub of expiredSubscriptions) {
        if (!sub.workspace) continue;

        console.log(`🔒 Subscription EXPIRED for workspace: ${sub.workspace.name} (Expired at: ${sub.expiresAt})`);

        // 1. Mark subscription as EXPIRED
        await prisma.subscription.update({
          where: { id: sub.id },
          data: { status: 'EXPIRED' },
        });

        // 2. Mark workspace as SUSPENDED
        await prisma.workspace.update({
          where: { id: sub.workspaceId },
          data: { status: 'SUSPENDED' },
        });

        // 3. Suspend non-superadmin users in that workspace
        for (const member of sub.workspace.members) {
          if (member.user && member.user.role !== 'SUPER_ADMIN') {
            await prisma.user.update({
              where: { id: member.userId },
              data: { status: 'SUSPENDED' },
            });

            await prisma.workspaceUser.update({
              where: { id: member.id },
              data: { status: 'SUSPENDED' },
            });
          }
        }

        // 4. Pause any running campaigns in that workspace
        await prisma.blastCampaign.updateMany({
          where: {
            workspaceId: sub.workspaceId,
            status: { in: ['RUNNING', 'SCHEDULED'] },
          },
          data: { status: 'PAUSED' },
        });

        // 5. Record Audit Log
        await prisma.auditLog.create({
          data: {
            action: 'AUTO_EXPIRE_SUBSCRIPTION',
            module: 'subscription',
            details: `Sistem otomatis menonaktifkan (SUSPEND) akun workspace "${sub.workspace.name}" karena masa aktif langganan telah berakhir pada ${sub.expiresAt.toLocaleString('id-ID')}.`,
            workspaceId: sub.workspaceId,
          },
        });
      }
    } catch (error) {
      console.error('Error in SubscriptionWorker checkExpiredSubscriptions:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Helper: Activate or Extend Subscription for a Workspace
   * @param {string} workspaceId
   * @param {number} durationDays (e.g. 30 for 1 month, 90 for 3 months, 365 for 1 year)
   * @param {string} actorUser (User object of Admin/SuperAdmin who activated)
   */
  async activateOrExtendSubscription(workspaceId, durationDays = 30, actorUser) {
    const now = new Date();
    let sub = await prisma.subscription.findUnique({
      where: { workspaceId },
      include: { workspace: true, plan: true },
    });

    let defaultPlan = await prisma.subscriptionPlan.findFirst({
      where: { isActive: true },
    });

    let currentExpiry = sub?.expiresAt ? new Date(sub.expiresAt) : null;
    let newExpiry;

    if (currentExpiry && currentExpiry > now && sub.status === 'ACTIVE') {
      // Extend from existing expiration date
      newExpiry = new Date(currentExpiry.getTime() + durationDays * 24 * 60 * 60 * 1000);
    } else {
      // Start fresh from today
      newExpiry = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
    }

    // Determine matching plan based on package duration
    let planCode = 'BULANAN';
    if (durationDays >= 300) {
      planCode = '1TAHUN';
    } else if (durationDays >= 60) {
      planCode = '3BULAN';
    }

    const targetPlan = (await prisma.subscriptionPlan.findFirst({
      where: { code: planCode },
    })) || defaultPlan;

    if (sub) {
      sub = await prisma.subscription.update({
        where: { workspaceId },
        data: {
          status: 'ACTIVE',
          startsAt: now,
          expiresAt: newExpiry,
          planId: targetPlan?.id || sub.planId,
        },
        include: { workspace: true, plan: true },
      });
    } else {
      sub = await prisma.subscription.create({
        data: {
          workspaceId,
          planId: targetPlan?.id || defaultPlan?.id || '',
          status: 'ACTIVE',
          startsAt: now,
          expiresAt: newExpiry,
        },
        include: { workspace: true, plan: true },
      });
    }

    // Reactivate workspace
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { status: 'ACTIVE' },
    });

    // Reactivate all users in workspace
    const members = await prisma.workspaceUser.findMany({
      where: { workspaceId },
    });

    for (const m of members) {
      await prisma.user.update({
        where: { id: m.userId },
        data: { status: 'ACTIVE' },
      });
      await prisma.workspaceUser.update({
        where: { id: m.id },
        data: { status: 'ACTIVE' },
      });
    }

    // Record Audit Log safely
    let validActorId = null;
    if (actorUser?.id) {
      const userExists = await prisma.user.findUnique({ where: { id: actorUser.id } });
      if (userExists) validActorId = userExists.id;
    }

    await prisma.auditLog.create({
      data: {
        actorId: validActorId,
        action: 'EXTEND_SUBSCRIPTION',
        module: 'subscription',
        details: `${actorUser?.role || 'Admin'} ${actorUser?.name || 'Sistem'} mengaktifkan/memperpanjang langganan workspace "${sub.workspace?.name}" selama ${durationDays} hari (Masa aktif hingga: ${newExpiry.toLocaleDateString('id-ID')}).`,
        workspaceId,
      },
    });

    return {
      success: true,
      subscription: sub,
      expiresAt: newExpiry,
    };
  }

  /**
   * Check active subscriptions nearing expiration (H-3 and H-1) and send WhatsApp reminders
   */
  async checkSubscriptionReminders() {
    try {
      const now = new Date();
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Find subscriptions expiring within next 3 days
      const nearingExpiry = await prisma.subscription.findMany({
        where: {
          status: 'ACTIVE',
          expiresAt: {
            gt: now,
            lte: in3Days,
          },
        },
        include: {
          workspace: {
            include: {
              members: {
                include: { user: true },
              },
            },
          },
        },
      });

      if (!nearingExpiry.length) return;

      // Find any connected WhatsApp gateway device
      const activeDevice = await prisma.device.findFirst({
        where: { status: 'CONNECTED' },
      });

      if (!activeDevice) return;

      for (const sub of nearingExpiry) {
        if (!sub.workspace || !sub.expiresAt) continue;

        // Check if reminder was already sent today for this workspace
        const alreadySentToday = await prisma.auditLog.findFirst({
          where: {
            action: 'SEND_RENEWAL_REMINDER',
            workspaceId: sub.workspaceId,
            createdAt: { gte: startOfDay },
          },
        });

        if (alreadySentToday) continue;

        // Find primary contact
        const primaryMember = sub.workspace.members.find((m) => m.user?.phone);
        if (!primaryMember || !primaryMember.user?.phone) continue;

        const daysLeft = Math.ceil((new Date(sub.expiresAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const customerName = primaryMember.user.name;
        const customerPhone = primaryMember.user.phone;
        const expiryFormatted = new Date(sub.expiresAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const reminderMsg =
          `Halo Kak ${customerName},\n\n` +
          `Kami ingin menginfokan bahwa masa aktif paket langganan ADMS BLAST untuk workspace *${sub.workspace.name}* akan segera berakhir dalam *${daysLeft} Hari Lagi* (tepatnya pada *${expiryFormatted}*).\n\n` +
          `Agar seluruh aktivitas pengiriman broadcast promosi dan chatbot WhatsApp Anda tetap berjalan lancar tanpa terhenti, yuk lakukan perpanjangan paket Anda di:\n` +
          `👉 http://localhost:5173/harga\n\n` +
          `Jika Kakak butuh bantuan perpanjangan atau pembayaran via QRIS, silakan langsung balas pesan ini. Terima kasih! 🙏`;

        try {
          await whatsappManager.sendMessage(activeDevice.id, customerPhone, reminderMsg);
          console.log(`[SubscriptionReminder] Sent H-${daysLeft} renewal reminder to ${customerName} (${customerPhone})`);

          // Record in audit log
          await prisma.auditLog.create({
            data: {
              action: 'SEND_RENEWAL_REMINDER',
              module: 'subscription',
              details: `Sistem otomatis mengirimkan pengingat perpanjangan H-${daysLeft} ke nomor WhatsApp ${customerName} (${customerPhone}) untuk workspace "${sub.workspace.name}".`,
              workspaceId: sub.workspaceId,
            },
          });
        } catch (msgErr) {
          console.warn(`[SubscriptionReminder] Failed to send to ${customerPhone}:`, msgErr.message);
        }
      }
    } catch (err) {
      console.warn('[SubscriptionReminder] Error running reminder check:', err.message);
    }
  }
}

const subscriptionWorker = new SubscriptionWorker();
export default subscriptionWorker;
