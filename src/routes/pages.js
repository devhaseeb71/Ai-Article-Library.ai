'use strict';

const express = require('express');
const { q } = require('../db');
const { str } = require('../middleware/security');

const router = express.Router();

function decorate(article) {
  if (!article) return null;
  return {
    ...article,
    html: require('../markup').renderMarkup(article.content),
    excerpt: require('../markup').excerpt(article.content, 180),
    minutes: require('../markup').readingTime(article.content)
  };
}

function neighbourNumbers(number) {
  // Prev/next are based on what actually exists, so articles added by an
  // admin beyond the original 1-32 are reachable too.
  const prevRow = number > 1 ? q.articles.byNumber.get(number - 1) : null;
  const nextRow = q.articles.byNumber.get(number + 1);
  return {
    prev: prevRow && prevRow.status === 'published' ? prevRow.number : null,
    next: nextRow && nextRow.status === 'published' ? nextRow.number : null
  };
}

// Home: all 32 published articles
router.get('/', (req, res) => {
  const category = str(req.query.category, { max: 60 });
  let articles = q.articles.published.all();
  if (category) articles = articles.filter((a) => a.category === category);

  res.render('home', {
    title: 'AI Articles Library - 32 in-depth articles',
    articles: articles.map(decorate),
    categories: q.articles.categories.all().map((r) => r.category),
    activeCategory: category
  });
});

// About page (declared before the numeric catch-all below)
router.get('/about', (req, res) => {
  res.render('about', { title: 'About - AI Articles Library' });
});

// Canonical slug URL: /read/transformers-explained
router.get('/read/:slug', (req, res, next) => {
  const row = q.articles.bySlug.get(str(req.params.slug, { max: 100 }));
  if (!row || row.status !== 'published') return next();
  res.redirect(`/${row.number}`);
});

// Single article by number: /1 ... /32
router.get('/:number', (req, res, next) => {
  const raw = String(req.params.number);
  if (!/^\d{1,3}$/.test(raw)) return next();
  const number = Number(raw);
  if (number < 1 || number > 999) return next();

  const row = q.articles.byNumber.get(number);
  if (!row || row.status !== 'published') return next();

  res.render('article', {
    title: `${row.number}. ${row.title}`,
    article: decorate(row),
    ...neighbourNumbers(number)
  });
});

module.exports = router;
