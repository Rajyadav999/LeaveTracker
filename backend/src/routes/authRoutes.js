const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendRegisterOtp);
router.post('/forgot-password', authController.sendResetPasswordOtp);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;
