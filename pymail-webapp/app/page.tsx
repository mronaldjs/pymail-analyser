"use client";

import { useEffect, useState } from "react";
import { IMAPCredentials } from "@/types/api";
import { useAnalyze } from "./hooks/useAnalyze";
import { useAction } from "./hooks/useAction";
import { useSenderSelection } from "./hooks/useSenderSelection";
import { LoadingScreen } from "./components/LoadingScreen";
import { LoginScreen } from "./components/LoginScreen";
import { Dashboard } from "./components/Dashboard";
import { popUpAlert } from "@/utils/alerts";

export default function Home() {
  const [credentials, setCredentials] = useState<IMAPCredentials>({
    host: "",
    email: "",
    password: "",
    days_limit: 30,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const { data, setData, isLoading, scanProgress, analyze, reset } =
    useAnalyze();

  const {
    actionModalOpen,
    setActionModalOpen,
    actionType,
    actionTargets,
    actionProgress,
    isProcessing,
    actionStatus,
    confirmAction,
    confirmBulkAction,
    executeAction,
    lastActionResult,
  } = useAction();

  const {
    selectedKeys,
    setSelectedKeys,
    selectedSourceKeys,
    toggleSelection,
    toggleAllVisible,
    clearSelection,
  } = useSenderSelection();

  const handleAnalyze = (creds: IMAPCredentials) => {
    setCredentials(creds);
    analyze(creds);
    clearSelection();
  };

  const handleDisconnect = () => {
    reset();
    clearSelection();
  };

  const isValidHttpUrl = (link: string) => {
    try {
      const url = new URL(link);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const normalizeUnsubscribeLink = (link: string) => {
    if (!link) return "";

    const candidates = link
      .split(",")
      .map((item) => item.trim().replace(/^<|>$/g, ""))
      .filter(Boolean);

    const mailtoLink = candidates.find((item) =>
      item.toLowerCase().startsWith("mailto:"),
    );
    if (mailtoLink) {
      return mailtoLink;
    }

    const httpLink = candidates.find((item) => isValidHttpUrl(item));
    if (httpLink) {
      return httpLink;
    }

    return candidates[0] ?? "";
  };

  const handleUnsubscribe = (rawLink: string) => {
    const link = normalizeUnsubscribeLink(rawLink);

    if (!link) {
      popUpAlert("Unsubscribe link not available.", "error");
      return;
    }

    if (link.toLowerCase().startsWith("mailto:")) {
      // Unsubscribe via email: opens the user's default email client.
      // We use window.open instead of window.location to avoid leaving the
      // page if no client is registered.
      const opened = window.open(link, "_self");
      if (!opened) {
        // Some browsers block opening — we try to copy and notify.
        try {
          navigator.clipboard?.writeText(link);
          popUpAlert(
            "Mailto link copied. Send an email to this recipient to complete the unsubscribe.",
            "info",
          );
        } catch {
          popUpAlert(
            "Open your email client and send to: " + link.slice(7),
            "info",
          );
        }
      }
      return;
    }

    if (isValidHttpUrl(link)) {
      window.open(link, "_blank", "noopener,noreferrer");
      return;
    }

    popUpAlert("Invalid unsubscribe link.", "error");
  };

  const handleExecuteAction = (senderEmails: string[]) => {
    executeAction(credentials, senderEmails);
  };

  useEffect(() => {
    if (!lastActionResult?.shouldRemoveFromList) {
      return;
    }

    const { targetKeys } = lastActionResult;
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      targetKeys.forEach((key) => next.delete(key));
      return next;
    });
  }, [lastActionResult, setSelectedKeys]);

  if (isLoading) {
    return <LoadingScreen progress={scanProgress} />;
  }

  if (data) {
    return (
      <Dashboard
        data={data}
        setData={setData}
        credentials={credentials}
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedKeys={selectedKeys}
        selectedSourceKeys={selectedSourceKeys}
        onToggleSelection={toggleSelection}
        onToggleAllVisible={toggleAllVisible}
        onDisconnect={handleDisconnect}
        actionModalOpen={actionModalOpen}
        setActionModalOpen={setActionModalOpen}
        actionType={actionType}
        actionTargets={actionTargets}
        actionProgress={actionProgress}
        isProcessing={isProcessing}
        actionStatus={actionStatus}
        onConfirmAction={confirmAction}
        onConfirmBulkAction={confirmBulkAction}
        onExecuteAction={handleExecuteAction}
        onUnsubscribe={handleUnsubscribe}
        lastActionResult={lastActionResult}
      />
    );
  }

  return <LoginScreen onAnalyze={handleAnalyze} />;
}
