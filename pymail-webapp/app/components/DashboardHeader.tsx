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
    <header className="sticky top-0 z-50 -mx-4 mb-6 flex items-center justify-between border-b border-border bg-background/70 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:px-8">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-primary/50 bg-primary/10 font-bold text-primary">
          P
        </div>
        <div className="hidden sm:block">
          <p className="eyebrow leading-tight">Inbox</p>
          <h1 className="text-lg font-bold leading-tight tracking-tight">
            Dashboard
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {vtEnabled && (
          <span
            title="VirusTotal is configured and being queried for domain reputation"
            className="inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium"
            style={{
              color: "#98c379",
              borderColor: "rgba(152, 195, 121, 0.3)",
              backgroundColor: "rgba(152, 195, 121, 0.1)",
            }}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">VirusTotal Active</span>
          </span>
        )}
        <ThemeSelector />
        <Button variant="outline" onClick={onDisconnect} size="sm">
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    </header>
  );
}
