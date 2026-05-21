"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getThemeList,
  applyTheme,
  saveThemePreference,
  loadThemePreference,
} from "../styles/themes";

export function ThemeSelector() {
  const [currentTheme, setCurrentTheme] = useState<string>("catppuccin");
  const themes = getThemeList();

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = loadThemePreference();
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const handleThemeChange = (themeName: string) => {
    setCurrentTheme(themeName);
    applyTheme(themeName);
    saveThemePreference(themeName);
  };

  return (
    <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-border/50 shadow-sm">
      <Palette className="h-4 w-4 text-primary" />
      <Select value={currentTheme} onValueChange={handleThemeChange}>
        <SelectTrigger className="w-[160px] h-8 border-0 bg-transparent shadow-none hover:bg-transparent focus:ring-0">
          <SelectValue placeholder="Select theme" />
        </SelectTrigger>
        <SelectContent className="max-h-[400px]">
          {themes.map((theme) => (
            <SelectItem
              key={theme.value}
              value={theme.value}
              className="cursor-pointer"
            >
              {theme.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
