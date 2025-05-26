const express = require('express');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve static frontend files from the root directory
app.use(express.static(__dirname));

// ✅ PostgreSQL connection
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ API Routes

// Get all notes
app.get('/api/notes', async (_, res) => {
  const { rows } = await db.query('SELECT * FROM notes ORDER BY id DESC');
  rows.forEach(r => r.tags = r.tags || []);
  res.json(rows);
});

// Add a new note
app.post('/api/notes', async (req, res) => {
  const { content, tags } = req.body;
  await db.query('INSERT INTO notes (content, tags) VALUES ($1, $2)', [content, tags]);
  res.sendStatus(201);
});

// Update an existing note
app.put('/api/notes/:id', async (req, res) => {
  const { content, tags } = req.body;
  await db.query('UPDATE notes SET content=$1, tags=$2 WHERE id=$3', [content, tags, req.params.id]);
  res.sendStatus(200);
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  await db.query('DELETE FROM notes WHERE id=$1', [req.params.id]);
  res.sendStatus(204);
});

// ✅ Start server
app.listen(process.env.PORT || 3000, () => {
  console.log('Server running');
});
