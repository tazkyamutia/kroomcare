const db = require('../config/db');

// Helper to ensure table exists
let isTableChecked = false;
const ensureNewsletterTableExists = async () => {
  if (isTableChecked) return;
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS newsletters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await db.query(createTableQuery);
    isTableChecked = true;
    console.log('Table "newsletters" checked/created successfully.');
  } catch (err) {
    console.error('Error ensuring newsletters table exists:', err.message);
  }
};

// Subscribe Newsletter
const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email wajib diisi.'
      });
    }

    // Check simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid.'
      });
    }

    // Ensure database table exists
    await ensureNewsletterTableExists();

    // Insert email to database
    const insertQuery = 'INSERT INTO newsletters (email) VALUES (?)';
    await db.query(insertQuery, [email]);

    res.status(201).json({
      success: true,
      message: 'Berhasil berlangganan newsletter.'
    });
  } catch (error) {
    console.error('Error in subscribeNewsletter:', error);
    
    // Handle MySQL Duplicate Entry error (code: 1062 or ER_DUP_ENTRY)
    if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062 || error.message.includes('Duplicate entry')) {
      return res.status(409).json({
        success: false,
        message: 'Email ini sudah terdaftar dalam newsletter kami.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat memproses langganan.',
      error: error.message
    });
  }
};

module.exports = {
  subscribeNewsletter
};
