'use strict';
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_FILE = process.env.DB_FILE || 'articles.db';
const db = new DatabaseSync(path.join(DATA_DIR, DB_FILE));

db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    role          TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS articles (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    number     INTEGER NOT NULL UNIQUE,
    slug       TEXT    NOT NULL UNIQUE,
    title      TEXT    NOT NULL,
    summary    TEXT    NOT NULL DEFAULT '',
    category   TEXT    NOT NULL DEFAULT 'General',
    content    TEXT    NOT NULL,
    status     TEXT    NOT NULL DEFAULT 'published' CHECK (status IN ('published','draft')),
    downloads  INTEGER NOT NULL DEFAULT 0,
    author_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS downloads (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    article_id INTEGER NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    ip         TEXT,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_articles_number ON articles(number);
  CREATE INDEX IF NOT EXISTS idx_downloads_user ON downloads(user_id);
`);

const q = {
  users: {
    byUsername: db.prepare('SELECT * FROM users WHERE username = ?'),
    byEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
    byId: db.prepare('SELECT * FROM users WHERE id = ?'),
    create: db.prepare(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)'
    ),
    all: db.prepare('SELECT id, username, email, role, created_at FROM users ORDER BY id'),
    count: db.prepare('SELECT COUNT(*) AS n FROM users'),
    setRole: db.prepare('UPDATE users SET role = ? WHERE id = ?'),
    delete: db.prepare('DELETE FROM users WHERE id = ?')
  },
  articles: {
    all: db.prepare(
      'SELECT a.*, u.username AS author FROM articles a LEFT JOIN users u ON u.id = a.author_id ORDER BY a.number'
    ),
    published: db.prepare(
      "SELECT a.*, u.username AS author FROM articles a LEFT JOIN users u ON u.id = a.author_id WHERE a.status = 'published' ORDER BY a.number"
    ),
    byNumber: db.prepare(
      'SELECT a.*, u.username AS author FROM articles a LEFT JOIN users u ON u.id = a.author_id WHERE a.number = ?'
    ),
    bySlug: db.prepare(
      'SELECT a.*, u.username AS author FROM articles a LEFT JOIN users u ON u.id = a.author_id WHERE a.slug = ?'
    ),
    byId: db.prepare(
      'SELECT a.*, u.username AS author FROM articles a LEFT JOIN users u ON u.id = a.author_id WHERE a.id = ?'
    ),
    count: db.prepare('SELECT COUNT(*) AS n FROM articles'),
    sumDownloads: db.prepare('SELECT COALESCE(SUM(downloads),0) AS n FROM articles'),
    categories: db.prepare('SELECT DISTINCT category FROM articles ORDER BY category'),
    maxNumber: db.prepare('SELECT COALESCE(MAX(number), 0) AS n FROM articles'),
    create: db.prepare(
      `INSERT INTO articles (number, slug, title, summary, category, content, status, author_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ),
    update: db.prepare(
      `UPDATE articles
       SET title = ?, summary = ?, category = ?, content = ?, status = ?, updated_at = datetime('now')
       WHERE id = ?`
    ),
    setStatus: db.prepare("UPDATE articles SET status = ?, updated_at = datetime('now') WHERE id = ?"),
    incDownloads: db.prepare('UPDATE articles SET downloads = downloads + 1 WHERE id = ?'),
    delete: db.prepare('DELETE FROM articles WHERE id = ?')
  },
  downloads: {
    create: db.prepare(
      'INSERT INTO downloads (user_id, article_id, ip) VALUES (?, ?, ?)'
    ),
    recent: db.prepare(
      `SELECT d.id, d.created_at, d.ip, u.username, a.title, a.number
       FROM downloads d
       JOIN users u ON u.id = d.user_id
       JOIN articles a ON a.id = d.article_id
       ORDER BY d.id DESC LIMIT 50`
    ),
    count: db.prepare('SELECT COUNT(*) AS n FROM downloads'),
    countByUser: db.prepare('SELECT COUNT(*) AS n FROM downloads WHERE user_id = ?'),
    perArticle: db.prepare(
      `SELECT a.number, a.title, a.downloads FROM articles a ORDER BY a.downloads DESC, a.number LIMIT 10`
    )
  }
};

module.exports = { db, q };
