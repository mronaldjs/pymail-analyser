import { Button } from "@/components/ui/button";
import { ThemeSelector } from "./ThemeSelector";
import { LogOut, ShieldCheck } from "lucide-react";
import { useReadiness } from "@/app/hooks/useReadiness";

interface DashboardHeaderProps {
  onDisconnect: () => void;
}

export function DashboardHeader({ onDisconnect }: DashboardHeaderProps) {
  const readiness = useReadiness();
  const vtEnabled = readiness?.virustotal_enabled === true;

  return (
    <header className="sticky top-0 z-50 -mx-4 px-4 sm:-mx-8 sm:px-8 py-3 bg-background/60 backdrop-blur-md border-b border-white/5 shadow-sm mb-6 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-linear-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 text-white font-bold text-lg">
          P
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-muted-foreground hidden sm:block">
          Inbox Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {vtEnabled && (
          <span
            title="VirusTotal is configured and being queried for domain reputation"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">VirusTotal Active</span>
          </span>
        )}
        <ThemeSelector />
        <Button
          variant="outline"
          onClick={onDisconnect}
          className="cursor-pointer border-white/10 hover:bg-white/5"
          size="sm"
        >
          <LogOut className="sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    </header>
  );
}
