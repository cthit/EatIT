import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { promises as fs } from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'eatit.db');

// Kept on globalThis so all route bundles and dev reloads share one connection
const globalForDb = globalThis as typeof globalThis & { eatitDb?: Promise<DatabaseSync> };

export function getDb(): Promise<DatabaseSync> {
  return (globalForDb.eatitDb ??= initDb());
}

async function initDb(): Promise<DatabaseSync> {
  await fs.mkdir(DATA_DIR, { recursive: true });

  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL'); // Better concurrency
  db.exec('PRAGMA foreign_keys = ON');

  return db;
}
