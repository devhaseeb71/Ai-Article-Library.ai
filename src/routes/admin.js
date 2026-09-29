'use strict';

const express = require('express');
const { q } = require('../db');
const { requireAdmin, validateArticle, safeNext, str } = require('../middleware/security');
const { slugify } = require('../bootstrap');
const { renderMarkup, excerpt, readingTime } = require('../markup');

const router = express.Router();

// Dedicated sign-in screen for the admin area. Declared ahead of requireAdmin so
// signed-out visitors get a real page here instead of the 404 handler. The form
// posts to the shared /login route, which already handles rate limiting.
router.get('/login', (req, res) => {
  if (req.user && req.user.role === 'admin') return res.redirect('/admin');
  res.render('admin/login', {
    title: 'Administrator sign in - AI Articles Library',
    form: { username: '' },
    next: safeNext(req.query.next, '/admin'),
    errors: []
  });
});

// Every remaining route in this file requires a signed-in administrator.
router.use(requireAdmin);

// Alias so /admin/dashboard reaches the dashboard instead of the 404 handler.
router.get('/dashboard', (req, res) => res.redirect('/admin'));

function flash(req, type, message) {
  req.session.flash = [...(req.session.flash || []), { type, message }];
}

// --- Dashboard -------------------------------------------------------------
router.get('/', (req, res) => {
  const stats = {
    articles: q.articles.count.get().n,
    published: q.articles.published.all().length,
    users: q.users.count.get().n,
    downloads: q.downloads.count.get().n,
    totalArticleDownloads: q.articles.sumDownloads.get().n
  };
  res.render('admin/dashboard', {
    title: 'Admin dashboard - AI Articles Library',
    stats,
    articles: q.articles.all.all().map((a) => ({ ...a, excerpt: excerpt(a.content, 120) })),
    users: q.users.all.all(),
    recentDownloads: q.downloads.recent.all(),
    topArticles: q.downloads.perArticle.all()
  });
});

// --- Create article --------------------------------------------------------
router.get('/articles/new', (req, res) => {
  const nextNumber = q.articles.maxNumber.get().n + 1;
  res.render('admin/article-form', {
    title: 'New article - Admin',
    article: { number: nextNumber, title: '', summary: '', category: '', content: '', status: 'published' },
    categories: q.articles.categories.all().map((r) => r.category),
    errors: [],
    mode: 'create'
  });
});

router.post('/articles', (req, res) => {
  const { errors, ...data } = validateArticle(req.body);
  const number = Number(str(req.body.number, { max: 4 })) || q.articles.maxNumber.get().n + 1;

  if (errors.length) {
    return res.status(400).render('admin/article-form', {
      title: 'New article - Admin',
      article: { ...data, number },
      categories: q.articles.categories.all().map((r) => r.category),
      errors,
      mode: 'create'
    });
  }
  if (number < 1 || number > 999) {
    return res.status(400).render('admin/article-form', {
      title: 'New article - Admin',
      article: { ...data, number },
      categories: q.articles.categories.all().map((r) => r.category),
      errors: ['Article number must be between 1 and 999.'],
      mode: 'create'
    });
  }
  if (q.articles.byNumber.get(number)) {
    return res.status(409).render('admin/article-form', {
      title: 'New article - Admin',
      article: { ...data, number },
      categories: q.articles.categories.all().map((r) => r.category),
      errors: [`Article number ${number} is already in use.`],
      mode: 'create'
    });
  }

  let slug = slugify(data.title);
  let suffix = 2;
  while (q.articles.bySlug.get(slug)) slug = `${slugify(data.title)}-${suffix++}`;

  q.articles.create.run(
    number,
    slug,
    data.title,
    data.summary,
    data.category,
    data.content,
    data.status,
    req.user.id
  );
  flash(req, 'success', `Article ${number} created and saved.`);
  res.redirect('/admin');
});

// --- Edit article ----------------------------------------------------------
router.get('/articles/:id/edit', (req, res) => {
  const article = q.articles.byId.get(Number(req.params.id));
  if (!article) return res.redirect('/admin');
  res.render('admin/article-form', {
    title: `Edit article ${article.number} - Admin`,
    article,
    categories: q.articles.categories.all().map((r) => r.category),
    errors: [],
    mode: 'edit'
  });
});

router.post('/articles/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = q.articles.byId.get(id);
  if (!existing) return res.redirect('/admin');

  const { errors, ...data } = validateArticle(req.body);
  if (errors.length) {
    return res.status(400).render('admin/article-form', {
      title: `Edit article ${existing.number} - Admin`,
      article: { ...existing, ...data },
      categories: q.articles.categories.all().map((r) => r.category),
      errors,
      mode: 'edit'
    });
  }

  q.articles.update.run(data.title, data.summary, data.category, data.content, data.status, id);
  flash(req, 'success', `Article ${existing.number} updated.`);
  res.redirect(`/admin/articles/${id}/edit`);
});

router.post('/articles/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  const article = q.articles.byId.get(id);
  if (!article) return res.redirect('/admin');
  q.articles.delete.run(id);
  flash(req, 'success', `Article ${article.number} deleted.`);
  res.redirect('/admin');
});

router.post('/articles/:id/status', (req, res) => {
  const id = Number(req.params.id);
  const article = q.articles.byId.get(id);
  if (!article) return res.redirect('/admin');
  const next = article.status === 'published' ? 'draft' : 'published';
  q.articles.setStatus.run(next, id);
  flash(req, 'success', `Article ${article.number} is now ${next}.`);
  res.redirect('/admin');
});

// --- User management -------------------------------------------------------
router.post('/users/:id/role', (req, res) => {
  const id = Number(req.params.id);
  const user = q.users.byId.get(id);
  if (!user) return res.redirect('/admin');

  if (user.id === req.user.id) {
    flash(req, 'error', 'You cannot change your own role.');
    return res.redirect('/admin');
  }

  const nextRole = user.role === 'admin' ? 'user' : 'admin';
  q.users.setRole.run(nextRole, id);
  flash(req, 'success', `${user.username} is now ${nextRole === 'admin' ? 'an administrator' : 'a standard user'}.`);
  res.redirect('/admin');
});

router.post('/users/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  const user = q.users.byId.get(id);
  if (!user) return res.redirect('/admin');

  if (user.id === req.user.id) {
    flash(req, 'error', 'You cannot delete your own account from here.');
    return res.redirect('/admin');
  }
  if (user.role === 'admin' && q.users.all.all().filter((u) => u.role === 'admin').length <= 1) {
    flash(req, 'error', 'At least one administrator must remain.');
    return res.redirect('/admin');
  }

  q.users.delete.run(id);
  flash(req, 'success', `User ${user.username} deleted.`);
  res.redirect('/admin');
});

module.exports = router;
