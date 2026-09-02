import uuid from 'react-native-uuid';
import { FieldLog } from '../types';

const NAMES = [
  'Rohan Mehta', 'Priya Sharma', 'Amit Verma', 'Sneha Iyer', 'Vikram Singh',
  'Ananya Rao', 'Karan Malhotra', 'Divya Nair', 'Arjun Kapoor', 'Neha Gupta',
  'Rahul Joshi', 'Pooja Reddy', 'Sanjay Patel', 'Kavya Menon', 'Aditya Bose',
];

const NOTE_TEMPLATES = [
  'Meter reading verified, no discrepancies found.',
  'Customer reported intermittent power drop, escalated to L2.',
  'Basement panel inspected, wiring in good condition.',
  'Elevator machine room checked, temperature within range.',
  'New connection request logged, documents pending.',
  'Billing dispute noted, refund process initiated.',
  'Site visit completed, photos attached for records.',
  'Safety compliance check passed for this installation.',
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Indices near the front (most recent, top of list) that should render as
// Sync Failed, so the Retry affordance is immediately visible on launch.
const FAILED_AT_TOP = new Set([1, 2, 4, 6, 8, 10, 12, 14, 16, 18]);

export function generateSeedLogs(count = 120): FieldLog[] {
  const now = Date.now();
  const logs: FieldLog[] = [];
  for (let i = 0; i < count; i++) {
    const createdAt = now - i * 1000 * 60 * 37; // spread out over time, descending
    const failed = FAILED_AT_TOP.has(i);
    logs.push({
      id: uuid.v4() as string,
      customerName: randomFrom(NAMES),
      notes: randomFrom(NOTE_TEMPLATES),
      timestamp: createdAt,
      imageUri: null,
      status: failed ? 'failed' : 'synced',
      createdAt,
      syncAttempts: failed ? 1 : 0,
      lastError: failed ? 'Server timeout (mock)' : null,
    });
  }
  return logs;
}
