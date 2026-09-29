'use strict';

// Downloads a ZIP through the HTTP layer (as a logged-in user) and prints the
// archive contents, so the real download path can be inspected.

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const app = require('../server');
const { seed } = require('../src/bootstrap');

const PORT = 3222;
const BASE = `http://127.0.0.1:${PORT}`;

async function main() {
  seed({ log: () => {} });
  const server = app.listen(PORT, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));

  let cookie = '';
  const jar = (res) => {
    const list = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const c of list) cookie = c.split(';')[0];
  };

  const login = await fetch(`${BASE}/login`);
  jar(login);
  const html = await login.text();
  const token = /name="_csrf" value="([a-f0-9]{64})"/.exec(html)[1];

  const auth = await fetch(`${BASE}/login`, {
    method: 'POST',
    redirect: 'manual',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      cookie
    },
    body: new URLSearchParams({ _csrf: token, username: 'admin', password: process.env.ADMIN_PASSWORD || 'Admin@12345' })
  });
  jar(auth);
  console.log('login status:', auth.status, '->', auth.headers.get('location'));

  const dl = await fetch(`${BASE}/download/7.zip`, { headers: { cookie } });
  console.log('download status:', dl.status);
  console.log('content-type:', dl.headers.get('content-type'));
  console.log('content-disposition:', dl.headers.get('content-disposition'));

  const buf = Buffer.from(await dl.arrayBuffer());
  const out = path.join(os.tmpdir(), `aa-article-7-${Date.now()}.zip`);
  fs.writeFileSync(out, buf);
  console.log(`saved ${buf.length} bytes to ${out}`);
  console.log('magic bytes:', buf.slice(0, 4).toString('hex'));

  server.close();
  require('../src/db').db.close();
  console.log('\nNow inspect it with:');
  console.log(`  tar -tf "${out}"`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
