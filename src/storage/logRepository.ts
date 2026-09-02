import { storage, LOGS_KEY } from './mmkv';
import { FieldLog } from '../types';

// All reads/writes go through this module so AsyncStorage stays the single
// source of truth and every caller (UI, sync engine) sees a consistent array
// shape. An in-memory cache backs synchronous-feeling call sites since
// AsyncStorage itself is inherently async.

let cache: FieldLog[] | null = null;

export async function loadLogs(): Promise<FieldLog[]> {
  if (cache) return cache;
  const raw = await storage.getItem(LOGS_KEY);
  if (!raw) {
    cache = [];
    return cache;
  }
  try {
    cache = JSON.parse(raw) as FieldLog[];
  } catch {
    cache = [];
  }
  return cache;
}

export async function saveLogs(logs: FieldLog[]): Promise<void> {
  cache = logs;
  await storage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export async function upsertLog(log: FieldLog): Promise<FieldLog[]> {
  const logs = await loadLogs();
  const idx = logs.findIndex((l) => l.id === log.id);
  if (idx >= 0) {
    logs[idx] = log;
  } else {
    logs.unshift(log); // newest first for display
  }
  await saveLogs(logs);
  return logs;
}

export async function patchLog(id: string, patch: Partial<FieldLog>): Promise<FieldLog[]> {
  const logs = await loadLogs();
  const idx = logs.findIndex((l) => l.id === id);
  if (idx >= 0) {
    logs[idx] = { ...logs[idx], ...patch };
    await saveLogs(logs);
  }
  return logs;
}

export async function deleteLog(id: string): Promise<FieldLog[]> {
  const logs = await loadLogs();
  const filtered = logs.filter((l) => l.id !== id);
  await saveLogs(filtered);
  return filtered;
}

export async function seedIfEmpty(seedFn: () => FieldLog[]): Promise<FieldLog[]> {
  const existing = await loadLogs();
  if (existing.length > 0) return existing;
  const seeded = seedFn();
  await saveLogs(seeded);
  return seeded;
}
