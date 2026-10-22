const mysql = require('mysql2/promise');
const db = require('../config/db');
const https = require('https');
const { queueNotification, sendNotification, updateNotificationStatus } = require('./notificationQueue');
const { broadcastTicketMessage, broadcastStaffNotification } = require('./realtimeHub');

let isSyncRunning = false;
const MCP_API_KEY = process.env.KROOMBOX_MCP_KEY || 'kp_live_b1b2e0b48460bfeb5fcc9db0312ec0e2b95da9e283f6e41ddb64a95c05fa2431';

/**
 * Helper: Panggil Kroombox Panel MCP Tool via SSE/HTTP
 */
function callPanelMcpTool(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    let sessionId = null;
    let messageEndpoint = null;
    let isResolved = false;

    const timer = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        reject(new Error('MCP Tool call timeout'));
      }
    }, 12000);

    const sseOptions = {
      hostname: 'panel.kroombox.com',
      path: '/api/mcp/sse',
      headers: {
        'Authorization': `Bearer ${MCP_API_KEY}`,
        'Accept': 'text/event-stream'
      }
    };

    const sseReq = https.get(sseOptions, (res) => {
      let buffer = '';
      res.on('data', (chunk) => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop();

        let currentEvent = null;
        for (const line of lines) {
          if (line.startsWith('event:')) {
            currentEvent = line.replace('event:', '').trim();
          } else if (line.startsWith('data:')) {
            const dataStr = line.replace('data:', '').trim();
            if (currentEvent === 'endpoint') {
              messageEndpoint = dataStr;
              const match = dataStr.match(/sessionId=([^&]+)/);
              if (match) sessionId = match[1];

              // Inisialisasi dan panggil tool setelah endpoint didapat
              sendRpc('initialize', {
                protocolVersion: '2024-11-05',
                capabilities: {},
                clientInfo: { name: 'kroomcare-sync', version: '1.0.0' }
              }).then(() => {
                return sendRpc('tools/call', { name: toolName, arguments: args });
              }).then((result) => {
                if (!isResolved) {
                  isResolved = true;
                  clearTimeout(timer);
                  try { sseReq.destroy(); } catch (_) {}
                  if (result && result.content && result.content[0] && result.content[0].text) {
                    try { resolve(JSON.parse(result.content[0].text)); }
                    catch (_) { resolve(result.content[0].text); }
                  } else {
                    resolve(result);
                  }
                }
              }).catch((rpcErr) => {
                if (!isResolved) {
                  isResolved = true;
                  clearTimeout(timer);
                  try { sseReq.destroy(); } catch (_) {}
                  reject(rpcErr);
                }
              });
            }
          }
        }
      });
      res.on('error', (e) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          reject(e);
        }
      });
    });

    sseReq.on('error', (e) => {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timer);
        reject(e);
      }
    });

    function sendRpc(method, params) {
      return new Promise((rResolve, rReject) => {
        const payload = JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params });
        const postOptions = {
          hostname: 'panel.kroombox.com',
          path: messageEndpoint,
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${MCP_API_KEY}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
          }
        };
        const postReq = https.request(postOptions, (pRes) => {
          let pBody = '';
          pRes.on('data', c => pBody += c.toString());
          pRes.on('end', () => {
            try {
              const parsed = JSON.parse(pBody);
              if (parsed.error) rReject(new Error(parsed.error.message || JSON.stringify(parsed.error)));
              else rResolve(parsed.result);
            } catch (pErr) {
              rReject(pErr);
            }
          });
        });
        postReq.on('error', rReject);
        postReq.write(payload);
        postReq.end();
      });
    }
  });
}

/**
 * Sinkronisasi Balasan Chat Pengguna dari Panel ke KroomCare
 */
async function syncPanelReplies() {
  try {
    const [tickets] = await db.query(
      'SELECT id, external_ticket_id, user_id, staff_id, judul FROM tickets WHERE external_ticket_id IS NOT NULL'
    );

    for (const t of tickets) {
      try {
        const messages = await callPanelMcpTool('kroombox_get_ticket_details', {
          ticket_id: t.external_ticket_id
        });

        if (!Array.isArray(messages)) continue;

        for (const msg of messages) {
          if (!msg.text) continue;
          // Lewati pesan sistem dan pesan dari staf KroomCare
          if (msg.senderId === 'SYSTEM' || 
              (msg.senderId && msg.senderId.startsWith('EXT:')) || 
              (msg.senderId && msg.senderId.startsWith('SYSTEM_'))) {
            continue;
          }

          // Cek apakah pesan sudah ada di database KroomCare
          const [existing] = await db.query(
            'SELECT id FROM ticket_replies WHERE ticket_id = ? AND (external_message_id = ? OR konten = ?)',
            [t.id, msg.id, msg.text]
          );

          if (existing.length > 0) continue;

          // Hitung waktu WIB
          let createdAtWib = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
          if (msg.timestamp) {
            const d = new Date(msg.timestamp);
            if (!isNaN(d.getTime())) {
              createdAtWib = d.toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
            }
          }

          // Simpan balasan pengguna dari panel ke KroomCare
          const [insertRes] = await db.query(
            'INSERT INTO ticket_replies (ticket_id, user_id, konten, external_message_id, created_at) VALUES (?, ?, ?, ?, ?)',
            [t.id, t.user_id, msg.text, msg.id, createdAtWib]
          );

          console.log(`[PanelSync] Balasan baru dari panel #${insertRes.insertId} pada tiket #${t.id} ("${msg.text.slice(0, 40)}...")`);

          // Update status & waktu updated_at tiket
          await db.query('UPDATE tickets SET updated_at = ? WHERE id = ?', [createdAtWib, t.id]);

          // Masukkan notifikasi staf
          const [staffRecipients] = t.staff_id
            ? [[{ id: t.staff_id }]]
            : await db.query("SELECT id FROM users WHERE role IN ('staff', 'admin')");

          for (const recipient of staffRecipients) {
            await db.query(`
              INSERT INTO notifications (user_id, title, type, message, link, is_read, created_at)
              VALUES (?, 'Balasan Masuk dari Support Center Panel', 'ticket', ?, ?, FALSE, ?)
            `, [
              recipient.id,
              `Pengguna membalas tiket #${t.id} "${t.judul}": "${msg.text.slice(0, 80)}"`,
              `/tickets/${t.id}`,
              createdAtWib
            ]);
          }

          // Broadcast instan via Realtime Event Hub ke antarmuka staf yang aktif
          const verifiedPayload = {
            ticket_id: String(t.id),
            external_ticket_id: t.external_ticket_id,
            message_id: String(insertRes.insertId),
            id: String(insertRes.insertId),
            content: msg.text,
            message: msg.text,
            text: msg.text,
            konten: msg.text,
            sender_role: 'user',
            sender_type: 'user',
            sender_id: String(t.user_id),
            sender_name: msg.senderName || 'Akun Kroombox',
            timestamp: createdAtWib,
            created_at: createdAtWib,
            isAdmin: false,
            status: 'sent'
          };

          broadcastTicketMessage(t.id, verifiedPayload, t.external_ticket_id);
          broadcastStaffNotification('MessageSent', verifiedPayload);
        }
      } catch (tErr) {
        // Silent fail per ticket to avoid stopping loop
      }
    }
  } catch (err) {
    console.warn('[PanelSync] Gagal memindai balasan panel:', err.message);
  }
}

/**
 * Sinkronisasi Tiket Baru dari KolabPanel
 */
async function syncPanelTickets() {
  if (isSyncRunning) return;
  isSyncRunning = true;

  try {
    // 1. Coba sinkronisasi tiket baru via MCP API
    try {
      const panelTicketsData = await callPanelMcpTool('kroombox_list_tickets', { limit: 50 });
      const panelTickets = (panelTicketsData && Array.isArray(panelTicketsData.tickets)) ? panelTicketsData.tickets : [];

      for (const pt of panelTickets) {
        const [existing] = await db.query('SELECT id FROM tickets WHERE external_ticket_id = ?', [pt.id]);
        if (existing.length > 0) continue;

        // Ambil detail pesan
        let desc = pt.subject;
        try {
          const detailMsgs = await callPanelMcpTool('kroombox_get_ticket_details', { ticket_id: pt.id });
          if (Array.isArray(detailMsgs) && detailMsgs.length > 0) {
            const userMsg = detailMsgs.find(m => m.senderId !== 'SYSTEM' && !m.isAdmin) || detailMsgs[0];
            if (userMsg && userMsg.text) desc = userMsg.text;
          }
        } catch (_) {}

        const email = `${pt.username || pt.user_id || 'user'}@kroombox.com`;
        const nama = pt.username || 'User Kroombox';

        // JIT User Provisioning
        const [kcUserRows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        let kcUserId;
        if (kcUserRows.length === 0) {
          const defaultPassword = 'EXT_USER_' + Date.now();
          const [insertUserRes] = await db.query(
            'INSERT INTO users (nama, email, password, role, koin_reward) VALUES (?, ?, ?, "member", 0)',
            [nama, email, defaultPassword]
          );
          kcUserId = insertUserRes.insertId;
        } else {
          kcUserId = kcUserRows[0].id;
        }

        const statusMapped = (pt.status === 'CLOSED' || pt.status === 'Closed' || pt.status === 'selesai')
          ? 'selesai'
          : (pt.status === 'IN_PROGRESS' || pt.status === 'diproses')
            ? 'diproses'
            : 'menunggu';

        const kategori = pt.category || 'General';
        let ticketDateStr = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
        if (pt.created_at) {
          const d = new Date(pt.created_at);
          if (!isNaN(d.getTime())) ticketDateStr = d.toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' });
        }

        const [tInsert] = await db.query(`
          INSERT INTO tickets (external_ticket_id, user_id, judul, deskripsi, kategori, status, is_priority, created_at)
          VALUES (?, ?, ?, ?, ?, ?, 0, ?)
        `, [pt.id, kcUserId, pt.subject, desc, kategori, statusMapped, ticketDateStr]);

        const ticketId = tInsert.insertId;
        console.log(`[PanelSync] Tiket baru dari panel terdeteksi (${pt.id}) -> KroomCare ID #${ticketId}`);

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
      }
    } catch (mcpErr) {
      // Fallback ke direct DB jika ada
    }

    // 2. Sinkronkan balasan-balasan pesan pada tiket aktif
    await syncPanelReplies();
  } catch (err) {
    console.warn('[PanelSync Worker] Error:', err.message);
  } finally {
    isSyncRunning = false;
  }
}

/**
 * startPanelSyncWorker
 * Menjalankan background worker setiap 5 detik untuk auto-sync tiket & balasan panel
 */
function startPanelSyncWorker(intervalMs = 6000) {
  console.log(`[PanelSync Worker] Aktif, memindai tiket & balasan Support Center Panel setiap ${Math.round(intervalMs / 1000)} detik.`);
  setTimeout(() => {
    syncPanelTickets().catch(() => {});
  }, 2000);

  setInterval(() => {
    syncPanelTickets().catch(() => {});
  }, intervalMs);
}

module.exports = { syncPanelTickets, syncPanelReplies, startPanelSyncWorker };
