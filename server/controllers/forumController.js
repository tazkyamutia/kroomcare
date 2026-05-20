const db = require('../config/db');

// Get All Forums
const getForums = async (req, res) => {
  try {
    const query = `
      SELECT 
        f.id, 
        f.user_id, 
        f.judul, 
        f.konten, 
        f.created_at,
        u.nama AS authorName,
        (SELECT COUNT(*) FROM forum_replies fr WHERE fr.forum_id = f.id) AS replyCount
      FROM forums f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `;
    const [rows] = await db.query(query);

    // Map untuk kompatibilitas frontend
    const mappedRows = rows.map(row => ({
      id: row.id.toString(),
      subject: row.judul,
      description: row.konten,
      status: 'Open', // default status
      priority: 'Low', // default priority
      createdAt: row.created_at,
      customerId: row.user_id ? row.user_id.toString() : '',
      customerName: row.authorName || 'Unknown User',
      category: 'Forum',
      isPrivate: false,
      replyCount: row.replyCount || 0
    }));

    res.status(200).json({
      success: true,
      data: mappedRows
    });
  } catch (error) {
    console.error('Error in getForums:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Create Forum Thread
const createForum = async (req, res) => {
  try {
    const { user_id, judul, konten } = req.body;

    if (!user_id || !judul || !konten) {
      return res.status(400).json({
        success: false,
        message: 'user_id, judul, dan konten wajib diisi.'
      });
    }

    const query = 'INSERT INTO forums (user_id, judul, konten) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [user_id, judul, konten]);

    res.status(201).json({
      success: true,
      message: 'Thread forum berhasil dibuat.',
      data: {
        id: result.insertId.toString(),
        user_id: user_id.toString(),
        judul,
        konten,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in createForum:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Get Forum Detail
const getForumDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        f.id, 
        f.user_id, 
        f.judul, 
        f.konten, 
        f.created_at,
        u.nama AS authorName
      FROM forums f
      JOIN users u ON f.user_id = u.id
      WHERE f.id = ?
    `;
    const [rows] = await db.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Thread forum tidak ditemukan.'
      });
    }

    const row = rows[0];
    const mappedForum = {
      id: row.id.toString(),
      subject: row.judul,
      description: row.konten,
      status: 'Open',
      priority: 'Low',
      createdAt: row.created_at,
      customerId: row.user_id ? row.user_id.toString() : '',
      customerName: row.authorName || 'Unknown User',
      category: 'Forum',
      isPrivate: false
    };

    res.status(200).json({
      success: true,
      data: mappedForum
    });
  } catch (error) {
    console.error('Error in getForumDetail:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Get Forum Replies
const getForumReplies = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        fr.id, 
        fr.forum_id, 
        fr.user_id, 
        fr.konten, 
        fr.created_at,
        u.nama AS userName,
        u.role AS userRole
      FROM forum_replies fr
      JOIN users u ON fr.user_id = u.id
      WHERE fr.forum_id = ?
      ORDER BY fr.created_at ASC
    `;
    const [rows] = await db.query(query, [id]);

    const mappedReplies = rows.map(row => ({
      id: row.id.toString(),
      ticketId: row.forum_id.toString(),
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
    console.error('Error in getForumReplies:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Add Reply to Forum
const addReply = async (req, res) => {
  try {
    const { forum_id, user_id, konten } = req.body;

    if (!forum_id || !user_id || !konten) {
      return res.status(400).json({
        success: false,
        message: 'forum_id, user_id, dan konten wajib diisi.'
      });
    }

    const query = 'INSERT INTO forum_replies (forum_id, user_id, konten) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [forum_id, user_id, konten]);

    // Ambil info pengirim balasan untuk dikembalikan ke frontend
    const [userRows] = await db.query('SELECT nama, role FROM users WHERE id = ?', [user_id]);
    const user = userRows[0] || { nama: 'Unknown', role: 'member' };

    res.status(201).json({
      success: true,
      message: 'Balasan forum berhasil ditambahkan.',
      data: {
        id: result.insertId.toString(),
        ticketId: forum_id.toString(),
        userId: user_id.toString(),
        userName: user.nama,
        userRole: user.role === 'member' ? 'customer' : user.role,
        text: konten,
        createdAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error in addReply:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.',
      error: error.message
    });
  }
};

// Delete Forum Thread (Moderation)
const deleteForum = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Hapus terlebih dahulu balasan terkait (foreign key constraint)
    await db.query('DELETE FROM forum_replies WHERE forum_id = ?', [id]);
    
    // Hapus thread forum
    const [result] = await db.query('DELETE FROM forums WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Thread forum tidak ditemukan.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Thread forum berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error in deleteForum:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat menghapus thread.',
      error: error.message
    });
  }
};

// Delete Reply (Moderation)
const deleteReply = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM forum_replies WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Balasan tidak ditemukan.'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Balasan berhasil dihapus.'
    });
  } catch (error) {
    console.error('Error in deleteReply:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat menghapus balasan.',
      error: error.message
    });
  }
};

module.exports = {
  getForums,
  createForum,
  getForumDetail,
  getForumReplies,
  addReply,
  deleteForum,
  deleteReply
};
