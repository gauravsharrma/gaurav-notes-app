const express = require('express');

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static frontend files (index.html, CSS, JS)
app.use(express.static(__dirname));

const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('frontend'));

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.get('/api/notes', async (_, res) => {
  const { rows } = await db.query('SELECT * FROM notes ORDER BY id DESC');
  rows.forEach(r => r.tags = r.tags || []);
  res.json(rows);
});

app.post('/api/notes', async (req, res) => {
  const { content, tags } = req.body;
  await db.query('INSERT INTO notes (content, tags) VALUES ($1, $2)', [content, tags]);
  res.sendStatus(201);
});

app.put('/api/notes/:id', async (req, res) => {
  const { content, tags } = req.body;
  await db.query('UPDATE notes SET content=$1, tags=$2 WHERE id=$3', [content, tags, req.params.id]);
  res.sendStatus(200);
});

app.delete('/api/notes/:id', async (req, res) => {
  await db.query('DELETE FROM notes WHERE id=$1', [req.params.id]);
  res.sendStatus(204);
});

app.listen(process.env.PORT || 3000, () => console.log('Server running'));
