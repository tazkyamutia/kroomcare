const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kroomcare'
    });

    try {
        console.log("Menambahkan kolom attachment_url ke forum_replies...");
        await connection.execute(`ALTER TABLE forum_replies ADD COLUMN attachment_url VARCHAR(255) DEFAULT NULL;`);
        console.log("Selesai menambahkan attachment_url.");
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Kolom attachment_url sudah ada.");
        } else {
            console.error("Error:", err);
        }
    } finally {
        await connection.end();
    }
}

runMigration();
