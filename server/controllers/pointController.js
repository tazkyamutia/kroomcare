const db = require('../config/db');

// Get Point History for a User
const getPointHistory = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id wajib disertakan.'
      });
    }

    const query = 'SELECT * FROM point_histories WHERE user_id = ? ORDER BY created_at DESC';
    const [rows] = await db.query(query, [user_id]);

    res.status(200).json({
      success: true,
      message: 'Riwayat poin berhasil diambil.',
      data: rows
    });
  } catch (error) {
    console.error('Error in getPointHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Redeem Points (Point Keluar)
const redeemPoints = async (req, res) => {
  try {
    const { user_id, points_required, keterangan } = req.body;

    if (!user_id || !points_required || !keterangan) {
      return res.status(400).json({
        success: false,
        message: 'user_id, points_required, dan keterangan wajib disertakan.'
      });
    }

    // 1. Cek saldo koin_reward user saat ini
    const [userRows] = await db.query('SELECT koin_reward FROM users WHERE id = ?', [user_id]);
    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    const currentPoints = userRows[0].koin_reward;
    if (currentPoints < points_required) {
      return res.status(400).json({
        success: false,
        message: 'Poin Anda tidak mencukupi untuk melakukan penukaran ini.'
      });
    }

    // 2. Kurangi koin_reward di tabel users
    await db.query('UPDATE users SET koin_reward = koin_reward - ? WHERE id = ?', [points_required, user_id]);

    // 3. Catat transaksi keluar di tabel point_histories
    await db.query(
      'INSERT INTO point_histories (user_id, jenis_transaksi, jumlah_poin, keterangan) VALUES (?, ?, ?, ?)',
      [user_id, 'keluar', points_required, keterangan]
    );

    res.status(200).json({
      success: true,
      message: 'Voucher berhasil ditukarkan.'
    });
  } catch (error) {
    console.error('Error in redeemPoints:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Get Point Balance
const getPointBalance = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id wajib disertakan.'
      });
    }

    const [rows] = await db.query('SELECT koin_reward FROM users WHERE id = ?', [user_id]);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Saldo poin berhasil diambil.',
      points: rows[0].koin_reward
    });
  } catch (error) {
    console.error('Error in getPointBalance:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

module.exports = {
  getPointHistory,
  redeemPoints,
  getPointBalance
};
