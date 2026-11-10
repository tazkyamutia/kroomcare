#!/usr/bin/env node
/**
 * Deploy KroomCare ke Kroombox Panel dengan memicu pipeline CI/CD bawaan panel
 * (pull Git `main` -> install -> build -> cascade -> reload PM2 -> health check).
 *
 * Dipakai otomatis oleh GitHub Actions (.github/workflows/deploy.yml) setiap push ke main,
 * dan bisa dijalankan manual:  KROOMBOX_API_KEY=... npm run deploy:panel
 *
 * Env:
 *   KROOMBOX_API_KEY  (wajib) token API/MCP Kroombox Panel
 *   KROOMBOX_SITE_ID  (opsional) default s_1790695000000_krcar
 *   DEPLOY_BRANCH     (opsional) default main
 *   DRY_RUN=1         (opsional) hanya validasi konfigurasi pipeline, tanpa eksekusi
 */
const https = require('https');

const HOST = 'panel.kroombox.com';
const API_KEY = process.env.KROOMBOX_API_KEY;
const SITE_ID = process.env.KROOMBOX_SITE_ID || 's_1790695000000_krcar';
const BRANCH = process.env.DEPLOY_BRANCH || 'main';
const DRY_RUN = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run');

if (!API_KEY) {
  console.error('KROOMBOX_API_KEY belum di-set.');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class McpClient {
  constructor() {
    this.endpoint = null;
    this.nextId = 1;
    this.pending = new Map();
    this.req = null;
  }

  connect() {
    return new Promise((resolve, reject) => {
      this.req = https.get(
        { hostname: HOST, path: '/api/mcp/sse', headers: { Authorization: `Bearer ${API_KEY}`, Accept: 'text/event-stream' } },
        (res) => {
          if (res.statusCode !== 200) return reject(new Error(`SSE gagal: HTTP ${res.statusCode}`));
          let buffer = '';
          let event = null;
          res.on('data', (chunk) => {
            buffer += chunk.toString();
            const lines = buffer.split('\n');
            buffer = lines.pop();
            for (const line of lines) {
              if (line.startsWith('event:')) event = line.slice(6).trim();
              else if (line.startsWith('data:')) {
                const data = line.slice(5).trim();
                if (event === 'endpoint') { this.endpoint = data; resolve(); }
                else { try { this.handle(JSON.parse(data)); } catch (_) {} }
              }
            }
          });
          res.on('error', reject);
        }
      );
      this.req.on('error', reject);
    });
  }

  handle(msg) {
    const p = msg && msg.id && this.pending.get(msg.id);
    if (!p) return;
    this.pending.delete(msg.id);
    if (msg.error) p.reject(new Error(msg.error.message || JSON.stringify(msg.error)));
    else p.resolve(msg.result);
  }

  request(method, params = {}, timeoutMs = 180000) {
    const id = this.nextId++;
    const payload = JSON.stringify({ jsonrpc: '2.0', id, method, params });
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`Timeout menunggu ${method}`)); }, timeoutMs);
      this.pending.set(id, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
      const req = https.request(
        { hostname: HOST, path: this.endpoint, method: 'POST', headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } },
        (res) => {
          let body = '';
          res.on('data', (c) => { body += c; });
          res.on('end', () => { if (body.trim()) { try { this.handle(JSON.parse(body)); } catch (_) {} } });
        }
      );
      req.on('error', (err) => { this.pending.delete(id); clearTimeout(timer); reject(err); });
      req.write(payload);
      req.end();
    });
  }

  // Memanggil tool panel, otomatis menunggu bila panel sedang "cooldown".
  async callTool(name, args) {
    for (let attempt = 0; attempt < 6; attempt++) {
      const res = await this.request('tools/call', { name, arguments: args });
      const text = (res.content || []).map((c) => c.text || '').join('');
      const cooldown = (res._meta && res._meta.error_type === 'COOLDOWN_ACTIVE') || /pendinginan|cooldown/i.test(text);
      if (cooldown) {
        const wait = ((res._meta && res._meta.retry_after_seconds) || 10) + 1;
        console.log(`[panel cooldown, menunggu ${wait}s]`);
        await sleep(wait * 1000);
        continue;
      }
      let data = text;
      try { data = JSON.parse(text); } catch (_) {}
      return { isError: Boolean(res.isError), data, text };
    }
    throw new Error(`${name}: cooldown panel tidak selesai-selesai`);
  }

  close() { if (this.req) this.req.destroy(); }
}

const isFailed = (r) =>
  r.isError ||
  (r.data && typeof r.data === 'object' && (r.data.success === false || /fail|error/i.test(String(r.data.status || r.data.state || ''))));

const pickStatus = (d) => String((d && (d.status || d.state || (d.pipeline && d.pipeline.status))) || '').toUpperCase();

async function main() {
  const client = new McpClient();
  await client.connect();
  await client.request('initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'kroomcare-deploy', version: '1.0.0' } });

  console.log(`${DRY_RUN ? '[DRY RUN] Validasi' : 'Menjalankan'} pipeline CI/CD panel untuk site ${SITE_ID} (branch ${BRANCH})...`);
  const run = await client.callTool('kroombox_run_cicd_pipeline', {
    site_id: SITE_ID,
    branch: BRANCH,
    // Kode produksi harus sama persis dengan GitHub; perubahan manual di server ditimpa.
    force_reset: true,
    dry_run: DRY_RUN,
    wait_for_completion: !DRY_RUN
  });
  console.log(typeof run.data === 'string' ? run.data : JSON.stringify(run.data, null, 2));
  if (isFailed(run)) throw new Error('Pipeline gagal dijalankan.');
  if (DRY_RUN) return;

  // wait_for_completion hanya menunggu ~120 detik; lanjutkan polling bila masih berjalan.
  let status = pickStatus(run.data);
  const deadline = Date.now() + 15 * 60 * 1000;
  while (/RUNNING|IN_PROGRESS|PENDING|QUEUED/.test(status) && Date.now() < deadline) {
    await sleep(15000);
    const st = await client.callTool('kroombox_get_cicd_status', { site_id: SITE_ID });
    status = pickStatus(st.data);
    console.log(`Status pipeline: ${status || '(tidak diketahui)'}`);
    if (isFailed(st)) {
      console.log(st.text);
      throw new Error('Pipeline gagal.');
    }
  }
  if (/RUNNING|IN_PROGRESS|PENDING|QUEUED/.test(status)) throw new Error('Pipeline belum selesai setelah 15 menit.');
  console.log('Deploy selesai.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => { console.error('DEPLOY GAGAL:', err.message); process.exit(1); });
