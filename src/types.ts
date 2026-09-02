export type SyncStatus = 'synced' | 'pending' | 'syncing' | 'failed';

export interface FieldLog {
  id: string;
  customerName: string;
  notes: string;
  timestamp: number; // ms epoch, when the log was captured
  imageUri?: string | null;
  status: SyncStatus;
  createdAt: number; // ms epoch, insertion order for FIFO
  syncAttempts: number;
  lastError?: string | null;
}
