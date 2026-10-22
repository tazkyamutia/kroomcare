const express = require('express');
const router = express.Router();
const { receiveExternalTicket, receiveExternalStatus, receiveExternalReply, triggerPanelSync } = require('../controllers/externalController');

// POST /api/external/tickets — menerima tiket dari server eksternal (KolabPanel)
router.post('/tickets', receiveExternalTicket);
router.post('/status', receiveExternalStatus);
router.post('/replies', receiveExternalReply);
router.post('/reply', receiveExternalReply);
router.get('/sync-now', triggerPanelSync);
router.post('/sync-now', triggerPanelSync);

module.exports = router;
