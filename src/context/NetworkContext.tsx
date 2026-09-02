import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { storage, NETWORK_OVERRIDE_KEY } from '../storage/mmkv';

interface NetworkContextValue {
  isDeviceOnline: boolean;
  forceOffline: boolean;
  isOnline: boolean; // effective: device online AND not forced offline
  setForceOffline: (v: boolean) => void;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [isDeviceOnline, setIsDeviceOnline] = useState(true);
  const [forceOffline, setForceOfflineState] = useState<boolean>(false);

  useEffect(() => {
    storage.getItem(NETWORK_OVERRIDE_KEY).then((v) => {
      if (v === 'true') setForceOfflineState(true);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsDeviceOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsubscribe();
  }, []);

  const setForceOffline = useCallback((v: boolean) => {
    storage.setItem(NETWORK_OVERRIDE_KEY, v ? 'true' : 'false');
    setForceOfflineState(v);
  }, []);

  const isOnline = isDeviceOnline && !forceOffline;

  return (
    <NetworkContext.Provider value={{ isDeviceOnline, forceOffline, isOnline, setForceOffline }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const ctx = useContext(NetworkContext);
  if (!ctx) throw new Error('useNetwork must be used within NetworkProvider');
  return ctx;
}
