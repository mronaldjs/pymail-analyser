import { useState } from "react";
import { SenderStats } from "@/types/api";
import SendersListView from "./SendersListView";
import SendersGridView from "./SendersGridView";
import { GroupHeader } from "./GroupHeader";
import {
  groupSenders,
  computeGroupStats,
  GroupConfig,
} from "@/utils/senderSorting";

interface SendersListProps {
  senders: SenderStats[];
  viewMode: "grid" | "list";
  groupConfig: GroupConfig;
  selectedKeys: Set<string>;
  onToggleSelection: (key: string) => void;
  onToggleAllVisible: (
    visibleSenders: SenderStats[],
    allVisibleSelected: boolean,
  ) => void;
  onUnsubscribe: (link: string) => void;
  onConfirmAction: (sender: SenderStats, action: "archive" | "delete") => void;
}

export default function SendersList({
  senders,
  viewMode,
  groupConfig,
  selectedKeys,
  onToggleSelection,
  onToggleAllVisible,
  onUnsubscribe,
  onConfirmAction,
}: SendersListProps) {
  const groupedSenders = groupSenders(senders, groupConfig);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(Array.from(groupedSenders.keys())),
  );

  const toggleGroup = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  // If no grouping, render directly without group headers
  if (groupConfig.groupBy === "none") {
    const allSenders = Array.from(groupedSenders.values())[0] || [];

    if (viewMode === "list") {
      return (
        <SendersListView
          senders={allSenders}
          selectedKeys={selectedKeys}
          onToggleSelection={onToggleSelection}
          onToggleAllVisible={onToggleAllVisible}
          onUnsubscribe={onUnsubscribe}
          onConfirmAction={onConfirmAction}
        />
      );
    }

    return (
      <SendersGridView
        senders={allSenders}
        selectedKeys={selectedKeys}
        onToggleSelection={onToggleSelection}
        onUnsubscribe={onUnsubscribe}
        onConfirmAction={onConfirmAction}
      />
    );
  }

  // Render with grouping
  return (
    <div className="space-y-2">
      {Array.from(groupedSenders.entries()).map(([groupName, groupSenders]) => {
        const isExpanded = expandedGroups.has(groupName);
        const stats = computeGroupStats(groupSenders);

        return (
          <div key={groupName}>
            <GroupHeader
              groupName={groupName}
              stats={stats}
              isExpanded={isExpanded}
              onToggle={() => toggleGroup(groupName)}
            />
            {isExpanded && (
              <div className="mt-2">
                {viewMode === "list" ? (
                  <SendersListView
                    senders={groupSenders}
                    selectedKeys={selectedKeys}
                    onToggleSelection={onToggleSelection}
                    onToggleAllVisible={onToggleAllVisible}
                    onUnsubscribe={onUnsubscribe}
                    onConfirmAction={onConfirmAction}
                  />
                ) : (
                  <SendersGridView
                    senders={groupSenders}
                    selectedKeys={selectedKeys}
                    onToggleSelection={onToggleSelection}
                    onUnsubscribe={onUnsubscribe}
                    onConfirmAction={onConfirmAction}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
