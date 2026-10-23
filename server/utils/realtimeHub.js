/**
 * Real-Time Event & Channel Pub/Sub Hub for KroomCare & Kroombox Panel
 * Supports two-way channels:
 * - `private-ticket.{ticket_id}` (Standard Laravel WebSockets / Pusher / Kroombox format)
 * - `kroomcare_ticket_{ticket_id}` (Internal alias)
 * - `presence-staff-notifications` (Global staff/admin notification stream)
 * Features:
 * - Anti-buffering (`X-Accel-Buffering: no`, `Cache-Control: no-cache, no-transform`)
 * - Keep-alive heartbeats (20s)
 * - Auto-cleanup on disconnect (zero memory leak)
 * - Verified payload validation ({ ticket_id, message_id, content, sender_role, timestamp })
 */

const db = require('../config/db');
const { resolveIdentity, isStaffRole } = require('../middleware/auth');

// Channels store: Map<string, Set<http.ServerResponse>>
const channelSubscribers = new Map();

const STAFF_CHANNELS = new Set(['presence-staff-notifications', 'staff-notifications']);

const deny = (res, status, message) => res.status(status).json({ success: false, message });

/**
 * Otorisasi langganan SSE. EventSource tidak bisa mengirim header Authorization, jadi token dikirim lewat ?token=.
 * Channel staf hanya untuk staff/admin; channel tiket hanya untuk pemilik tiket atau staff/admin.
 * Mengembalikan true bila boleh, atau sudah mengirim respons penolakan.
 */
async function authorizeChannel(req, res, channelName) {
  const user = await resolveIdentity(req, { allowQueryToken: true });
  if (!user) {
    deny(res, 401, 'Sesi tidak valid atau sudah kedaluwarsa.');
    return false;
  }
  if (STAFF_CHANNELS.has(channelName)) {
    if (isStaffRole(user)) return true;
    deny(res, 403, 'Akses ditolak.');
    return false;
  }
  const match = /^(?:private-ticket\.|kroomcare_ticket_)(.+)$/.exec(channelName);
  if (!match) {
    deny(res, 404, 'Channel tidak dikenal.');
    return false;
  }
  if (isStaffRole(user)) return true;
  const ref = match[1];
  const [rows] = await db.query(
    'SELECT user_id FROM tickets WHERE ' + (/^\d+$/.test(ref) ? 'id = ?' : 'external_ticket_id = ?'),
    [ref]
  );
  if (rows.length && Number(rows[0].user_id) === Number(user.id)) return true;
  deny(res, 404, 'Tiket tidak ditemukan.');
  return false;
}

/**
 * Get or create subscriber set for any channel name
 * @param {string} channelName
 */
function getChannelSet(channelName) {
  const normalized = String(channelName).trim();
  if (!channelSubscribers.has(normalized)) {
    channelSubscribers.set(normalized, new Set());
  }
  return channelSubscribers.get(normalized);
}

/**
 * Generic SSE subscription handler for any channel
 */
async function handleChannelSubscription(req, res) {
  const channelName = String(req.params.channel || req.query.channel || 'presence-staff-notifications').trim();
  try {
    if (!(await authorizeChannel(req, res, channelName))) return;
  } catch (err) {
    console.error('[RealtimeHub] authorize error:', err.message);
    return deny(res, 500, 'Terjadi kesalahan server.');
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const subs = getChannelSet(channelName);
  subs.add(res);

  // Initial connected handshake
  const handshake = {
    channel: channelName,
    status: 'connected',
    timestamp: new Date().toISOString()
  };
  res.write(`event: connected\ndata: ${JSON.stringify(handshake)}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive ping\n\n');
    } catch (_) {}
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    subs.delete(res);
    if (subs.size === 0) {
      channelSubscribers.delete(channelName);
    }
  });
}

/**
 * Subscription handler for Ticket Chat (subscribes to both private-ticket.{id} and kroomcare_ticket_{id})
 */
async function handleTicketSubscription(req, res) {
  const ticketId = String(req.params.id);
  const primaryChannel = `private-ticket.${ticketId}`;
  const aliasChannel = `kroomcare_ticket_${ticketId}`;
  try {
    if (!(await authorizeChannel(req, res, primaryChannel))) return;
  } catch (err) {
    console.error('[RealtimeHub] authorize error:', err.message);
    return deny(res, 500, 'Terjadi kesalahan server.');
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const primarySubs = getChannelSet(primaryChannel);
  const aliasSubs = getChannelSet(aliasChannel);
  primarySubs.add(res);
  aliasSubs.add(res);

  const handshake = {
    channels: [primaryChannel, aliasChannel],
    ticket_id: ticketId,
    status: 'connected',
    timestamp: new Date().toISOString()
  };
  res.write(`event: connected\ndata: ${JSON.stringify(handshake)}\n\n`);

  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive ping\n\n');
    } catch (_) {}
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    primarySubs.delete(res);
    aliasSubs.delete(res);
    if (primarySubs.size === 0) channelSubscribers.delete(primaryChannel);
    if (aliasSubs.size === 0) channelSubscribers.delete(aliasChannel);
  });
}

/**
 * Subscription handler specifically for staff global presence
 */
function handleStaffSubscription(req, res) {
  req.params.channel = 'presence-staff-notifications';
  return handleChannelSubscription(req, res);
}

/**
 * Broadcast event & payload to a specific channel
 * @param {string} channelName
 * @param {string} eventName
 * @param {object} payload
 */
function broadcastToChannel(channelName, eventName, payload) {
  const normalized = String(channelName).trim();
  const subs = channelSubscribers.get(normalized);
  if (!subs || subs.size === 0) return 0;

  const eventData = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  let sentCount = 0;
  for (const client of Array.from(subs)) {
    try {
      client.write(eventData);
      sentCount++;
    } catch (err) {
      subs.delete(client);
    }
  }
  return sentCount;
}

/**
 * Broadcast validated message payload to all ticket channels and notify staff
 * @param {string|number} ticketId
 * @param {object} rawPayload
 * @param {string} [externalTicketId]
 */
function broadcastTicketMessage(ticketId, rawPayload, externalTicketId) {
  const tid = String(ticketId);
  const textContent = String(rawPayload.content || rawPayload.message || rawPayload.text || rawPayload.konten || '').trim();
  const msgId = String(rawPayload.message_id || rawPayload.id || Date.now());
  const senderRole = rawPayload.sender_role || (rawPayload.sender_type === 'staff' || rawPayload.userRole === 'staff' || rawPayload.userRole === 'admin' ? 'staff' : 'user');
  const nowIso = rawPayload.timestamp || rawPayload.created_at || rawPayload.createdAt || new Date().toISOString();

  // 1. Validasi & Standardisasi Schema Payload
  const verifiedPayload = {
    ticket_id: tid,
    external_ticket_id: externalTicketId ? String(externalTicketId) : undefined,
    message_id: msgId,
    id: msgId,
    content: textContent,
    message: textContent,
    text: textContent,
    konten: textContent,
    sender_role: senderRole,
    sender_type: senderRole,
    sender_id: String(rawPayload.sender_id || rawPayload.userId || ''),
    sender_name: rawPayload.sender_name || rawPayload.userName || (senderRole === 'staff' ? 'Staff KroomCare' : 'User'),
    timestamp: nowIso,
    created_at: nowIso,
    createdAt: nowIso,
    isAdmin: senderRole === 'staff',
    status: 'sent'
  };

  // 2. Broadcast ke channel tiket (format Laravel: private-ticket.{id} & internal alias)
  const channelsToBroadcast = [
    `private-ticket.${tid}`,
    `kroomcare_ticket_${tid}`
  ];

  if (externalTicketId) {
    channelsToBroadcast.push(`private-ticket.${externalTicketId}`);
    channelsToBroadcast.push(`kroomcare_ticket_${externalTicketId}`);
  }

  for (const ch of channelsToBroadcast) {
    broadcastToChannel(ch, 'MessageSent', verifiedPayload);
  }

  // 3. Broadcast ke notifikasi global staff agar header/dashboard langsung tahu ada chat baru
  broadcastToChannel('presence-staff-notifications', 'MessageSent', verifiedPayload);

  return verifiedPayload;
}

/**
 * Broadcast event non-pesan (StatusChanged, TicketAssigned, TicketUpdated) ke channel tiket dan staf.
 */
function broadcastTicketEvent(ticketId, eventName, payload, externalTicketId) {
  const tid = String(ticketId);
  const channels = [`private-ticket.${tid}`, `kroomcare_ticket_${tid}`];
  if (externalTicketId) channels.push(`private-ticket.${externalTicketId}`, `kroomcare_ticket_${externalTicketId}`);
  for (const ch of channels) broadcastToChannel(ch, eventName, payload);
  broadcastToChannel('presence-staff-notifications', eventName, payload);
}

/**
 * Broadcast event notifikasi global staff (misal: TicketCreated)
 * @param {string} eventName - 'TicketCreated' | 'NotificationCreated'
 * @param {object} payload
 */
function broadcastStaffNotification(eventName, payload) {
  const normalizedPayload = {
    ...payload,
    timestamp: payload.timestamp || payload.created_at || new Date().toISOString()
  };
  broadcastToChannel('presence-staff-notifications', eventName, normalizedPayload);
  broadcastToChannel('staff-notifications', eventName, normalizedPayload);
  return normalizedPayload;
}

module.exports = {
  handleChannelSubscription,
  handleTicketSubscription,
  handleStaffSubscription,
  broadcastToChannel,
  broadcastTicketMessage,
  broadcastTicketEvent,
  broadcastStaffNotification,
  channelSubscribers
};

