import { ScanProgress } from "@/types/api";
import { useState, useEffect } from "react";
import { ThemeSelector } from "./ThemeSelector";

interface LoadingScreenProps {
  progress?: ScanProgress;
}

function formatEta(seconds: number | null): string | null {
  if (seconds === null || seconds <= 0) return null;
  if (seconds < 60) return `~${seconds}s remaining`;
  const minutes = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  if (minutes < 60) {
    return remSec > 0
      ? `~${minutes}min ${remSec}s remaining`
      : `~${minutes}min remaining`;
  }
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return `~${hours}h ${remMin}min remaining`;
}

// Canonical scan phases, rendered as a terminal log.
const SCAN_PHASES = [
  { key: "fetching", label: "fetch inbox headers" },
  { key: "scanning", label: "scan unsubscribe links" },
  { key: "processing", label: "check domain reputation" },
] as const;

const TIPS = [
  "Unsubscribing from newsletters shrinks your digital footprint.",
  "Emails emit CO₂ — a cleaner inbox is a greener inbox.",
  "Check a sender's domain reputation to spot phishing.",
  "Archiving instead of deleting declutters while keeping history.",
];

function phaseDetail(phase: string, p?: ScanProgress): string {
  if (!p) return "";
  if (phase === "fetching") {
    const total = p.phaseTotal || p.current;
    return total > p.current
      ? `${p.current} of ~${total}`
      : `${p.current} emails`;
  }
  if (phase === "scanning") return `${p.current}/${p.phaseTotal}`;
  if (phase === "processing") return `${p.current}/${p.phaseTotal}`;
  return "";
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setTipIndex((prev) => (prev + 1) % TIPS.length),
      4500,
    );
    return () => clearInterval(interval);
  }, []);

  const phase = progress?.phase ?? "idle";
  const currentIdx = SCAN_PHASES.findIndex((s) => s.key === phase);
  const percentage = progress?.percentage ?? 0;
  const eta = progress ? formatEta(progress.etaSeconds) : null;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background p-4">
      {/* Quiet ambient wash (accent radial), no loud blobs. */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 50% at 22% 18%, rgba(var(--accent-rgb), 0.10), transparent 70%), radial-gradient(55% 45% at 80% 82%, rgba(var(--accent-rgb), 0.07), transparent 72%)",
        }}
      />

      <div className="absolute right-4 top-4 z-10">
        <ThemeSelector />
      </div>

      <div className="z-10 w-full max-w-xl space-y-4">
        {/* Terminal window */}
        <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
          {/* Top accent progress bar */}
          <div
            className="absolute left-0 top-0 h-0.5 bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />

          {/* Chrome bar */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
            <span className="h-3 w-3 rounded-full bg-destructive/70" />
            <span className="h-3 w-3 rounded-full bg-[#e5c07b]/70" />
            <span className="h-3 w-3 rounded-full bg-[#98c379]/70" />
            <span className="ml-3 text-xs text-muted-foreground">
              ~/pymail · analyze
            </span>
          </div>

          {/* Body — the live log */}
          <div className="space-y-2 p-5 text-sm leading-relaxed">
            <div className="text-muted-foreground">
              <span className="text-primary">$</span> pymail analyze --inbox
            </div>

            {SCAN_PHASES.map((s, i) => {
              const status =
                currentIdx === -1
                  ? percentage >= 100
                    ? "done"
                    : "pending"
                  : i < currentIdx
                    ? "done"
                    : i === currentIdx
                      ? "active"
                      : "pending";
              const detail = status === "pending" ? "" : phaseDetail(s.key, progress);
              return (
                <div
                  key={s.key}
                  className={`flex items-center gap-3 ${
                    status === "pending" ? "text-muted-foreground/40" : ""
                  }`}
                >
                  <span
                    className={
                      status === "done"
                        ? "text-[#98c379]"
                        : status === "active"
                          ? "text-primary"
                          : "text-muted-foreground/40"
                    }
                  >
                    {status === "done" ? "✓" : status === "active" ? "▸" : "·"}
                  </span>
                  <span
                    className={
                      status === "active" ? "text-foreground" : undefined
                    }
                  >
                    {s.label}
                  </span>
                  <span className="min-w-0 flex-1 border-b border-dashed border-border/50" />
                  <span
                    className={`tabular-nums ${
                      status === "active"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {detail}
                  </span>
                  {status === "active" && (
                    <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-primary" />
                  )}
                </div>
              );
            })}

            {/* Status line */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-primary">{percentage}%</span>
              {eta && <span className="text-muted-foreground">{eta}</span>}
            </div>
          </div>
        </div>

        {/* Rotating hint */}
        <p
          key={tipIndex}
          className="px-2 text-center text-xs text-muted-foreground/70 duration-500 animate-in fade-in text-balance"
        >
          {TIPS[tipIndex]}
        </p>
      </div>
    </main>
  );
}
