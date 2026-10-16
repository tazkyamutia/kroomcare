const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Smart env loader: Di lokal Windows/dev muat server/.env (port 3306), di produksi gunakan root .env (port 3310)
const isProd = process.env.NODE_ENV === 'production' || !!process.env.PM2_HOME || process.platform === 'linux';
const localServerEnv = path.resolve(__dirname, '../.env');
if (!isProd && fs.existsSync(localServerEnv)) {
  require('dotenv').config({ path: localServerEnv, override: true });
} else {
  require('dotenv').config();
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kroomcare',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initial verification logic
pool.getConnection()
  .then((connection) => {
    console.log('Database Connected Successfully to MySQL!');
    connection.release();
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
  });

module.exports = pool;
