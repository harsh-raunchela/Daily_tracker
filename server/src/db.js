import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Structure
const initialData = {
  users: [],
  habits: [],
  habitRecords: [],
  tasks: [],
  journalEntries: [],
  rewards: [],
  monthlyScores: []
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading db.json, returning empty structure', err);
    return initialData;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export const db = {
  get: (collection) => {
    const data = readDb();
    return data[collection] || [];
  },

  find: (collection, predicate) => {
    const data = readDb();
    const items = data[collection] || [];
    return items.filter(predicate);
  },

  findOne: (collection, predicate) => {
    const data = readDb();
    const items = data[collection] || [];
    return items.find(predicate);
  },

  insert: (collection, item) => {
    const data = readDb();
    if (!data[collection]) data[collection] = [];
    data[collection].push(item);
    writeDb(data);
    return item;
  },

  update: (collection, predicate, updates) => {
    const data = readDb();
    const items = data[collection] || [];
    const index = items.findIndex(predicate);
    if (index === -1) return null;
    items[index] = { ...items[index], ...updates };
    writeDb(data);
    return items[index];
  },

  delete: (collection, predicate) => {
    const data = readDb();
    const items = data[collection] || [];
    const index = items.findIndex(predicate);
    if (index === -1) return false;
    const [deleted] = items.splice(index, 1);
    writeDb(data);
    return deleted;
  },

  deleteMany: (collection, predicate) => {
    const data = readDb();
    const items = data[collection] || [];
    const remaining = items.filter(item => !predicate(item));
    const deletedCount = items.length - remaining.length;
    data[collection] = remaining;
    writeDb(data);
    return deletedCount;
  }
};
