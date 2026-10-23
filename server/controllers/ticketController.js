const db = require('../config/db');
const https = require('https');
const http = require('http');
const { isStaffRole, isAdminRole } = require('../middleware/auth');
const {
  toDbStatus,
  toUiStatus,
  ESCALATION_TEXT,
  isEscalationText,
  wibNow,
  loadTicketForUser,
  notifyUser,
  notifyRoles,
  notifyTicketHandlers
} = require('../utils/ticketAccess');
const { applyTicketReward } = require('./pointController');

const MAX_SUBJECT = 200;
const MAX_TEXT = 10000;

const sendWebhook = (webhookUrl, payload, method = 'POST') => {
  return new Promise((resolve) => {
    try {
      const urlObj = new URL(webhookUrl);
      const protocol = urlObj.protocol === 'https:' ? https : http;
      const postData = JSON.stringify(payload);
      const port = urlObj.port ? parseInt(urlObj.port, 10) : (urlObj.protocol === 'https:' ? 443 : 80);
      const options = {
        hostname: urlObj.hostname,
        port: port,
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData),
          'x-api-key': process.env.KROOMCARE_API_KEY
        }
      };
      const req = protocol.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          console.log(`[Webhook] Sent to ${webhookUrl} (Ext: ${payload.external_ticket_id}) - Status: ${res.statusCode}`);
          resolve({ success: res.statusCode >= 200 && res.statusCode < 300, statusCode: res.statusCode, body });
        });
      });
      req.on('error', (e) => {
        console.error('[Webhook] Request failed:', e.message);
        resolve({ success: false, error: e.message });
      });
      req.write(postData);
      req.end();
    } catch (err) {
      console.error('[Webhook] Setup error:', err.message);
      resolve({ success: false });
    }
  });
};

// Sinkronisasi ke KolabPanel hanya untuk tiket yang memang berasal dari panel (external_ticket_id diisi oleh panel).
const syncReplyToPanel = (ticket, senderName, text) => {
  if (!ticket.external_ticket_id || !process.env.KOLABPANEL_WEBHOOK_URL) return;
  sendWebhook(process.env.KOLABPANEL_WEBHOOK_URL, {
    external_ticket_id: ticket.external_ticket_id,
    sender_name: senderName,
    text
  });
};

const syncStatusToPanel = (ticket, status) => {
  if (!ticket.external_ticket_id || !process.env.KOLABPANEL_WEBHOOK_URL) return;
  sendWebhook(process.env.KOLABPANEL_WEBHOOK_URL.replace('/external-reply', '/external-status'), {
    external_ticket_id: ticket.external_ticket_id,
    status
  });
};

// Server lokal developer (port 5000 / MySQL 3306) meneruskan perubahan ke server live memakai API key layanan.
const isLocalDevServer = () => process.env.PORT === '5000' || process.env.DB_PORT === '3306';
const forwardToLive = (path, payload, method = 'POST') => {
  const url = (process.env.LIVE_KROOMCARE_URL || 'https://kroomcare.kroombox.com') + path;
  sendWebhook(url, { ...payload, is_synced: true }, method)
    .catch(err => console.error('[LocalSync] Gagal meneruskan ke live server:', err.message));
};

const broadcast = (fn, ...args) => {
  try {
    require('../utils/realtimeHub')[fn](...args);
  } catch (rtErr) {
    console.warn('[RealtimeHub] Broadcast error:', rtErr.message);
  }
};

const serverError = (res, label, error) => {
  console.error(`Error in ${label}:`, error);
  res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
};

const notFound = (res) => res.status(404).json({ success: false, message: 'Tiket tidak ditemukan.' });

// Pengirim aksi: pengguna dari token, atau user_id dari body bila dipanggil layanan internal.
const resolveActorId = (req) => (req.user.service ? Number(req.body.user_id || req.body.staff_id) || null : req.user.id);

const getUserBrief = async (userId) => {
  if (!userId) return null;
  const [rows] = await db.query('SELECT id, nama, email, role FROM users WHERE id = ?', [userId]);
  return rows[0] || null;
};

// Create Ticket
const createTicket = async (req, res) => {
  try {
    const { judul, deskripsi, is_priority, kategori } = req.body;
    // Pelanggan selalu membuat tiket atas namanya sendiri; staff/admin/layanan boleh membuatkan untuk pelanggan.
    const ownerId = isStaffRole(req.user) ? Number(req.body.user_id || req.user.id) : req.user.id;

    if (!ownerId || !judul || !deskripsi) {
      return res.status(400).json({ success: false, message: 'Judul dan deskripsi wajib diisi.' });
    }
    if (String(judul).length > MAX_SUBJECT || String(deskripsi).length > MAX_TEXT) {
      return res.status(400).json({ success: false, message: 'Judul atau deskripsi terlalu panjang.' });
    }

    const owner = await getUserBrief(ownerId);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan. Silakan login ulang.' });
    }

    // Prioritas dari pelanggan adalah permintaan; staff tetap bisa membatalkannya lewat PUT /:id/priority.
    const priority = is_priority ? 1 : 0;
    const finalKategori = String(kategori || 'General').slice(0, 50);
    const now = wibNow();
    const [result] = await db.query(
      'INSERT INTO tickets (user_id, judul, deskripsi, is_priority, kategori, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [ownerId, judul, deskripsi, priority, finalKategori, now]
    );
    const ticketId = result.insertId;

    // Batas reward harian anti-spam (maksimal 1 reward tiket per hari, senilai 10 poin)
    let pointsAwarded = 0;
    try {
      const [todayReward] = await db.query(
        `SELECT id FROM point_histories
         WHERE user_id = ? AND jenis_transaksi = 'masuk' AND keterangan LIKE 'Reward pembuatan tiket%' AND DATE(created_at) = CURDATE()`,
        [ownerId]
      );
      if (todayReward.length === 0) {
        pointsAwarded = 10;
        await db.query('UPDATE users SET koin_reward = COALESCE(koin_reward, 0) + ? WHERE id = ?', [pointsAwarded, ownerId]);
        await db.query(
          'INSERT INTO point_histories (user_id, jenis_transaksi, jumlah_poin, keterangan, created_at) VALUES (?, ?, ?, ?, ?)',
          [ownerId, 'masuk', pointsAwarded, `Reward pembuatan tiket baru #${ticketId}`, now]
        );
      }
    } catch (pointErr) {
      console.error('Failed to process daily ticket reward:', pointErr.message);
    }

    await notifyRoles(['staff', 'admin'], `Tiket Baru #${ticketId}`, `Tiket baru dari ${owner.nama}: "${judul}"`, `/staff/tickets/${ticketId}`, req.user.id);

    broadcast('broadcastStaffNotification', 'TicketCreated', {
      ticket_id: String(ticketId),
      external_ticket_id: null,
      subject: judul,
      title: judul,
      category: finalKategori,
      priority: priority ? 'high' : 'normal',
      isPriority: Boolean(priority),
      customer_name: owner.nama,
      status: 'Open',
      timestamp: now,
      created_at: now,
      link: `/staff/tickets/${ticketId}`
    });

    // Notifikasi WhatsApp ke grup staf (antrean + pengiriman awal asinkron)
    const targetJid = process.env.WA_TARGET_JID;
    if (targetJid) {
      const messageContent = `🎫 *Tiket Keluhan Baru #${ticketId}*
*Nama:* ${owner.nama}
*Email:* ${owner.email}
*Subjek:* ${judul}
*Deskripsi:* ${deskripsi}
*Prioritas:* ${priority ? 'Tinggi (High)' : 'Normal'}`;
      const { queueNotification, sendNotification, updateNotificationStatus } = require('../utils/notificationQueue');
      queueNotification(targetJid, messageContent)
        .then(async (queueId) => {
          if (!queueId) return;
          const sent = await sendNotification(targetJid, messageContent);
          await updateNotificationStatus(queueId, sent.success ? 'sent' : 'failed', sent.success ? undefined : 1);
        })
        .catch((err) => console.error('Failed to trigger initial notification send:', err.message));
    }

    res.status(201).json({
      success: true,
      message: pointsAwarded > 0 ? `Tiket berhasil dibuat (+${pointsAwarded} Koin Reward).` : 'Tiket berhasil dibuat.',
      data: {
        id: ticketId,
        user_id: ownerId,
        judul,
        deskripsi,
        isPriority: Boolean(priority),
        pointsAwarded
      }
    });
  } catch (error) {
    serverError(res, 'createTicket', error);
  }
};

// Get Tickets: staff/admin melihat semua (opsional filter user_id/assigned), pelanggan hanya tiketnya sendiri.
const getTickets = async (req, res) => {
  try {
    let query = `
      SELECT
        t.id, t.external_ticket_id, t.user_id, t.staff_id, t.judul, t.deskripsi, t.status, t.is_priority, t.kategori,
        t.created_at, t.updated_at,
        u1.nama AS nama_pengirim,
        u2.nama AS nama_staf,
        COALESCE(rep.reply_count, 0) AS reply_count,
        latest_rep.konten AS last_reply,
        latest_rep.created_at AS last_reply_at,
        latest_user.nama AS last_reply_by,
        latest_user.role AS last_reply_role
      FROM tickets t
      LEFT JOIN users u1 ON t.user_id = u1.id
      LEFT JOIN users u2 ON t.staff_id = u2.id
      LEFT JOIN (
        SELECT ticket_id, COUNT(*) AS reply_count, MAX(id) AS max_reply_id
        FROM ticket_replies
        GROUP BY ticket_id
      ) rep ON t.id = rep.ticket_id
      LEFT JOIN ticket_replies latest_rep ON rep.max_reply_id = latest_rep.id
      LEFT JOIN users latest_user ON latest_rep.user_id = latest_user.id
    `;
    const where = [];
    const params = [];

    if (!isStaffRole(req.user)) {
      where.push('t.user_id = ?');
      params.push(req.user.id);
    } else {
      if (req.query.user_id) {
        where.push('t.user_id = ?');
        params.push(req.query.user_id);
      }
      if (req.query.assigned === 'me' && req.user.id) {
        where.push('t.staff_id = ?');
        params.push(req.user.id);
      }
    }
    if (where.length) query += ' WHERE ' + where.join(' AND ');
    query += ' ORDER BY t.id DESC';

    const [rows] = await db.query(query, params);

    const mappedRows = rows.map(row => {
      const lastReplyRoleMapped = row.last_reply_role === 'member' ? 'customer' : row.last_reply_role;
      const hasStaffReply = row.last_reply_role === 'staff' || row.last_reply_role === 'admin';

      return {
        id: row.id.toString(),
        externalTicketId: row.external_ticket_id || null,
        external_ticket_id: row.external_ticket_id || null,
        isFromPanel: Boolean(row.external_ticket_id),
        subject: row.judul,
        description: row.deskripsi,
        status: toUiStatus(row.status),
        isPriority: !!row.is_priority,
        createdAt: row.created_at,
        updatedAt: row.last_reply_at || row.updated_at || row.created_at,
        customerId: row.user_id ? row.user_id.toString() : '',
        customerName: row.nama_pengirim || 'Unknown Customer',
        assignedTo: row.staff_id ? row.staff_id.toString() : undefined,
        assignedStaffName: row.nama_staf,
        category: row.kategori || 'Support',
        replyCount: row.reply_count || 0,
        lastReply: row.last_reply || null,
        lastReplyBy: row.last_reply_by || null,
        lastReplyRole: lastReplyRoleMapped || null,
        lastReplyAt: row.last_reply_at || null,
        hasStaffReply: Boolean(hasStaffReply)
      };
    });

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).json({ success: true, data: mappedRows });
  } catch (error) {
    serverError(res, 'getTickets', error);
  }
};

// Get Ticket Detail
const getTicketDetail = async (req, res) => {
  try {
    const ticket = await loadTicketForUser(req.user, req.params.id);
    if (!ticket) return notFound(res);

    const [rows] = await db.query(
      `SELECT t.created_at, u1.nama AS nama_pengirim, u2.nama AS nama_staf
       FROM tickets t
       LEFT JOIN users u1 ON t.user_id = u1.id
       LEFT JOIN users u2 ON t.staff_id = u2.id
       WHERE t.id = ?`,
      [ticket.id]
    );
    const row = rows[0] || {};

    const [rewardRows] = await db.query(
      'SELECT id, jumlah_poin FROM point_histories WHERE user_id = ? AND keterangan LIKE ? ORDER BY id DESC LIMIT 1',
      [ticket.user_id, `%penyelesaian tiket #${ticket.id}%`]
    );
    const rewardGiven = rewardRows.length > 0;

    // Eskalasi dihitung dari balasan staf/admin yang diawali penanda eskalasi, bukan dari kata di pesan mana pun.
    const [escRows] = await db.query(
      `SELECT tr.konten FROM ticket_replies tr JOIN users u ON tr.user_id = u.id
       WHERE tr.ticket_id = ? AND u.role IN ('staff', 'admin') AND (tr.konten LIKE '[%' OR tr.konten LIKE 'Tiket telah dieskalasi%')`,
      [ticket.id]
    );

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).json({
      success: true,
      data: {
        id: ticket.id.toString(),
        externalTicketId: ticket.external_ticket_id || null,
        external_ticket_id: ticket.external_ticket_id || null,
        isFromPanel: Boolean(ticket.external_ticket_id),
        subject: ticket.judul,
        description: ticket.deskripsi,
        status: toUiStatus(ticket.status),
        isPriority: !!ticket.is_priority,
        createdAt: row.created_at,
        customerId: ticket.user_id ? ticket.user_id.toString() : '',
        customerName: row.nama_pengirim || 'Unknown Customer',
        assignedTo: ticket.staff_id ? ticket.staff_id.toString() : undefined,
        assignedStaffName: row.nama_staf || null,
        category: ticket.kategori || 'Support',
        isPrivate: true,
        isEscalated: escRows.some(r => isEscalationText(r.konten)),
        rewardGiven,
        rewardAmount: rewardGiven ? rewardRows[0].jumlah_poin : 50
      }
    });
  } catch (error) {
    serverError(res, 'getTicketDetail', error);
  }
};

// Set Priority (staff/admin)
const setPriority = async (req, res) => {
  try {
    const { is_priority } = req.body;
    if (is_priority === undefined) {
      return res.status(400).json({ success: false, message: 'Field is_priority wajib dikirim.' });
    }

    const ticket = await loadTicketForUser(req.user, req.params.id);
    if (!ticket) return notFound(res);

    await db.query('UPDATE tickets SET is_priority = ? WHERE id = ?', [is_priority ? 1 : 0, ticket.id]);
    broadcast('broadcastTicketEvent', ticket.id, 'TicketUpdated', { ticket_id: String(ticket.id), isPriority: !!is_priority }, ticket.external_ticket_id);

    res.status(200).json({
      success: true,
      message: 'Prioritas tiket berhasil diperbarui.',
      data: { id: String(ticket.id), isPriority: !!is_priority }
    });
  } catch (error) {
    serverError(res, 'setPriority', error);
  }
};

// Update Status Tiket
// Staff/admin: semua status. Pelanggan: hanya menutup (Resolved) atau membuka kembali (Open) tiket miliknya.
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const dbStatus = toDbStatus(status);
    if (!dbStatus) {
      return res.status(400).json({ success: false, message: 'Status tidak valid. Gunakan Open, In Progress, atau Resolved.' });
    }

    const ticket = await loadTicketForUser(req.user, req.params.id);
    if (!ticket) return notFound(res);

    const staffActor = isStaffRole(req.user);
    if (!staffActor && dbStatus === 'diproses') {
      return res.status(403).json({ success: false, message: 'Pelanggan hanya dapat menutup atau membuka kembali tiket.' });
    }
    if (ticket.status === dbStatus) {
      return res.status(200).json({ success: true, message: 'Status tiket tidak berubah.', data: { id: String(ticket.id), status: toUiStatus(dbStatus) } });
    }

    const now = wibNow();
    await db.query('UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?', [dbStatus, now, ticket.id]);

    // Staff yang mulai memproses tiket tanpa penanggung jawab otomatis menjadi penanggung jawabnya.
    if (staffActor && req.user.id && !ticket.staff_id && dbStatus === 'diproses') {
      await db.query('UPDATE tickets SET staff_id = ? WHERE id = ? AND staff_id IS NULL', [req.user.id, ticket.id]);
    }

    const uiStatus = toUiStatus(dbStatus);
    const actor = await getUserBrief(resolveActorId(req));
    const actorName = actor ? actor.nama : 'Sistem';
    const statusLabel = { Open: 'Dibuka kembali', 'In Progress': 'Sedang diproses', Resolved: 'Selesai' }[uiStatus];

    if (staffActor) {
      await notifyUser(ticket.user_id, `Status tiket #${ticket.id}: ${statusLabel}`, `${actorName} mengubah status tiket "${ticket.judul}" menjadi ${statusLabel}.`, `/tickets/${ticket.id}`);
    } else {
      await notifyTicketHandlers(ticket, `Tiket #${ticket.id} ${dbStatus === 'selesai' ? 'ditutup pelanggan' : 'dibuka kembali'}`, `${actorName} ${dbStatus === 'selesai' ? 'menutup' : 'membuka kembali'} tiket "${ticket.judul}".`, req.user.id);
    }

    broadcast('broadcastTicketEvent', ticket.id, 'StatusChanged', { ticket_id: String(ticket.id), status: uiStatus, changed_by: actorName, timestamp: now }, ticket.external_ticket_id);
    syncStatusToPanel(ticket, uiStatus);
    if (!req.body.is_synced && isLocalDevServer()) forwardToLive(`/api/tickets/${ticket.id}/status`, { status }, 'PUT');

    res.status(200).json({ success: true, message: 'Status tiket berhasil diperbarui.', data: { id: String(ticket.id), status: uiStatus } });
  } catch (error) {
    serverError(res, 'updateStatus', error);
  }
};

// Tugaskan tiket ke staff. Admin bebas memilih staff (atau melepas penugasan); staff hanya bisa mengambil tiket yang belum dipegang.
const assignTicket = async (req, res) => {
  try {
    const ticket = await loadTicketForUser(req.user, req.params.id);
    if (!ticket) return notFound(res);

    const requested = req.body.staff_id === null || req.body.staff_id === '' ? null : Number(req.body.staff_id || req.user.id);
    if (!isAdminRole(req.user)) {
      if (requested !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Staff hanya dapat mengambil tiket untuk dirinya sendiri.' });
      }
      if (ticket.staff_id && Number(ticket.staff_id) !== req.user.id) {
        return res.status(409).json({ success: false, message: 'Tiket sudah ditangani staff lain. Hubungi admin untuk memindahkan.' });
      }
    }

    let staff = null;
    if (requested !== null) {
      staff = await getUserBrief(requested);
      if (!staff || (staff.role !== 'staff' && staff.role !== 'admin')) {
        return res.status(400).json({ success: false, message: 'Staff tujuan tidak valid.' });
      }
    }

    await db.query('UPDATE tickets SET staff_id = ?, updated_at = ? WHERE id = ?', [requested, wibNow(), ticket.id]);

    if (staff && Number(staff.id) !== Number(req.user.id)) {
      await notifyUser(staff.id, `Tiket #${ticket.id} ditugaskan ke Anda`, `Anda ditugaskan menangani tiket "${ticket.judul}".`, `/staff/tickets/${ticket.id}`);
    }
    if (ticket.staff_id && Number(ticket.staff_id) !== Number(requested) && Number(ticket.staff_id) !== Number(req.user.id)) {
      await notifyUser(ticket.staff_id, `Tiket #${ticket.id} dipindahkan`, `Tiket "${ticket.judul}" kini ${staff ? `ditangani ${staff.nama}` : 'tidak memiliki penanggung jawab'}.`, `/staff/tickets/${ticket.id}`);
    }

    broadcast('broadcastTicketEvent', ticket.id, 'TicketAssigned', { ticket_id: String(ticket.id), assignedTo: staff ? String(staff.id) : null, assignedStaffName: staff ? staff.nama : null }, ticket.external_ticket_id);

    res.status(200).json({
      success: true,
      message: staff ? `Tiket ditugaskan ke ${staff.nama}.` : 'Penugasan tiket dilepas.',
      data: { id: String(ticket.id), assignedTo: staff ? String(staff.id) : null, assignedStaffName: staff ? staff.nama : null }
    });
  } catch (error) {
    serverError(res, 'assignTicket', error);
  }
};

// Get Ticket Replies (Chat messages)
const getTicketReplies = async (req, res) => {
  try {
    const ticket = await loadTicketForUser(req.user, req.params.id);
    if (!ticket) return notFound(res);

    const [rows] = await db.query(
      `SELECT tr.id, tr.ticket_id, tr.user_id, tr.konten, tr.external_message_id, tr.created_at, u.nama AS userName, u.role AS userRole
       FROM ticket_replies tr
       JOIN users u ON tr.user_id = u.id
       WHERE tr.ticket_id = ?
       ORDER BY tr.id ASC`,
      [ticket.id]
    );

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).json({
      success: true,
      data: rows.map(row => ({
        id: row.id.toString(),
        ticketId: row.ticket_id.toString(),
        userId: row.user_id.toString(),
        userName: row.userName,
        userRole: row.userRole === 'member' ? 'customer' : row.userRole,
        text: row.konten,
        externalMessageId: row.external_message_id || null,
        isFromPanel: Boolean(row.external_message_id),
        createdAt: row.created_at
      }))
    });
  } catch (error) {
    serverError(res, 'getTicketReplies', error);
  }
};

// Simpan balasan + notifikasi + sinkronisasi. Dipakai oleh balasan biasa dan eskalasi.
const storeReply = async (ticket, sender, konten) => {
  const now = wibNow();
  const [result] = await db.query('INSERT INTO ticket_replies (ticket_id, user_id, konten, created_at) VALUES (?, ?, ?, ?)', [ticket.id, sender.id, konten, now]);
  const senderIsStaff = sender.role === 'staff' || sender.role === 'admin';

  if (senderIsStaff) {
    // Staff pertama yang membalas menjadi penanggung jawab; tiket yang dibalas staff berstatus diproses.
    await db.query("UPDATE tickets SET staff_id = COALESCE(staff_id, ?), status = 'diproses', updated_at = ? WHERE id = ?", [sender.id, now, ticket.id]);
    if (Number(ticket.user_id) !== Number(sender.id)) {
      const roleLabel = sender.role === 'admin' ? 'Administrator' : 'Staff KroomCare';
      await notifyUser(ticket.user_id, `Balasan dari ${sender.nama} (${roleLabel})`, `Tiket #${ticket.id} "${ticket.judul}": "${konten.slice(0, 80)}"`, `/tickets/${ticket.id}`);
    }
    syncReplyToPanel(ticket, sender.nama, konten);
    if (ticket.status !== 'diproses') syncStatusToPanel(ticket, 'In Progress');
  } else {
    // Balasan pelanggan pada tiket yang sudah selesai otomatis membuka kembali tiket tersebut.
    const reopened = ticket.status === 'selesai';
    await db.query(`UPDATE tickets SET updated_at = ?${reopened ? ", status = 'menunggu'" : ''} WHERE id = ?`, [now, ticket.id]);
    await notifyTicketHandlers(
      ticket,
      reopened ? `Tiket #${ticket.id} dibuka kembali` : `Balasan dari ${sender.nama} (Customer)`,
      `Pelanggan membalas tiket #${ticket.id} "${ticket.judul}": "${konten.slice(0, 80)}"`,
      sender.id
    );
    syncReplyToPanel(ticket, sender.nama, konten);
    if (reopened) {
      syncStatusToPanel(ticket, 'Open');
      broadcast('broadcastTicketEvent', ticket.id, 'StatusChanged', { ticket_id: String(ticket.id), status: 'Open', changed_by: sender.nama, timestamp: now }, ticket.external_ticket_id);
    }
  }

  const senderType = senderIsStaff ? 'staff' : 'user';
  const data = {
    ticket_id: String(ticket.id),
    external_ticket_id: ticket.external_ticket_id || undefined,
    message_id: result.insertId.toString(),
    id: result.insertId.toString(),
    content: konten,
    message: konten,
    text: konten,
    konten: konten,
    sender_role: senderType,
    sender_type: senderType,
    ticketId: String(ticket.id),
    userId: String(sender.id),
    sender_id: String(sender.id),
    sender_name: sender.nama,
    userName: sender.nama,
    userRole: sender.role === 'member' ? 'customer' : sender.role,
    timestamp: now,
    created_at: now,
    createdAt: now,
    isAdmin: senderIsStaff,
    status: 'sent'
  };
  broadcast('broadcastTicketMessage', ticket.id, data, ticket.external_ticket_id);
  return data;
};

// Add Reply to Ticket
const addTicketReply = async (req, res) => {
  try {
    const konten = String(req.body.konten || '').trim();
    if (!konten) {
      return res.status(400).json({ success: false, message: 'Konten balasan wajib diisi.' });
    }
    if (konten.length > MAX_TEXT) {
      return res.status(400).json({ success: false, message: 'Balasan terlalu panjang.' });
    }

    const ticket = await loadTicketForUser(req.user, req.params.id);
    if (!ticket) return notFound(res);

    const sender = await getUserBrief(resolveActorId(req));
    if (!sender) {
      return res.status(400).json({ success: false, message: 'Pengirim balasan tidak dikenali.' });
    }

    const data = await storeReply(ticket, sender, konten);
    if (!req.body.is_synced && isLocalDevServer()) forwardToLive(`/api/tickets/${ticket.id}/replies`, { user_id: sender.id, konten });

    res.status(201).json({ success: true, message: 'Balasan tiket berhasil ditambahkan.', data });
  } catch (error) {
    serverError(res, 'addTicketReply', error);
  }
};

// Give Point Reward to Customer (staff/admin). Satu reward per tiket; mengirim ulang mengubah jumlahnya.
const giveReward = async (req, res) => {
  try {
    const ticket = await loadTicketForUser(req.user, req.params.id);
    if (!ticket) return notFound(res);
    const result = await applyTicketReward(ticket, req.body.points);
    res.status(result.status).json(result.body);
  } catch (error) {
    serverError(res, 'giveReward', error);
  }
};

// Escalate Ticket to Maintenance (staff/admin): prioritas tinggi, status diproses, catatan eskalasi, notifikasi admin.
const escalateTicket = async (req, res) => {
  try {
    const ticket = await loadTicketForUser(req.user, req.params.id);
    if (!ticket) return notFound(res);

    const sender = await getUserBrief(resolveActorId(req));
    if (!sender || (sender.role !== 'staff' && sender.role !== 'admin')) {
      return res.status(400).json({ success: false, message: 'Eskalasi harus dilakukan oleh staff atau admin.' });
    }

    const [existing] = await db.query(
      "SELECT tr.konten FROM ticket_replies tr JOIN users u ON tr.user_id = u.id WHERE tr.ticket_id = ? AND u.role IN ('staff','admin')",
      [ticket.id]
    );
    if (existing.some(r => isEscalationText(r.konten))) {
      return res.status(409).json({ success: false, message: 'Tiket ini sudah dieskalasi.' });
    }

    await db.query('UPDATE tickets SET is_priority = 1 WHERE id = ?', [ticket.id]);
    const data = await storeReply(ticket, sender, ESCALATION_TEXT);
    await notifyRoles(['admin'], `Eskalasi tiket #${ticket.id}`, `${sender.nama} mengeskalasi tiket "${ticket.judul}" ke tim teknis.`, `/staff/tickets/${ticket.id}`, sender.id);

    res.status(200).json({
      success: true,
      message: 'Tiket berhasil dieskalasi ke tim teknis.',
      data: { id: String(ticket.id), status: 'In Progress', isPriority: true, isEscalated: true, reply: data }
    });
  } catch (error) {
    serverError(res, 'escalateTicket', error);
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketDetail,
  setPriority,
  updateStatus,
  assignTicket,
  getTicketReplies,
  addTicketReply,
  giveReward,
  escalateTicket
};
