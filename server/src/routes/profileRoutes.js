import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { getProfile, updateProfile, changePassword } from '../controllers/profileController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/me', getProfile);
router.patch('/update-info', updateProfile);
router.patch('/change-password', changePassword);

export default router;
