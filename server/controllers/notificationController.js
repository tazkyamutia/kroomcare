const db = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error getNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.status(200).json({
      success: true,
      data: { count: rows[0].count }
    });
  } catch (error) {
    console.error('Error getUnreadCount:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const [result] = await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan.' });
    }

    res.status(200).json({
      success: true,
      message: 'Notifikasi ditandai sebagai dibaca.'
    });
  } catch (error) {
    console.error('Error markAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await db.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Semua notifikasi ditandai sebagai dibaca.'
    });
  } catch (error) {
    console.error('Error markAllAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Fungsi helper untuk insert notifikasi secara internal (dipanggil dari controller lain)
const createInAppNotification = async (user_id, type, message, link) => {
  try {
    await db.query(
      'INSERT INTO notifications (user_id, type, message, link) VALUES (?, ?, ?, ?)',
      [user_id, type, message, link || null]
    );
  } catch (err) {
    console.error('Gagal mengirim notifikasi:', err);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createInAppNotification
};
