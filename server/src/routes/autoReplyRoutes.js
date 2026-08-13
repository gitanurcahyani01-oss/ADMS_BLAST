import express from 'express';
import {
  getAutoReplyRules,
  createAutoReplyRule,
  updateAutoReplyRule,
  deleteAutoReplyRule,
} from '../controllers/autoReplyController.js';
import { verifyToken, requirePermission, requireWorkspace } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', requirePermission('automation.view'), getAutoReplyRules);
router.post('/', requirePermission('automation.create'), requireWorkspace, createAutoReplyRule);
router.put('/:id', requirePermission('automation.edit'), requireWorkspace, updateAutoReplyRule);
router.delete('/:id', requirePermission('automation.delete'), deleteAutoReplyRule);

export default router;
