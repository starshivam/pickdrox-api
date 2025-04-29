import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { logout } from '../controllers/auth.controller';

const router = express.Router();

// Make sure to type this correctly

router.get('/logout', authenticateToken, logout);

export default router;