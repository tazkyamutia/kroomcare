const cron = require('node-cron');
const db = require('../config/db');
const { createInAppNotification } = require('../controllers/notificationController');

// Helper to notify all admins and staff
async function notifyAdminsAndStaff(message, link) {
  try {
    const [users] = await db.query("SELECT id FROM users WHERE role IN ('admin', 'staff')");
    for (const u of users) {
      await createInAppNotification(u.id, 'system', message, link);
    }
  } catch (error) {
    console.error('[Cron] Error notifying admins/staff:', error.message);
  }
}

function initCronJobs() {
  console.log('[Cron] Initializing cron jobs...');

  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      // Find tickets that breached SLA and are not yet priority
      const query = `
        SELECT id, judul, sla_deadline 
        FROM tickets 
        WHERE status = 'menunggu' 
          AND is_priority = 0 
          AND sla_deadline IS NOT NULL 
          AND sla_deadline < NOW()
      `;
      const [breachedTickets] = await db.query(query);

      if (breachedTickets.length > 0) {
        console.log(`[Cron] Found ${breachedTickets.length} tickets breaching SLA. Escalating...`);
        
        for (const ticket of breachedTickets) {
          // Set as priority
          await db.query('UPDATE tickets SET is_priority = 1 WHERE id = ?', [ticket.id]);
          
          // Notify staff & admins
          const msg = `⚠️ [ESKALASI SLA] Tiket #${ticket.id} (${ticket.judul}) telah melewati batas waktu SLA.`;
          await notifyAdminsAndStaff(msg, `/staff/tickets/${ticket.id}`);
        }
      }
    } catch (error) {
      console.error('[Cron] Error in SLA checker:', error.message);
    }
  });
}

module.exports = { initCronJobs };
