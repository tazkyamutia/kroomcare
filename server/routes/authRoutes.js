const express = require('express');
const router = express.Router();
const { requireAuth, requireSelfOrAdmin } = require('../middleware/auth');
const rateLimit = require('../middleware/rateLimit');

// Batas percobaan untuk endpoint yang bisa ditebak (password, OTP, kode reset, tiket SSO).
const loginLimiter = rateLimit({ max: 20, windowMs: 15 * 60 * 1000, message: 'Terlalu banyak percobaan. Coba lagi dalam 15 menit.' });
const otpLimiter = rateLimit({ max: 10, windowMs: 15 * 60 * 1000, message: 'Terlalu banyak percobaan kode. Coba lagi dalam 15 menit.' });
const selfId = (req) => req.params.id;
const { 
  login, 
  register,
  getProfile, 
  updateProfile, 
  changePassword,
  setup2FA,
  verify2FA,
  disable2FA,
  login2FA,
  forgotPassword,
  resetPassword,
  ssoExchange
} = require('../controllers/authController');

// Route untuk Single Sign-On (SSO) Kroombox Panel
router.post('/sso-exchange', loginLimiter, ssoExchange);

// Route untuk login & register
router.post('/login', loginLimiter, login);
router.post('/register', loginLimiter, register);
router.post('/login/2fa', otpLimiter, login2FA);
router.post('/forgot-password', otpLimiter, forgotPassword);
router.post('/reset-password', otpLimiter, resetPassword);

// Route untuk profil pengguna
router.get('/profile/:id', requireAuth, requireSelfOrAdmin(selfId), getProfile);
router.put('/profile/:id', requireAuth, requireSelfOrAdmin(selfId), updateProfile);
router.put('/profile/:id/password', requireAuth, requireSelfOrAdmin(selfId), otpLimiter, changePassword);

// Route untuk 2FA
router.post('/2fa/setup', requireAuth, setup2FA);
router.post('/2fa/verify', requireAuth, otpLimiter, verify2FA);
router.post('/2fa/disable', requireAuth, otpLimiter, disable2FA);

module.exports = router;
