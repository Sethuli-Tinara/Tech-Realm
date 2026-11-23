-- Database tables for Tech Realm.
-- This file runs automatically when the API starts (it is safe to run more than once).

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  xp            INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS missions (
  id            SERIAL PRIMARY KEY,
  position      INTEGER NOT NULL,
  tier          TEXT NOT NULL,
  title         TEXT NOT NULL,
  story         TEXT NOT NULL,
  lesson        TEXT NOT NULL,
  quiz_question TEXT NOT NULL,
  quiz_options  TEXT[] NOT NULL,
  quiz_answer   INTEGER NOT NULL,   -- index of the correct option (0-based)
  xp            INTEGER NOT NULL DEFAULT 100
);

CREATE TABLE IF NOT EXISTS completions (
  user_id      INTEGER REFERENCES users(id) ON DELETE CASCADE,
  mission_id   INTEGER REFERENCES missions(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, mission_id)
);
