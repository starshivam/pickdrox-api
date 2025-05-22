import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { logout } from '../controllers/auth.controller';
import { updateProfile, getProfile, changePassword, updateCommunicationPreferences, getCommunicationPreferences } from '../controllers/user.controller';
import { addRoute, getMyRoutes, getSingleRoute } from '../controllers/route.controller';
import { addPickupRequest, findAllUsersRequests } from '../controllers/pickuprequest.controller';

const router = express.Router();

// Route for logging out (authenticated user)
router.get('/logout', authenticateToken, logout);

// Route for updating user profile (authenticated user)
router.post('/profile/update', authenticateToken, updateProfile);

// Route for getting user profile (authenticated user)
router.get('/profile/get', authenticateToken, getProfile);

router.post('/profile/change-password', authenticateToken, changePassword);

// User Preferences
router.post('/update/communication-preferences', authenticateToken, updateCommunicationPreferences);
router.get('/get/communication-preferences', authenticateToken, getCommunicationPreferences);

// User Routes Request
router.post('/add/route', authenticateToken, addRoute);
router.get('/my/routes', authenticateToken, getMyRoutes);
router.get('/route/:routeId', authenticateToken, getSingleRoute);

// User Pickup Routes
router.post('/add/pickup-request', authenticateToken, addPickupRequest);
// Find all users pickup request as per parameters
router.get('/find/pickup-request', authenticateToken, findAllUsersRequests);


export default router;
