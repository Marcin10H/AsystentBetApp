import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { STORAGE_KEYS } from '../constants/storageKeys';
import type { Coupon, CouponStatus } from '../types/coupon';

type NewCouponInput = {
  nazwaBukmachera: string;
  stawka: number;
  kurs: number;
  potencjalnaWygrana: number;
  status: CouponStatus;
};

type CouponsContextValue = {
  coupons: Coupon[];
  loading: boolean;
  addCoupon: (input: NewCouponInput) => Promise<void>;
  updateCoupon: (id: string, patch: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  clearAllCoupons: () => Promise<void>;
};

const CouponsContext = createContext<CouponsContextValue | null>(null);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function parseCoupons(raw: string | null): Coupon[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw) as unknown;
    if (!Array.isArray(arr)) return [];
    return arr.map((item) => ({
      ...(item as Coupon),
      stawka: Number((item as Coupon).stawka),
      kurs: Number((item as Coupon).kurs),
      potencjalnaWygrana: Number((item as Coupon).potencjalnaWygrana),
    }));
  } catch {
    return [];
  }
}

export function CouponsProvider({ children }: { children: React.ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Wczytanie kuponów z pamięci lokalnej przy starcie
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.coupons);
        if (!cancelled) setCoupons(parseCoupons(raw));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Dodawanie / edycja / usuwanie + zapis do AsyncStorage
  const addCoupon = async (input: NewCouponInput) => {
    const row: Coupon = {
      id: generateId(),
      nazwaBukmachera: input.nazwaBukmachera.trim(),
      stawka: input.stawka,
      kurs: input.kurs,
      potencjalnaWygrana: input.potencjalnaWygrana,
      // Data w ISO, żeby potem łatwo filtrować po czasie
      dataDodania: new Date().toISOString(),
      status: input.status,
    };

    const next = [row, ...coupons];
    setCoupons(next);
    // Zapis do pamięci lokalnej
    await AsyncStorage.setItem(STORAGE_KEYS.coupons, JSON.stringify(next));
  };

  const updateCoupon = async (id: string, patch: Partial<Coupon>) => {
    const next = coupons.map((c) => (c.id === id ? { ...c, ...patch } : c));
    setCoupons(next);
    await AsyncStorage.setItem(STORAGE_KEYS.coupons, JSON.stringify(next));
  };

  const deleteCoupon = async (id: string) => {
    const next = coupons.filter((c) => c.id !== id);
    setCoupons(next);
    await AsyncStorage.setItem(STORAGE_KEYS.coupons, JSON.stringify(next));
  };

  /** Czyści tylko kupony (profil i motyw zostają — reset pełny robi Account). */
  const clearAllCoupons = async () => {
    setCoupons([]);
    await AsyncStorage.removeItem(STORAGE_KEYS.coupons);
  };

  const value = {
    coupons,
    loading,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    clearAllCoupons,
  };

  return (
    <CouponsContext.Provider value={value}>{children}</CouponsContext.Provider>
  );
}

export function useCoupons(): CouponsContextValue {
  const ctx = useContext(CouponsContext);
  if (!ctx) {
    throw new Error('useCoupons musi być użyte wewnątrz CouponsProvider');
  }
  return ctx;
}
