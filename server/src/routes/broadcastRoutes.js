import express from 'express';
import {
  getBroadcasts,
  createBroadcast,
  startBroadcast,
  pauseBroadcast,
  resumeBroadcast,
  cancelBroadcast,
  getProgress,
  getBroadcastLogs,
  deleteBroadcast,
} from '../controllers/broadcastController.js';
import { verifyToken, requirePermission, requireWorkspace } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', requirePermission('broadcast.view'), getBroadcasts);
router.post('/', requirePermission('broadcast.create'), requireWorkspace, createBroadcast);
router.delete('/:id', requirePermission('broadcast.delete'), deleteBroadcast);

// Queue execution & life-cycle controls
router.post('/:id/start', requirePermission('broadcast.send'), startBroadcast);
router.post('/:id/pause', requirePermission('broadcast.send'), pauseBroadcast);
router.post('/:id/resume', requirePermission('broadcast.send'), resumeBroadcast);
router.post('/:id/cancel', requirePermission('broadcast.send'), cancelBroadcast);

// Live progress & detailed logs
router.get('/:id/progress', requirePermission('broadcast.view'), getProgress);
router.get('/:id/logs', requirePermission('broadcast.view'), getBroadcastLogs);

export default router;
