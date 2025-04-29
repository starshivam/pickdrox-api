import express from 'express';
import { registerUser, loginUser, resendOTP, verifyOTP } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

// Make sure to type this correctly
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/resend-otp/:email_phone', resendOTP);
router.post('/verify-otp', verifyOTP);

export default router;