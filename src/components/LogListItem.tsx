import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FieldLog } from '../types';
import { StatusBadge } from './StatusBadge';
import { SpinningIcon } from './SpinningIcon';
import { colors, radius, spacing } from '../theme';

export const ITEM_HEIGHT = 96; // fixed row height — required for getItemLayout

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  log: FieldLog;
  onRetry: (id: string) => void;
  onDelete: (id: string) => void;
}

function LogListItemImpl({ log, onRetry, onDelete }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        {log.imageUri ? (
          <Image source={{ uri: log.imageUri }} style={styles.avatarImg} />
        ) : (
          <Text style={styles.avatarInitial}>{log.customerName.charAt(0).toUpperCase()}</Text>
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{log.customerName}</Text>
        <Text style={styles.notes} numberOfLines={1}>{log.notes}</Text>
        <Text style={styles.timestamp}>{formatTimestamp(log.timestamp)}</Text>
      </View>
      <View style={styles.right}>
        {log.status === 'syncing' ? (
          <View style={styles.syncingRow}>
            <SpinningIcon size={13} color={colors.warning} />
            <StatusBadge status={log.status} />
          </View>
        ) : (
          <StatusBadge status={log.status} />
        )}
        {log.status === 'failed' && (
          <TouchableOpacity style={styles.retryBtn} onPress={() => onRetry(log.id)}>
            <Ionicons name="refresh" size={14} color={colors.primary} />
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(log.id)}
        hitSlop={8}
      >
        <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

function areEqual(prev: Props, next: Props) {
  return (
    prev.log.id === next.log.id &&
    prev.log.status === next.log.status &&
    prev.log.customerName === next.log.customerName &&
    prev.log.notes === next.log.notes &&
    prev.log.timestamp === next.log.timestamp &&
    prev.log.imageUri === next.log.imageUri
  );
}

export const LogListItem = React.memo(LogListItemImpl, areEqual);

const styles = StyleSheet.create({
  row: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.chromeBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: {
    width: 44,
    height: 44,
  },
  avatarInitial: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  body: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  notes: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  syncingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  retryText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteBtn: {
    marginLeft: spacing.sm,
    padding: 4,
  },
});
