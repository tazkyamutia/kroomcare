const { spawn } = require('child_process');
const path = require('path');

// Jika dijalankan di Kroombox Panel (PM2 runtime port 5550 atau production)
const isPanelProduction = process.env.PORT === '5550' || process.env.NODE_ENV === 'production' || !!process.env.PM2_HOME || !!process.env.PM2_USAGE;

if (isPanelProduction) {
  console.log('[KroomCare] Mode Produksi Kroombox Panel terdeteksi.');
  console.log('[KroomCare] Menjalankan Express Server + SPA Fallback di port ' + (process.env.PORT || 5550));
  require('../server/server.js');
} else {
  // Mode lokal developer: jalankan Vite
  const isWindows = process.platform === 'win32';
  const npxCmd = isWindows ? 'npx.cmd' : 'npx';
  const vite = spawn(npxCmd, ['vite', '--port=3000', '--host=0.0.0.0'], {
    stdio: 'inherit',
    shell: true
  });
  vite.on('exit', (code) => process.exit(code || 0));
}
