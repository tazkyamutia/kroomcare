const db = require('../config/db');

/**
 * receiveExternalTicket
 * Endpoint server-to-server (KolabPanel → Kroomcare).
 * Memvalidasi API Key, melakukan JIT Provisioning akun,
 * menyimpan tiket, memberi reward koin, dan antrekan notifikasi WA.
 */
const receiveExternalTicket = async (req, res) => {
  try {
    // ── 1. Validasi API Key ──────────────────────────────────────────────────
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.KROOMCARE_API_KEY) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or missing API Key'
      });
    }

    // ── 2. Validasi Payload ──────────────────────────────────────────────────
    const { external_ticket_id, email, nama, judul, kategori, prioritas, deskripsi } = req.body;
    if (!email || !judul || !deskripsi) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, judul, deskripsi'
      });
    }

    // ── 3. JIT Provisioning — Cari atau Buat Akun ───────────────────────────
    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    let userId;
    let isNewUser = false;

    if (rows.length === 0) {
      // Buat akun baru dengan role 'member' (password placeholder, tidak untuk login langsung)
      const defaultPassword = 'EXT_USER_' + Date.now();
      const insertUser = `
        INSERT INTO users (nama, email, password, role, koin_reward)
        VALUES (?, ?, ?, 'member', 0)
      `;
      const [userResult] = await db.query(insertUser, [
        nama || 'User KolabPanel',
        email,
        defaultPassword
      ]);
      userId = userResult.insertId;
      isNewUser = true;
    } else {
      userId = rows[0].id;
    }

    // ── 4. Simpan Tiket ──────────────────────────────────────────────────────
    const isPriority = (prioritas && prioritas.toLowerCase() === 'high') ? 1 : 0;
    const finalKategori = kategori || 'General';

    const insertTicket = `
      INSERT INTO tickets (external_ticket_id, user_id, judul, deskripsi, is_priority, kategori)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [ticketResult] = await db.query(insertTicket, [
      external_ticket_id || null,
      userId,
      judul,
      deskripsi,
      isPriority,
      finalKategori
    ]);
    const ticketId = ticketResult.insertId;

    // ── 5. Tambah Reward Koin (Anti-spam 1x per hari, 10 poin) ────────────────
    try {
      const [todayReward] = await db.query(
        `SELECT id FROM point_histories 
         WHERE user_id = ? 
           AND jenis_transaksi = 'masuk' 
           AND keterangan LIKE 'Reward pembuatan tiket%' 
           AND DATE(created_at) = CURDATE()`,
        [userId]
      );
      if (todayReward.length === 0) {
        await db.query(
          'UPDATE users SET koin_reward = COALESCE(koin_reward, 0) + 10 WHERE id = ?',
          [userId]
        );
        const descPoint = `Reward pembuatan tiket eksternal #${ticketId}`;
        await db.query(
          'INSERT INTO point_histories (user_id, jenis_transaksi, jumlah_poin, keterangan) VALUES (?, ?, ?, ?)',
          [userId, 'masuk', 10, descPoint]
        );
      }
    } catch (pErr) {
      console.error('Failed to process external ticket reward:', pErr.message);
    }

    // ── 6. Antrekan Notifikasi WhatsApp ──────────────────────────────────────
    const targetJid = process.env.WA_TARGET_JID || '120363xxxxx@g.us';
    const prioritasLabel = isPriority ? '🔴 Tinggi (High)' : '🟢 Normal';
    const newUserNote = isNewUser ? '\n⚠️ _Akun baru telah dibuat secara otomatis (JIT)_' : '';

    const messageContent =
      `🎫 *Tiket Keluhan Eksternal (KolabPanel) #${ticketId}*\n` +
      `*Nama:* ${nama || 'Tidak diketahui'}\n` +
      `*Email:* ${email}\n` +
      `*Subjek:* ${judul}\n` +
      `*Kategori:* ${finalKategori}\n` +
      `*Deskripsi:* ${deskripsi}\n` +
      `*Prioritas:* ${prioritasLabel}` +
      newUserNote;

    const {
      queueNotification,
      sendNotification,
      updateNotificationStatus
    } = require('../utils/notificationQueue');

    queueNotification(targetJid, messageContent)
      .then(async (queueId) => {
        if (!queueId) return;
        const result = await sendNotification(targetJid, messageContent);
        if (result.success) {
          await updateNotificationStatus(queueId, 'sent');
        } else {
          await updateNotificationStatus(queueId, 'failed', 1);
        }
      })
      .catch((err) => console.error('[ExternalController] WA queue error:', err.message));

    // ── 7. Response Sukses ───────────────────────────────────────────────────
    return res.status(200).json({
      success: true,
      message: 'Ticket successfully created',
      data: {
        ticketId,
        userId,
        isNewUser,
        kategori: finalKategori,
        isPriority: Boolean(isPriority)
      }
    });
  } catch (error) {
    console.error('[ExternalController] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

const receiveExternalStatus = async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.KROOMCARE_API_KEY) {
      return res.status(401).json({ success: false, message: 'Invalid API Key' });
    }

    const { external_ticket_id, status } = req.body;
    if (!external_ticket_id || !status) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    // Map KolabPanel status to Kroomcare status
    const dbStatus = (status === 'CLOSED' || status === 'Closed' || status === 'Resolved') ? 'selesai' : 'menunggu';

    await db.query('UPDATE tickets SET status = ? WHERE external_ticket_id = ?', [dbStatus, external_ticket_id]);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[ExternalController] receiveExternalStatus Error:', error);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
};

module.exports = { receiveExternalTicket, receiveExternalStatus };
