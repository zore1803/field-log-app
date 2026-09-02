import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLogs } from '../context/LogsContext';
import { LogListItem, ITEM_HEIGHT } from '../components/LogListItem';
import { NetworkBanner } from '../components/NetworkBanner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FieldLog } from '../types';
import { colors, radius, spacing } from '../theme';

interface Props {
  onAddPress: () => void;
}

export function LogListScreen({ onAddPress }: Props) {
  const { logs, isLoading, retry, deleteLog, failedCount } = useLogs();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const keyExtractor = useCallback((item: FieldLog) => item.id, []);

  const getItemLayout = useCallback(
    (_: ArrayLike<FieldLog> | null | undefined, index: number) => ({
      length: ITEM_HEIGHT,
      offset: ITEM_HEIGHT * index,
      index,
    }),
    []
  );

  const requestDelete = useCallback((id: string) => setPendingDeleteId(id), []);

  const renderItem = useCallback(
    ({ item }: { item: FieldLog }) => (
      <LogListItem log={item} onRetry={retry} onDelete={requestDelete} />
    ),
    [retry, requestDelete]
  );

  const header = useMemo(
    () => (
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Field Logs</Text>
        {failedCount > 0 && (
          <View style={styles.failedPill}>
            <Ionicons name="alert-circle" size={14} color={colors.danger} />
            <Text style={styles.failedPillText}>{failedCount} failed</Text>
          </View>
        )}
      </View>
    ),
    [failedCount]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <NetworkBanner />
      {header}

      {isLoading ? (
        <View style={styles.centerFill}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.centerText}>Loading logs…</Text>
        </View>
      ) : logs.length === 0 ? (
        <View style={styles.centerFill}>
          <Ionicons name="document-text-outline" size={40} color={colors.textMuted} />
          <Text style={styles.centerText}>No field logs yet</Text>
          <Text style={styles.centerSubText}>Tap the + button to add your first log.</Text>
        </View>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          getItemLayout={getItemLayout}
          initialNumToRender={12}
          maxToRenderPerBatch={12}
          windowSize={7}
          removeClippedSubviews
          contentContainerStyle={{ paddingBottom: 96 }}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={onAddPress} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <ConfirmDialog
        visible={pendingDeleteId !== null}
        variant="delete"
        title="Delete this log?"
        message="Do you want to delete it permanently? This action cannot be undone."
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) deleteLog(pendingDeleteId);
          setPendingDeleteId(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  failedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.dangerBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  failedPillText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  centerFill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  centerText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  centerSubText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: spacing.xl,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
