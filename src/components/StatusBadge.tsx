import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SyncStatus } from '../types';
import { colors, radius } from '../theme';

const CONFIG: Record<SyncStatus, { label: string; bg: string; fg: string }> = {
  synced: { label: 'Synced', bg: colors.successBg, fg: colors.success },
  pending: { label: 'Pending Sync', bg: colors.pendingBg, fg: colors.pendingText },
  syncing: { label: 'Syncing…', bg: colors.warningBg, fg: colors.warning },
  failed: { label: 'Sync Failed', bg: colors.dangerBg, fg: colors.danger },
};

function StatusBadgeImpl({ status }: { status: SyncStatus }) {
  const cfg = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.label, { color: cfg.fg }]}>{cfg.label}</Text>
    </View>
  );
}

export const StatusBadge = React.memo(StatusBadgeImpl);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
