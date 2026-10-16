const db = require('../config/db');

/**
 * Normalizes destination WhatsApp target into valid JID format per Kroomhook specification:
 * - Private chat: <number>@s.whatsapp.net (e.g. 628123456789@s.whatsapp.net, no +, no spaces, international)
 * - Group chat: <group-id>@g.us (e.g. 120363000000000000@g.us)
 */
function formatWhatsAppJid(target) {
  if (!target) return '';
  let clean = String(target).trim();
  
  // If already full JID format
  if (clean.endsWith('@g.us') || clean.endsWith('@s.whatsapp.net')) {
    // If private chat, ensure phone number part has no non-digit characters
    if (clean.endsWith('@s.whatsapp.net')) {
      const numPart = clean.replace('@s.whatsapp.net', '').replace(/[^0-9]/g, '');
      const normalizedNum = numPart.startsWith('0') ? '62' + numPart.slice(1) : numPart;
      return `${normalizedNum}@s.whatsapp.net`;
    }
    return clean;
  }

  // Raw number cleanup
  clean = clean.replace(/[^0-9]/g, '');
  if (clean.startsWith('0')) {
    clean = '62' + clean.slice(1);
  } else if (!clean.startsWith('62') && clean.length >= 9) {
    clean = '62' + clean;
  }

  return clean ? `${clean}@s.whatsapp.net` : '';
}

let isTableChecked = false;
const ensureNotificationTableExists = async () => {
  if (isTableChecked) return;
  try {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS notification_queues (
        id INT AUTO_INCREMENT PRIMARY KEY,
        target_jid VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        retry_count INT DEFAULT 0,
        error_message TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await db.query(createTableQuery);

    // Ensure error_message column exists if table was created previously without it
    try {
      const [cols] = await db.query(`SHOW COLUMNS FROM notification_queues LIKE 'error_message'`);
      if (cols.length === 0) {
        await db.query(`ALTER TABLE notification_queues ADD COLUMN error_message TEXT DEFAULT NULL AFTER retry_count`);
      }
    } catch (_) {}

    isTableChecked = true;
    console.log('[NotificationQueue] Table "notification_queues" ready.');
  } catch (err) {
    console.error('[NotificationQueue] Error ensuring notification_queues table exists:', err.message);
  }
};

/**
 * Inserts a new notification into the queue with 'pending' status.
 */
const queueNotification = async (targetJid, message) => {
  await ensureNotificationTableExists();
  const normalizedJid = formatWhatsAppJid(targetJid) || targetJid;
  try {
    const query = 'INSERT INTO notification_queues (target_jid, message, status) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [normalizedJid, message, 'pending']);
    return result.insertId;
  } catch (err) {
    console.error('[NotificationQueue] Failed to queue notification:', err.message);
    return null;
  }
};

/**
 * Updates status, retry count, and error description.
 */
const updateNotificationStatus = async (id, status, retryCount = null, errorMessage = null) => {
  try {
    const updates = ['status = ?'];
    const params = [status];

    if (retryCount !== null) {
      updates.push('retry_count = ?');
      params.push(retryCount);
    }
    if (errorMessage !== null) {
      updates.push('error_message = ?');
      params.push(String(errorMessage).substring(0, 500));
    }

    params.push(id);
    const query = `UPDATE notification_queues SET ${updates.join(', ')} WHERE id = ?`;
    await db.query(query, params);
  } catch (err) {
    console.error(`[NotificationQueue] Failed to update status for ID ${id}:`, err.message);
  }
};

/**
 * Sends WhatsApp message via Kroomhook Webhook:
 * POST https://kroomhook.kroombox.com/notify
 * Headers:
 *   Content-Type: application/json
 *   X-API-Key: YOUR_API_KEY
 * Body:
 *   { "to": "<target>@s.whatsapp.net", "message": "<text>" }
 */
const sendNotification = async (targetJid, message) => {
  const waEndpoint = process.env.WEBHOOK_URL || process.env.KROOMHOOK_URL || 'https://kroomhook.kroombox.com/notify';
  const apiKey = (process.env.WEBHOOK_API_KEY || process.env.WA_API_KEY || process.env.KROOMHOOK_API_KEY || '').trim();
  const normalizedJid = formatWhatsAppJid(targetJid);

  if (!normalizedJid) {
    return {
      success: false,
      status: 400,
      response: 'invalid target JID',
      error: 'Target WhatsApp JID kosong atau tidak valid.'
    };
  }

  if (!apiKey) {
    console.warn('[Kroomhook] Peringatan: WEBHOOK_API_KEY belum dikonfigurasi di .env. Permintaan ke Kroomhook akan ditolak (401).');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(waEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey
      },
      body: JSON.stringify({
        to: normalizedJid,
        message: message
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const responseText = await response.text();

    if (response.ok) {
      // Status 200: notify applied
      console.log(`[Kroomhook] Pesan WhatsApp berhasil dikirim ke ${normalizedJid} (Status ${response.status}: "${responseText.trim()}")`);
      return { success: true, status: response.status, response: responseText };
    }

    // Reference error responses
    // 400: invalid json or invalid notify request
    // 401: unauthorized (invalid or missing API key)
    // 502: send whatsapp: ... (bot cannot deliver message)
    console.warn(`[Kroomhook] Gagal mengirim WhatsApp. Status ${response.status}: "${responseText.trim()}"`);
    return {
      success: false,
      status: response.status,
      response: responseText,
      error: response.status === 401 
        ? 'Unauthorized: Periksa WEBHOOK_API_KEY pada .env atau pengaturan Admin.' 
        : responseText
    };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('[Kroomhook] Network / Timeout Error:', err.message);
    return { success: false, status: 0, error: err.message };
  }
};

/**
 * Worker to process pending/failed notifications in database.
 */
const processQueue = async () => {
  await ensureNotificationTableExists();
  try {
    const query = `
      SELECT id, target_jid, message, retry_count, status, error_message
      FROM notification_queues 
      WHERE status IN ('pending', 'failed') AND retry_count < 5
      ORDER BY created_at ASC
      LIMIT 10
    `;
    const [rows] = await db.query(query);
    if (!rows || rows.length === 0) return;

    for (const row of rows) {
      console.log(`[Notification Worker] Memproses antrean notifikasi ID #${row.id} ke ${row.target_jid}...`);
      const result = await sendNotification(row.target_jid, row.message);

      if (result.success) {
        await updateNotificationStatus(row.id, 'sent', row.retry_count, null);
        console.log(`[Notification Worker] Notifikasi ID #${row.id} sukses terkirim.`);
      } else {
        const nextRetry = (row.retry_count || 0) + 1;
        const errDesc = result.error || result.response || `HTTP ${result.status}`;

        // If 401 unauthorized or 400 invalid request, stop retrying indefinitely to avoid log spam
        if (result.status === 401 || result.status === 400) {
          await updateNotificationStatus(row.id, 'failed', 5, errDesc);
          console.warn(`[Notification Worker] Notifikasi ID #${row.id} dihentikan (Status ${result.status}: ${errDesc}).`);
        } else {
          await updateNotificationStatus(row.id, 'failed', nextRetry, errDesc);
          console.log(`[Notification Worker] Notifikasi ID #${row.id} dijadwalkan ulang. Percobaan ke-${nextRetry}.`);
        }
      }
    }
  } catch (err) {
    console.error('[Notification Worker] Error saat memproses antrean notifikasi:', err.message);
  }
};

let workerIntervalId = null;
const startNotificationWorker = () => {
  if (workerIntervalId) return;

  // Run initial check after 5 seconds
  setTimeout(processQueue, 5000);

  // Run periodic worker every 30 seconds
  workerIntervalId = setInterval(processQueue, 30000);
  console.log('[Notification Worker] Background worker aktif (interval: 30 detik).');
};

module.exports = {
  formatWhatsAppJid,
  queueNotification,
  sendNotification,
  updateNotificationStatus,
  startNotificationWorker,
  processQueue
};
