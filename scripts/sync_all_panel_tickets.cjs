const https = require('https');
const { McpClient } = require('../scratch/run_remote.cjs');

function parseContent(res) {
  if (!res) return null;
  if (res.content && res.content[0] && res.content[0].text) {
    try {
      return JSON.parse(res.content[0].text);
    } catch (_) {
      return res.content[0].text;
    }
  }
  return res;
}

async function main() {
  console.log('--- Memeriksa Semua Tiket di Kroombox Panel ---');
  const client = new McpClient();
  await client.connect();
  await client.sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'cli', version: '1.0.0' }
  });

  // 1. Ambil seluruh tiket dari Kroombox Panel (limit 50)
  const panelTicketsRaw = await client.callTool('kroombox_list_tickets', {
    limit: 50,
    page: 1,
    status: 'ALL'
  });

  const panelTicketsRes = parseContent(panelTicketsRaw) || {};
  const panelTickets = panelTicketsRes.tickets || [];
  console.log(`Ditemukan ${panelTickets.length} tiket di Kroombox Panel.`);

  // 2. Ambil profil user panel
  const profileRaw = await client.callTool('kroombox_get_user_profile', {});
  const profile = parseContent(profileRaw) || {};
  const userEmail = profile.email || 'akun@kroombox.com';
  const userName = profile.username || 'Akun Kroombox';

  // 3. Untuk setiap tiket, periksa detail pesan dan sinkronkan ke KroomCare
  for (const t of panelTickets) {
    console.log(`\nMemproses Tiket Panel [${t.id}] - "${t.subject}"...`);
    
    // Ambil detail pesan tiket untuk deskripsi
    let desc = t.subject;
    try {
      const msgsRaw = await client.callTool('kroombox_get_ticket_details', { ticket_id: t.id });
      const msgs = parseContent(msgsRaw);
      if (Array.isArray(msgs) && msgs.length > 0) {
        const firstUserMsg = msgs.find(m => m.senderId !== 'SYSTEM') || msgs[0];
        if (firstUserMsg && firstUserMsg.text) {
          desc = firstUserMsg.text;
        }
      }
    } catch (e) {
      console.warn(`Gagal mengambil pesan untuk ${t.id}:`, e.message);
    }

    const payload = {
      external_ticket_id: t.id,
      email: userEmail,
      nama: userName,
      judul: t.subject,
      kategori: t.category || 'Hosting',
      prioritas: 'Normal',
      deskripsi: desc
    };

    // Kirim ke KroomCare Remote
    try {
      const resRemote = await fetch('https://kroomcare.kroombox.com/api/external/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'KC_2aa4c37a3c8647133a9ee1177a86cd2e87936e2dcb7f96dc'
        },
        body: JSON.stringify(payload)
      });
      const dataRemote = await resRemote.json();
      console.log(`  -> Remote KroomCare:`, dataRemote.success ? `Sukses (ID #${dataRemote.data?.ticketId || 'OK'})` : dataRemote.message);
    } catch (err) {
      console.error(`  -> Remote error:`, err.message);
    }

    // Kirim ke KroomCare Lokal
    try {
      const resLocal = await fetch('http://localhost:5000/api/external/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'KC_2aa4c37a3c8647133a9ee1177a86cd2e87936e2dcb7f96dc'
        },
        body: JSON.stringify(payload)
      });
      const dataLocal = await resLocal.json();
      console.log(`  -> Local KroomCare:`, dataLocal.success ? `Sukses (ID #${dataLocal.data?.ticketId || 'OK'})` : dataLocal.message);
    } catch (err) {
      console.log(`  -> Local KroomCare tidak aktif atau terlewat.`);
    }
  }

  console.log('\n--- Sinkronisasi Tiket Selesai ---');
}

main().catch(console.error);
