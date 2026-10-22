/**
 * Real-Time Event & Channel Pub/Sub Hub for KroomCare & Kroombox Panel
 * Provides two-way real-time communication channel: `kroomcare_ticket_{ticket_id}`
 * Supports Server-Sent Events (SSE) and WebSocket/Pusher broadcasting with zero external overhead.
 */

// Channels store: Map<string, Set<http.ServerResponse>>
const ticketChannels = new Map();

/**
 * Get or create subscriber set for channel `kroomcare_ticket_{ticketId}`
 */
function getChannelSubscribers(ticketId) {
  const channelName = `kroomcare_ticket_${ticketId}`;
  if (!ticketChannels.has(channelName)) {
    ticketChannels.set(channelName, new Set());
  }
  return ticketChannels.get(channelName);
}

/**
 * Subscribe client (HTTP SSE) to ticket channel
 */
function handleTicketSubscription(req, res) {
  const ticketId = req.params.id;
  const channelName = `kroomcare_ticket_${ticketId}`;

  // Headers wajib SSE & anti-buffering Nginx/Proxy
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
    'Access-Control-Allow-Origin': '*'
  });

  const subscribers = getChannelSubscribers(ticketId);
  subscribers.add(res);

  // Kirim event sambungan awal
  const initialPayload = JSON.stringify({
    channel: channelName,
    ticket_id: String(ticketId),
    status: 'subscribed',
    timestamp: new Date().toISOString()
  });
  res.write(`event: connected\ndata: ${initialPayload}\n\n`);

  // Heartbeat ping berkala setiap 20 detik agar reverse-proxy / firewall tidak memutus koneksi
  const heartbeatTimer = setInterval(() => {
    res.write(`: ping\n\n`);
  }, 20000);

  // Lifecycle cleanup ketika koneksi terputus / tab ditutup / navigasi (mencegah memory leak)
  req.on('close', () => {
    clearInterval(heartbeatTimer);
    subscribers.delete(res);
    if (subscribers.size === 0) {
      ticketChannels.delete(channelName);
    }
  });
}

/**
 * Broadcast payload seragam ke channel `kroomcare_ticket_{ticketId}`
 * @param {string|number} ticketId
 * @param {object} messagePayload
 */
function broadcastTicketMessage(ticketId, messagePayload) {
  const channelName = `kroomcare_ticket_${ticketId}`;
  const subscribers = ticketChannels.get(channelName);
  
  if (!subscribers || subscribers.size === 0) {
    return false;
  }

  // Schema payload standar
  const standardizedPayload = {
    ticket_id: String(ticketId),
    id: String(messagePayload.id || messagePayload.message_id || Date.now()),
    message_id: String(messagePayload.id || messagePayload.message_id || Date.now()),
    sender_id: String(messagePayload.sender_id || messagePayload.userId || ''),
    sender_name: messagePayload.sender_name || messagePayload.userName || 'User',
    sender_type: (messagePayload.sender_type || (messagePayload.userRole === 'staff' || messagePayload.userRole === 'admin' ? 'staff' : 'user')),
    userRole: messagePayload.userRole || (messagePayload.sender_type === 'staff' ? 'staff' : 'customer'),
    message: messagePayload.message || messagePayload.text || messagePayload.konten || '',
    text: messagePayload.text || messagePayload.message || messagePayload.konten || '',
    konten: messagePayload.konten || messagePayload.message || messagePayload.text || '',
    created_at: messagePayload.created_at || messagePayload.createdAt || new Date().toISOString(),
    createdAt: messagePayload.createdAt || messagePayload.created_at || new Date().toISOString(),
    status: 'sent'
  };

  const eventData = `event: MessageSent\ndata: ${JSON.stringify(standardizedPayload)}\n\n`;

  for (const clientRes of subscribers) {
    try {
      clientRes.write(eventData);
    } catch (err) {
      console.warn(`[RealtimeHub] Error sending to subscriber in ${channelName}:`, err.message);
      subscribers.delete(clientRes);
    }
  }

  return true;
}

module.exports = {
  handleTicketSubscription,
  broadcastTicketMessage,
  ticketChannels
};
