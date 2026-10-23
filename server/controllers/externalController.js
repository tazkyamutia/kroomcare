const db = require('../config/db');
const { isServiceRequest } = require('../middleware/auth');
const { randomUnusablePassword } = require('../utils/password');
const { notifyUser } = require('../utils/ticketAccess');

/**
 * receiveExternalTicket
 * Endpoint server-to-server (KolabPanel → Kroomcare).
 * Memvalidasi API Key, melakukan JIT Provisioning akun,
 * menyimpan tiket, memberi reward koin, dan antrekan notifikasi WA.
 */
const receiveExternalTicket = async (req, res) => {
  try {
    // ── 1. Validasi API Key ──────────────────────────────────────────────────
    if (!isServiceRequest(req)) {
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
      const defaultPassword = await randomUnusablePassword();
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
            `/staff/tickets/${ticketId}`,
            wibNow
          ]
        );
      }
    } catch (nErr) {
      console.error('[ExternalController] Gagal membuat notifikasi staff/admin:', nErr.message);
    }

    // Broadcast instant real-time event ke channel presence-staff-notifications (Staff Dashboard)
    try {
      const { broadcastStaffNotification } = require('../utils/realtimeHub');
      broadcastStaffNotification('TicketCreated', {
        ticket_id: String(ticketId),
        external_ticket_id: external_ticket_id || null,
        subject: judul,
        title: judul,
        category: finalKategori,
        priority: isPriority ? 'high' : 'normal',
        isPriority: Boolean(isPriority),
        customer_name: nama || 'User KolabPanel',
        customer_email: email,
        status: 'Open',
        timestamp: wibNow,
        created_at: wibNow,
        link: `/staff/tickets/${ticketId}`
      });
    } catch (rtErr) {
      console.warn('[ExternalController] Realtime broadcast error:', rtErr.message);
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
    const targetJid = process.env.WA_TARGET_JID;
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

    if (targetJid) queueNotification(targetJid, messageContent)
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
      message: 'Internal server error'
    });
  }
};

const receiveExternalStatus = async (req, res) => {
  try {
    if (!isServiceRequest(req)) {
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

    const [rows] = await db.query('SELECT id, user_id, judul, status FROM tickets WHERE external_ticket_id = ?', [external_ticket_id]);
    await db.query('UPDATE tickets SET status = ? WHERE external_ticket_id = ?', [dbStatus, external_ticket_id]);

    const ticket = rows[0];
    if (ticket && ticket.status !== dbStatus) {
      const uiStatus = dbStatus === 'selesai' ? 'Resolved' : (dbStatus === 'diproses' ? 'In Progress' : 'Open');
      const label = { Open: 'Dibuka kembali', 'In Progress': 'Sedang diproses', Resolved: 'Selesai' }[uiStatus];
      await notifyUser(ticket.user_id, `Status tiket #${ticket.id}: ${label}`, `Status tiket "${ticket.judul}" diperbarui dari Support Center Panel menjadi ${label}.`, `/tickets/${ticket.id}`);
      try {
        require('../utils/realtimeHub').broadcastTicketEvent(ticket.id, 'StatusChanged', { ticket_id: String(ticket.id), status: uiStatus, changed_by: 'Support Center Panel' }, external_ticket_id);
      } catch (_) {}
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('[ExternalController] receiveExternalStatus Error:', error);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
};

const receiveExternalReply = async (req, res) => {
  try {
    if (!isServiceRequest(req)) {
      return res.status(401).json({ success: false, message: 'Invalid API Key' });
    }

    const { external_ticket_id, email, text, konten, ticket_id, id: rawId, message, external_message_id, message_id } = req.body;
    const extTicketId = external_ticket_id || ticket_id || rawId;
    const replyContent = text || konten || message;
    const extMessageId = external_message_id || message_id || (rawId && String(rawId).startsWith('m_') ? String(rawId) : ('m_ext_' + Date.now()));

    if (!extTicketId || !replyContent) {
      return res.status(400).json({ success: false, message: 'Missing required fields: external_ticket_id/ticket_id, text/konten/message' });
    }

    // Cari tiket berdasarkan external_ticket_id atau ID tiket lokal
    let [tickets] = await db.query('SELECT id, user_id, staff_id, judul, external_ticket_id FROM tickets WHERE external_ticket_id = ?', [extTicketId]);
    if (tickets.length === 0 && !isNaN(Number(extTicketId))) {
      [tickets] = await db.query('SELECT id, user_id, staff_id, judul, external_ticket_id FROM tickets WHERE id = ?', [Number(extTicketId)]);
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

    // Cegah duplikasi balasan yang persis sama
    // Duplikat = ID pesan panel yang sama, atau teks sama dalam 2 menit terakhir (pantulan balasan yang baru dikirim
    // ke panel). Teks yang sama di waktu lain ("ok", "terima kasih") tetap disimpan.
    const [existing] = await db.query(
      `SELECT id FROM ticket_replies WHERE ticket_id = ? AND (external_message_id = ?
         OR (konten = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 2 MINUTE)))`,
      [ticketId, extMessageId, replyContent]
    );
    if (existing.length > 0) {
      return res.status(200).json({ success: true, message: 'Reply already recorded', data: { replyId: existing[0].id, ticketId } });
    }

    const wibNow = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
    const [result] = await db.query(
      'INSERT INTO ticket_replies (ticket_id, user_id, konten, external_message_id, created_at) VALUES (?, ?, ?, ?, ?)',
      [ticketId, senderUserId, replyContent, extMessageId, wibNow]
    );

    // Update updated_at tiket; balasan pelanggan pada tiket selesai membuka kembali tiket tersebut.
    const [senderRows] = await db.query('SELECT role FROM users WHERE id = ?', [senderUserId]);
    const fromCustomer = !senderRows.length || (senderRows[0].role !== 'staff' && senderRows[0].role !== 'admin');
    await db.query(
      `UPDATE tickets SET updated_at = ?${fromCustomer ? ", status = IF(status = 'selesai', 'menunggu', status)" : ''} WHERE id = ?`,
      [wibNow, ticketId]
    );

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
            `/staff/tickets/${ticketId}`,
            wibNow
          ]);
        }
      }
    } catch (nErr) {
      console.error('[ExternalController] Gagal membuat notifikasi balasan:', nErr.message);
    }

    // Broadcast via Realtime Hub ke channel private-ticket.{ticketId} & kroomcare_ticket_{ticketId}
    try {
      const { broadcastTicketMessage } = require('../utils/realtimeHub');
      const [senderRoleRow] = await db.query('SELECT role, nama FROM users WHERE id = ?', [senderUserId]);
      const senderRole = senderRoleRow[0]?.role || 'customer';
      const senderName = senderRoleRow[0]?.nama || 'Pengguna';
      const senderRoleMapped = (senderRole === 'staff' || senderRole === 'admin') ? 'staff' : 'user';

      broadcastTicketMessage(ticketId, {
        ticket_id: String(ticketId),
        external_ticket_id: tickets[0]?.external_ticket_id || undefined,
        message_id: result.insertId.toString(),
        id: result.insertId.toString(),
        content: replyContent,
        message: replyContent,
        text: replyContent,
        konten: replyContent,
        sender_role: senderRoleMapped,
        sender_type: senderRoleMapped,
        sender_id: String(senderUserId),
        sender_name: senderName,
        timestamp: wibNow,
        created_at: wibNow,
        status: 'sent'
      }, tickets[0]?.external_ticket_id);
    } catch (rtErr) {
      console.warn('[RealtimeHub] Error broadcasting external reply:', rtErr.message);
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
    return res.status(500).json({ success: false, message: 'Internal error' });
  }
};

const triggerPanelSync = async (req, res) => {
  try {
    if (!isServiceRequest(req)) {
      return res.status(401).json({ success: false, message: 'Invalid API Key' });
    }
    const { syncPanelTickets } = require('../utils/panelSyncWorker');
    await syncPanelTickets();
    return res.status(200).json({ success: true, message: 'Sinkronisasi tiket & balasan panel Kroombox selesai.' });
  } catch (err) {
    console.error('[ExternalController] triggerPanelSync Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal sinkronisasi panel' });
  }
};

module.exports = { receiveExternalTicket, receiveExternalStatus, receiveExternalReply, triggerPanelSync };

