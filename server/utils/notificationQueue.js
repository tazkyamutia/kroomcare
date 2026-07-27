const db = require('../config/db');

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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `;
    await db.query(createTableQuery);
    isTableChecked = true;
    console.log('Table "notification_queues" checked/created successfully.');
  } catch (err) {
    console.error('Error ensuring notification_queues table exists:', err.message);
  }
};

/**
 * Inserts a new notification into the queue with a 'pending' status.
 */
const queueNotification = async (targetJid, message) => {
  await ensureNotificationTableExists();
  try {
    const query = 'INSERT INTO notification_queues (target_jid, message, status) VALUES (?, ?, ?)';
    const [result] = await db.query(query, [targetJid, message, 'pending']);
    return result.insertId;
  } catch (err) {
    console.error('Failed to queue notification:', err.message);
    return null;
  }
};

/**
 * Updates the status and optionally the retry count of a queued notification.
 */
const updateNotificationStatus = async (id, status, retryCount = null) => {
  try {
    if (retryCount !== null) {
      const query = 'UPDATE notification_queues SET status = ?, retry_count = ? WHERE id = ?';
      await db.query(query, [status, retryCount, id]);
    } else {
      const query = 'UPDATE notification_queues SET status = ? WHERE id = ?';
      await db.query(query, [status, id]);
    }
  } catch (err) {
    console.error(`Failed to update notification status for ID ${id}:`, err.message);
  }
};

/**
 * Sends a WhatsApp notification using the external API.
 */
const sendNotification = async (targetJid, message) => {
  const waEndpoint = 'https://kroomhook.kroombox.com/notify';
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(waEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: targetJid,
        message: message
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      console.log(`WhatsApp notification success. Status: ${response.status}`);
      return { success: true, status: response.status, response: text };
    } else {
      const text = await response.text();
      console.warn(`WhatsApp notification non-OK status: ${response.status}, response error: ${text.substring(0, 100)}`);
      return { success: false, status: response.status, response: text };
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('WhatsApp notification network/timeout error:', err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Scans the database for notifications that are 'pending' or 'failed' (with retry_count < 5) and retries them.
 */
const processQueue = async () => {
  await ensureNotificationTableExists();
  try {
    const query = `
      SELECT id, target_jid, message, retry_count 
      FROM notification_queues 
      WHERE status IN ('pending', 'failed') AND retry_count < 5
      ORDER BY created_at ASC
    `;
    const [rows] = await db.query(query);
    if (!rows || rows.length === 0) return;

    console.log(`[Notification Worker] Processing ${rows.length} pending/failed notifications in queue...`);

    for (const row of rows) {
      console.log(`[Notification Worker] Retrying notification ID ${row.id} to ${row.target_jid}...`);
      const result = await sendNotification(row.target_jid, row.message);
      if (result.success) {
        await updateNotificationStatus(row.id, 'sent');
        console.log(`[Notification Worker] Successfully sent notification ID ${row.id}`);
      } else {
        const nextRetry = row.retry_count + 1;
        await updateNotificationStatus(row.id, 'failed', nextRetry);
        console.log(`[Notification Worker] Failed to send notification ID ${row.id}. Retry count: ${nextRetry}`);
      }
    }
  } catch (err) {
    console.error('[Notification Worker] Error processing notification queue:', err.message);
  }
};

let workerIntervalId = null;
const startNotificationWorker = () => {
  if (workerIntervalId) return;

  // Run initial queue processing after 10 seconds of server startup
  setTimeout(processQueue, 10000);

  // Run queue processing every 30 seconds
  workerIntervalId = setInterval(processQueue, 30000);
  console.log('[Notification Worker] Background worker started (interval: 30s).');
};

module.exports = {
  queueNotification,
  sendNotification,
  updateNotificationStatus,
  startNotificationWorker,
  processQueue
};
