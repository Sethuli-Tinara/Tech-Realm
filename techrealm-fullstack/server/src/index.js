// Tech Realm API: sign-up/log-in, missions, quiz answers, leaderboard and a simple path advisor.
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, initDatabase, pool } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is missing. Set it in your .env file.');
}

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || false }));
app.use(express.json({ limit: '10kb' }));

// ---------- helpers ----------

// Checks the "Authorization: Bearer <token>" header and puts the user id on req.userId.
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in first' });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch {
    res.status(401).json({ error: 'Your session expired. Please log in again.' });
  }
}

const makeToken = (userId) => jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, xp: u.xp });

// Wrap async route handlers so errors go to the error handler below.
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- routes ----------

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/register', wrap(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!name || !email.includes('@') || password.length < 8) {
    return res.status(400).json({ error: 'Enter a name, a valid email and a password of 8+ characters' });
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await query(
      'INSERT INTO users (name, email, password_hash) VALUES ($1,$2,$3) RETURNING id, name, email, xp',
      [name, email, hash]
    );
    res.status(201).json({ token: makeToken(rows[0].id), user: publicUser(rows[0]) });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'That email is already registered' });
    throw err;
  }
}));

app.post('/api/auth/login', wrap(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = rows[0];
  // Same message for "no user" and "wrong password" so attackers cannot guess emails.
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Wrong email or password' });
  }
  res.json({ token: makeToken(user.id), user: publicUser(user) });
}));

app.get('/api/auth/me', requireAuth, wrap(async (req, res) => {
  const { rows } = await query('SELECT id, name, email, xp FROM users WHERE id = $1', [req.userId]);
  if (!rows[0]) return res.status(404).json({ error: 'User not found' });
  res.json({ user: publicUser(rows[0]) });
}));

// List all missions and mark the ones this user has finished.
app.get('/api/missions', requireAuth, wrap(async (req, res) => {
  const { rows } = await query(
    `SELECT m.id, m.position, m.tier, m.title, m.story, m.lesson,
            m.quiz_question, m.quiz_options, m.xp,
            (c.user_id IS NOT NULL) AS completed
       FROM missions m
       LEFT JOIN completions c ON c.mission_id = m.id AND c.user_id = $1
      ORDER BY m.position`,
    [req.userId]
  );
  res.json({ missions: rows });
}));

// Check a quiz answer. The correct answer is never sent to the browser.
app.post('/api/missions/:id/answer', requireAuth, wrap(async (req, res) => {
  const missionId = Number(req.params.id);
  const chosen = Number(req.body.answer);
  if (!Number.isInteger(missionId) || !Number.isInteger(chosen)) {
    return res.status(400).json({ error: 'Send a numeric answer' });
  }

  const { rows } = await query('SELECT quiz_answer, xp FROM missions WHERE id = $1', [missionId]);
  if (!rows[0]) return res.status(404).json({ error: 'Mission not found' });

  if (chosen !== rows[0].quiz_answer) {
    return res.json({ correct: false, xpGained: 0, message: 'Not quite. Read the lesson again and try once more.' });
  }

  // Give XP only the first time the mission is completed.
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      'INSERT INTO completions (user_id, mission_id) VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING mission_id',
      [req.userId, missionId]
    );
    let xpGained = 0;
    if (inserted.rowCount === 1) {
      xpGained = rows[0].xp;
      await client.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [xpGained, req.userId]);
    }
    const { rows: userRows } = await client.query('SELECT xp FROM users WHERE id = $1', [req.userId]);
    await client.query('COMMIT');
    res.json({
      correct: true,
      xpGained,
      totalXp: userRows[0].xp,
      message: xpGained ? 'Correct! The gate opens.' : 'Correct, but you already earned XP for this mission.',
    });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}));

app.get('/api/leaderboard', requireAuth, wrap(async (req, res) => {
  const { rows } = await query('SELECT name, xp FROM users ORDER BY xp DESC, name ASC LIMIT 10');
  res.json({ leaderboard: rows });
}));

// Simple rule-based advisor: matches keywords to a suggested learning path.
const paths = [
  { keywords: ['web', 'website', 'react', 'frontend', 'design'], path: 'Frontend Developer: start with HTML, CSS and JavaScript, then React.' },
  { keywords: ['data', 'database', 'sql', 'postgres', 'analyst'], path: 'Data and Databases: learn SQL, table design, then PostgreSQL.' },
  { keywords: ['server', 'api', 'backend', 'node', 'java'], path: 'Backend Developer: learn one language well (Node.js or Java), then APIs and databases.' },
  { keywords: ['security', 'hack', 'network', 'cyber'], path: 'Cyber Security: learn networking basics first, then Linux and security tools.' },
];

app.post('/api/advisor', requireAuth, (req, res) => {
  const text = String(req.body.interest || '').toLowerCase().slice(0, 300);
  const match = paths.find((p) => p.keywords.some((k) => text.includes(k)));
  res.json({
    suggestion: match
      ? match.path
      : 'Not sure yet? Start with the Basic tier: learn how programs work, then pick the path that excites you most.',
  });
});

// Unknown API route
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Last-resort error handler: log the details on the server, send a safe message to the browser.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

const port = Number(process.env.PORT) || 4000;

// Wait for the database to be ready, then start listening.
async function start(retries = 10) {
  try {
    await initDatabase();
    app.listen(port, () => console.log(`Tech Realm API listening on port ${port}`));
  } catch (err) {
    if (retries === 0) throw err;
    console.log(`Database not ready, retrying in 3 seconds... (${retries} left)`);
    await new Promise((r) => setTimeout(r, 3000));
    return start(retries - 1);
  }
}

start();
