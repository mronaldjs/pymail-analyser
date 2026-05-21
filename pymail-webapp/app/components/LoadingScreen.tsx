import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
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

function IndeterminateBar() {
  return (
    <div className="relative w-full h-2 overflow-hidden rounded-full bg-slate-700/50">
      <div className="absolute top-0 bottom-0 rounded-full bg-linear-to-r from-primary to-accent animate-indeterminate" />
    </div>
  );
}

const TIPS = [
  "Unsubscribing from newsletters reduces your digital footprint.",
  "Emails emit CO2. A cleaner inbox is a greener inbox.",
  "Check your sender's domain reputation to avoid phishing.",
  "Review high-risk senders frequently to protect your account.",
  "Archiving instead of deleting preserves history while decluttering.",
];

export function LoadingScreen({ progress }: LoadingScreenProps) {
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const getPhaseMessage = () => {
    if (!progress) return "Analyzing your inbox...";
    switch (progress.phase) {
      case "counting":
        return "Counting emails in period...";
      case "fetching":
        return "Fetching emails from inbox...";
      case "scanning":
        return "Scanning for unsubscribe links...";
      case "processing":
        return "Checking domain reputation...";
      default:
        return "Analyzing your inbox...";
    }
  };

  const getProgressDetails = () => {
    if (!progress || progress.phase === "idle") {
      return "This may take a few seconds";
    }
    if (progress.phase === "counting") return "Querying the IMAP server";
    if (progress.phase === "fetching") {
      const total = progress.phaseTotal || progress.current;
      return `${progress.current.toLocaleString()} ${total > progress.current ? `of ~${total.toLocaleString()}` : ""} emails processed`.trim();
    }
    if (progress.phase === "scanning")
      return `${progress.current} of ${progress.phaseTotal} messages scanned`;
    if (progress.phase === "processing")
      return `${progress.current} of ${progress.phaseTotal} domains checked`;
    return "Processing...";
  };

  const isCounting = progress?.phase === "counting";
  const showDeterminateBar =
    progress &&
    progress.phase !== "idle" &&
    progress.phase !== "counting" &&
    progress.percentage > 0;
  const eta = progress ? formatEta(progress.etaSeconds) : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-br from-background via-background to-primary/20 p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-1/4 right-1/4 w-[50%] h-[50%] bg-accent/20 blur-[120px] rounded-full pointer-events-none animate-pulse duration-7000 delay-1000" />

      <div className="absolute top-4 right-4 z-10">
        <ThemeSelector />
      </div>

      <div className="flex flex-col items-center space-y-8 w-full max-w-md z-10">
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full animate-ping duration-3000" />
          <Loader2 className="w-16 h-16 text-primary animate-spin duration-1000" />
        </div>

        <div className="glass-card w-full p-8 rounded-2xl text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-primary to-accent">
              {getPhaseMessage()}
            </h2>
            <p className="text-muted-foreground font-medium">
              {getProgressDetails()}
            </p>
          </div>

          {showDeterminateBar && (
            <div className="mt-6 space-y-2 w-full animate-in fade-in slide-in-from-bottom-2">
              <Progress
                value={progress.percentage}
                className="w-full h-2 bg-slate-700/50"
              />
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-primary">{progress.percentage}%</span>
                {eta && <span className="text-accent">{eta}</span>}
              </div>
            </div>
          )}

          {isCounting && (
            <div className="mt-6 w-full animate-in fade-in slide-in-from-bottom-2">
              <IndeterminateBar />
            </div>
          )}

          {!progress && (
            <div className="mt-6 flex justify-center gap-1.5 animate-in fade-in slide-in-from-bottom-2">
              <div
                className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="w-2.5 h-2.5 bg-accent rounded-full animate-bounce"
                style={{ animationDelay: "0.15s" }}
              />
              <div
                className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          )}
        </div>

        <div className="h-12 flex items-center justify-center overflow-hidden w-full text-center px-4">
          <p
            key={tipIndex}
            className="text-sm font-medium text-muted-foreground/80 animate-in fade-in slide-in-from-bottom-4 duration-500 text-balance"
          >
            💡 {TIPS[tipIndex]}
          </p>
        </div>
      </div>
    </main>
  );
}
