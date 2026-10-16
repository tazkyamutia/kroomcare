let mysql;
try {
  mysql = require('./server/node_modules/mysql2/promise');
} catch (e) {
  try {
    mysql = require('/volume1/web/Web/kolabpanel-v1/server/node_modules/mysql2/promise');
  } catch (e2) {
    mysql = require('mysql2/promise');
  }
}

async function main() {
  console.log('=== Sinkronisasi Penuh: Dari Panel Database (panelkroombox-test) ke KroomCare ===');
  
  // 1. Koneksi ke database KolabPanel
  const panelConn = await mysql.createConnection({
    host: '192.168.100.185',
    port: 3310,
    user: 'root',
    password: 'kolab@777',
    database: 'panelkroombox-test'
  });

  // 2. Koneksi ke database KroomCare
  const kroomcareConn = await mysql.createConnection({
    host: '192.168.100.185',
    port: 3310,
    user: 'root',
    password: 'kolab@777',
    database: 'kroomcare'
  });

  console.log('Berhasil terkoneksi ke kedua database!');

  // 3. Ambil semua tiket dari database Panel beserta data pengirimnya
  const [panelTickets] = await panelConn.query(`
    SELECT 
      t.id, 
      t.user_id, 
      u.username, 
      u.email, 
      t.subject, 
      t.category, 
      t.status, 
      t.created_at
    FROM tickets t
    LEFT JOIN users u ON t.user_id = u.id
    ORDER BY t.created_at ASC
  `);

  console.log(`Total tiket ditemukan di database Panel: ${panelTickets.length}`);

  let addedCount = 0;
  let skippedCount = 0;

  for (const pt of panelTickets) {
    // Cek apakah sudah pernah masuk ke kroomcare berdasarkan external_ticket_id
    const [existing] = await kroomcareConn.query(
      'SELECT id FROM tickets WHERE external_ticket_id = ?',
      [pt.id]
    );

    if (existing.length > 0) {
      console.log(`[SUDAH ADA] Tiket ${pt.id} ("${pt.subject}") sudah ada di KroomCare (ID #${existing[0].id}).`);
      skippedCount++;
      continue;
    }

    // Ambil isi keluhan / deskripsi dari tabel messages di panel
    let desc = pt.subject;
    try {
      const [messages] = await panelConn.query(
        'SELECT text, sender_id FROM messages WHERE ticket_id = ? ORDER BY timestamp ASC',
        [pt.id]
      );
      if (messages.length > 0) {
        // Ambil pesan pengirim pertama yang bukan SYSTEM
        const userMsg = messages.find(m => m.sender_id !== 'SYSTEM') || messages[0];
        if (userMsg && userMsg.text) {
          desc = userMsg.text;
        }
      }
    } catch (msgErr) {
      console.warn(`Gagal membaca messages untuk ${pt.id}:`, msgErr.message);
    }

    const email = pt.email || `${pt.username || pt.user_id || 'user'}@kolabpanel.local`;
    const nama = pt.username || 'User KolabPanel';

    // Cari atau buat akun user di kroomcare
    const [kcUserRows] = await kroomcareConn.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    let kcUserId;
    if (kcUserRows.length === 0) {
      const defaultPassword = 'EXT_USER_' + Date.now();
      const [insertUserRes] = await kroomcareConn.query(
        'INSERT INTO users (nama, email, password, role, koin_reward) VALUES (?, ?, ?, "member", 0)',
        [nama, email, defaultPassword]
      );
      kcUserId = insertUserRes.insertId;
      console.log(`  -> Akun baru dibuat untuk ${email} (User ID #${kcUserId})`);
    } else {
      kcUserId = kcUserRows[0].id;
    }

    // Map status
    const statusMapped = (pt.status === 'CLOSED' || pt.status === 'Closed' || pt.status === 'selesai')
      ? 'selesai'
      : (pt.status === 'IN_PROGRESS' || pt.status === 'diproses')
        ? 'diproses'
        : 'menunggu';

    const kategori = pt.category || 'General';

    // Simpan ke kroomcare.tickets
    const [ticketInsertRes] = await kroomcareConn.query(`
      INSERT INTO tickets (external_ticket_id, user_id, judul, deskripsi, kategori, status, is_priority, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?)
    `, [pt.id, kcUserId, pt.subject, desc, kategori, statusMapped, pt.created_at || new Date()]);

    console.log(`[BERHASIL IMPORT] Tiket ${pt.id} ("${pt.subject}") masuk ke KroomCare sebagai ID #${ticketInsertRes.insertId}!`);
    addedCount++;
  }

  await panelConn.end();
  await kroomcareConn.end();

  console.log(`\n=== Hasil Sinkronisasi: ${addedCount} tiket baru diimpor, ${skippedCount} sudah ada sebelumnya ===`);
}

main().catch(console.error);
