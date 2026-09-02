import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import uuid from 'react-native-uuid';
import { FieldLog } from '../types';
import { loadLogs, upsertLog, deleteLog as deleteLogFromStorage, seedIfEmpty } from '../storage/logRepository';
import { generateSeedLogs } from '../utils/seed';
import { flushQueue, retryLog } from '../sync/syncEngine';
import { useNetwork } from './NetworkContext';

interface NewLogInput {
  customerName: string;
  notes: string;
  timestamp: number;
  imageUri?: string | null;
}

interface LogsContextValue {
  logs: FieldLog[];
  isLoading: boolean;
  addLog: (input: NewLogInput) => void;
  retry: (id: string) => void;
  deleteLog: (id: string) => void;
  pendingCount: number;
  failedCount: number;
}

const LogsContext = createContext<LogsContextValue | undefined>(undefined);

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const { isOnline } = useNetwork();
  const [logs, setLogs] = useState<FieldLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isOnlineRef = useRef(isOnline);
  isOnlineRef.current = isOnline;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const initial = await seedIfEmpty(() => generateSeedLogs(120));
      if (cancelled) return;
      setLogs(initial);
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const isStillOnline = useCallback(() => isOnlineRef.current, []);

  useEffect(() => {
    if (isOnline && !isLoading) {
      flushQueue(isStillOnline, setLogs);
    }
  }, [isOnline, isLoading, isStillOnline]);

  const addLog = useCallback(
    (input: NewLogInput) => {
      const log: FieldLog = {
        id: uuid.v4() as string,
        customerName: input.customerName,
        notes: input.notes,
        timestamp: input.timestamp,
        imageUri: input.imageUri ?? null,
        status: 'pending',
        createdAt: Date.now(),
        syncAttempts: 0,
        lastError: null,
      };
      (async () => {
        const updated = await upsertLog(log);
        setLogs([...updated]);
        if (isOnlineRef.current) {
          flushQueue(isStillOnline, setLogs);
        }
      })();
    },
    [isStillOnline]
  );

  const retry = useCallback(
    (id: string) => {
      retryLog(id, isStillOnline, setLogs);
    },
    [isStillOnline]
  );

  const deleteLog = useCallback((id: string) => {
    (async () => {
      const updated = await deleteLogFromStorage(id);
      setLogs([...updated]);
    })();
  }, []);

  const pendingCount = logs.filter((l) => l.status === 'pending' || l.status === 'syncing').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;

  return (
    <LogsContext.Provider
      value={{ logs, isLoading, addLog, retry, deleteLog, pendingCount, failedCount }}
    >
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  const ctx = useContext(LogsContext);
  if (!ctx) throw new Error('useLogs must be used within LogsProvider');
  return ctx;
}
