import React from 'react';
import { View, Text, StyleSheet, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '../context/NetworkContext';
import { useLogs } from '../context/LogsContext';
import { colors, radius, spacing } from '../theme';

export function NetworkBanner() {
  const { isOnline, isDeviceOnline, forceOffline, setForceOffline } = useNetwork();
  const { pendingCount } = useLogs();

  return (
    <View style={[styles.wrap, { backgroundColor: isOnline ? colors.chromeBg : colors.dangerBg }]}>
      <View style={styles.left}>
        <Ionicons
          name={isOnline ? 'cloud-done-outline' : 'cloud-offline-outline'}
          size={16}
          color={isOnline ? colors.primary : colors.danger}
        />
        <Text style={[styles.statusText, { color: isOnline ? colors.primary : colors.danger }]}>
          {isOnline ? 'Online' : 'Offline'}
          {pendingCount > 0 ? ` · ${pendingCount} queued` : ''}
        </Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.toggleLabel}>Force Offline (dev)</Text>
        <Switch
          value={forceOffline}
          onValueChange={setForceOffline}
          trackColor={{ true: colors.primary, false: '#ccc' }}
          thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
