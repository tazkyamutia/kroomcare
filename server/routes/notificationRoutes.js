const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// Semua route notifikasi wajib autentikasi
router.use(requireAuth);

// Daftar notifikasi
router.get('/', getNotifications);

// Hitung unread
router.get('/unread-count', getUnreadCount);

// Tandai semua dibaca
router.put('/read-all', markAllAsRead);

// Tandai dibaca per id
router.put('/:id/read', markAsRead);

module.exports = router;
