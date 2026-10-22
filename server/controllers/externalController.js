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
    const { external_ticket_id, email, nama, judul, kategori, prioritas, priority, deskripsi } = req.body;
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

    // ── 4. Simpan Tiket (Cek Idempotensi) ───────────────────────────────────
    if (external_ticket_id) {
      const [existing] = await db.query('SELECT id FROM tickets WHERE external_ticket_id = ?', [external_ticket_id]);
      if (existing.length > 0) {
        return res.status(200).json({
          success: true,
          message: 'Tiket eksternal sudah ada (tersinkronisasi).',
          data: {
            ticketId: existing[0].id,
            userId,
            isNewUser: false,
            alreadyExists: true
          }
        });
      }
    }

    // Default prioritas tiket dari panel adalah Normal (0), hanya diset 1 jika secara eksplisit urgent/critical
    const prioRaw = (prioritas || priority || '').toString().toLowerCase();
    const isPriority = (prioRaw === 'urgent' || prioRaw === 'critical') ? 1 : 0;
    const finalKategori = kategori || 'General';
    const wibNow = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });

    const insertTicket = `
      INSERT INTO tickets (external_ticket_id, user_id, judul, deskripsi, is_priority, kategori, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [ticketResult] = await db.query(insertTicket, [
      external_ticket_id || null,
      userId,
      judul,
      deskripsi,
      isPriority,
      finalKategori,
      wibNow
    ]);
    const ticketId = ticketResult.insertId;

    // Kirim notifikasi in-app ke seluruh staf & admin
    try {
      const [staffAndAdmin] = await db.query("SELECT id FROM users WHERE role IN ('staff', 'admin')");
      for (const sa of staffAndAdmin) {
        await db.query(
          "INSERT INTO notifications (user_id, title, type, message, link, is_read, created_at) VALUES (?, ?, 'ticket', ?, ?, 0, ?)",
          [
            sa.id,
            `Tiket Baru dari Panel #${ticketId}`,
            `Tiket #${ticketId} (${external_ticket_id || 'Panel'}) dari ${nama || 'User Panel'}: "${judul}"`,
            `/tickets/${ticketId}`,
            wibNow
          ]
        );
      }
    } catch (nErr) {
      console.error('[ExternalController] Gagal membuat notifikasi staff/admin:', nErr.message);
    }

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
          'INSERT INTO point_histories (user_id, jenis_transaksi, jumlah_poin, keterangan, created_at) VALUES (?, ?, ?, ?, ?)',
          [userId, 'masuk', 10, descPoint, wibNow]
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
    const statusLower = (status || '').toString().toLowerCase();
    const dbStatus = (statusLower === 'closed' || statusLower === 'resolved' || statusLower === 'selesai') 
      ? 'selesai' 
      : (statusLower === 'in_progress' || statusLower === 'in progress' || statusLower === 'diproses')
        ? 'diproses'
        : 'menunggu';

    await db.query('UPDATE tickets SET status = ? WHERE external_ticket_id = ?', [dbStatus, external_ticket_id]);

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[ExternalController] receiveExternalStatus Error:', error);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
};

const receiveExternalReply = async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.KROOMCARE_API_KEY) {
      return res.status(401).json({ success: false, message: 'Invalid API Key' });
    }

    const { external_ticket_id, email, text, konten, ticket_id, id: rawId, message } = req.body;
    const extTicketId = external_ticket_id || ticket_id || rawId;
    const replyContent = text || konten || message;

    if (!extTicketId || !replyContent) {
      return res.status(400).json({ success: false, message: 'Missing required fields: external_ticket_id/ticket_id, text/konten/message' });
    }

    // Cari tiket berdasarkan external_ticket_id atau ID tiket lokal
    let [tickets] = await db.query('SELECT id, user_id, staff_id, judul FROM tickets WHERE external_ticket_id = ?', [extTicketId]);
    if (tickets.length === 0 && !isNaN(Number(extTicketId))) {
      [tickets] = await db.query('SELECT id, user_id, staff_id, judul FROM tickets WHERE id = ?', [Number(extTicketId)]);
    }

    if (tickets.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found for external_ticket_id: ' + extTicketId });
    }

    const ticketId = tickets[0].id;
    let senderUserId = tickets[0].user_id;

    if (email) {
      const [uRows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (uRows.length > 0) {
        senderUserId = uRows[0].id;
      }
    }

    const wibNow = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
    const [result] = await db.query(
      'INSERT INTO ticket_replies (ticket_id, user_id, konten, created_at) VALUES (?, ?, ?, ?)',
      [ticketId, senderUserId, replyContent, wibNow]
    );

    // Update updated_at tiket
    await db.query('UPDATE tickets SET updated_at = ? WHERE id = ?', [wibNow, ticketId]);

    // Beritahukan staff atau customer jika ada balasan masuk
    try {
      const [senderRoleRow] = await db.query('SELECT role, nama FROM users WHERE id = ?', [senderUserId]);
      const senderRole = senderRoleRow[0]?.role || 'customer';
      const senderName = senderRoleRow[0]?.nama || 'Pengguna';

      if (senderRole === 'staff' || senderRole === 'admin') {
        // Balasan dari staff/admin -> Beritahukan pelanggan pemilik tiket
        await db.query(`
          INSERT INTO notifications (user_id, title, type, message, link, is_read, created_at)
          VALUES (?, ?, 'ticket', ?, ?, FALSE, ?)
        `, [
          tickets[0].user_id,
          `Balasan dari ${senderName} (Staff)`,
          `Staff membalas tiket #${ticketId} "${tickets[0].judul}": "${replyContent.slice(0, 80)}"`,
          `/tickets/${ticketId}`,
          wibNow
        ]);
      } else {
        // Balasan dari customer -> Beritahukan staf yang ditugaskan atau seluruh staf & admin
        const [targetRecipients] = tickets[0].staff_id
          ? [[{ id: tickets[0].staff_id }]]
          : await db.query("SELECT id FROM users WHERE role IN ('staff', 'admin')");

        for (const recipient of targetRecipients) {
          await db.query(`
            INSERT INTO notifications (user_id, title, type, message, link, is_read, created_at)
            VALUES (?, 'Balasan Masuk dari KolabPanel', 'ticket', ?, ?, FALSE, ?)
          `, [
            recipient.id,
            `Pengguna membalas tiket #${ticketId} "${tickets[0].judul}": "${replyContent.slice(0, 80)}"`,
            `/tickets/${ticketId}`,
            wibNow
          ]);
        }
      }
    } catch (nErr) {
      console.error('[ExternalController] Gagal membuat notifikasi balasan:', nErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'External reply successfully received and saved.',
      data: {
        replyId: result.insertId,
        ticketId,
        senderUserId
      }
    });
  } catch (error) {
    console.error('[ExternalController] receiveExternalReply Error:', error);
    return res.status(500).json({ success: false, message: 'Internal error', error: error.message });
  }
};

module.exports = { receiveExternalTicket, receiveExternalStatus, receiveExternalReply };

