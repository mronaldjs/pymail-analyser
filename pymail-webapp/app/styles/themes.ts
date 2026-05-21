export interface ThemeColors {
  name: string;
  displayName: string;
  colors: {
    // Background colors
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;

    // Primary colors
    primary: string;
    primaryForeground: string;

    // Secondary colors
    secondary: string;
    secondaryForeground: string;

    // Muted colors
    muted: string;
    mutedForeground: string;

    // Accent colors
    accent: string;
    accentForeground: string;

    // Destructive colors
    destructive: string;
    destructiveForeground: string;

    // Border and input
    border: string;
    input: string;
    ring: string;

    // Special colors
    success: string;
    warning: string;
    info: string;

    // Gradient colors
    gradientFrom: string;
    gradientTo: string;
  };
}

export const themes: Record<string, ThemeColors> = {
  // Catppuccin Mocha - Soothing pastel theme
  catppuccin: {
    name: "catppuccin",
    displayName: "🌙 Catppuccin Mocha",
    colors: {
      background: "230 20% 11%", // #1e1e2e
      foreground: "226 64% 88%", // #cdd6f4
      card: "232 23% 14%", // #181825
      cardForeground: "226 64% 88%", // #cdd6f4
      popover: "232 23% 14%", // #181825
      popoverForeground: "226 64% 88%", // #cdd6f4

      primary: "267 84% 81%", // #cba6f7 (Mauve)
      primaryForeground: "230 20% 11%",

      secondary: "189 71% 73%", // #89dceb (Sky)
      secondaryForeground: "230 20% 11%",

      muted: "237 16% 23%", // #313244
      mutedForeground: "228 39% 80%", // #bac2de

      accent: "197 97% 75%", // #89b4fa (Blue)
      accentForeground: "230 20% 11%",

      destructive: "343 81% 75%", // #f38ba8 (Red)
      destructiveForeground: "230 20% 11%",

      border: "237 16% 23%", // #313244
      input: "237 16% 23%", // #313244
      ring: "267 84% 81%", // #cba6f7

      success: "115 54% 76%", // #a6e3a1 (Green)
      warning: "41 86% 83%", // #f9e2af (Yellow)
      info: "189 71% 73%", // #89dceb (Sky)

      gradientFrom: "267 84% 81%", // Mauve
      gradientTo: "197 97% 75%", // Blue
    },
  },

  // Catppuccin Latte - Light pastel theme
  catppuccinLatte: {
    name: "catppuccinLatte",
    displayName: "☀️ Catppuccin Latte",
    colors: {
      background: "220 23% 95%", // #eff1f5
      foreground: "234 16% 35%", // #4c4f69
      card: "0 0% 100%", // #ffffff
      cardForeground: "234 16% 35%",
      popover: "0 0% 100%",
      popoverForeground: "234 16% 35%",

      primary: "266 85% 58%", // #8839ef (Mauve)
      primaryForeground: "0 0% 100%",

      secondary: "199 76% 69%", // #04a5e5 (Sky)
      secondaryForeground: "0 0% 100%",

      muted: "233 13% 87%", // #dce0e8
      mutedForeground: "233 10% 47%", // #6c6f85

      accent: "220 91% 54%", // #1e66f5 (Blue)
      accentForeground: "0 0% 100%",

      destructive: "347 87% 44%", // #d20f39 (Red)
      destructiveForeground: "0 0% 100%",

      border: "233 13% 87%",
      input: "233 13% 87%",
      ring: "266 85% 58%",

      success: "109 58% 40%", // #40a02b (Green)
      warning: "35 77% 49%", // #df8e1d (Yellow)
      info: "199 76% 69%", // #04a5e5 (Sky)

      gradientFrom: "266 85% 58%",
      gradientTo: "220 91% 54%",
    },
  },

  // Nord - Arctic, north-bluish theme
  nord: {
    name: "nord",
    displayName: "❄️ Nord",
    colors: {
      background: "220 16% 22%", // #2e3440
      foreground: "218 27% 94%", // #eceff4
      card: "220 17% 20%", // #3b4252
      cardForeground: "218 27% 94%",
      popover: "220 17% 20%",
      popoverForeground: "218 27% 94%",

      primary: "193 43% 67%", // #88c0d0 (Frost)
      primaryForeground: "220 16% 22%",

      secondary: "179 25% 65%", // #8fbcbb (Frost)
      secondaryForeground: "220 16% 22%",

      muted: "222 16% 28%", // #434c5e
      mutedForeground: "220 16% 60%", // #d8dee9

      accent: "213 32% 52%", // #5e81ac (Frost)
      accentForeground: "218 27% 94%",

      destructive: "354 42% 56%", // #bf616a (Red)
      destructiveForeground: "218 27% 94%",

      border: "222 16% 28%",
      input: "222 16% 28%",
      ring: "193 43% 67%",

      success: "92 28% 65%", // #a3be8c (Green)
      warning: "29 54% 61%", // #ebcb8b (Yellow)
      info: "210 34% 63%", // #81a1c1 (Blue)

      gradientFrom: "193 43% 67%",
      gradientTo: "213 32% 52%",
    },
  },

  // Dracula - Dark theme with vibrant colors
  dracula: {
    name: "dracula",
    displayName: "🧛 Dracula",
    colors: {
      background: "231 15% 18%", // #282a36
      foreground: "60 30% 96%", // #f8f8f2
      card: "232 14% 20%", // #44475a
      cardForeground: "60 30% 96%",
      popover: "232 14% 20%",
      popoverForeground: "60 30% 96%",

      primary: "265 89% 78%", // #bd93f9 (Purple)
      primaryForeground: "231 15% 18%",

      secondary: "326 100% 74%", // #ff79c6 (Pink)
      secondaryForeground: "231 15% 18%",

      muted: "232 14% 31%", // #44475a
      mutedForeground: "231 15% 70%", // #6272a4

      accent: "191 97% 77%", // #8be9fd (Cyan)
      accentForeground: "231 15% 18%",

      destructive: "0 100% 67%", // #ff5555 (Red)
      destructiveForeground: "60 30% 96%",

      border: "232 14% 31%",
      input: "232 14% 31%",
      ring: "265 89% 78%",

      success: "135 94% 65%", // #50fa7b (Green)
      warning: "65 92% 76%", // #f1fa8c (Yellow)
      info: "191 97% 77%", // #8be9fd (Cyan)

      gradientFrom: "265 89% 78%",
      gradientTo: "191 97% 77%",
    },
  },

  // Tokyo Night - Clean, night city theme
  tokyoNight: {
    name: "tokyoNight",
    displayName: "🗼 Tokyo Night",
    colors: {
      background: "240 17% 11%", // #1a1b26
      foreground: "225 25% 80%", // #c0caf5
      card: "236 17% 13%", // #24283b
      cardForeground: "225 25% 80%",
      popover: "236 17% 13%",
      popoverForeground: "225 25% 80%",

      primary: "217 92% 76%", // #7aa2f7 (Blue)
      primaryForeground: "240 17% 11%",

      secondary: "199 89% 66%", // #2ac3de (Cyan)
      secondaryForeground: "240 17% 11%",

      muted: "235 14% 22%", // #414868
      mutedForeground: "223 14% 63%", // #9699a3

      accent: "267 67% 74%", // #bb9af7 (Purple)
      accentForeground: "240 17% 11%",

      destructive: "0 76% 70%", // #f7768e (Red)
      destructiveForeground: "240 17% 11%",

      border: "235 14% 22%",
      input: "235 14% 22%",
      ring: "217 92% 76%",

      success: "158 64% 52%", // #9ece6a (Green)
      warning: "41 90% 64%", // #e0af68 (Yellow)
      info: "199 89% 66%", // #2ac3de (Cyan)

      gradientFrom: "217 92% 76%",
      gradientTo: "267 67% 74%",
    },
  },

  // Gruvbox - Retro, warm colors
  gruvbox: {
    name: "gruvbox",
    displayName: "🎨 Gruvbox",
    colors: {
      background: "30 9% 20%", // #282828
      foreground: "42 11% 83%", // #ebdbb2
      card: "30 10% 16%", // #1d2021
      cardForeground: "42 11% 83%",
      popover: "30 10% 16%",
      popoverForeground: "42 11% 83%",

      primary: "180 25% 55%", // #689d6a (Aqua)
      primaryForeground: "30 9% 20%",

      secondary: "142 25% 55%", // #b8bb26 (Green)
      secondaryForeground: "30 9% 20%",

      muted: "30 9% 30%", // #3c3836
      mutedForeground: "40 11% 65%", // #bdae93

      accent: "24 29% 62%", // #d79921 (Yellow)
      accentForeground: "30 9% 20%",

      destructive: "4 69% 60%", // #fb4934 (Red)
      destructiveForeground: "42 11% 83%",

      border: "30 9% 30%",
      input: "30 9% 30%",
      ring: "180 25% 55%",

      success: "142 25% 55%", // #b8bb26 (Green)
      warning: "24 29% 62%", // #d79921 (Yellow)
      info: "180 25% 55%", // #689d6a (Aqua)

      gradientFrom: "180 25% 55%",
      gradientTo: "24 29% 62%",
    },
  },

  // Solarized - Precision colors for machines and people
  solarized: {
    name: "solarized",
    displayName: "🌅 Solarized",
    colors: {
      background: "192 100% 11%", // #002b36
      foreground: "44 87% 94%", // #fdf6e3
      card: "193 100% 12%", // #073642
      cardForeground: "44 87% 94%",
      popover: "193 100% 12%",
      popoverForeground: "44 87% 94%",

      primary: "205 69% 49%", // #268bd2 (Blue)
      primaryForeground: "44 87% 94%",

      secondary: "175 59% 40%", // #2aa198 (Cyan)
      secondaryForeground: "44 87% 94%",

      muted: "195 23% 25%", // #586e75
      mutedForeground: "186 8% 55%", // #839496

      accent: "68 100% 30%", // #859900 (Green)
      accentForeground: "44 87% 94%",

      destructive: "1 71% 52%", // #dc322f (Red)
      destructiveForeground: "44 87% 94%",

      border: "195 23% 25%",
      input: "195 23% 25%",
      ring: "205 69% 49%",

      success: "68 100% 30%", // #859900 (Green)
      warning: "45 100% 38%", // #b58900 (Yellow)
      info: "175 59% 40%", // #2aa198 (Cyan)

      gradientFrom: "205 69% 49%",
      gradientTo: "175 59% 40%",
    },
  },

  // Monokai - Bold, professional theme
  monokai: {
    name: "monokai",
    displayName: "💎 Monokai Pro",
    colors: {
      background: "60 1% 16%", // #2d2a2e
      foreground: "60 4% 95%", // #fcfcfa
      card: "300 2% 21%", // #403e41
      cardForeground: "60 4% 95%",
      popover: "300 2% 21%",
      popoverForeground: "60 4% 95%",

      primary: "330 82% 70%", // #ff6188 (Pink)
      primaryForeground: "60 1% 16%",

      secondary: "81 82% 69%", // #a9dc76 (Green)
      secondaryForeground: "60 1% 16%",

      muted: "270 2% 30%", // #5b595c
      mutedForeground: "60 2% 70%", // #939293

      accent: "186 100% 69%", // #78dce8 (Cyan)
      accentForeground: "60 1% 16%",

      destructive: "0 82% 70%", // #ff6188 (Red)
      destructiveForeground: "60 4% 95%",

      border: "270 2% 30%",
      input: "270 2% 30%",
      ring: "330 82% 70%",

      success: "81 82% 69%", // #a9dc76 (Green)
      warning: "54 100% 71%", // #ffd866 (Yellow)
      info: "186 100% 69%", // #78dce8 (Cyan)

      gradientFrom: "330 82% 70%",
      gradientTo: "186 100% 69%",
    },
  },

  // Ayu - Simple, elegant, modern
  ayu: {
    name: "ayu",
    displayName: "🎯 Ayu Dark",
    colors: {
      background: "213 19% 14%", // #0a0e14
      foreground: "46 11% 85%", // #e6e1cf
      card: "213 17% 17%", // #15191f
      cardForeground: "46 11% 85%",
      popover: "213 17% 17%",
      popoverForeground: "46 11% 85%",

      primary: "39 67% 69%", // #ffb454 (Orange)
      primaryForeground: "213 19% 14%",

      secondary: "95 38% 62%", // #86b300 (Green)
      secondaryForeground: "213 19% 14%",

      muted: "210 14% 23%", // #273747
      mutedForeground: "210 9% 55%", // #607080

      accent: "180 36% 54%", // #5ccfe6 (Cyan)
      accentForeground: "213 19% 14%",

      destructive: "359 65% 61%", // #f07178 (Red)
      destructiveForeground: "46 11% 85%",

      border: "210 14% 23%",
      input: "210 14% 23%",
      ring: "39 67% 69%",

      success: "95 38% 62%", // #86b300 (Green)
      warning: "39 67% 69%", // #ffb454 (Orange)
      info: "180 36% 54%", // #5ccfe6 (Cyan)

      gradientFrom: "39 67% 69%",
      gradientTo: "180 36% 54%",
    },
  },

  // One Dark Pro - Atom's iconic theme
  oneDark: {
    name: "oneDark",
    displayName: "⚛️ One Dark Pro",
    colors: {
      background: "220 13% 18%", // #282c34
      foreground: "219 14% 71%", // #abb2bf
      card: "220 12% 16%", // #21252b
      cardForeground: "219 14% 71%",
      popover: "220 12% 16%",
      popoverForeground: "219 14% 71%",

      primary: "207 82% 66%", // #61afef (Blue)
      primaryForeground: "220 13% 18%",

      secondary: "95 38% 62%", // #98c379 (Green)
      secondaryForeground: "220 13% 18%",

      muted: "220 9% 25%", // #3e4451
      mutedForeground: "218 10% 55%", // #5c6370

      accent: "286 60% 67%", // #c678dd (Purple)
      accentForeground: "220 13% 18%",

      destructive: "355 65% 65%", // #e06c75 (Red)
      destructiveForeground: "219 14% 71%",

      border: "220 9% 25%",
      input: "220 9% 25%",
      ring: "207 82% 66%",

      success: "95 38% 62%", // #98c379 (Green)
      warning: "39 67% 69%", // #e5c07b (Yellow)
      info: "187 47% 55%", // #56b6c2 (Cyan)

      gradientFrom: "207 82% 66%",
      gradientTo: "286 60% 67%",
    },
  },

  // GitHub Dark - GitHub's dark theme
  githubDark: {
    name: "githubDark",
    displayName: "🐙 GitHub Dark",
    colors: {
      background: "210 12% 8%", // #0d1117
      foreground: "213 27% 84%", // #c9d1d9
      card: "215 14% 10%", // #161b22
      cardForeground: "213 27% 84%",
      popover: "215 14% 10%",
      popoverForeground: "213 27% 84%",

      primary: "212 92% 60%", // #58a6ff (Blue)
      primaryForeground: "210 12% 8%",

      secondary: "137 55% 71%", // #7ee787 (Green)
      secondaryForeground: "210 12% 8%",

      muted: "215 14% 14%", // #21262d
      mutedForeground: "215 12% 52%", // #8b949e

      accent: "316 74% 73%", // #f778ba (Pink)
      accentForeground: "210 12% 8%",

      destructive: "0 73% 67%", // #f85149 (Red)
      destructiveForeground: "213 27% 84%",

      border: "215 14% 14%",
      input: "215 14% 14%",
      ring: "212 92% 60%",

      success: "137 55% 71%", // #7ee787 (Green)
      warning: "41 88% 75%", // #f0c869 (Yellow)
      info: "212 92% 60%", // #58a6ff (Blue)

      gradientFrom: "212 92% 60%",
      gradientTo: "316 74% 73%",
    },
  },

  // Rosé Pine - All natural pine, faux fur and a bit of soho vibes
  rosePine: {
    name: "rosePine",
    displayName: "🌹 Rosé Pine",
    colors: {
      background: "246 24% 10%", // #191724
      foreground: "245 50% 91%", // #e0def4
      card: "249 22% 12%", // #1f1d2e
      cardForeground: "245 50% 91%",
      popover: "249 22% 12%",
      popoverForeground: "245 50% 91%",

      primary: "245 58% 82%", // #c4a7e7 (Iris)
      primaryForeground: "246 24% 10%",

      secondary: "2 66% 83%", // #ebbcba (Rose)
      secondaryForeground: "246 24% 10%",

      muted: "248 25% 18%", // #26233a
      mutedForeground: "249 12% 47%", // #6e6a86

      accent: "189 43% 73%", // #9ccfd8 (Foam)
      accentForeground: "246 24% 10%",

      destructive: "343 76% 68%", // #eb6f92 (Love)
      destructiveForeground: "245 50% 91%",

      border: "248 25% 18%",
      input: "248 25% 18%",
      ring: "245 58% 82%",

      success: "35 71% 68%", // #f6c177 (Gold)
      warning: "35 71% 68%", // #f6c177 (Gold)
      info: "189 43% 73%", // #9ccfd8 (Foam)

      gradientFrom: "245 58% 82%",
      gradientTo: "189 43% 73%",
    },
  },

  // Horizon - Beautifully warm dual theme
  horizon: {
    name: "horizon",
    displayName: "🌄 Horizon",
    colors: {
      background: "240 6% 13%", // #1c1e26
      foreground: "60 6% 84%", // #e3e6ee
      card: "236 6% 16%", // #232530
      cardForeground: "60 6% 84%",
      popover: "236 6% 16%",
      popoverForeground: "60 6% 84%",

      primary: "327 100% 74%", // #f075b7 (Pink)
      primaryForeground: "240 6% 13%",

      secondary: "355 92% 70%", // #f43e5c (Red)
      secondaryForeground: "240 6% 13%",

      muted: "232 6% 21%", // #2e303e
      mutedForeground: "233 5% 52%", // #6c6f93

      accent: "171 100% 66%", // #00e8c6 (Teal)
      accentForeground: "240 6% 13%",

      destructive: "355 92% 70%", // #f43e5c (Red)
      destructiveForeground: "60 6% 84%",

      border: "232 6% 21%",
      input: "232 6% 21%",
      ring: "327 100% 74%",

      success: "163 100% 66%", // #09f7a0 (Green)
      warning: "37 95% 73%", // #fab795 (Orange)
      info: "171 100% 66%", // #00e8c6 (Teal)

      gradientFrom: "327 100% 74%",
      gradientTo: "171 100% 66%",
    },
  },
};

export function getThemeList(): { value: string; label: string }[] {
  return Object.values(themes).map((theme) => ({
    value: theme.name,
    label: theme.displayName,
  }));
}

export function applyTheme(themeName: string) {
  const theme = themes[themeName];
  if (!theme) return;

  const root = document.documentElement;
  const { colors } = theme;

  // Apply all CSS variables
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--card", colors.card);
  root.style.setProperty("--card-foreground", colors.cardForeground);
  root.style.setProperty("--popover", colors.popover);
  root.style.setProperty("--popover-foreground", colors.popoverForeground);
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--primary-foreground", colors.primaryForeground);
  root.style.setProperty("--secondary", colors.secondary);
  root.style.setProperty("--secondary-foreground", colors.secondaryForeground);
  root.style.setProperty("--muted", colors.muted);
  root.style.setProperty("--muted-foreground", colors.mutedForeground);
  root.style.setProperty("--accent", colors.accent);
  root.style.setProperty("--accent-foreground", colors.accentForeground);
  root.style.setProperty("--destructive", colors.destructive);
  root.style.setProperty(
    "--destructive-foreground",
    colors.destructiveForeground,
  );
  root.style.setProperty("--border", colors.border);
  root.style.setProperty("--input", colors.input);
  root.style.setProperty("--ring", colors.ring);
  root.style.setProperty("--success", colors.success);
  root.style.setProperty("--warning", colors.warning);
  root.style.setProperty("--info", colors.info);
  root.style.setProperty("--gradient-from", colors.gradientFrom);
  root.style.setProperty("--gradient-to", colors.gradientTo);
}

export function saveThemePreference(themeName: string) {
  localStorage.setItem("pymail-theme", themeName);
}

export function loadThemePreference(): string {
  return localStorage.getItem("pymail-theme") || "catppuccin";
}
