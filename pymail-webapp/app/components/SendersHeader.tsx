import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid, Archive, Trash2 } from "lucide-react";

interface SendersHeaderProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  groupingMode: "tenant" | "provider";
  groupingHint: string;
  selectedCount: number;
  visibleCount: number;
  onArchiveSelected: () => void;
  onDeleteSelected: () => void;
}

export function SendersHeader({
  viewMode,
  setViewMode,
  groupingMode,
  groupingHint,
  selectedCount,
  visibleCount,
  onArchiveSelected,
  onDeleteSelected,
}: SendersHeaderProps) {
  return (
    <CardHeader>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <CardTitle>Principais Ofensores</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="cursor-pointer"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "outline"}
              onClick={() => setViewMode("grid")}
              className="cursor-pointer"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            Modo de agrupamento:{" "}
            {groupingMode === "tenant"
              ? "tenant (detalhado)"
              : "provider (consolidado)"}
          </p>
          <p className="text-xs text-muted-foreground">{groupingHint}</p>
        </div>

        {/* Filtros de fonte removidos: lista de tags eliminada por exibir muitos rótulos irrelevantes */}

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedCount} selecionado(s) • {visibleCount} visível(is)
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onArchiveSelected}
              disabled={selectedCount === 0}
              className="cursor-pointer"
            >
              <Archive className="h-4 w-4 mr-1" /> Arquivar selecionados
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onDeleteSelected}
              disabled={selectedCount === 0}
              className="cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Excluir selecionados
            </Button>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
