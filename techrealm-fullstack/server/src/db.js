// Connects the API to PostgreSQL and sets up the tables on startup.
import pg from 'pg';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { missions } from './seed.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const query = (text, params) => pool.query(text, params);

// Create tables and add starter missions (runs once at startup).
export async function initDatabase() {
  const schema = readFileSync(path.join(here, 'schema.sql'), 'utf8');
  await pool.query(schema);

  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM missions');
  if (rows[0].count === 0) {
    for (const [index, m] of missions.entries()) {
      await pool.query(
        `INSERT INTO missions
          (position, tier, title, story, lesson, quiz_question, quiz_options, quiz_answer, xp)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [index + 1, m.tier, m.title, m.story, m.lesson, m.quiz_question, m.quiz_options, m.quiz_answer, m.xp]
      );
    }
    console.log(`Added ${missions.length} starter missions`);
  }
}
