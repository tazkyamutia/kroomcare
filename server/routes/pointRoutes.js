const express = require('express');
const router = express.Router();
const { getPointHistory, redeemPoints, getPointBalance, rewardCustomer } = require('../controllers/pointController');

// Route untuk mendapatkan riwayat poin user
router.get('/history/:user_id', getPointHistory);

// Route untuk menukarkan poin (point keluar)
router.post('/redeem', redeemPoints);

// Route untuk mendapatkan saldo poin saat ini
router.get('/balance/:user_id', getPointBalance);

// Route untuk memberikan reward koin ke customer
router.post('/reward', rewardCustomer);

module.exports = router;
