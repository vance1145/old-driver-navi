const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'assets', 'icons');
const DATA_DIR = path.join(ROOT, 'assets', 'js', 'data');
const HEADER_FILE = path.join(ROOT, 'assets', 'js', 'components', 'header.js');

const FORCE = process.argv.includes('--force');
const CONCURRENCY = 10;

function extractHostnames() {
  const hostnames = new Set();
  const hostnameToB64Url = new Map();

  const dataFiles = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.js'));
  for (const file of dataFiles) {
    const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');

    const b64Re = /favicon\.png\.pub\/v1\/([A-Za-z0-9+/=]+)/g;
    let match;
    while ((match = b64Re.exec(content)) !== null) {
      try {
        const decoded = Buffer.from(match[1], 'base64').toString('utf-8');
        const hostname = new URL(decoded).hostname;
        hostnames.add(hostname);
        hostnameToB64Url.set(hostname, `https://favicon.png.pub/v1/${match[1]}`);
      } catch {}
    }

    const directUrlRe = /icon:\s*"(https?:\/\/[^"]+)"/g;
    while ((match = directUrlRe.exec(content)) !== null) {
      if (match[1].includes('favicon.png.pub')) continue;
      try {
        const hostname = new URL(match[1]).hostname;
        hostnames.add(hostname);
      } catch {}
    }
  }

  const headerContent = fs.readFileSync(HEADER_FILE, 'utf-8');
  const headerUrlRe = /url:\s*'(https?:\/\/[^']+)'/g;
  let match;
  while ((match = headerUrlRe.exec(headerContent)) !== null) {
    try {
      const hostname = new URL(match[1]).hostname;
      hostnames.add(hostname);
    } catch {}
  }

  return { hostnames: [...hostnames].sort(), hostnameToB64Url };
}

function download(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { timeout: 8000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location).then(resolve).catch(reject);
        res.resume();
        return;
      }
      if (res.statusCode !== 200) {
        res.resume();
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        if (buf.length < 10) {
          reject(new Error('Empty response'));
        } else {
          resolve(buf);
        }
      });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

async function fetchIcon(hostname, hostnameToB64Url) {
  const dest = path.join(ICONS_DIR, `${hostname}.ico`);

  if (!FORCE && fs.existsSync(dest)) {
    return { hostname, status: 'skipped' };
  }

  const sources = [
    `https://icons.duckduckgo.com/ip3/${hostname}.ico`,
    `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
    `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=32`,
    `https://${hostname}/favicon.ico`,
  ];

  const b64Url = hostnameToB64Url.get(hostname);
  if (b64Url) sources.splice(1, 0, b64Url);

  for (const url of sources) {
    try {
      const data = await download(url);
      fs.writeFileSync(dest, data);
      return { hostname, status: 'ok', source: url };
    } catch {}
  }

  return { hostname, status: 'failed' };
}

async function run() {
  const { hostnames, hostnameToB64Url } = extractHostnames();
  console.log(`Found ${hostnames.length} unique hostnames`);

  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  const results = { ok: 0, skipped: 0, failed: [] };
  const queue = [...hostnames];

  async function worker() {
    while (queue.length > 0) {
      const hostname = queue.shift();
      const result = await fetchIcon(hostname, hostnameToB64Url);
      if (result.status === 'ok') {
        results.ok++;
        process.stdout.write(`  ✓ ${hostname}\n`);
      } else if (result.status === 'skipped') {
        results.skipped++;
      } else {
        results.failed.push(hostname);
        process.stdout.write(`  ✗ ${hostname}\n`);
      }
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);

  console.log(`\nDone: ${results.ok} downloaded, ${results.skipped} skipped, ${results.failed.length} failed`);
  if (results.failed.length > 0) {
    console.log('Failed:', results.failed.join(', '));
  }
}

run().catch(e => { console.error(e); process.exit(1); });
