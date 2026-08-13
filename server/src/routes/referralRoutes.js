import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  validateReferralCode,
  getReferralStats,
  requestPayout,
  getAdminReferralOverview,
  processAdminPayout,
} from '../controllers/referralController.js';

const router = express.Router();

// Public endpoint to validate referral code at checkout
router.get('/validate/:code', validateReferralCode);

// Protected Client endpoints
router.get('/me', verifyToken, getReferralStats);
router.post('/payout', verifyToken, requestPayout);

// Super Admin endpoints
router.get('/admin/overview', verifyToken, (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }
  next();
}, getAdminReferralOverview);

router.patch('/admin/payout/:id', verifyToken, (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ success: false, message: 'Akses ditolak.' });
  }
  next();
}, processAdminPayout);

export default router;
