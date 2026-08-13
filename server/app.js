import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './src/routes/authRoutes.js';
import rbacRoutes from './src/routes/rbacRoutes.js';
import whatsappRoutes from './src/routes/whatsappRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import broadcastRoutes from './src/routes/broadcastRoutes.js';
import mediaRoutes from './src/routes/mediaRoutes.js';
import autoReplyRoutes from './src/routes/autoReplyRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import monitoringRoutes from './src/routes/monitoringRoutes.js';
import auditRoutes from './src/routes/auditRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import profileRoutes from './src/routes/profileRoutes.js';
import referralRoutes from './src/routes/referralRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.resolve(__dirname, 'uploads');
const PUBLIC_DIR = path.resolve(__dirname, 'public');

const app = express();

// Security & CORS
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));

// Body Parsers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Uploads
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

// Health Check Endpoint (Instant 200 OK)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({ status: 'ok', service: 'ADMS Blast Active', time: new Date().toISOString() });
});

// Auto DB Init Endpoint
app.get(['/api/init-db', '/init-db'], async (req, res) => {
  try {
    const { bootstrapDatabase } = await import('./src/utils/bootstrap.js');
    const result = await bootstrapDatabase();
    res.json(result);
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// API Endpoints
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/rbac', '/rbac'], rbacRoutes);
app.use(['/api/whatsapp', '/whatsapp'], whatsappRoutes);
app.use(['/api/contacts', '/contacts'], contactRoutes);
app.use(['/api/broadcasts', '/broadcasts', '/api/broadcast', '/broadcast'], broadcastRoutes);
app.use(['/api/media', '/media'], mediaRoutes);
app.use(['/api/auto-reply', '/auto-reply', '/api/autoreply', '/autoreply'], autoReplyRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/monitoring', '/monitoring'], monitoringRoutes);
app.use(['/api/audit-logs', '/audit-logs', '/api/audit', '/audit'], auditRoutes);
app.use(['/api/orders', '/orders'], orderRoutes);
app.use(['/api/profile', '/profile'], profileRoutes);
app.use(['/api/referrals', '/referrals'], referralRoutes);

// Frontend React SPA Static Serving
if (fs.existsSync(PUBLIC_DIR)) {
  app.use(express.static(PUBLIC_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
  });
}

// Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({ success: false, message: 'Internal Server Error', error: err.message });
});

// Port Binding & Instant Start
const PORT = typeof PhusionPassenger !== 'undefined' ? 'passenger' : (process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`🚀 ADMS Blast Online on ${PORT}`);
  // Non-blocking background loader
  setTimeout(async () => {
    try {
      const { bootstrapDatabase } = await import('./src/utils/bootstrap.js');
      await bootstrapDatabase();
    } catch (e) {}
    try {
      const whatsappManager = (await import('./src/whatsapp/WhatsAppManager.js')).default;
      await whatsappManager.restoreAllSessions();
    } catch (e) {}
    try {
      const broadcastScheduler = (await import('./src/whatsapp/scheduler.js')).default;
      broadcastScheduler.start();
    } catch (e) {}
    try {
      const subscriptionWorker = (await import('./src/workers/subscriptionWorker.js')).default;
      subscriptionWorker.start(30000);
    } catch (e) {}
  }, 2000);
});

export default app;
