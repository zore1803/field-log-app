import { FieldLog } from '../types';
import { loadLogs, patchLog } from '../storage/logRepository';

// Mock network submit — swap for a real API call. Randomly fails ~15% of the
// time so "Sync Failed" + manual retry has something real to exercise.
async function mockSubmitToServer(log: FieldLog): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 700));
  if (Math.random() < 0.15) {
    throw new Error('Network request failed (mock server error)');
  }
}

let isFlushing = false;

/**
 * Flushes the pending queue strictly FIFO (oldest createdAt first), one at a
 * time — a submission never jumps ahead of one still in flight.
 */
export async function flushQueue(
  isStillOnline: () => boolean,
  onChange?: (logs: FieldLog[]) => void
): Promise<void> {
  if (isFlushing) return;
  isFlushing = true;
  try {
    while (isStillOnline()) {
      const logs = await loadLogs();
      const next = logs
        .filter((l) => l.status === 'pending')
        .sort((a, b) => a.createdAt - b.createdAt)[0];
      if (!next) break;

      const syncing = await patchLog(next.id, { status: 'syncing' });
      onChange?.(syncing);

      try {
        await mockSubmitToServer(next);
        const updated = await patchLog(next.id, { status: 'synced', lastError: null });
        onChange?.(updated);
      } catch (err: any) {
        const updated = await patchLog(next.id, {
          status: 'failed',
          syncAttempts: next.syncAttempts + 1,
          lastError: err?.message ?? 'Unknown sync error',
        });
        onChange?.(updated);
        // Stop the FIFO run on failure so a jammed item doesn't get skipped
        // silently; user retries it manually and the queue resumes after.
        break;
      }
    }
  } finally {
    isFlushing = false;
  }
}

export async function retryLog(
  id: string,
  isStillOnline: () => boolean,
  onChange?: (logs: FieldLog[]) => void
): Promise<void> {
  const marked = await patchLog(id, { status: 'pending' });
  onChange?.(marked);
  await flushQueue(isStillOnline, onChange);
}
