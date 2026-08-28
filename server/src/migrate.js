import { query } from './db-pg.js';

export async function migrate() {
  console.log('Running database migrations...');

  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      category TEXT DEFAULT 'General',
      target NUMERIC DEFAULT 1,
      unit TEXT DEFAULT 'times',
      difficulty INTEGER DEFAULT 3,
      frequency TEXT DEFAULT 'daily',
      active BOOLEAN DEFAULT TRUE,
      color TEXT DEFAULT '#d9a441',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS habit_records (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      value NUMERIC DEFAULT 0,
      note TEXT DEFAULT '',
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(habit_id, date)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      due_date TEXT,
      priority TEXT DEFAULT 'medium',
      category TEXT DEFAULT 'Work',
      completed BOOLEAN DEFAULT FALSE,
      completed_at TIMESTAMPTZ,
      recurring TEXT DEFAULT 'none',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      title TEXT,
      body TEXT DEFAULT '',
      mood INTEGER DEFAULT 3,
      energy INTEGER DEFAULT 5,
      tags TEXT[] DEFAULT '{}',
      highlights TEXT[] DEFAULT '{}',
      challenges TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(user_id, date)
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      required_score INTEGER DEFAULT 80,
      month TEXT DEFAULT '2026-08',
      unlocked BOOLEAN DEFAULT FALSE,
      claimed BOOLEAN DEFAULT FALSE,
      claimed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  console.log('✅ All tables created/verified.');
}
