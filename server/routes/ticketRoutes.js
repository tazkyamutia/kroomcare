const express = require('express');
const router = express.Router();
const {
  createTicket,
  getTickets,
  getTicketDetail,
  setPriority,
  updateStatus,
  getTicketReplies,
  addTicketReply,
  giveReward,
  escalateTicket
} = require('../controllers/ticketController');

// Rute daftar tiket
router.get('/', getTickets);

// Rute membuat tiket baru
router.post('/', createTicket);

// Rute detail tiket
router.get('/:id', getTicketDetail);

// Rute ubah prioritas tiket
router.put('/:id/priority', setPriority);

// Rute ubah status tiket
router.put('/:id/status', updateStatus);

// Rute eskalasi tiket ke maintenance
router.put('/:id/escalate', escalateTicket);


// Rute ambil chat/balasan tiket
router.get('/:id/replies', getTicketReplies);

// Rute kirim balasan chat tiket
router.post('/:id/replies', addTicketReply);

// Rute beri reward koin
router.post('/:id/reward', giveReward);

module.exports = router;
