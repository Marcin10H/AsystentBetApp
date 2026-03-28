import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';

type UserProfileValue = {
  displayName: string;
  setDisplayName: (name: string) => Promise<void>;
};

const UserProfileContext = createContext<UserProfileValue | null>(null);

export function UserProfileProvider({ children }: { children: React.ReactNode }) {
  const [displayName, setDisplayNameState] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.displayName);
      if (!cancelled && raw) setDisplayNameState(raw);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setDisplayName = async (name: string) => {
    // Zapis imienia lokalnie (powitanie na podsumowaniu).
    const trimmed = name.trim();
    setDisplayNameState(trimmed);
    if (trimmed) await AsyncStorage.setItem(STORAGE_KEYS.displayName, trimmed);
    else await AsyncStorage.removeItem(STORAGE_KEYS.displayName);
  };

  const value = { displayName, setDisplayName };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile(): UserProfileValue {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    throw new Error('useUserProfile musi być wewnątrz UserProfileProvider');
  }
  return ctx;
}
