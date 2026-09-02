import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Modal, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NetworkProvider } from './src/context/NetworkContext';
import { LogsProvider } from './src/context/LogsContext';
import { LogListScreen } from './src/screens/LogListScreen';
import { NewLogScreen } from './src/screens/NewLogScreen';
import { ConfirmDialog } from './src/components/ConfirmDialog';

const queryClient = new QueryClient();

export default function App() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [dialog, setDialog] = useState<{ variant: 'success' | 'offline' } | null>(null);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NetworkProvider>
          <LogsProvider>
            <LogListScreen onAddPress={() => setIsAddOpen(true)} />
            <Modal
              visible={isAddOpen}
              animationType="slide"
              presentationStyle="pageSheet"
              onRequestClose={() => setIsAddOpen(false)}
            >
              <NewLogScreen
                onClose={() => setIsAddOpen(false)}
                onSubmitted={(variant) => setDialog({ variant })}
              />
            </Modal>
            <ConfirmDialog
              visible={dialog !== null}
              variant={dialog?.variant ?? 'success'}
              title={dialog?.variant === 'offline' ? 'Saved offline' : 'Submitted'}
              message={
                dialog?.variant === 'offline'
                  ? "You're offline — this log is queued and will sync automatically once connectivity returns."
                  : 'Your log was queued and will sync shortly.'
              }
              onClose={() => setDialog(null)}
            />
            <StatusBar style="auto" />
          </LogsProvider>
        </NetworkProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({});
