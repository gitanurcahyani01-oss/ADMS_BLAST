import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(verifyToken);
router.get('/', requireRole('SUPER_ADMIN', 'ADMIN'), getAuditLogs);

export default router;
