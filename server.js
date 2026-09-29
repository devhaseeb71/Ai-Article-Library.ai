'use strict';

const path = require('node:path');
const crypto = require('node:crypto');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

const { seed } = require('./src/bootstrap');
const { csrf, attachUser, str } = require('./src/middleware/security');
const { renderMarkup, excerpt, readingTime } = require('./src/markup');
const { q } = require('./src/db');

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const IS_PROD = process.env.NODE_ENV === 'production';

if (IS_PROD && !process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET must be set when NODE_ENV=production');
}

const app = express();

// --- Security headers ------------------------------------------------------
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'self'"],
        baseUri: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: 'same-origin' }
  })
);

// --- Core middleware -------------------------------------------------------
app.use(express.urlencoded({ extended: false, limit: '256kb' }));
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: IS_PROD ? '1h' : 0 }));

app.use(
  session({
    name: 'aa.sid',
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: IS_PROD,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use(csrf);
app.use(attachUser);

// --- Flash messages (kept in session, no extra dependency) -----------------
app.use((req, res, next) => {
  res.locals.flash = req.session.flash || [];
  req.session.flash = [];
  res.locals.flashOnce = (type, message) => {
    req.session.flash.push({ type, message });
  };
  next();
});

// --- Global rate limit -----------------------------------------------------
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 600,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: 'Too many requests. Please slow down and try again shortly.'
  })
);

// --- Template locals -------------------------------------------------------
app.use((req, res, next) => {
  res.locals.title = 'AI Articles Library';
  res.locals.path = req.path;
  res.locals.query = req.query;
  res.locals.renderMarkup = renderMarkup;
  res.locals.excerpt = excerpt;
  res.locals.readingTime = readingTime;
  res.locals.isAdmin = Boolean(req.user && req.user.role === 'admin');
  res.locals.totalArticles = q.articles.count.get().n;
  next();
});

app.use('/', require('./src/routes/pages'));
app.use('/', require('./src/routes/auth'));
app.use('/download', require('./src/routes/download'));
app.use('/admin', require('./src/routes/admin'));

// --- Errors ----------------------------------------------------------------
app.use((req, res) => {
  res.status(404).render('error', {
    title: '404 - Page not found',
    heading: 'Page not found',
    message: `We could not find ${str(req.path, { max: 120 })}.`,
    layout: 'layouts/main'
  });
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  if (res.headersSent) return;
  res.status(status).render('error', {
    title: `${status} - ${status === 500 ? 'Server error' : 'Request rejected'}`,
    heading: status === 500 ? 'Something went wrong' : 'Request rejected',
    message: status === 500 ? 'An unexpected error occurred. Please try again.' : err.message,
    layout: 'layouts/main'
  });
});

if (require.main === module) {
  seed();
  app.listen(PORT, HOST, () => {
    console.log('');
    console.log('  AI Articles Library');
    console.log(`  running at http://${HOST}:${PORT}`);
    console.log('  press Ctrl+C to stop');
    console.log('');
  });
}

module.exports = app;
