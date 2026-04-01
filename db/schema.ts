import * as SQLite from 'expo-sqlite';
import { DB_NAME } from '../constants/config';

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);
  await runMigrations(_db);
  return _db;
}

async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('product', 'room')),
      name TEXT NOT NULL,
      image_uri TEXT NOT NULL,
      overall_score REAL NOT NULL,
      risk_level TEXT NOT NULL CHECK(risk_level IN ('safe', 'low', 'moderate', 'high', 'critical')),
      response_json TEXT NOT NULL,
      analyzed_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_scans_type ON scans (type);
    CREATE INDEX IF NOT EXISTS idx_scans_risk_level ON scans (risk_level);
  `);
}
