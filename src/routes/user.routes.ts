import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { logout } from '../controllers/auth.controller';
import { updateProfile } from '../controllers/user.controller';

const router = express.Router();

// Make sure to type this correctly

router.get('/logout', authenticateToken, logout);
router.post('/profile/update', authenticateToken, updateProfile);

export default router;