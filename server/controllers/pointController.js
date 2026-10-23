const db = require('../config/db');
const { loadTicketForUser, notifyUser } = require('../utils/ticketAccess');

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
      message: 'Terjadi kesalahan server.'
    });
  }
};

// Redeem Points (Point Keluar)
const redeemPoints = async (req, res) => {
  try {
    const userId = req.user.id;
    const pointsRequired = Number(req.body.points_required);
    const keterangan = String(req.body.keterangan || '').slice(0, 255);

    if (!Number.isInteger(pointsRequired) || pointsRequired <= 0 || !keterangan) {
      return res.status(400).json({
        success: false,
        message: 'points_required harus bilangan bulat positif dan keterangan wajib disertakan.'
      });
    }

    // Pengurangan atomik: saldo dicek dan dipotong dalam satu query sehingga tidak bisa minus lewat request paralel.
    const [result] = await db.query(
      'UPDATE users SET koin_reward = koin_reward - ? WHERE id = ? AND koin_reward >= ?',
      [pointsRequired, userId, pointsRequired]
    );
    if (result.affectedRows === 0) {
      return res.status(400).json({
        success: false,
        message: 'Poin Anda tidak mencukupi untuk melakukan penukaran ini.'
      });
    }

    await db.query(
      'INSERT INTO point_histories (user_id, jenis_transaksi, jumlah_poin, keterangan) VALUES (?, ?, ?, ?)',
      [userId, 'keluar', pointsRequired, keterangan]
    );

    res.status(200).json({
      success: true,
      message: 'Voucher berhasil ditukarkan.'
    });
  } catch (error) {
    console.error('Error in redeemPoints:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
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
      message: 'Terjadi kesalahan server.'
    });
  }
};

// Reward penyelesaian tiket. Satu catatan reward per tiket: mengirim ulang mengubah jumlahnya (selisih saja).
const MAX_REWARD_POINTS = 1000;
const applyTicketReward = async (ticket, rawPoints) => {
  const pointsAmount = Number(rawPoints === undefined || rawPoints === '' ? 50 : rawPoints);
  if (!Number.isInteger(pointsAmount) || pointsAmount < 0 || pointsAmount > MAX_REWARD_POINTS) {
    return { status: 400, body: { success: false, message: `Jumlah poin harus bilangan bulat 0 sampai ${MAX_REWARD_POINTS}.` } };
  }

  const customerId = ticket.user_id;
  const desc = `Reward penyelesaian tiket #${ticket.id}: ${ticket.judul}`;
  const [histRows] = await db.query(
    'SELECT id, jumlah_poin FROM point_histories WHERE user_id = ? AND keterangan LIKE ? ORDER BY id DESC LIMIT 1',
    [customerId, `%penyelesaian tiket #${ticket.id}%`]
  );
  const existing = histRows[0] || null;

  if (existing) {
    const diff = pointsAmount - Number(existing.jumlah_poin);
    await db.query('UPDATE users SET koin_reward = GREATEST(0, COALESCE(koin_reward, 0) + ?) WHERE id = ?', [diff, customerId]);
    await db.query('UPDATE point_histories SET jumlah_poin = ?, keterangan = ? WHERE id = ?', [pointsAmount, desc, existing.id]);
  } else {
    await db.query('UPDATE users SET koin_reward = COALESCE(koin_reward, 0) + ? WHERE id = ?', [pointsAmount, customerId]);
    await db.query(
      'INSERT INTO point_histories (user_id, jenis_transaksi, jumlah_poin, keterangan) VALUES (?, ?, ?, ?)',
      [customerId, 'masuk', pointsAmount, desc]
    );
  }

  const [balanceRows] = await db.query('SELECT koin_reward FROM users WHERE id = ?', [customerId]);
  await notifyUser(customerId, 'Reward poin diterima', `Anda menerima ${pointsAmount} poin untuk tiket #${ticket.id} "${ticket.judul}".`, '/points-history');

  return {
    status: 200,
    body: {
      success: true,
      message: existing
        ? `Berhasil memperbarui reward menjadi ${pointsAmount} koin.`
        : `Berhasil memberikan ${pointsAmount} koin reward kepada pelanggan.`,
      data: {
        userId: String(customerId),
        points: pointsAmount,
        pointsAwarded: pointsAmount,
        isUpdated: Boolean(existing),
        newBalance: balanceRows[0] ? balanceRows[0].koin_reward : null
      }
    }
  };
};

// Reward Customer with Points (staff/admin, lewat /api/points/reward dengan ticket_id)
const rewardCustomer = async (req, res) => {
  try {
    const ticket = await loadTicketForUser(req.user, req.body.ticket_id || req.body.ticketId);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Tiket tidak ditemukan. Reward hanya dapat diberikan untuk tiket.' });
    }
    const result = await applyTicketReward(ticket, req.body.points);
    res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Error in rewardCustomer:', error);
    res.status(500).json({ success: false, message: 'Gagal memberikan reward poin.' });
  }
};

module.exports = {
  getPointHistory,
  redeemPoints,
  getPointBalance,
  rewardCustomer,
  applyTicketReward
};
