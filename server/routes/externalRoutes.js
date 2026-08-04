const express = require('express');
const router = express.Router();
const { receiveExternalTicket } = require('../controllers/externalController');

// POST /api/external/tickets — menerima tiket dari server eksternal (KolabPanel)
router.post('/tickets', receiveExternalTicket);

module.exports = router;
