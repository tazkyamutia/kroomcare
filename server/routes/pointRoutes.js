const express = require('express');
const router = express.Router();
const { getPointHistory, redeemPoints, getPointBalance } = require('../controllers/pointController');

// Route untuk mendapatkan riwayat poin user
router.get('/history/:user_id', getPointHistory);

// Route untuk menukarkan poin (point keluar)
router.post('/redeem', redeemPoints);

// Route untuk mendapatkan saldo poin saat ini
router.get('/balance/:user_id', getPointBalance);

module.exports = router;
