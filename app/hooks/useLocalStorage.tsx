import { useEffect, useState } from "react";

interface LocalStorage<T> {
  value: T;
  set: (newVal: T) => void;
  clear: () => void;
  ready: boolean;
}

export default function useLocalStorage<T>(
  key: string,
  defaultValue: T,
): LocalStorage<T> {
  // Always start with defaultValue so server and client render identically.
  // The real stored value is loaded in useEffect (client-only).
  const [value, setValue] = useState<T>(defaultValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = globalThis.localStorage.getItem(key);
      if (stored !== null) setValue(JSON.parse(stored) as T);
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
    }
    setReady(true);
  }, [key]);

  const set = (newVal: T) => {
    setValue(newVal);
    globalThis.localStorage.setItem(key, JSON.stringify(newVal));
  };

  const clear = () => {
    setValue(defaultValue);
    globalThis.localStorage.removeItem(key);
  };

  return { value, set, clear, ready };
}
