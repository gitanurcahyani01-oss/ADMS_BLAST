import prisma from '../prisma.js';
import broadcastQueue from './BroadcastQueue.js';

class BroadcastScheduler {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }

  start() {
    if (this.interval) return;
    console.log('⏰ Broadcast Scheduler Worker started (checking every 30s)...');

    this.checkScheduledCampaigns();
    this.interval = setInterval(() => {
      this.checkScheduledCampaigns();
    }, 30000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async checkScheduledCampaigns() {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      const now = new Date();
      const dueCampaigns = await prisma.blastCampaign.findMany({
        where: {
          status: 'SCHEDULED',
          scheduledAt: { lte: now },
        },
      });

      for (const campaign of dueCampaigns) {
        console.log(`⏰ [Scheduler] Auto-launching Scheduled Campaign: [${campaign.title}] (${campaign.id})`);
        try {
          await broadcastQueue.startCampaign(campaign.id, campaign.workspaceId);
        } catch (err) {
          console.error(`❌ [Scheduler] Failed to launch campaign [${campaign.id}]:`, err.message);
        }
      }
    } catch (error) {
      console.error('❌ Error in BroadcastScheduler check:', error.message);
    } finally {
      this.isRunning = false;
    }
  }
}

export const broadcastScheduler = new BroadcastScheduler();
export default broadcastScheduler;
