const express = require('express');
const router = express.Router();
const { receiveExternalTicket, receiveExternalStatus, receiveExternalReply } = require('../controllers/externalController');

// POST /api/external/tickets — menerima tiket dari server eksternal (KolabPanel)
router.post('/tickets', receiveExternalTicket);
router.post('/status', receiveExternalStatus);
router.post('/replies', receiveExternalReply);
router.post('/reply', receiveExternalReply);

module.exports = router;
