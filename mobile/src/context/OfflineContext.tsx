import React, { createContext, useContext, useState, useEffect } from 'react';
import { offlineStorage } from '../services/offlineStorage';

interface OfflineContextType {
  isOffline: boolean;
  syncing: boolean;
  pendingSyncCount: number;
  toggleOfflineSimulation: () => void;
  triggerSync: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType>({} as OfflineContextType);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);

  useEffect(() => {
    checkQueue();
  }, []);

  const checkQueue = async () => {
    const queue = await offlineStorage.getSyncQueue();
    setPendingSyncCount(queue.length);
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const queue = await offlineStorage.getSyncQueue();
      if (queue.length > 0) {
        // Attempt to flush offline mutations
        await offlineStorage.clearSyncQueue();
        setPendingSyncCount(0);
      }
    } finally {
      setSyncing(false);
    }
  };

  const toggleOfflineSimulation = () => {
    setIsOffline((prev) => !prev);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOffline,
        syncing,
        pendingSyncCount,
        toggleOfflineSimulation,
        triggerSync,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => useContext(OfflineContext);
