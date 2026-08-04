// Script sementara untuk menjalankan migrasi ALTER TABLE kolom `kategori`
require('dotenv').config({ path: './server/.env' });
const mysql = require('mysql2/promise');

async function migrate() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kroomcare',
  });

  try {
    console.log('Koneksi ke database berhasil...');

    // Cek apakah kolom sudah ada
    const [cols] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'tickets' AND COLUMN_NAME = 'kategori'
    `, [process.env.DB_NAME || 'kroomcare']);

    if (cols.length > 0) {
      console.log('✅ Kolom `kategori` sudah ada, tidak perlu migrasi.');
    } else {
      await db.query(`
        ALTER TABLE tickets ADD COLUMN kategori VARCHAR(100) DEFAULT 'General' AFTER deskripsi
      `);
      console.log("✅ ALTER TABLE berhasil: kolom 'kategori' ditambahkan ke tabel 'tickets'.");
    }

    // Verifikasi struktur tabel
    const [desc] = await db.query('DESCRIBE tickets');
    console.log('\nStruktur tabel tickets saat ini:');
    desc.forEach(row => {
      const flag = row.Field === 'kategori' ? ' ← BARU' : '';
      console.log(`  ${row.Field.padEnd(20)} ${row.Type.padEnd(25)} ${row.Null} ${row.Default || 'NULL'}${flag}`);
    });

  } finally {
    await db.end();
    console.log('\nKoneksi ditutup.');
  }
}

migrate().catch(err => {
  console.error('❌ Migrasi gagal:', err.message);
  process.exit(1);
});
