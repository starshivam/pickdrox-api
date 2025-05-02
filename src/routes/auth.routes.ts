import express from 'express';
import { registerUser, loginUser, resendOTP, verifyOTP, resetPassword } from '../controllers/auth.controller';

const router = express.Router();

// Make sure to type this correctly
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/resend-otp/:email_phone', resendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/change-password', resetPassword);

export default router;