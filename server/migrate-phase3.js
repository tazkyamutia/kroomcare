const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'kroomcare',
    port: process.env.DB_PORT || 3310
  });

  const [tickets] = await db.query('DESCRIBE tickets');
  console.log("=== TICKETS TABLE ===");
  console.log(tickets);

  const [forums] = await db.query('DESCRIBE forums');
  console.log("=== FORUMS TABLE ===");
  console.log(forums);
  
  const [users] = await db.query('DESCRIBE users');
  console.log("=== USERS TABLE ===");
  console.log(users);

  // MIGRATION FOR PHASE 3
  console.log("Migrating for Phase 3...");
  
  try {
    await db.query("ALTER TABLE tickets ADD COLUMN sla_deadline DATETIME NULL");
    console.log("Added sla_deadline to tickets.");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log("sla_deadline already exists");
    else throw e;
  }
  
  try {
    await db.query("ALTER TABLE forums ADD COLUMN solved_reply_id INT NULL");
    console.log("Added solved_reply_id to forums.");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') console.log("solved_reply_id already exists");
    else throw e;
  }

  await db.end();
}

run().catch(console.error);
