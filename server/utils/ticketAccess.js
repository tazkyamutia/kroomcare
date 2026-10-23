const db = require('../config/db');
const { isStaffRole } = require('../middleware/auth');

// Status tiket di database (Bahasa Indonesia) <-> label yang dipakai frontend & KolabPanel.
const DB_STATUS = { Open: 'menunggu', 'In Progress': 'diproses', Resolved: 'selesai', Closed: 'selesai' };
const toDbStatus = (status) => DB_STATUS[status] || null;
const toUiStatus = (dbStatus) => {
  const s = String(dbStatus || '').toLowerCase();
  if (s === 'menunggu' || s === 'open') return 'Open';
  if (s === 'diproses' || s === 'proses' || s === 'in progress' || s === 'progress') return 'In Progress';
  return 'Resolved';
};

// Penanda balasan eskalasi. Teks lama ikut dikenali agar tiket yang sudah dieskalasi tetap terdeteksi.
const ESCALATION_MARKERS = ['[ESKALASI]', '[SISTEM AUTO-ESKALASI]', '[SYSTEM AUTO-ESCALATION]', 'Tiket telah dieskalasi ke tim teknis'];
const ESCALATION_TEXT = '[ESKALASI] Tiket dieskalasi ke tim teknis (Maintenance) untuk penanganan lanjutan.';
const isEscalationText = (text) => ESCALATION_MARKERS.some((m) => String(text || '').startsWith(m));

const wibNow = () => new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });

/**
 * Memuat tiket dan memastikan pemanggil boleh mengaksesnya:
 * staff/admin/layanan boleh semua tiket, pelanggan hanya tiket miliknya.
 * Tiket orang lain dilaporkan sebagai "tidak ditemukan" agar ID tidak bisa ditebak-tebak.
 */
const loadTicketForUser = async (user, ticketId) => {
  const id = Number(ticketId);
  if (!Number.isInteger(id) || id <= 0) return null;
  const [rows] = await db.query(
    'SELECT id, user_id, staff_id, external_ticket_id, judul, deskripsi, status, is_priority, kategori FROM tickets WHERE id = ?',
    [id]
  );
  if (!rows.length) return null;
  const ticket = rows[0];
  if (isStaffRole(user) || Number(ticket.user_id) === Number(user.id)) return ticket;
  return null;
};

const notifyUser = async (userId, title, message, link) => {
  if (!userId) return;
  try {
    await db.query(
      "INSERT INTO notifications (user_id, title, type, message, link, is_read, created_at) VALUES (?, ?, 'ticket', ?, ?, FALSE, ?)",
      [userId, title, message, link, wibNow()]
    );
  } catch (err) {
    console.error('[notify] gagal membuat notifikasi:', err.message);
  }
};

const notifyRoles = async (roles, title, message, link, excludeUserId) => {
  const [rows] = await db.query('SELECT id FROM users WHERE role IN (?)', [roles]);
  for (const row of rows) {
    if (Number(row.id) !== Number(excludeUserId)) await notifyUser(row.id, title, message, link);
  }
};

// Staff yang memegang tiket, atau seluruh staff & admin bila tiket belum ditugaskan.
const notifyTicketHandlers = async (ticket, title, message, excludeUserId) => {
  const link = `/staff/tickets/${ticket.id}`;
  if (ticket.staff_id) {
    if (Number(ticket.staff_id) !== Number(excludeUserId)) await notifyUser(ticket.staff_id, title, message, link);
    return;
  }
  await notifyRoles(['staff', 'admin'], title, message, link, excludeUserId);
};

module.exports = {
  toDbStatus,
  toUiStatus,
  ESCALATION_TEXT,
  isEscalationText,
  wibNow,
  loadTicketForUser,
  notifyUser,
  notifyRoles,
  notifyTicketHandlers
};
