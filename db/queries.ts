import { getDatabase } from './schema';
import type { StoredScan, ScanType, StoredRiskLevel } from '../types';

// ─── Insert ───────────────────────────────────────────────────────────────────

export async function insertScan(scan: StoredScan): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO scans (id, type, name, image_uri, overall_score, risk_level, response_json, analyzed_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      scan.id,
      scan.type,
      scan.name,
      scan.image_uri,
      scan.overall_score,
      scan.risk_level,
      scan.response_json,
      scan.analyzed_at,
      scan.created_at,
    ]
  );
}

// ─── Fetch All ────────────────────────────────────────────────────────────────

export interface FetchScansOptions {
  type?: ScanType;
  riskLevel?: StoredRiskLevel;
  search?: string;
  sortBy?: 'created_at' | 'overall_score' | 'risk_level';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
}

export async function fetchScans(options: FetchScansOptions = {}): Promise<StoredScan[]> {
  const db = await getDatabase();

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (options.type) {
    conditions.push('type = ?');
    params.push(options.type);
  }

  if (options.riskLevel) {
    conditions.push('risk_level = ?');
    params.push(options.riskLevel);
  }

  if (options.search && options.search.trim()) {
    conditions.push('name LIKE ?');
    params.push(`%${options.search.trim()}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sortBy = options.sortBy ?? 'created_at';
  const sortOrder = options.sortOrder ?? 'DESC';
  const limit = options.limit ?? 100;
  const offset = options.offset ?? 0;

  const rows = await db.getAllAsync<StoredScan>(
    `SELECT * FROM scans ${where} ORDER BY ${sortBy} ${sortOrder} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return rows;
}

// ─── Fetch Single ─────────────────────────────────────────────────────────────

export async function fetchScanById(id: string): Promise<StoredScan | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<StoredScan>(
    'SELECT * FROM scans WHERE id = ?',
    [id]
  );
  return row ?? null;
}

// ─── Fetch Recent ─────────────────────────────────────────────────────────────

export async function fetchRecentScans(limit = 5): Promise<StoredScan[]> {
  const db = await getDatabase();
  return db.getAllAsync<StoredScan>(
    'SELECT * FROM scans ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteScan(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM scans WHERE id = ?', [id]);
}

export async function deleteAllScans(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM scans');
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface LibraryStats {
  totalScans: number;
  averageScore: number;
  highRiskCount: number;
}

export async function fetchLibraryStats(): Promise<LibraryStats> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{
    totalScans: number;
    averageScore: number;
    highRiskCount: number;
  }>(
    `SELECT
       COUNT(*) as totalScans,
       COALESCE(AVG(overall_score), 0) as averageScore,
       SUM(CASE WHEN risk_level IN ('high', 'critical') THEN 1 ELSE 0 END) as highRiskCount
     FROM scans`
  );
  return row ?? { totalScans: 0, averageScore: 0, highRiskCount: 0 };
}

// ─── Weekly Trend ─────────────────────────────────────────────────────────────

export interface DailyScore {
  date: string;
  avgScore: number;
  count: number;
}

export async function fetchWeeklyTrend(): Promise<DailyScore[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DailyScore>(
    `SELECT
       date(created_at) as date,
       AVG(overall_score) as avgScore,
       COUNT(*) as count
     FROM scans
     WHERE created_at >= date('now', '-7 days')
     GROUP BY date(created_at)
     ORDER BY date ASC`
  );
  return rows;
}
