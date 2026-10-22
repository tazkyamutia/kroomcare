const db = require('../config/db');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID diperlukan.' });
    }

    const [rows] = await db.query(
      'SELECT id, user_id, title, type, message, link, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
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
    const userId = req.user?.id || req.query.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID diperlukan.' });
    }

    const [rows] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
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
    const userId = req.user?.id || req.body.user_id || req.query.user_id;

    let query = 'UPDATE notifications SET is_read = TRUE WHERE id = ?';
    let params = [id];
    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    const [result] = await db.query(query, params);

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
    const userId = req.user?.id || req.body.user_id || req.query.user_id;
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID diperlukan.' });
    }

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

// Helper internal untuk menambah notifikasi
const createInAppNotification = async (user_id, title, message, link, type = 'ticket') => {
  try {
    const wibNow = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
    await db.query(
      'INSERT INTO notifications (user_id, title, type, message, link, is_read, created_at) VALUES (?, ?, ?, ?, ?, FALSE, ?)',
      [user_id, title, type, message, link || null, wibNow]
    );
  } catch (err) {
    console.error('Gagal membuat in-app notification:', err.message);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createInAppNotification
};
