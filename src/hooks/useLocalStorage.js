import { useCallback, useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (error) {
      console.error('Failed to read localStorage', error);
      return initialValue;
    }
  });

  const saveValue = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch (error) {
          console.error('Failed to save localStorage', error);
        }
        return resolved;
      });
    },
    [key]
  );

  useEffect(() => {
    function handleStorage(event) {
      if (event.key === key && event.newValue) {
        setValue(JSON.parse(event.newValue));
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [key]);

  return [value, saveValue];
}
