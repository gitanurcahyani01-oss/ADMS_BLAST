import { Router } from 'express';
import {
  getMonitoringStats,
  getDevices,
  getBlastLogs,
} from '../controllers/monitoringController.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();

// Both Super Admin & Admin can access monitoring routes
router.use(verifyToken);

router.get('/stats', getMonitoringStats);
router.get('/devices', getDevices);
router.get('/logs', getBlastLogs);

export default router;
