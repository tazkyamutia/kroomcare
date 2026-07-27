const db = require('../config/db');

// Create Ticket
const createTicket = async (req, res) => {
  try {
    const { user_id, judul, deskripsi, is_priority } = req.body;
    
    if (!user_id || !judul || !deskripsi) {
      return res.status(400).json({ 
        success: false, 
        message: 'user_id, judul, dan deskripsi wajib diisi.' 
      });
    }

    const query = 'INSERT INTO tickets (user_id, judul, deskripsi, is_priority) VALUES (?, ?, ?, ?)';
    const [result] = await db.query(query, [user_id, judul, deskripsi, is_priority ? 1 : 0]);
    const ticketId = result.insertId;

    // Tambahkan 50 koin reward ke customer
    await db.query('UPDATE users SET koin_reward = COALESCE(koin_reward, 0) + 50 WHERE id = ?', [user_id]);

    // Catat histori poin
    const desc = `Reward pembuatan tiket baru #${ticketId}`;
    await db.query(
      'INSERT INTO point_histories (user_id, jenis_transaksi, jumlah_poin, keterangan) VALUES (?, ?, ?, ?)',
      [user_id, 'masuk', 50, desc]
    );

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
    const waEndpoint = 'https://kroomhook.kroombox.com/notify';
    const messageContent = `🎫 *Tiket Keluhan Baru #${ticketId}*
*Nama:* ${userNama}
*Email:* ${userEmail}
*Subjek:* ${judul}
*Deskripsi:* ${deskripsi}
*Prioritas:* ${is_priority ? 'Tinggi (High)' : 'Normal'}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    fetch(waEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: targetJid,
        message: messageContent
      }),
      signal: controller.signal
    })
      .then(async (response) => {
        clearTimeout(timeoutId);
        const text = await response.text();
        console.log(`WhatsApp notification status: ${response.status}, response: ${text}`);
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        console.error('WhatsApp notification error (timeout or network):', err.message);
      });

    res.status(201).json({
      success: true,
      message: 'Tiket berhasil dibuat.',
      data: {
        id: ticketId,
        user_id,
        judul,
        deskripsi,
        isPriority: !!is_priority
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
    `;
    let params = [];

    if (user_id) {
      query += ' WHERE t.user_id = ?';
      params.push(user_id);
    }
    
    query += ' ORDER BY t.created_at DESC';

    const [rows] = await db.query(query, params);
    
    // Map untuk kompatibilitas frontend
    const mappedRows = rows.map(row => ({
      id: row.id.toString(),
      subject: row.judul,
      description: row.deskripsi,
      status: row.status === 'menunggu' ? 'Open' : (row.status === 'diproses' ? 'In Progress' : 'Resolved'),
      isPriority: !!row.is_priority,
      createdAt: row.created_at,
      customerId: row.user_id ? row.user_id.toString() : '',
      customerName: row.nama_pengirim || 'Unknown Customer',
      assignedTo: row.staff_id ? row.staff_id.toString() : undefined,
      category: 'Support'
    }));

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

    // Cek apakah reward sudah pernah diberikan untuk tiket ini
    const rewardQuery = "SELECT id FROM point_histories WHERE user_id = ? AND keterangan LIKE ?";
    const [rewardRows] = await db.query(rewardQuery, [row.user_id, `%tiket #${row.id}%`]);
    const rewardGiven = rewardRows.length > 0;

    const mappedTicket = {
      id: row.id.toString(),
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
      rewardGiven: rewardGiven
    };

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

    const query = 'INSERT INTO ticket_replies (ticket_id, user_id, konten) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [id, user_id, konten]);

    // Ambil info pengirim balasan untuk dikembalikan ke frontend
    const [userRows] = await db.query('SELECT nama, role FROM users WHERE id = ?', [user_id]);
    const user = userRows[0] || { nama: 'Unknown', role: 'member' };

    // Jika pengirim adalah staff, secara otomatis assign tiket ke staff ini dan ubah status menjadi 'diproses'
    if (user.role === 'staff') {
      await db.query("UPDATE tickets SET staff_id = ?, status = 'diproses' WHERE id = ?", [user_id, id]);
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
        createdAt: new Date().toISOString()
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
    await db.query('INSERT INTO ticket_replies (ticket_id, user_id, konten) VALUES (?, ?, ?)', [id, systemUserId, content]);

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

