const express = require('express');
const router = express.Router();
const { requireAuth, requireStaffOrAdmin } = require('../middleware/auth');
const {
  createTicket,
  getTickets,
  getTicketDetail,
  setPriority,
  updateStatus,
  assignTicket,
  getTicketReplies,
  addTicketReply,
  giveReward,
  escalateTicket
} = require('../controllers/ticketController');
const { handleTicketSubscription } = require('../utils/realtimeHub');

// Rute Real-time Stream SSE untuk channel kroomcare_ticket_{ticket_id}. EventSource tidak bisa mengirim header,
// jadi autentikasinya memakai ?token= dan dicek di dalam handler.
router.get('/:id/realtime', handleTicketSubscription);

// Semua rute tiket lainnya wajib login (atau API key layanan internal).
router.use(requireAuth);

// Daftar tiket: pelanggan hanya tiket miliknya, staff/admin semua tiket
router.get('/', getTickets);

// Membuat tiket baru
router.post('/', createTicket);

// Detail tiket
router.get('/:id', getTicketDetail);

// Ubah prioritas tiket (staff/admin)
router.put('/:id/priority', requireStaffOrAdmin, setPriority);

// Ubah status tiket (staff/admin semua status; pelanggan tutup/buka kembali tiket miliknya)
router.put('/:id/status', updateStatus);

// Tugaskan tiket ke staff (admin memilih staff; staff mengambil tiket yang belum dipegang)
router.put('/:id/assign', requireStaffOrAdmin, assignTicket);

// Eskalasi tiket ke maintenance (staff/admin)
router.put('/:id/escalate', requireStaffOrAdmin, escalateTicket);

// Ambil chat/balasan tiket
router.get('/:id/replies', getTicketReplies);

// Kirim balasan chat tiket
router.post('/:id/replies', addTicketReply);

// Beri reward koin penyelesaian tiket (staff/admin)
router.post('/:id/reward', requireStaffOrAdmin, giveReward);

module.exports = router;
