const db = require('../config/db');
const https = require('https');
const http = require('http');

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
      resolve({ success: false, error: err.message });
    }
  });
};


// Create Ticket
const createTicket = async (req, res) => {
  try {
    const { user_id, judul, deskripsi, is_priority, kategori } = req.body;
    
    if (!user_id || !judul || !deskripsi) {
      return res.status(400).json({ 
        success: false, 
        message: 'user_id, judul, dan deskripsi wajib diisi.' 
      });
    }

    // Pastikan akun user_id benar-benar ada di database
    const [userRows] = await db.query('SELECT id, nama, email FROM users WHERE id = ?', [user_id]);
    if (!userRows || userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Pengguna (ID: ${user_id}) tidak ditemukan di database. Silakan muat ulang halaman atau login ulang.`
      });
    }

    const finalKategori = kategori || 'General';
    const wibNow = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
    const query = 'INSERT INTO tickets (user_id, judul, deskripsi, is_priority, kategori, created_at) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [user_id, judul, deskripsi, is_priority ? 1 : 0, finalKategori, wibNow]);
    const ticketId = result.insertId;

    // Cek batasan reward harian anti-spam (Maksimal 1 reward tiket per hari, senilai 10 poin)
    let pointsAwarded = 0;
    try {
      const [todayReward] = await db.query(
        `SELECT id FROM point_histories 
         WHERE user_id = ? 
           AND jenis_transaksi = 'masuk' 
           AND keterangan LIKE 'Reward pembuatan tiket%' 
           AND DATE(created_at) = CURDATE()`,
        [user_id]
      );

      if (todayReward.length === 0) {
        // Belum menerima reward tiket hari ini: Berikan +10 koin
        pointsAwarded = 10;
        await db.query('UPDATE users SET koin_reward = COALESCE(koin_reward, 0) + ? WHERE id = ?', [pointsAwarded, user_id]);
        const desc = `Reward pembuatan tiket baru #${ticketId}`;
        await db.query(
          'INSERT INTO point_histories (user_id, jenis_transaksi, jumlah_poin, keterangan, created_at) VALUES (?, ?, ?, ?, ?)',
          [user_id, 'masuk', pointsAwarded, desc, wibNow]
        );
      }
    } catch (pointErr) {
      console.error('Failed to process daily ticket reward:', pointErr.message);
    }

    // Kirim Notifikasi WhatsApp via GoWA
    let userNama = 'Unknown';
    let userEmail = 'unknown@kroombox.com';
    try {
      const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [user_id]);
      if (userRows && userRows.length > 0) {
        userNama = userRows[0].nama || 'Unknown';
        userEmail = userRows[0].email || 'unknown@kroombox.com';
      }
    } catch (dbErr) {
      console.error('Failed to fetch user details for WhatsApp notification:', dbErr.message);
    }

    const targetJid = process.env.WA_TARGET_JID || '120363xxxxx@g.us';
    const messageContent = `🎫 *Tiket Keluhan Baru #${ticketId}*
*Nama:* ${userNama}
*Email:* ${userEmail}
*Subjek:* ${judul}
*Deskripsi:* ${deskripsi}
*Prioritas:* ${is_priority ? 'Tinggi (High)' : 'Normal'}`;

    // Kirim Notifikasi in-app ke seluruh staff & admin
    try {
      const [staffAndAdmin] = await db.query("SELECT id FROM users WHERE role IN ('staff', 'admin')");
      for (const sa of staffAndAdmin) {
        await db.query(
          "INSERT INTO notifications (user_id, title, type, message, link, is_read, created_at) VALUES (?, ?, 'ticket', ?, ?, 0, ?)",
          [
            sa.id,
            `Tiket Baru #${ticketId}`,
            `Tiket baru dari ${userNama}: "${judul}"`,
            `/tickets/${ticketId}`,
            wibNow
          ]
        );
      }
    } catch (nErr) {
      console.error('Failed to notify staff/admin of new ticket:', nErr.message);
    }

    // Antrekan notifikasi dan lakukan pengiriman awal secara asinkron
    const { queueNotification, sendNotification, updateNotificationStatus } = require('../utils/notificationQueue');
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
      .catch((err) => {
        console.error('Failed to trigger initial notification send:', err.message);
      });


    res.status(201).json({
      success: true,
      message: pointsAwarded > 0 
        ? `Tiket berhasil dibuat (+${pointsAwarded} Koin Reward).`
        : 'Tiket berhasil dibuat.',
      data: {
        id: ticketId,
        user_id,
        judul,
        deskripsi,
        isPriority: !!is_priority,
        pointsAwarded
      }
    });
  } catch (error) {
    console.error('Error in createTicket:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Get Tickets (Seluruh tiket untuk Staff/Admin, atau filter berdasarkan user_id untuk Customer)
const getTickets = async (req, res) => {
  try {
    const { user_id } = req.query;
    
    let query = `
      SELECT 
        t.id, 
        t.external_ticket_id,
        t.user_id, 
        t.staff_id, 
        t.judul, 
        t.deskripsi, 
        t.status, 
        t.is_priority, 
        t.kategori,
        t.created_at,
        t.updated_at,
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
    let params = [];

    if (user_id) {
      query += ' WHERE t.user_id = ?';
      params.push(user_id);
    }
    
    query += ' ORDER BY t.id DESC';

    const [rows] = await db.query(query, params);
    
    // Map untuk kompatibilitas frontend
    const mappedRows = rows.map(row => {
      let mappedStatus = 'Open';
      const s = (row.status || '').toLowerCase();
      if (s === 'menunggu' || s === 'open') mappedStatus = 'Open';
      else if (s === 'diproses' || s === 'proses' || s === 'in progress' || s === 'progress') mappedStatus = 'In Progress';
      else mappedStatus = 'Resolved';

      const lastReplyRoleMapped = row.last_reply_role === 'member' ? 'customer' : row.last_reply_role;
      const hasStaffReply = row.last_reply_role === 'staff' || row.last_reply_role === 'admin';

      return {
        id: row.id.toString(),
        externalTicketId: row.external_ticket_id || null,
        subject: row.judul,
        description: row.deskripsi,
        status: mappedStatus,
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
    res.status(200).json({
      success: true,
      data: mappedRows
    });
  } catch (error) {
    console.error('Error in getTickets:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Get Ticket Detail
const getTicketDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        t.id, 
        t.external_ticket_id,
        t.user_id, 
        t.staff_id, 
        t.judul, 
        t.deskripsi, 
        t.status, 
        t.is_priority, 
        t.created_at,
        u1.nama AS nama_pengirim,
        u2.nama AS nama_staf
      FROM tickets t
      LEFT JOIN users u1 ON t.user_id = u1.id
      LEFT JOIN users u2 ON t.staff_id = u2.id
      WHERE t.id = ?
    `;
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan.'
      });
    }

    const row = rows[0];

    // Cek apakah reward penyelesaian tiket sudah pernah diberikan untuk tiket ini
    const rewardQuery = "SELECT id, jumlah_poin FROM point_histories WHERE user_id = ? AND keterangan LIKE ? ORDER BY id DESC LIMIT 1";
    const [rewardRows] = await db.query(rewardQuery, [row.user_id, `%penyelesaian tiket #${row.id}%`]);
    const rewardGiven = rewardRows.length > 0;
    const rewardAmount = rewardGiven ? rewardRows[0].jumlah_poin : 50;

    const mappedTicket = {
      id: row.id.toString(),
      externalTicketId: row.external_ticket_id || null,
      subject: row.judul,
      description: row.deskripsi,
      status: row.status === 'menunggu' ? 'Open' : (row.status === 'diproses' ? 'In Progress' : 'Resolved'),
      isPriority: !!row.is_priority,
      createdAt: row.created_at,
      customerId: row.user_id ? row.user_id.toString() : '',
      customerName: row.nama_pengirim || 'Unknown Customer',
      assignedTo: row.staff_id ? row.staff_id.toString() : undefined,
      category: 'Support',
      isPrivate: true,
      rewardGiven: rewardGiven,
      rewardAmount: rewardAmount
    };

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).json({
      success: true,
      data: mappedTicket
    });
  } catch (error) {
    console.error('Error in getTicketDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Set Priority
const setPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_priority } = req.body;

    if (is_priority === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Field is_priority wajib dikirim.'
      });
    }

    const query = 'UPDATE tickets SET is_priority = ? WHERE id = ?';
    const [result] = await db.query(query, [is_priority ? 1 : 0, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan atau gagal diperbarui.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Prioritas tiket berhasil diperbarui.',
      data: {
        id,
        isPriority: !!is_priority
      }
    });
  } catch (error) {
    console.error('Error in setPriority:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Update Status Tiket
const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, staff_id } = req.body; // Open, In Progress, Resolved, staff_id optional

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status wajib diisi.'
      });
    }

    // Map frontend status to DB status
    let dbStatus = 'menunggu';
    if (status === 'In Progress') dbStatus = 'diproses';
    else if (status === 'Resolved' || status === 'Closed') dbStatus = 'selesai';

    let query = 'UPDATE tickets SET status = ?';
    let params = [dbStatus];
    if (staff_id) {
      query += ', staff_id = ?';
      params.push(staff_id);
    }
    query += ' WHERE id = ?';
    params.push(id);

    const [result] = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan.'
      });
    }

    // Sync status to KolabPanel if external_ticket_id exists
    try {
      const [ticketRows] = await db.query('SELECT external_ticket_id FROM tickets WHERE id = ?', [id]);
      if (ticketRows.length > 0 && ticketRows[0].external_ticket_id && process.env.KOLABPANEL_WEBHOOK_URL) {
          const webhookUrl = process.env.KOLABPANEL_WEBHOOK_URL.replace('/external-reply', '/external-status');
          sendWebhook(webhookUrl, {
              external_ticket_id: ticketRows[0].external_ticket_id,
              status: status
          });
      }
    } catch (syncErr) {
      console.error('[Kroomcare] Error fetching ticket for sync:', syncErr.message);
    }

    // Jika di lokal, teruskan juga pembaruan status ke live server KroomCare
    if (!req.body.is_synced && (process.env.PORT === '5000' || process.env.DB_PORT === '3306')) {
      const liveStatusEndpoint = (process.env.LIVE_KROOMCARE_URL || 'https://kroomcare.kroombox.com') + `/api/tickets/${id}/status`;
      sendWebhook(liveStatusEndpoint, {
        status,
        staff_id,
        is_synced: true
      }, 'PUT').catch(err => console.error('[LocalSync] Gagal meneruskan status ke live server:', err.message));
    }

    res.status(200).json({
      success: true,
      message: 'Status tiket berhasil diperbarui.',
      data: {
        id,
        status: status
      }
    });
  } catch (error) {
    console.error('Error in updateStatus:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Get Ticket Replies (Chat messages)
const getTicketReplies = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        tr.id, 
        tr.ticket_id, 
        tr.user_id, 
        tr.konten, 
        tr.created_at,
        u.nama AS userName,
        u.role AS userRole
      FROM ticket_replies tr
      JOIN users u ON tr.user_id = u.id
      WHERE tr.ticket_id = ?
      ORDER BY tr.created_at ASC
    `;
    const [rows] = await db.query(query, [id]);

    const mappedReplies = rows.map(row => ({
      id: row.id.toString(),
      ticketId: row.ticket_id.toString(),
      userId: row.user_id.toString(),
      userName: row.userName,
      userRole: row.userRole === 'member' ? 'customer' : row.userRole,
      text: row.konten,
      createdAt: row.created_at
    }));

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).json({
      success: true,
      data: mappedReplies
    });
  } catch (error) {
    console.error('Error in getTicketReplies:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Add Reply to Ticket
const addTicketReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, konten } = req.body;

    if (!user_id || !konten) {
      return res.status(400).json({
        success: false,
        message: 'user_id dan konten wajib diisi.'
      });
    }

    const wibNow = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
    const query = 'INSERT INTO ticket_replies (ticket_id, user_id, konten, created_at) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(query, [id, user_id, konten, wibNow]);

    // Ambil info pengirim balasan untuk dikembalikan ke frontend
    const [userRows] = await db.query('SELECT nama, role FROM users WHERE id = ?', [user_id]);
    const user = userRows[0] || { nama: 'Unknown', role: 'member' };

    // Ambil info tiket untuk sinkronisasi notifikasi dan webhook
    const [tktRows] = await db.query('SELECT user_id, staff_id, external_ticket_id, judul, deskripsi FROM tickets WHERE id = ?', [id]);
    const ticketData = tktRows.length > 0 ? tktRows[0] : null;

    // Jika pengirim adalah staff atau admin, secara otomatis assign tiket dan ubah status menjadi 'diproses'
    if (user.role === 'staff' || user.role === 'admin') {
      await db.query("UPDATE tickets SET staff_id = COALESCE(staff_id, ?), status = 'diproses', updated_at = ? WHERE id = ?", [user_id, wibNow, id]);

      // Buat notifikasi in-app untuk customer jika dibalas oleh staff / admin
      if (ticketData && ticketData.user_id && ticketData.user_id !== parseInt(user_id, 10)) {
        try {
          const roleLabel = user.role === 'admin' ? 'Administrator' : 'Staff KroomCare';
          await db.query(`
            INSERT INTO notifications (user_id, title, type, message, link, is_read, created_at)
            VALUES (?, ?, 'ticket', ?, ?, FALSE, ?)
          `, [
            ticketData.user_id,
            `Balasan dari ${user.nama} (${roleLabel})`,
            `Staff membalas tiket #${id} "${ticketData.judul}": "${konten.slice(0, 80)}"`,
            `/tickets/${id}`,
            wibNow
          ]);
        } catch (notifErr) {
          console.error('Failed to create in-app notification for customer:', notifErr.message);
        }
      }

      // --- Sync reply to KolabPanel if this is an external ticket ---
      try {
        let extTicketId = ticketData ? ticketData.external_ticket_id : null;

        // 1. Jika external_ticket_id masih kosong, cari berdasarkan judul yang sama di tiket lain
        if (!extTicketId && ticketData && ticketData.judul) {
          const [matchRows] = await db.query(
            'SELECT external_ticket_id FROM tickets WHERE judul = ? AND external_ticket_id IS NOT NULL ORDER BY id DESC LIMIT 1',
            [ticketData.judul]
          );
          if (matchRows.length > 0) {
            extTicketId = matchRows[0].external_ticket_id;
            await db.query('UPDATE tickets SET external_ticket_id = ? WHERE id = ?', [extTicketId, id]);
          }
        }

        // 2. Jika masih kosong, cek apakah subjek atau deskripsi mengandung ID panel format (t_...)
        if (!extTicketId && ticketData) {
          const combinedText = `${ticketData.judul} ${ticketData.deskripsi || ''}`;
          const matchRegex = combinedText.match(/\b(t_\d+_[a-z0-9]+)\b/i);
          if (matchRegex) {
            extTicketId = matchRegex[1];
            await db.query('UPDATE tickets SET external_ticket_id = ? WHERE id = ?', [extTicketId, id]);
          }
        }

        if (extTicketId && process.env.KOLABPANEL_WEBHOOK_URL) {
          console.log(`[Webhook] Syncing reply for ticket #${id} (Ext: ${extTicketId}) to ${process.env.KOLABPANEL_WEBHOOK_URL}`);
          sendWebhook(process.env.KOLABPANEL_WEBHOOK_URL, {
            external_ticket_id: extTicketId,
            sender_name: user.nama,
            text: konten
          });

          // Sinkronisasikan status tiket ke KolabPanel juga
          const webhookStatusUrl = process.env.KOLABPANEL_WEBHOOK_URL.replace('/external-reply', '/external-status');
          sendWebhook(webhookStatusUrl, {
            external_ticket_id: extTicketId,
            status: 'In Progress'
          });
        }
      } catch(err) {
        console.error('Failed to process KolabPanel webhook:', err.message);
      }
    } else {
      // Jika pengguna (customer / member) yang membalas
      await db.query("UPDATE tickets SET updated_at = ? WHERE id = ?", [wibNow, id]);

      // Buat notifikasi untuk staff/admin yang menangani tiket atau seluruh staff & admin jika belum di-assign
      try {
        const targetStaff = (ticketData && ticketData.staff_id)
          ? [{ id: ticketData.staff_id }]
          : (await db.query("SELECT id FROM users WHERE role IN ('staff', 'admin')"))[0];

        for (const st of targetStaff) {
          if (st.id !== parseInt(user_id, 10)) {
            await db.query(`
              INSERT INTO notifications (user_id, title, type, message, link, is_read, created_at)
              VALUES (?, ?, 'ticket', ?, ?, FALSE, ?)
            `, [
              st.id,
              `Balasan dari ${user.nama} (Customer)`,
              `Pelanggan membalas tiket #${id} "${ticketData?.judul || ''}": "${konten.slice(0, 80)}"`,
              `/staff/tickets/${id}`,
              wibNow
            ]);
          }
        }
      } catch (notifErr) {
        console.error('Failed to create in-app notification for staff/admin:', notifErr.message);
      }

      // Sinkronkan balasan customer ke KolabPanel webhook jika tiket berasal dari panel
      try {
        let extTicketId = ticketData ? ticketData.external_ticket_id : null;
        if (!extTicketId && ticketData && ticketData.judul) {
          const [matchRows] = await db.query(
            'SELECT external_ticket_id FROM tickets WHERE judul = ? AND external_ticket_id IS NOT NULL ORDER BY id DESC LIMIT 1',
            [ticketData.judul]
          );
          if (matchRows.length > 0) {
            extTicketId = matchRows[0].external_ticket_id;
          }
        }
        if (extTicketId && process.env.KOLABPANEL_WEBHOOK_URL) {
          sendWebhook(process.env.KOLABPANEL_WEBHOOK_URL, {
            external_ticket_id: extTicketId,
            sender_name: user.nama,
            text: konten
          });
        }
      } catch (syncErr) {
        console.error('Failed to sync customer reply to KolabPanel webhook:', syncErr.message);
      }
    }

    // Jika balasan dibuat di server lokal (port 5000 / DB port 3306), otomatis sinkronkan ke Live Server KroomCare (port 5550)
    // agar balasan yang diketik oleh staf di localhost langsung muncul di Support Center Panel Kroombox
    if (!req.body.is_synced && (process.env.PORT === '5000' || process.env.DB_PORT === '3306')) {
      const liveEndpoint = (process.env.LIVE_KROOMCARE_URL || 'https://kroomcare.kroombox.com') + `/api/tickets/${id}/replies`;
      sendWebhook(liveEndpoint, {
        user_id,
        konten,
        is_synced: true
      }).catch(err => console.error('[LocalSync] Gagal meneruskan balasan ke live server:', err.message));
    }

    res.status(201).json({
      success: true,
      message: 'Balasan tiket berhasil ditambahkan.',
      data: {
        id: result.insertId.toString(),
        ticketId: id.toString(),
        userId: user_id.toString(),
        userName: user.nama,
        userRole: user.role === 'member' ? 'customer' : user.role,
        text: konten,
        createdAt: wibNow
      }
    });
  } catch (error) {
    console.error('Error in addTicketReply:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Give Point Reward to Customer
const giveReward = async (req, res) => {
  try {
    const { id } = req.params; // ticket ID
    const { points } = req.body; // read points from request body
    const pointsAmount = parseInt(points) || 50; // default to 50 if not specified

    // Cari tiket untuk mendapatkan customer user_id
    const [ticketRows] = await db.query('SELECT user_id, judul FROM tickets WHERE id = ?', [id]);
    if (ticketRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tiket tidak ditemukan.'
      });
    }

    const ticket = ticketRows[0];
    const customerId = ticket.user_id;

    // Tambahkan poin ke user
    await db.query('UPDATE users SET koin_reward = koin_reward + ? WHERE id = ?', [pointsAmount, customerId]);

    // Catat histori poin
    const desc = `Reward penyelesaian tiket #${id}: ${ticket.judul}`;
    await db.query(
      'INSERT INTO point_histories (user_id, jenis_transaksi, jumlah_poin, keterangan) VALUES (?, ?, ?, ?)',
      [customerId, 'masuk', pointsAmount, desc]
    );

    res.status(200).json({
      success: true,
      message: 'Poin reward berhasil diberikan kepada pelanggan.',
      data: { points: pointsAmount }
    });
  } catch (error) {
    console.error('Error in giveReward:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Escalate Ticket to Maintenance
const escalateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_id } = req.body;

    // 1. Update status to 'diproses'
    await db.query("UPDATE tickets SET status = 'diproses' WHERE id = ?", [id]);

    // 2. Update priority to High (is_priority = 1)
    await db.query("UPDATE tickets SET is_priority = 1 WHERE id = ?", [id]);

    // 3. Catat eskalasi ke ticket_replies
    const systemUserId = staff_id || 2; // Default to staff_id or Sarah Staff (2)
    const content = "Tiket telah dieskalasi ke tim teknis (Transfer to Maintenance).";
    const wibNow = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
    await db.query('INSERT INTO ticket_replies (ticket_id, user_id, konten, created_at) VALUES (?, ?, ?, ?)', [id, systemUserId, content, wibNow]);

    res.status(200).json({
      success: true,
      message: 'Tiket berhasil dieskalasi ke tim teknis.',
      data: {
        id,
        status: 'In Progress',
        isPriority: true
      }
    });
  } catch (error) {
    console.error('Error in escalateTicket:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

module.exports = {
  createTicket,
  getTickets,
  getTicketDetail,
  setPriority,
  updateStatus,
  getTicketReplies,
  addTicketReply,
  giveReward,
  escalateTicket
};

