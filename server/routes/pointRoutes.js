const express = require('express');
const router = express.Router();
const { requireAuth, requireStaffOrAdmin, requireSelfOrStaff } = require('../middleware/auth');
const { getPointHistory, redeemPoints, getPointBalance, rewardCustomer } = require('../controllers/pointController');

router.use(requireAuth);

const ownUserId = (req) => req.params.user_id;

// Route untuk mendapatkan riwayat poin user (pemilik akun atau staff/admin)
router.get('/history/:user_id', requireSelfOrStaff(ownUserId), getPointHistory);

// Route untuk menukarkan poin (point keluar) milik akun yang sedang login
router.post('/redeem', redeemPoints);

// Route untuk mendapatkan saldo poin saat ini
router.get('/balance/:user_id', requireSelfOrStaff(ownUserId), getPointBalance);

// Route untuk memberikan reward koin ke customer (staff/admin, wajib menyebut tiket)
router.post('/reward', requireStaffOrAdmin, rewardCustomer);

module.exports = router;
