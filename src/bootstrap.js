'use strict';

const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { q } = require('./db');
const { ARTICLES } = require('./seed');

const ADMIN_USER = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@localhost.test';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'article';
}

function seed({ log = console.log } = {}) {
  let createdAdmins = 0;
  if (!q.users.byUsername.get(ADMIN_USER)) {
    q.users.create.run(
      ADMIN_USER,
      ADMIN_EMAIL,
      bcrypt.hashSync(ADMIN_PASSWORD, 12),
      'admin'
    );
    createdAdmins = 1;
  }

  const existing = q.articles.count.get().n;
  let inserted = 0;
  if (existing === 0) {
    const admin = q.users.byUsername.get(ADMIN_USER);
    for (const a of ARTICLES) {
      q.articles.create.run(
        a.number,
        a.slug || slugify(a.title),
        a.title,
        a.summary || '',
        a.category || 'General',
        a.content,
        'published',
        admin ? admin.id : null
      );
      inserted += 1;
    }
    log(`Seeded ${inserted} articles.`);
  } else {
    log(`Articles already present (${existing}), skipping seed.`);
  }

  if (createdAdmins) {
    log('Admin account created:');
    log(`  username: ${ADMIN_USER}`);
    log(`  password: ${ADMIN_PASSWORD}`);
    log('Change this password after first login.');
  }

  return { inserted, createdAdmins };
}

// Password hashing helper used by the register route.
function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}
function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

module.exports = { seed, slugify, hashPassword, verifyPassword, randomToken };
