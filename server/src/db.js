import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure local data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

const initialData = {
  users: [],
  habits: [],
  habitRecords: [],
  tasks: [],
  journalEntries: [],
  rewards: [],
  monthlyScores: []
};

let memoryStore = null;
let pgPool = null;

function readLocalFile() {
  if (!fs.existsSync(DB_FILE)) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    } catch (e) {}
    return JSON.parse(JSON.stringify(initialData));
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db.json:', err);
    return JSON.parse(JSON.stringify(initialData));
  }
}

function writeLocalFile(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Ignore in read-only container filesystems
  }
}

async function persistToPg(collection, items) {
  if (!pgPool) return;
  try {
    await pgPool.query(
      `INSERT INTO app_collections (key, data, updated_at) 
       VALUES ($1, $2, NOW()) 
       ON CONFLICT (key) DO UPDATE SET data = $2, updated_at = NOW()`,
      [collection, JSON.stringify(items)]
    );
  } catch (err) {
    console.error(`Error persisting collection "${collection}" to PostgreSQL:`, err.message);
  }
}

export async function initDb() {
  memoryStore = readLocalFile();

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.log('📁 Database: Using file-based storage (server/data/db.json)');
    return;
  }

  try {
    console.log('🐘 Database: Connecting to Cloud PostgreSQL...');
    pgPool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });

    // Create collections table if not exists
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS app_collections (
        key TEXT PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '[]'::jsonb,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Load existing collections from Postgres
    const res = await pgPool.query('SELECT key, data FROM app_collections');
    if (res.rows.length > 0) {
      for (const row of res.rows) {
        memoryStore[row.key] = Array.isArray(row.data)
          ? row.data
          : (typeof row.data === 'string' ? JSON.parse(row.data) : []);
      }
      console.log(`✅ Database: Connected to Cloud PostgreSQL (${res.rows.length} collections loaded)`);
    } else {
      console.log('🔄 Database: Initializing first-time cloud synchronization...');
      for (const key of Object.keys(memoryStore)) {
        await persistToPg(key, memoryStore[key]);
      }
      console.log('✅ Database: Initial data uploaded to Cloud PostgreSQL!');
    }
  } catch (err) {
    console.error('⚠️ Database: Could not connect to PostgreSQL. Using local file store.', err.message);
  }
}

function getStore() {
  if (!memoryStore) {
    memoryStore = readLocalFile();
  }
  return memoryStore;
}

export const db = {
  get: (collection) => {
    const data = getStore();
    return data[collection] || [];
  },

  find: (collection, predicate) => {
    const data = getStore();
    const items = data[collection] || [];
    return items.filter(predicate);
  },

  findOne: (collection, predicate) => {
    const data = getStore();
    const items = data[collection] || [];
    return items.find(predicate);
  },

  insert: (collection, item) => {
    const data = getStore();
    if (!data[collection]) data[collection] = [];
    data[collection].push(item);
    writeLocalFile(data);
    persistToPg(collection, data[collection]);
    return item;
  },

  update: (collection, predicate, updates) => {
    const data = getStore();
    const items = data[collection] || [];
    const index = items.findIndex(predicate);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    writeLocalFile(data);
    persistToPg(collection, items);
    return items[index];
  },

  delete: (collection, predicate) => {
    const data = getStore();
    const items = data[collection] || [];
    const index = items.findIndex(predicate);
    if (index === -1) return false;
    const [deleted] = items.splice(index, 1);
    writeLocalFile(data);
    persistToPg(collection, items);
    return deleted;
  },

  deleteMany: (collection, predicate) => {
    const data = getStore();
    const items = data[collection] || [];
    const remaining = items.filter(item => !predicate(item));
    const deletedCount = items.length - remaining.length;
    data[collection] = remaining;
    writeLocalFile(data);
    persistToPg(collection, remaining);
    return deletedCount;
  }
};

