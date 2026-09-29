// Script untuk menjalankan migrasi Phase 2 Kroomcare
require('dotenv').config({ path: './.env' });
const mysql = require('mysql2/promise');

async function migrate() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kroomcare',
  });

  try {
    console.log('Koneksi ke database berhasil...');

    // 1. Cek dan tambahkan kolom rating & rating_comment di tickets
    const [cols] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tickets' AND COLUMN_NAME IN ('rating', 'rating_comment')
    `, [process.env.DB_NAME || 'kroomcare']);

    const existingCols = cols.map(c => c.COLUMN_NAME);
    
    if (!existingCols.includes('rating')) {
      await db.query(`ALTER TABLE tickets ADD COLUMN rating INT DEFAULT NULL`);
      console.log("✅ Ditambahkan kolom 'rating' ke tabel 'tickets'.");
    } else {
      console.log('✅ Kolom `rating` sudah ada.');
    }

    if (!existingCols.includes('rating_comment')) {
      await db.query(`ALTER TABLE tickets ADD COLUMN rating_comment TEXT DEFAULT NULL`);
      console.log("✅ Ditambahkan kolom 'rating_comment' ke tabel 'tickets'.");
    } else {
      console.log('✅ Kolom `rating_comment` sudah ada.');
    }

    // 2. Buat tabel notifications
    await db.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        link VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log("✅ Tabel 'notifications' dibuat atau sudah ada.");

  } catch (error) {
    console.error('❌ Gagal saat menjalankan migrasi:', error);
  } finally {
    await db.end();
    console.log('\nKoneksi ditutup.');
  }
}

migrate().catch(err => {
  console.error('❌ Migrasi gagal:', err.message);
  process.exit(1);
});
