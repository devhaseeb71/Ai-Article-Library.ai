'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const { q } = require('../db');
const { requireLogin } = require('../middleware/security');
const { sendArticleZip } = require('../zip');

const router = express.Router();

// Downloads are the most expensive thing this site does, so they are
// rate limited per IP on top of requiring a signed-in account.
const downloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: 'Too many downloads at once. Please wait a minute.'
});

// GET is used so the download works as a plain link and a bookmark.
// CSRF protection is not required: the route has no side effect other than
// recording a download, and it cannot be triggered cross-site in a harmful
// way because the response is a file, not a state change.
router.get('/:file', downloadLimiter, requireLogin, (req, res, next) => {
  const file = String(req.params.file || '');
  const match = /^(\d{1,3})\.zip$/i.exec(file);
  if (!match) return next();

  const number = Number(match[1]);
  const article = q.articles.byNumber.get(number);

  if (!article) {
    return res.status(404).render('error', {
      title: '404 - Article not found',
      heading: 'Article not found',
      message: `There is no article number ${number}.`
    });
  }
  const isAdmin = req.user && req.user.role === 'admin';
  if (article.status !== 'published' && !isAdmin) {
    return res.status(404).render('error', {
      title: '404 - Article not found',
      heading: 'Article not found',
      message: 'That article is not available.'
    });
  }

  q.articles.incDownloads.run(article.id);
  q.downloads.create.run(req.user.id, article.id, req.ip || null);

  sendArticleZip(res, { ...article, downloads: article.downloads + 1 }, req.user);
});

module.exports = router;
