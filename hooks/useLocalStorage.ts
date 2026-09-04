'use client';
import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_EVENT = 'mimikara_localstorage_sync';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Sync from localStorage on mount and when key changes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          setStoredValue(JSON.parse(item));
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
  }, [key]);

  // Listen for sync events triggered by other components in the same window
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ key: string; value: T }>;
      if (customEvent.detail && customEvent.detail.key === key) {
        setStoredValue(customEvent.detail.value);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener(LOCAL_STORAGE_EVENT, handleSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(LOCAL_STORAGE_EVENT, handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [key]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue(current => {
        const valueToStore = value instanceof Function ? value(current) : value;
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.dispatchEvent(
            new CustomEvent(LOCAL_STORAGE_EVENT, {
              detail: { key, value: valueToStore },
            })
          );
        }
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  }, [key]);

  return [storedValue, setValue] as const;
}

