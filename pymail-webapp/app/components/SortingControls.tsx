import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import {
  SortField,
  SortDirection,
  GroupBy,
  getSortFieldLabel,
  getGroupByLabel,
} from "@/utils/senderSorting";

interface SortingControlsProps {
  sortField: SortField;
  sortDirection: SortDirection;
  groupBy: GroupBy;
  onSortFieldChange: (field: SortField) => void;
  onSortDirectionChange: (direction: SortDirection) => void;
  onGroupByChange: (groupBy: GroupBy) => void;
}

export function SortingControls({
  sortField,
  sortDirection,
  groupBy,
  onSortFieldChange,
  onSortDirectionChange,
  onGroupByChange,
}: SortingControlsProps) {
  const sortFields: SortField[] = [
    "email_count",
    "spam_score",
    "open_rate",
    "sender_name",
    "sender_alphanum",
    "sender_email",
  ];

  const groupByOptions: GroupBy[] = ["none", "domain", "open_rate_range"];

  const toggleDirection = () => {
    onSortDirectionChange(sortDirection === "asc" ? "desc" : "asc");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          Group by:
        </label>
        <Select
          value={groupBy}
          onValueChange={(value) => onGroupByChange(value as GroupBy)}
        >
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue placeholder="Select grouping" />
          </SelectTrigger>
          <SelectContent>
            {groupByOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {getGroupByLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          Sort by:
        </label>
        <Select
          value={sortField}
          onValueChange={(value) => onSortFieldChange(value as SortField)}
        >
          <SelectTrigger className="w-40 h-9">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {sortFields.map((field) => (
              <SelectItem key={field} value={field}>
                {getSortFieldLabel(field)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="outline"
          onClick={toggleDirection}
          className="h-9 w-9 p-0"
          title={sortDirection === "asc" ? "Ascending" : "Descending"}
        >
          {sortDirection === "asc" ? (
            <ArrowUp className="h-4 w-4" />
          ) : (
            <ArrowDown className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
