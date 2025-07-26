const express = require('express');
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
  logout,
  refreshToken,
  resendVerification,
  deleteAccount
} = require('../controllers/authController');

const {
  protect,
  verifyEmailToken,
  verifyPasswordResetToken
} = require('../middlewares/auth');

const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordResetRequest,
  validatePasswordReset
} = require('../middlewares/validation');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/verify-email/:token', verifyEmailToken, verifyEmail);
router.post('/forgot-password', validatePasswordResetRequest, forgotPassword);
router.post('/reset-password/:token', verifyPasswordResetToken, validatePasswordReset, resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, validateProfileUpdate, updateProfile);
router.put('/change-password', protect, validatePasswordReset, changePassword);
router.post('/logout', protect, logout);
router.post('/refresh', protect, refreshToken);
router.post('/resend-verification', protect, resendVerification);
router.delete('/me', protect, deleteAccount);

module.exports = router; 