import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  onDisconnect: () => void;
}

export function DashboardHeader({ onDisconnect }: DashboardHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Painel da Caixa de Entrada
      </h1>
      <div className="flex items-center gap-2">
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
