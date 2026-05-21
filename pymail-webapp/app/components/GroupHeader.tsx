import { ChevronDown, ChevronRight } from "lucide-react";
import { GroupStats } from "@/utils/senderSorting";

interface GroupHeaderProps {
  groupName: string;
  stats: GroupStats;
  isExpanded: boolean;
  onToggle: () => void;
}

export function GroupHeader({
  groupName,
  stats,
  isExpanded,
  onToggle,
}: GroupHeaderProps) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3 bg-muted/50 border-y border-border cursor-pointer hover:bg-muted/80 hover:shadow-md transition-all duration-300 ease-in-out hover:px-5"
      onClick={onToggle}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div className="flex items-center gap-3">
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-300 ease-in-out" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 ease-in-out" />
        )}
        <h3 className="text-sm font-semibold">{groupName}</h3>
        <span className="text-xs text-muted-foreground">
          ({stats.senderCount} sender{stats.senderCount !== 1 ? "s" : ""})
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="font-medium">
            {stats.totalEmails.toLocaleString()}
          </span>
          <span>emails</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium">{stats.averageSpamScore}</span>
          <span>avg spam</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-medium">{stats.averageOpenRate}%</span>
          <span>avg open</span>
        </div>
      </div>
    </div>
  );
}
