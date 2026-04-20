import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { IMAPCredentials, SenderStats, DeleteRequest } from "@/types/api";
import { resolveApiErrorMessage } from "../resolveApiErrorMessage";
import { getSenderKey } from "@/utils/senderSelection";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useAction() {
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "archive">("delete");
  const [actionTargets, setActionTargets] = useState<SenderStats[]>([]);
  const [actionProgress, setActionProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionStatus, setActionStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");

  const actionMutation = useMutation({
    mutationFn: async ({
      credentials,
      senderEmails,
      type,
      targetKeys,
    }: {
      credentials: IMAPCredentials;
      senderEmails: string[];
      type: "delete" | "archive";
      targetKeys: string[];
    }) => {
      setActionStatus("processing");
      const payload: DeleteRequest = {
        credentials,
        sender_emails: senderEmails,
      };
      const endpoint = type === "delete" ? "delete" : "archive";
      const response = await axios.post<{ not_archived?: number }>(
        `${API_BASE_URL}/${endpoint}`,
        payload,
      );
      const notArchived = response.data?.not_archived || 0;
      const shouldRemoveFromList = type === "delete" || notArchived === 0;
      return {
        type,
        targetKeys,
        notArchived,
        shouldRemoveFromList,
      };
    },
    onSuccess: ({ type, targetKeys, notArchived }) => {
      setActionProgress(100);
      setActionStatus("success");
      if (type === "archive" && notArchived > 0) {
        alert(
          "Alguns remetentes não foram arquivados porque a conta não expôs uma pasta de arquivo compatível.",
        );
      }
      setTimeout(() => {
        setActionModalOpen(false);
        setActionTargets([]);
        setIsProcessing(false);
        setActionProgress(0);
        setActionStatus("idle");
      }, 1500);
    },
    onError: (error: unknown) => {
      setActionStatus("error");
      const fallback = `Falha ao ${actionType === "delete" ? "excluir" : "arquivar"} os e-mails selecionados.`;
      const message = resolveApiErrorMessage(error, fallback);
      alert(
        `Falha ao ${actionType === "delete" ? "excluir" : "arquivar"}: ` +
          message,
      );
      setIsProcessing(false);
      setTimeout(() => {
        setActionStatus("idle");
      }, 2000);
    },
  });

  // Simulate progress when processing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing && actionProgress < 90) {
      interval = setInterval(() => {
        setActionProgress((prev) => {
          if (prev >= 90) return prev;
          const diff = 90 - prev;
          return prev + Math.max(1, diff * 0.1);
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isProcessing, actionProgress]);

  const confirmAction = (sender: SenderStats, type: "delete" | "archive") => {
    setActionTargets([sender]);
    setActionType(type);
    setActionModalOpen(true);
    setActionProgress(0);
  };

  const confirmBulkAction = (
    targets: SenderStats[],
    type: "delete" | "archive",
  ) => {
    if (targets.length === 0) {
      return;
    }
    setActionTargets(targets);
    setActionType(type);
    setActionModalOpen(true);
    setActionProgress(0);
  };

  const executeAction = (
    credentials: IMAPCredentials,
    senderEmails: string[],
  ) => {
    if (actionTargets.length > 0) {
      setIsProcessing(true);
      const targetKeys = actionTargets.map((sender) => getSenderKey(sender));
      actionMutation.mutate({
        credentials,
        senderEmails,
        type: actionType,
        targetKeys,
      });
    }
  };

  return {
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
    lastActionResult: actionMutation.data,
  };
}
