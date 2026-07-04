export interface Accent {
  name: string;
  label: string;
  hex: string;
  /** "r, g, b" for rgba() usage in raw CSS (glows, tints). */
  rgb: string;
}

// Curated accents that harmonize with the dark editorial palette. The disciplined
// dark/light base comes from globals.css (via next-themes); only the accent is
// user-pickable, mirroring the portfolio's single-accent architecture.
export const ACCENTS: Accent[] = [
  { name: "mauve", label: "Mauve", hex: "#c778dd", rgb: "199, 120, 221" },
  { name: "blue", label: "Blue", hex: "#61afef", rgb: "97, 175, 239" },
  { name: "green", label: "Green", hex: "#98c379", rgb: "152, 195, 121" },
  { name: "amber", label: "Amber", hex: "#e5c07b", rgb: "229, 192, 123" },
  { name: "rose", label: "Rose", hex: "#eb6f92", rgb: "235, 111, 146" },
  { name: "cyan", label: "Cyan", hex: "#56b6c2", rgb: "86, 182, 194" },
];

const STORAGE_KEY = "pymail-accent";
const DEFAULT_ACCENT = "mauve";

export function getAccentList(): Accent[] {
  return ACCENTS;
}

/** Override the accent-related CSS variables at runtime. */
export function applyAccent(name: string): void {
  const accent = ACCENTS.find((a) => a.name === name) ?? ACCENTS[0];
  const root = document.documentElement;
  root.style.setProperty("--accent", accent.hex);
  root.style.setProperty("--primary", accent.hex);
  root.style.setProperty("--ring", accent.hex);
  root.style.setProperty("--accent-rgb", accent.rgb);
}

export function saveAccentPreference(name: string): void {
  localStorage.setItem(STORAGE_KEY, name);
}

export function loadAccentPreference(): string {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_ACCENT;
}
