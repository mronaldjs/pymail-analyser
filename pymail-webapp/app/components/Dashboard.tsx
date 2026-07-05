"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AnalysisResponse, IMAPCredentials, SenderStats } from "@/types/api";
import { DashboardHeader } from "./DashboardHeader";
import { HealthScoreCards } from "./HealthScoreCards";
import { SendersHeader } from "./SendersHeader";
import SendersList from "./SendersList";
import { ActionModal } from "./ActionModal";
import {
  filterBySources,
  buildBulkSenderEmails,
  getSenderKey,
} from "@/utils/senderSelection";
import {
  SortField,
  SortDirection,
  GroupBy,
  GroupConfig,
} from "@/utils/senderSorting";

interface DashboardProps {
  data: AnalysisResponse;
  setData: (data: AnalysisResponse | null) => void;
  credentials: IMAPCredentials;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  selectedKeys: Set<string>;
  selectedSourceKeys: string[];
  onToggleSelection: (key: string) => void;
  onToggleAllVisible: (
    visibleSenders: SenderStats[],
    allVisibleSelected: boolean,
  ) => void;
  onDisconnect: () => void;
  actionModalOpen: boolean;
  setActionModalOpen: (open: boolean) => void;
  actionType: "delete" | "archive";
  actionTargets: SenderStats[];
  isProcessing: boolean;
  actionStatus: "idle" | "processing" | "success" | "error";
  onConfirmAction: (sender: SenderStats, type: "delete" | "archive") => void;
  onConfirmBulkAction: (
    targets: SenderStats[],
    type: "delete" | "archive",
  ) => void;
  onExecuteAction: (senderEmails: string[]) => void;
  onUnsubscribe: (link: string) => void;
  lastActionResult?: { targetKeys: string[]; shouldRemoveFromList: boolean };
}

export function Dashboard({
  data,
  setData,
  credentials,
  viewMode,
  setViewMode,
  selectedKeys,
  selectedSourceKeys,
  onToggleSelection,
  onToggleAllVisible,
  onDisconnect,
  actionModalOpen,
  setActionModalOpen,
  actionType,
  actionTargets,
  isProcessing,
  actionStatus,
  onConfirmAction,
  onConfirmBulkAction,
  onExecuteAction,
  onUnsubscribe,
  lastActionResult,
}: DashboardProps) {
  const allSenders = data.ignored_senders || [];
  const visibleSenders = filterBySources(allSenders, selectedSourceKeys);

  // Sorting and grouping state
  const [sortField, setSortField] = useState<SortField>("spam_score");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [groupBy, setGroupBy] = useState<GroupBy>("none");

  const groupConfig: GroupConfig = {
    groupBy,
    sortWithinGroups: { field: sortField, direction: sortDirection },
  };
  const groupingMode =
    data.source_grouping_mode === "tenant" ? "tenant" : "provider";
  const groupingHint =
    data.source_grouping_mode === "tenant"
      ? "Detailed grouping active: private domains generate keys by tenant (e.g.: myblog.github.io -> myblog)."
      : "Provider grouping active: private domains tend to be grouped by the provider (e.g.: myblog.github.io -> github).";

  // Tracks already processed targetKeys to prevent infinite loops and ensure
  // a single removal per action — necessary because the consumer (page.tsx) may
  // not reset lastActionResult immediately.
  const consumedRef = useRef<string>("");
  useEffect(() => {
    if (
      !lastActionResult ||
      !lastActionResult.shouldRemoveFromList ||
      !lastActionResult.targetKeys ||
      lastActionResult.targetKeys.length === 0
    ) {
      return;
    }
    const key = lastActionResult.targetKeys.join(",");
    if (consumedRef.current === key) {
      return;
    }
    consumedRef.current = key;
    const { targetKeys } = lastActionResult;
    setData({
      ...data,
      ignored_senders: data.ignored_senders.filter(
        (s) => !targetKeys.includes(getSenderKey(s)),
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastActionResult]);

  const handleArchiveSelected = () => {
    const targets = allSenders.filter((sender) =>
      selectedKeys.has(getSenderKey(sender)),
    );
    onConfirmBulkAction(targets, "archive");
  };

  const handleDeleteSelected = () => {
    const targets = allSenders.filter((sender) =>
      selectedKeys.has(getSenderKey(sender)),
    );
    onConfirmBulkAction(targets, "delete");
  };

  const handleExecuteAction = () => {
    const senderEmails = buildBulkSenderEmails(actionTargets);
    onExecuteAction(senderEmails);
  };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <DashboardHeader onDisconnect={onDisconnect} />

        <HealthScoreCards
          healthScore={data.health_score}
          totalEmailsScanned={data.total_emails_scanned}
          credentials={credentials}
        />

        <Card className="col-span-4">
          <SendersHeader
            viewMode={viewMode}
            setViewMode={setViewMode}
            groupingMode={groupingMode}
            groupingHint={groupingHint}
            selectedCount={selectedKeys.size}
            visibleCount={visibleSenders.length}
            sortField={sortField}
            sortDirection={sortDirection}
            groupBy={groupBy}
            onSortFieldChange={setSortField}
            onSortDirectionChange={setSortDirection}
            onGroupByChange={setGroupBy}
            onArchiveSelected={handleArchiveSelected}
            onDeleteSelected={handleDeleteSelected}
          />
          <CardContent>
            <SendersList
              senders={visibleSenders}
              viewMode={viewMode}
              groupConfig={groupConfig}
              selectedKeys={selectedKeys}
              onToggleSelection={onToggleSelection}
              onToggleAllVisible={onToggleAllVisible}
              onUnsubscribe={onUnsubscribe}
              onConfirmAction={onConfirmAction}
            />
          </CardContent>
        </Card>

        <ActionModal
          open={actionModalOpen}
          onOpenChange={setActionModalOpen}
          actionType={actionType}
          actionTargets={actionTargets}
          isProcessing={isProcessing}
          actionStatus={actionStatus}
          onConfirm={handleExecuteAction}
        />
      </div>
    </main>
  );
}
