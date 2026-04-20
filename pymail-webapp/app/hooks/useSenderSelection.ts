import { useState } from "react";
import { SenderStats } from "@/types/api";
import { getSenderKey } from "@/utils/senderSelection";

export function useSenderSelection() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [selectedSourceKeys, setSelectedSourceKeys] = useState<string[]>([]);

  const toggleSelection = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleAllVisible = (visibleSenders: SenderStats[], allVisibleSelected: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleSenders.forEach((sender) => next.delete(getSenderKey(sender)));
      } else {
        visibleSenders.forEach((sender) => next.add(getSenderKey(sender)));
      }
      return next;
    });
  };

  const toggleSourceFilter = (sourceKey: string) => {
    setSelectedSourceKeys((prev) =>
      prev.includes(sourceKey)
        ? prev.filter((source) => source !== sourceKey)
        : [...prev, sourceKey],
    );
  };

  const clearSelection = () => {
    setSelectedKeys(new Set());
    setSelectedSourceKeys([]);
  };

  return {
    selectedKeys,
    setSelectedKeys,
    selectedSourceKeys,
    toggleSelection,
    toggleAllVisible,
    toggleSourceFilter,
    clearSelection,
  };
}
