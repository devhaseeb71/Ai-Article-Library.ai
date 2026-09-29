'use strict';

const crypto = require('node:crypto');

// --- CSRF -------------------------------------------------------------------
// Double-submit cookie. Token is stored in the session and compared against
// the value submitted in the form body or the x-csrf-token header.

function csrf(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  res.locals.csrfToken = req.session.csrfToken;
  res.cookie('csrf_token', req.session.csrfToken, {
    httpOnly: false,
    sameSite: 'lax',
    secure: req.secure,
    maxAge: 1000 * 60 * 60 * 2
  });

  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const sent = (req.body && req.body._csrf) || req.get('x-csrf-token') || '';
  const expected = req.session.csrfToken;
  const a = Buffer.from(String(sent));
  const b = Buffer.from(String(expected));
  const ok = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!ok) {
    const err = new Error('Invalid or expired security token. Please reload the page.');
    err.status = 403;
    return next(err);
  }
  return next();
}

// --- Auth guards ------------------------------------------------------------

function attachUser(req, res, next) {
  const id = req.session.userId;
  if (id) {
    const user = require('../db').q.users.byId.get(id);
    if (user) {
      req.user = user;
      req.session.lastSeen = Date.now();
    } else {
      delete req.session.userId;
    }
  }
  res.locals.currentUser = req.user || null;
  next();
}

function requireLogin(req, res, next) {
  if (req.user) return next();
  if (req.accepts(['html', 'json']) === 'json') {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const next_ = encodeURIComponent(req.originalUrl || '/');
  return res.redirect(`/login?next=${next_}`);
}

function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
  }
  if (req.user.role !== 'admin') {
    return res.status(403).render('error', {
      title: '403 - Administrator access required',
      heading: 'Administrator access required',
      message:
        'This area is limited to administrators. If you believe this is a mistake, sign in with an admin account.'
    });
  }
  return next();
}

// Only allow same-site relative paths, so ?next= cannot be used as an open redirect.
function safeNext(value, fallback = '/') {
  const n = str(value, { max: 300 });
  if (!n.startsWith('/') || n.startsWith('//')) return fallback;
  return n;
}

// --- Input validation -------------------------------------------------------

function str(value, { max = 5000, trim = true } = {}) {
  if (value === undefined || value === null) return '';
  let s = String(value);
  if (trim) s = s.trim();
  return s.slice(0, max);
}

const USERNAME_RE = /^[a-zA-Z0-9._-]{3,24}$/;
const EMAIL_RE = /^[^\s@]{1,64}@[^\s@.]+(\.[^\s@.]+)+$/;

function validateRegistration(body) {
  const errors = [];
  const username = str(body.username, { max: 24 });
  const email = str(body.email, { max: 190 }).toLowerCase();
  const password = str(body.password, { max: 200, trim: false });
  const confirm = str(body.confirmPassword, { max: 200, trim: false });

  if (!USERNAME_RE.test(username)) {
    errors.push('Username must be 3-24 characters using letters, numbers, dot, dash or underscore.');
  }
  if (!EMAIL_RE.test(email)) {
    errors.push('Enter a valid email address.');
  }
  if (password.length < 10) {
    errors.push('Password must be at least 10 characters.');
  } else if (password.length > 200) {
    errors.push('Password must be 200 characters or fewer.');
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.push('Password must contain at least one letter and one number.');
  } else if (/^(.)\1+$/.test(password)) {
    errors.push('Password is too simple.');
  }
  if (confirm && confirm !== password) {
    errors.push('Passwords do not match.');
  }
  return { errors, username, email, password };
}

function validateArticle(body) {
  const errors = [];
  const title = str(body.title, { max: 200 });
  const summary = str(body.summary, { max: 500 });
  const category = str(body.category, { max: 60 }) || 'General';
  const content = str(body.content, { max: 200000 });
  const status = body.status === 'draft' ? 'draft' : 'published';

  if (title.length < 5) errors.push('Title must be at least 5 characters.');
  if (content.length < 100) errors.push('Content must be at least 100 characters.');
  if (!/^[\w &/().,'-]{2,60}$/.test(category)) {
    errors.push('Category contains unsupported characters.');
  }
  return { errors, title, summary, category, content, status };
}

module.exports = {
  csrf,
  attachUser,
  requireLogin,
  requireAdmin,
  safeNext,
  validateRegistration,
  validateArticle,
  str
};
