'use strict';

// End-to-end smoke test. Boots the app on an ephemeral port, then checks the
// public pages, the login gate on downloads, registration, and the admin area.
// Run with: npm test

const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB = path.join(DATA_DIR, 'test-articles.db');
for (const f of [DB, `${DB}-wal`, `${DB}-shm`]) if (fs.existsSync(f)) fs.unlinkSync(f);

process.env.DB_FILE = 'test-articles.db';
process.env.SESSION_SECRET = 'test-secret-not-for-production';
process.env.ADMIN_PASSWORD = 'TestAdmin@123';
process.env.NODE_ENV = 'test';

const app = require('../server');
const { seed } = require('../src/bootstrap');
const { q } = require('../src/db');

const BASE = `http://127.0.0.1:${process.env.TEST_PORT || 3111}`;
let passed = 0;
let failed = 0;

function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => {
      passed += 1;
      console.log(`  PASS  ${name}`);
    })
    .catch((err) => {
      failed += 1;
      console.log(`  FAIL  ${name}\n        ${err.message}`);
    });
}

function extractCsrf(html) {
  const m = /name="_csrf" value="([a-f0-9]{64})"/.exec(html);
  assert.ok(m, 'CSRF token not found in form');
  return m[1];
}

function makeClient() {
  let cookie = '';
  return async function request(pathname, options = {}) {
    const headers = Object.assign({ cookie }, options.headers || {});
    const res = await fetch(`${BASE}${pathname}`, {
      redirect: 'manual',
      ...options,
      headers
    });
    const setCookie = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    for (const c of setCookie) {
      const [pair] = c.split(';');
      if (pair.startsWith('aa.sid=') || pair.startsWith('csrf_token=')) {
        const name = pair.split('=')[0];
        const others = cookie.split('; ').filter((x) => x && !x.startsWith(`${name}=`));
        cookie = [...others, pair].join('; ');
      }
    }
    const text = await res.text();
    return { status: res.status, headers: res.headers, body: text };
  };
}

async function main() {
  seed({ log: () => {} });
  const server = app.listen(process.env.TEST_PORT || 3111, '127.0.0.1');
  await new Promise((r) => server.once('listening', r));

  const anon = makeClient();
  const user = makeClient();
  const admin = makeClient();

  console.log('\nDATA');
  await check('32 articles seeded', () => {
    const n = q.articles.count.get().n;
    assert.strictEqual(n, 32, `expected 32 articles, found ${n}`);
  });
  await check('admin account created', () => {
    const a = q.users.byUsername.get('admin');
    assert.ok(a && a.role === 'admin', 'admin user missing');
  });

  console.log('\nPUBLIC READING (no account)');
  await check('GET / returns 200 and lists 32 articles', async () => {
    const r = await anon('/');
    assert.strictEqual(r.status, 200);
    for (let i = 1; i <= 32; i += 1) {
      assert.ok(r.body.includes(`href="/${i}"`), `article ${i} not linked on home page`);
    }
  });
  await check('all 32 article pages render', async () => {
    for (let i = 1; i <= 32; i += 1) {
      const r = await anon(`/${i}`);
      assert.strictEqual(r.status, 200, `/${i} returned ${r.status}`);
      assert.ok(r.body.includes('<h1>'), `/${i} missing heading`);
    }
  });
  await check('article 33 does not exist', async () => {
    const r = await anon('/33');
    assert.strictEqual(r.status, 404);
  });
  await check('security headers present', async () => {
    const r = await anon('/');
    assert.ok(r.headers.get('content-security-policy'), 'no CSP header');
    assert.strictEqual(r.headers.get('x-content-type-options'), 'nosniff');
    assert.ok(!r.headers.get('x-powered-by'), 'x-powered-by leaked');
  });
  await check('article HTML is escaped, not executed', async () => {
    q.articles.create.run(900, 'xss-test', 'XSS <b>bold</b> test', 'sum', 'Security', 'body', 'draft', null);
    const r = await anon('/about');
    assert.ok(!r.body.includes('<b>bold</b>'), 'raw HTML rendered unescaped');
  });

  console.log('\nDOWNLOAD GATE');
  await check('anonymous download is redirected to login', async () => {
    const r = await anon('/download/1.zip');
    assert.strictEqual(r.status, 302);
    assert.ok(r.headers.get('location').startsWith('/login'), 'not redirected to /login');
  });
  await check('anonymous download returns no file bytes', async () => {
    const r = await anon('/download/1.zip');
    assert.ok(!r.body.includes('PK'), 'zip data served to anonymous user');
  });

  console.log('\nREGISTRATION + LOGIN');
  await check('register validates weak passwords', async () => {
    const page = await user('/register');
    const token = extractCsrf(page.body);
    const r = await user('/register', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: token,
        username: 'weakuser',
        email: 'weak@example.com',
        password: 'short',
        confirmPassword: 'short'
      })
    });
    assert.strictEqual(r.status, 400);
    assert.ok(r.body.includes('at least 10 characters'), 'password rule not enforced');
  });
  await check('register rejects duplicate username', async () => {
    const token = extractCsrf((await user('/register')).body);
    const r = await user('/register', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: token,
        username: 'admin',
        email: 'new@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123'
      })
    });
    assert.strictEqual(r.status, 409);
  });
  await check('CSRF token is enforced', async () => {
    const r = await user('/register', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username: 'x', email: 'x@y.com', password: 'ValidPass123' })
    });
    assert.strictEqual(r.status, 403, 'missing CSRF token was accepted');
  });
  await check('register succeeds and signs the user in', async () => {
    const token = extractCsrf((await user('/register')).body);
    const r = await user('/register', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: token,
        username: 'reader1',
        email: 'reader1@example.com',
        password: 'ValidPass123',
        confirmPassword: 'ValidPass123'
      })
    });
    assert.strictEqual(r.status, 302);
    const home = await user('/');
    assert.ok(home.body.includes('reader1'), 'not signed in after register');
  });
  await check('login with wrong password is rejected', async () => {
    const c = makeClient();
    const token = extractCsrf((await c('/login')).body);
    const r = await c('/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ _csrf: token, username: 'reader1', password: 'WrongPass999' })
    });
    assert.strictEqual(r.status, 401);
  });
  await check('user cannot open the admin dashboard', async () => {
    const r = await user('/admin');
    assert.strictEqual(r.status, 403);
  });

  console.log('\nDOWNLOAD AFTER LOGIN');
  await check('signed-in user gets a real ZIP file', async () => {
    const r = await user('/download/1.zip');
    assert.strictEqual(r.status, 200);
    assert.strictEqual(r.headers.get('content-type'), 'application/zip');
    assert.ok(r.headers.get('content-disposition').includes('.zip'), 'no attachment header');
    assert.ok(r.body.startsWith('PK'), 'response is not a ZIP archive');
  });
  await check('download is recorded and counter increments', async () => {
    const before = q.articles.byNumber.get(1).downloads;
    await user('/download/1.zip');
    const after = q.articles.byNumber.get(1).downloads;
    assert.strictEqual(after, before + 1, 'download counter did not increment');
    assert.ok(q.downloads.count.get().n > 0, 'download log empty');
  });
  await check('invalid zip path is not served', async () => {
    const r = await user('/download/../../package.json');
    assert.notStrictEqual(r.status, 200);
  });

  console.log('\nADMIN DASHBOARD');
  await check('admin can sign in', async () => {
    const token = extractCsrf((await admin('/login')).body);
    const r = await admin('/login', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ _csrf: token, username: 'admin', password: 'TestAdmin@123' })
    });
    assert.strictEqual(r.status, 302);
    const dash = await admin('/admin');
    assert.strictEqual(dash.status, 200);
    assert.ok(dash.body.includes('Admin dashboard'));
  });
  await check('admin dashboard is not open to anonymous users', async () => {
    const r = await anon('/admin');
    assert.strictEqual(r.status, 302);
    assert.ok(r.headers.get('location').startsWith('/login'));
  });
  await check('admin can create an article', async () => {
    const token = extractCsrf((await admin('/admin/articles/new')).body);
    const r = await admin('/admin/articles', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: token,
        number: '33',
        title: 'Smoke Test Article Created By Admin',
        summary: 'Created by the smoke test.',
        category: 'Testing',
        content: '## Heading\n\nThis body is long enough to pass validation because it repeats. '.repeat(12),
        status: 'published'
      })
    });
    assert.strictEqual(r.status, 302);
    assert.ok(q.articles.byNumber.get(33), 'article 33 was not created');
  });
  await check('new article is publicly readable', async () => {
    const r = await anon('/33');
    assert.strictEqual(r.status, 200);
  });
  await check('admin can edit an article', async () => {
    const id = q.articles.byNumber.get(33).id;
    const token = extractCsrf((await admin(`/admin/articles/${id}/edit`)).body);
    const r = await admin(`/admin/articles/${id}`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        _csrf: token,
        title: 'Smoke Test Article Edited',
        summary: 'Edited.',
        category: 'Testing',
        content: 'Edited body long enough to satisfy the minimum length validator. '.repeat(10),
        status: 'published'
      })
    });
    assert.strictEqual(r.status, 302);
    assert.strictEqual(q.articles.byId.get(id).title, 'Smoke Test Article Edited');
  });
  await check('unpublished article is hidden from the public', async () => {
    const id = q.articles.byNumber.get(33).id;
    q.articles.setStatus.run('draft', id);
    const r = await anon('/33');
    assert.strictEqual(r.status, 404, 'draft article was publicly visible');
    q.articles.setStatus.run('published', id);
  });
  await check('admin can delete an article', async () => {
    const id = q.articles.byNumber.get(33).id;
    const token = extractCsrf((await admin('/admin')).body);
    const r = await admin(`/admin/articles/${id}/delete`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ _csrf: token })
    });
    assert.strictEqual(r.status, 302);
    assert.ok(!q.articles.byNumber.get(33), 'article was not deleted');
  });
  await check('admin can promote a user', async () => {
    const target = q.users.byUsername.get('reader1');
    const token = extractCsrf((await admin('/admin')).body);
    await admin(`/admin/users/${target.id}/role`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ _csrf: token })
    });
    assert.strictEqual(q.users.byId.get(target.id).role, 'admin');
    await admin(`/admin/users/${target.id}/role`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ _csrf: token })
    });
    assert.strictEqual(q.users.byId.get(target.id).role, 'user');
  });
  await check('admin cannot demote themselves', async () => {
    const token = extractCsrf((await admin('/admin')).body);
    const me = q.users.byUsername.get('admin');
    await admin(`/admin/users/${me.id}/role`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ _csrf: token })
    });
    assert.strictEqual(q.users.byId.get(me.id).role, 'admin', 'admin demoted themselves');
  });

  console.log('\nLOGOUT');
  await check('logout clears the session', async () => {
    const token = extractCsrf((await user('/')).body);
    await user('/logout', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ _csrf: token })
    });
    const r = await user('/download/1.zip');
    assert.strictEqual(r.status, 302, 'still able to download after logout');
  });

  server.close();
  console.log(`\n${passed} passed, ${failed} failed\n`);
  require('../src/db').db.close();
  for (const f of [DB, `${DB}-wal`, `${DB}-shm`]) {
    try {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    } catch {
      /* best effort on Windows file locks */
    }
  }
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
