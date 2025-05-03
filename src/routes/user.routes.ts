import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { logout } from '../controllers/auth.controller';
import { updateProfile, getProfile, changePassword, updateCommunicationPreferences, getCommunicationPreferences } from '../controllers/user.controller';

const router = express.Router();

// Route for logging out (authenticated user)
router.get('/logout', authenticateToken, logout);

// Route for updating user profile (authenticated user)
router.post('/profile/update', authenticateToken, updateProfile);

// Route for getting user profile (authenticated user)
router.get('/profile/get', authenticateToken, getProfile);

router.post('/profile/change-password', authenticateToken, changePassword);

router.post('/update/communication-preferences', authenticateToken, updateCommunicationPreferences);

router.get('/get/communication-preferences', authenticateToken, getCommunicationPreferences);


export default router;
