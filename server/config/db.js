const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kroomcare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Verifikasi koneksi awal
pool.getConnection()
  .then(connection => {
    console.log('Database Connected Successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err.message);
  });

module.exports = pool;
