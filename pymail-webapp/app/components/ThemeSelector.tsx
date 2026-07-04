"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import {
  getAccentList,
  applyAccent,
  saveAccentPreference,
  loadAccentPreference,
} from "../styles/themes";

export function ThemeSelector() {
  const [accent, setAccent] = useState("mauve");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const accents = getAccentList();

  useEffect(() => {
    // Client-only: restore the saved accent and mark mounted so the theme
    // toggle can reflect the real resolved theme (unavailable during SSR).
    const saved = loadAccentPreference();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccent(saved);
    applyAccent(saved);
    setMounted(true);
  }, []);

  const pickAccent = (name: string) => {
    setAccent(name);
    applyAccent(name);
    saveAccentPreference(name);
  };

  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-3 py-1.5 backdrop-blur-sm">
      <div
        className="flex items-center gap-1.5"
        role="group"
        aria-label="Accent color"
      >
        {accents.map((a) => {
          const active = accent === a.name;
          return (
            <button
              key={a.name}
              type="button"
              aria-label={`Accent ${a.label}`}
              aria-pressed={active}
              title={a.label}
              onClick={() => pickAccent(a.name)}
              className="h-4 w-4 rounded-full transition-transform hover:scale-110 cursor-pointer"
              style={{
                backgroundColor: a.hex,
                boxShadow: active
                  ? `0 0 0 2px var(--background), 0 0 0 3.5px ${a.hex}`
                  : "none",
              }}
            />
          );
        })}
      </div>
      <span className="h-4 w-px bg-border" aria-hidden />
      <button
        type="button"
        aria-label="Toggle light and dark"
        title={isDark ? "Switch to light" : "Switch to dark"}
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
      >
        {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
    </div>
  );
}
