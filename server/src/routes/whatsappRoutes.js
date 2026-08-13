import express from 'express';
import {
  getDevices,
  createDevice,
  getDeviceQR,
  disconnectDevice,
  deleteDevice,
  sendTestMessage,
} from '../controllers/whatsappController.js';
import { verifyToken, requirePermission, requireWorkspace } from '../middleware/auth.js';

const router = express.Router();

// All WhatsApp routes require authentication
router.use(verifyToken);

// Device management
router.get('/devices', requirePermission('whatsapp.view'), getDevices);
router.post('/devices', requirePermission('whatsapp.connect'), requireWorkspace, createDevice);
router.get('/devices/:deviceId/qr', requirePermission('whatsapp.connect'), getDeviceQR);
router.post('/devices/:deviceId/disconnect', requirePermission('whatsapp.disconnect'), disconnectDevice);
router.delete('/devices/:deviceId', requirePermission('whatsapp.disconnect'), deleteDevice);

// Live test messaging
router.post('/send-test', requirePermission('broadcast.create'), sendTestMessage);

export default router;
