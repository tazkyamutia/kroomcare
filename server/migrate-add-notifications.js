const db = require('./config/db');

async function migrate() {
  try {
    console.log('Running migration: create notifications table...');
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'ticket',
        message TEXT NOT NULL,
        link VARCHAR(255) NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_read (user_id, is_read),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    await db.query(createTableQuery);
    console.log('Notifications table ready!');

    // Populate initial notification for ticket #36 if reply exists
    const [replies] = await db.query(`
      SELECT tr.id, tr.ticket_id, tr.user_id, tr.konten, tr.created_at, t.user_id as customer_id, t.judul, u.nama as staff_name
      FROM ticket_replies tr
      JOIN tickets t ON tr.ticket_id = t.id
      JOIN users u ON tr.user_id = u.id
      WHERE u.role IN ('staff', 'admin') AND t.user_id != tr.user_id
    `);

    for (const r of replies) {
      const [existing] = await db.query(
        'SELECT id FROM notifications WHERE user_id = ? AND link LIKE ?',
        [r.customer_id, `%/tickets/${r.ticket_id}%`]
      );
      if (existing.length === 0) {
        await db.query(`
          INSERT INTO notifications (user_id, title, type, message, link, is_read, created_at)
          VALUES (?, ?, 'ticket', ?, ?, FALSE, ?)
        `, [
          r.customer_id,
          `Balasan dari ${r.staff_name}`,
          `Staff membalas tiket #${r.ticket_id} "${r.judul}": "${r.konten.slice(0, 60)}"`,
          `/tickets/${r.ticket_id}`,
          r.created_at
        ]);
        console.log(`Notification seeded for ticket #${r.ticket_id} to customer #${r.customer_id}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrate();
