const express = require('express');
const router = express.Router();
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
  resetPassword
} = require('../controllers/authController');

// Route untuk login & register
router.post('/login', login);
router.post('/register', register);
router.post('/login/2fa', login2FA);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Route untuk profil pengguna
router.get('/profile/:id', getProfile);
router.put('/profile/:id', updateProfile);
router.put('/profile/:id/password', changePassword);

// Route untuk 2FA
router.post('/2fa/setup', setup2FA);
router.post('/2fa/verify', verify2FA);
router.post('/2fa/disable', disable2FA);

module.exports = router;
