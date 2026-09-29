'use strict';

// Deletes the SQLite database so the next start reseeds from scratch.

const fs = require('node:fs');
const path = require('node:path');

const dataDir = path.join(__dirname, '..', 'data');
let removed = 0;

for (const file of ['articles.db', 'articles.db-wal', 'articles.db-shm']) {
  const full = path.join(dataDir, file);
  if (fs.existsSync(full)) {
    fs.unlinkSync(full);
    removed += 1;
    console.log(`removed ${file}`);
  }
}

console.log(removed ? 'Database reset. Run "npm start" to rebuild it.' : 'Nothing to reset.');
