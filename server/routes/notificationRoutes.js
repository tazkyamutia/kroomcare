const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

// Middleware autentikasi fleksibel: support Authorization Header dan user_id param/body
const flexibleAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (payload) {
      req.user = {
        id: payload.userId,
        role: payload.role,
        email: payload.email
      };
      return next();
    }
  }

  // Fallback ke user_id dari query atau body
  const userId = req.query.user_id || req.body?.user_id;
  if (userId) {
    req.user = { id: parseInt(userId, 10) };
    return next();
  }

  return res.status(401).json({
    success: false,
    message: 'Autentikasi atau user_id diperlukan.'
  });
};

router.use(flexibleAuth);

// Daftar notifikasi
router.get('/', getNotifications);

// Hitung unread
router.get('/unread-count', getUnreadCount);

// Tandai semua dibaca
router.put('/read-all', markAllAsRead);

// Tandai dibaca per id
router.put('/:id/read', markAsRead);

module.exports = router;
