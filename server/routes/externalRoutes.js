const express = require('express');
const router = express.Router();
const { receiveExternalTicket, receiveExternalStatus } = require('../controllers/externalController');

// POST /api/external/tickets — menerima tiket dari server eksternal (KolabPanel)
router.post('/tickets', receiveExternalTicket);
router.post('/status', receiveExternalStatus);

module.exports = router;
