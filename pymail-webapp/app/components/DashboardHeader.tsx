import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut, ShieldCheck } from "lucide-react";
import { useReadiness } from "@/app/hooks/useReadiness";

interface DashboardHeaderProps {
  onDisconnect: () => void;
}

export function DashboardHeader({ onDisconnect }: DashboardHeaderProps) {
  const readiness = useReadiness();
  const vtEnabled = readiness?.virustotal_enabled === true;

  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Painel da Caixa de Entrada
      </h1>
      <div className="flex items-center gap-2">
        {vtEnabled && (
          <span
            title="VirusTotal está configurado e sendo consultado para reputação de domínios"
            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            VirusTotal ativo
          </span>
        )}
        <ThemeToggle />
        <Button
          variant="outline"
          onClick={onDisconnect}
          className="cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" /> Desconectar
        </Button>
      </div>
    </div>
  );
}
