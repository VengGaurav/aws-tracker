import { useState, useEffect } from "react";

export default function useLocalStorageState(key, defaultValue) {
  const [value, setValue] = useState(() => {
    const json = localStorage.getItem(key);
    return json ? JSON.parse(json) : defaultValue;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

