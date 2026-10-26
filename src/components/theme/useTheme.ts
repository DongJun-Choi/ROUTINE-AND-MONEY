"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  readThemePreference,
  resolveTheme,
  saveThemePreference,
  THEME_CHANGE_EVENT,
  THEME_STORAGE_KEY,
  watchSystemTheme,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/theme";

// 사이드바와 모바일 상단 바에 전환 버튼이 함께 있어서, 한쪽에서 바꾸면 이벤트로 다른 쪽도 맞춘다.
export function useTheme() {
  const [preference, setPreferenceState] = useState<ThemePreference>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const sync = () => {
      const current = readThemePreference();
      setPreferenceState(current);
      setResolved(resolveTheme(current));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      applyTheme(readThemePreference());
      sync();
    };
    const stopWatchingSystem = watchSystemTheme(() => {
      if (readThemePreference() === "system") applyTheme("system");
      sync();
    });

    sync();
    window.addEventListener(THEME_CHANGE_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      stopWatchingSystem();
      window.removeEventListener(THEME_CHANGE_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    saveThemePreference(next);
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  return { preference, resolved, setPreference };
}
