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

// Reward Customer with Points (Staf/Admin memberi atau mengedit poin ke customer untuk tiket)
const rewardCustomer = async (req, res) => {
  try {
    const { ticket_id, ticketId, user_id, userId, points } = req.body;
    const targetUserId = user_id || userId;
    const targetTicketId = ticket_id || ticketId;
    const pointsAmount = parseInt(points, 10);

    if (isNaN(pointsAmount) || pointsAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Jumlah poin harus berupa angka valid (minimal 0).'
      });
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'user_id wajib disertakan.'
      });
    }

    // 1. Cek user
    const [userRows] = await db.query('SELECT id, nama, koin_reward FROM users WHERE id = ?', [targetUserId]);
    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User pelanggan tidak ditemukan.'
      });
    }

    const currentBalance = userRows[0].koin_reward || 0;

    // 2. Cek apakah sudah pernah diberi reward untuk tiket ini
    let existingReward = null;
    if (targetTicketId) {
      const [histRows] = await db.query(
        "SELECT id, jumlah_poin FROM point_histories WHERE user_id = ? AND keterangan LIKE ? ORDER BY id DESC LIMIT 1",
        [targetUserId, `%penyelesaian tiket #${targetTicketId}%`]
      );
      if (histRows.length > 0) {
        existingReward = histRows[0];
      }
    }

    let newBalance = currentBalance;
    const desc = targetTicketId 
      ? `Reward penyelesaian tiket #${targetTicketId}`
      : `Reward poin pelayanan pelanggan`;

    if (existingReward) {
      // Edit / Update poin yang sudah pernah diberikan: hitung selisih
      const diff = pointsAmount - existingReward.jumlah_poin;
      newBalance = Math.max(0, currentBalance + diff);
      await db.query('UPDATE users SET koin_reward = ? WHERE id = ?', [newBalance, targetUserId]);
      
      // Update record history lama
      await db.query(
        'UPDATE point_histories SET jumlah_poin = ?, keterangan = ? WHERE id = ?',
        [pointsAmount, desc, existingReward.id]
      );
    } else {
      // Pemberian reward pertama kali
      newBalance = currentBalance + pointsAmount;
      await db.query('UPDATE users SET koin_reward = ? WHERE id = ?', [newBalance, targetUserId]);

      await db.query(
        'INSERT INTO point_histories (user_id, jenis_transaksi, jumlah_poin, keterangan) VALUES (?, ?, ?, ?)',
        [targetUserId, 'masuk', pointsAmount, desc]
      );
    }

    res.status(200).json({
      success: true,
      message: existingReward
        ? `Berhasil memperbarui reward menjadi ${pointsAmount} koin.`
        : `Berhasil memberikan ${pointsAmount} koin reward kepada pelanggan.`,
      data: {
        userId: targetUserId,
        pointsAwarded: pointsAmount,
        isUpdated: !!existingReward,
        newBalance: newBalance
      }
    });
  } catch (error) {
    console.error('Error in rewardCustomer:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memberikan reward poin.',
      error: error.message
    });
  }
};

module.exports = {
  getPointHistory,
  redeemPoints,
  getPointBalance,
  rewardCustomer
};
