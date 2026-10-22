const mysql = require('mysql2/promise');
const db = require('../config/db');
const { queueNotification, sendNotification, updateNotificationStatus } = require('./notificationQueue');

let isSyncRunning = false;

/**
 * syncPanelTickets
 * Mengambil tiket baru dari database KolabPanel (panelkroombox-test),
 * memasukkannya ke database KroomCare, dan otomatis mengirimkan notifikasi WhatsApp.
 */
async function syncPanelTickets() {
  if (isSyncRunning) return;
  isSyncRunning = true;

  let panelConn = null;
  try {
    const panelDbHost = process.env.PANEL_DB_HOST || '192.168.100.185';
    const panelDbPort = parseInt(process.env.PANEL_DB_PORT, 10) || 3310;
    const panelDbUser = process.env.PANEL_DB_USER || 'root';
    const panelDbPassword = process.env.PANEL_DB_PASSWORD || 'kolab@777';
    const panelDbName = process.env.PANEL_DB_NAME || 'panelkroombox-test';

    // Coba koneksi ke database KolabPanel dengan timeout pendek agar tidak blocking
    panelConn = await mysql.createConnection({
      host: panelDbHost,
      port: panelDbPort,
      user: panelDbUser,
      password: panelDbPassword,
      database: panelDbName,
      connectTimeout: 5000
    });

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

    for (const pt of panelTickets) {
      // 1. Cek apakah tiket sudah ada di database KroomCare
      const [existing] = await db.query(
        'SELECT id FROM tickets WHERE external_ticket_id = ?',
        [pt.id]
      );
      if (existing.length > 0) {
        continue; // Lewati jika sudah ada
      }

      // 2. Ambil deskripsi pesan pertama dari tabel messages
      let desc = pt.subject;
      try {
        const [messages] = await panelConn.query(
          'SELECT text, sender_id FROM messages WHERE ticket_id = ? ORDER BY timestamp ASC',
          [pt.id]
        );
        if (messages.length > 0) {
          const userMsg = messages.find(m => m.sender_id !== 'SYSTEM') || messages[0];
          if (userMsg && userMsg.text) {
            desc = userMsg.text;
          }
        }
      } catch (mErr) {
        // Fallback gunakan subjek
      }

      const email = pt.email || `${pt.username || pt.user_id || 'user'}@kolabpanel.local`;
      const nama = pt.username || 'User KolabPanel';

      // 3. JIT User Provisioning di KroomCare
      const [kcUserRows] = await db.query(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      let kcUserId;
      let isNewUser = false;
      if (kcUserRows.length === 0) {
        const defaultPassword = 'EXT_USER_' + Date.now();
        const [insertUserRes] = await db.query(
          'INSERT INTO users (nama, email, password, role, koin_reward) VALUES (?, ?, ?, "member", 0)',
          [nama, email, defaultPassword]
        );
        kcUserId = insertUserRes.insertId;
        isNewUser = true;
      } else {
        kcUserId = kcUserRows[0].id;
      }

      // 4. Map Status
      const statusMapped = (pt.status === 'CLOSED' || pt.status === 'Closed' || pt.status === 'selesai')
        ? 'selesai'
        : (pt.status === 'IN_PROGRESS' || pt.status === 'diproses')
          ? 'diproses'
          : 'menunggu';

      const kategori = pt.category || 'General';

      // 5. Simpan ke tabel tickets KroomCare (Pastikan waktu terparse dalam WIB)
      let ticketDateStr = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
      if (pt.created_at) {
        const d = new Date(pt.created_at);
        if (!isNaN(d.getTime())) {
          ticketDateStr = d.toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
        }
      }

      const [ticketInsertRes] = await db.query(`
        INSERT INTO tickets (external_ticket_id, user_id, judul, deskripsi, kategori, status, is_priority, created_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?)
      `, [pt.id, kcUserId, pt.subject, desc, kategori, statusMapped, ticketDateStr]);

      const ticketId = ticketInsertRes.insertId;
      console.log(`[PanelSync] Tiket baru dari panel terdeteksi (${pt.id}) -> Diimpor sebagai KroomCare ID #${ticketId}`);

      // Broadcast real-time ke dasbor staf
      try {
        const { broadcastStaffNotification } = require('./realtimeHub');
        broadcastStaffNotification('TicketCreated', {
          ticket_id: String(ticketId),
          external_ticket_id: pt.id,
          subject: pt.subject,
          title: pt.subject,
          category: kategori,
          priority: 'normal',
          isPriority: false,
          customer_name: nama,
          customer_email: email,
          status: statusMapped === 'menunggu' ? 'Open' : (statusMapped === 'diproses' ? 'In Progress' : 'Resolved'),
          timestamp: ticketDateStr,
          created_at: ticketDateStr,
          link: `/staff/tickets/${ticketId}`
        });
      } catch (bcErr) {
        console.warn('[PanelSync] Broadcast error:', bcErr.message);
      }

      // 6. Otomatis kirim Notifikasi WhatsApp via Kroomhook
      const targetJid = process.env.WA_TARGET_JID || '6285847255010@s.whatsapp.net';
      const newUserNote = isNewUser ? '\n⚠️ _Akun baru telah dibuat secara otomatis di KroomCare (JIT)_' : '';
      const messageContent =
        `🎫 *Tiket Keluhan Eksternal (KolabPanel) #${ticketId}*\n` +
        `*ID Panel:* ${pt.id}\n` +
        `*Nama:* ${nama}\n` +
        `*Email:* ${email}\n` +
        `*Subjek:* ${pt.subject}\n` +
        `*Kategori:* ${kategori}\n` +
        `*Deskripsi:* ${desc}\n` +
        `*Status:* 🟢 ${statusMapped}` +
        newUserNote;

      try {
        const queueId = await queueNotification(targetJid, messageContent);
        if (queueId) {
          const sendRes = await sendNotification(targetJid, messageContent);
          if (sendRes.success) {
            await updateNotificationStatus(queueId, 'sent');
          } else {
            await updateNotificationStatus(queueId, 'failed', 1, sendRes.error);
          }
        }
      } catch (notifErr) {
        console.error(`[PanelSync] Gagal mengirim notif WA untuk tiket #${ticketId}:`, notifErr.message);
      }
    }
  } catch (err) {
    // Abaikan jika tidak dapat menjangkau database panel (misal saat running di local dev tanpa akses LAN)
    if (process.env.NODE_ENV === 'production') {
      console.warn('[PanelSync] Peringatan koneksi database panel:', err.message);
    }
  } finally {
    if (panelConn) {
      try { await panelConn.end(); } catch (_) {}
    }
    isSyncRunning = false;
  }
}

/**
 * startPanelSyncWorker
 * Menjalankan background worker untuk sinkronisasi tiket panel secara berkala
 */
function startPanelSyncWorker(intervalMs = 60000) {
  console.log(`[PanelSync Worker] Aktif, memindai tiket KolabPanel setiap ${Math.round(intervalMs / 1000)} detik.`);
  // Jalankan segera sekali di awal setelah delay singkat
  setTimeout(() => {
    syncPanelTickets().catch(() => {});
  }, 5000);

  setInterval(() => {
    syncPanelTickets().catch(() => {});
  }, intervalMs);
}

module.exports = { syncPanelTickets, startPanelSyncWorker };
