"use client";

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

interface DashboardProps {
  data: AnalysisResponse;
  setData: (data: AnalysisResponse | null) => void;
  credentials: IMAPCredentials;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  selectedKeys: Set<string>;
  selectedSourceKeys: string[];
  onToggleSelection: (key: string) => void;
  onDisconnect: () => void;
  actionModalOpen: boolean;
  setActionModalOpen: (open: boolean) => void;
  actionType: "delete" | "archive";
  actionTargets: SenderStats[];
  actionProgress: number;
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
  onDisconnect,
  actionModalOpen,
  setActionModalOpen,
  actionType,
  actionTargets,
  actionProgress,
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
  const groupingMode =
    data.source_grouping_mode === "tenant" ? "tenant" : "provider";
  const groupingHint =
    data.source_grouping_mode === "tenant"
      ? "Agrupamento detalhado ativo: domínios privados geram chaves por tenant (ex.: myblog.github.io -> myblog)."
      : "Agrupamento por provedor ativo: domínios privados tendem a ser agrupados pelo provedor (ex.: myblog.github.io -> github).";

  // Update data when action completes
  if (lastActionResult && lastActionResult.shouldRemoveFromList) {
    const { targetKeys } = lastActionResult;
    setData({
      ...data,
      ignored_senders: data.ignored_senders.filter(
        (s) => !targetKeys.includes(getSenderKey(s)),
      ),
    });
  }

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
            onArchiveSelected={handleArchiveSelected}
            onDeleteSelected={handleDeleteSelected}
          />
          <CardContent>
            <SendersList
              senders={visibleSenders}
              viewMode={viewMode}
              selectedKeys={selectedKeys}
              onToggleSelection={onToggleSelection}
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
          actionProgress={actionProgress}
          isProcessing={isProcessing}
          actionStatus={actionStatus}
          onConfirm={handleExecuteAction}
        />
      </div>
    </main>
  );
}
