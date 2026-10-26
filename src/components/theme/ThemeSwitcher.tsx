"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/useTheme";
import HoverLabel from "@/components/ui/HoverLabel";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: "system", label: "시스템 설정 따르기", icon: Monitor },
  { value: "light", label: "라이트 모드", icon: Sun },
  { value: "dark", label: "다크 모드", icon: Moon },
];

export function ThemeSwitcher({ className = "" }: { className?: string }) {
  const { preference, setPreference } = useTheme();

  return (
    <div role="group" aria-label="화면 테마" className={`flex w-fit gap-0.5 rounded-[10px] border border-segment-line bg-segment p-[3px] ${className}`}>
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            aria-label={label}
            aria-pressed={active}
            onClick={() => setPreference(value)}
            className={`group relative flex size-9 items-center justify-center rounded-lg transition-colors ${active ? "bg-segment-active text-segment-active-text shadow-segment" : "text-icon hover:text-heading"}`}
          >
            <Icon size={17} strokeWidth={2} aria-hidden="true" />
            <HoverLabel text={label} />
          </button>
        );
      })}
    </div>
  );
}

export function ThemeToggleButton() {
  const { resolved, setPreference } = useTheme();
  const next = resolved === "dark" ? "light" : "dark";
  const Icon = resolved === "dark" ? Sun : Moon;
  const label = next === "dark" ? "다크 모드로 바꾸기" : "라이트 모드로 바꾸기";

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setPreference(next)}
      className="group relative flex size-11 items-center justify-center rounded-[10px] border border-line-control bg-surface text-ink transition-colors hover:bg-subtle"
    >
      <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
      <HoverLabel text={label} placement="bottom" />
    </button>
  );
}
