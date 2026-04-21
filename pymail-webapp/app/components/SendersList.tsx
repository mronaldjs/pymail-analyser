import { SenderStats } from "@/types/api";
import SendersListView from "./SendersListView";
import SendersGridView from "./SendersGridView";

interface SendersListProps {
  senders: SenderStats[];
  viewMode: "grid" | "list";
  selectedKeys: Set<string>;
  onToggleSelection: (key: string) => void;
  onToggleAllVisible: (visibleSenders: SenderStats[], allVisibleSelected: boolean) => void;
  onUnsubscribe: (link: string) => void;
  onConfirmAction: (sender: SenderStats, action: "archive" | "delete") => void;
}

export default function SendersList({
  senders,
  viewMode,
  selectedKeys,
  onToggleSelection,
  onToggleAllVisible,
  onUnsubscribe,
  onConfirmAction,
}: SendersListProps) {
  if (viewMode === "list") {
    return (
      <SendersListView
        senders={senders}
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
      senders={senders}
      selectedKeys={selectedKeys}
      onToggleSelection={onToggleSelection}
      onUnsubscribe={onUnsubscribe}
      onConfirmAction={onConfirmAction}
    />
  );
}
