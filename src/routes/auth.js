'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { q } = require('../db');
const { hashPassword, verifyPassword } = require('../bootstrap');
const { validateRegistration, str } = require('../middleware/security');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: 'Too many attempts. Please wait 15 minutes and try again.'
});

function safeNext(value) {
  // Only allow same-site relative paths, so ?next= cannot be used as an open redirect.
  const n = str(value, { max: 300 });
  if (!n.startsWith('/') || n.startsWith('//')) return '/';
  return n;
}

router.get('/register', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('register', {
    title: 'Create your account - AI Articles Library',
    form: { username: '', email: '' },
    errors: []
  });
});

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { errors, username, email, password, confirm } = {
      ...validateRegistration(req.body),
      confirm: str(req.body.confirmPassword, { max: 200, trim: false })
    };

    if (errors.length) {
      return res.status(400).render('register', {
        title: 'Create your account - AI Articles Library',
        form: { username, email },
        errors
      });
    }

    if (q.users.byUsername.get(username)) {
      return res.status(409).render('register', {
        title: 'Create your account - AI Articles Library',
        form: { username, email },
        errors: ['That username is already taken. Please choose another.']
      });
    }
    if (q.users.byEmail.get(email)) {
      return res.status(409).render('register', {
        title: 'Create your account - AI Articles Library',
        form: { username, email },
        errors: ['An account already exists for that email address.']
      });
    }

    const hash = await hashPassword(password);
    const info = q.users.create.run(username, email, hash, 'user');
    const userId = Number(info.lastInsertRowid);

    // Regenerate the session id on privilege change to prevent session fixation.
    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = userId;
      req.session.flash = [{ type: 'success', message: 'Account created. You are now signed in.' }];
      res.redirect('/');
    });
  } catch (err) {
    next(err);
  }
});

router.get('/login', (req, res) => {
  if (req.user) return res.redirect('/');
  res.render('login', {
    title: 'Sign in - AI Articles Library',
    form: { username: '' },
    next: safeNext(req.query.next),
    errors: []
  });
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const username = str(req.body.username, { max: 24 });
    const password = str(req.body.password, { max: 200, trim: false });
    const target = safeNext(req.body.next);
    const user = q.users.byUsername.get(username);

    const fail = (message) =>
      res.status(401).render('login', {
        title: 'Sign in - AI Articles Library',
        form: { username },
        next: target,
        errors: [message]
      });

    if (!user) {
      // Equalise timing between unknown user and wrong password.
      await verifyPassword(password, '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidiu');
      return fail('Incorrect username or password.');
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) return fail('Incorrect username or password.');

    req.session.regenerate((err) => {
      if (err) return next(err);
      req.session.userId = user.id;
      req.session.flash = [{ type: 'success', message: `Welcome back, ${user.username}.` }];
      res.redirect(target);
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('aa.sid');
    res.clearCookie('csrf_token');
    res.redirect('/');
  });
});

module.exports = router;
