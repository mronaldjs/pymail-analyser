import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { List, LayoutGrid, Archive, Trash2 } from "lucide-react";
import { SortingControls } from "./SortingControls";
import { SortField, SortDirection, GroupBy } from "@/utils/senderSorting";

interface SendersHeaderProps {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  groupingMode: "tenant" | "provider";
  groupingHint: string;
  selectedCount: number;
  visibleCount: number;
  sortField: SortField;
  sortDirection: SortDirection;
  groupBy: GroupBy;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
  onGroupByChange: (groupBy: GroupBy) => void;
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
  sortField,
  sortDirection,
  groupBy,
  onSortFieldChange,
  onSortDirectionChange,
  onGroupByChange,
  onArchiveSelected,
  onDeleteSelected,
}: SendersHeaderProps) {
  return (
    <CardHeader>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <CardTitle>Top Offenders</CardTitle>
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

        <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="eyebrow">
            Grouping Mode:{" "}
            {groupingMode === "tenant"
              ? "tenant (detailed)"
              : "provider (consolidated)"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">{groupingHint}</p>
        </div>

        {/* Source filters removed: tag list eliminated due to displaying too many irrelevant labels */}

        <SortingControls
          sortField={sortField}
          sortDirection={sortDirection}
          groupBy={groupBy}
          onSortFieldChange={onSortFieldChange}
          onSortDirectionChange={onSortDirectionChange}
          onGroupByChange={onGroupByChange}
        />

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedCount} selected • {visibleCount} visible
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={onArchiveSelected}
              disabled={selectedCount === 0}
              className="cursor-pointer"
            >
              <Archive className="h-4 w-4 mr-1" /> Archive Selected
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={onDeleteSelected}
              disabled={selectedCount === 0}
              className="cursor-pointer"
            >
              <Trash2 className="h-4 w-4 mr-1" /> Delete Selected
            </Button>
          </div>
        </div>
      </div>
    </CardHeader>
  );
}
