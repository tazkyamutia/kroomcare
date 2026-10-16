const fs = require('fs');
const path = require('path');
const { McpClient, executeRemote } = require('../scratch/run_remote.cjs');

async function main() {
  const client = new McpClient();
  await client.connect();
  await client.sendRequest('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'cli', version: '1.0.0' }
  });

  const files = [
    'server/controllers/externalController.js',
    'server/controllers/ticketController.js',
    'server/config/db.js',
    'scripts/sync_all_panel_tickets.cjs'
  ];

  for (const f of files) {
    const fullPath = path.resolve(__dirname, '..', f);
    const content = fs.readFileSync(fullPath, 'utf8');
    console.log(`Uploading ${f}...`);
    const res = await client.callTool('kroombox_write_file_content', {
      site_id: 's_1790695000000_krcar',
      file_path: f,
      content
    });
    console.log(`  -> Result:`, res);
  }

  console.log('Restarting PM2 process for s_1790695000000_krcar...');
  const restartRes = await client.callTool('kroombox_manage_site_process', {
    site_id: 's_1790695000000_krcar',
    action: 'restart'
  });
  console.log('PM2 restart:', restartRes);
  console.log('Done!');
}

main().catch(console.error);
