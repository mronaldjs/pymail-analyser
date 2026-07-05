import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { IMAPCredentials, SenderStats, DeleteRequest } from "@/types/api";
import { resolveApiErrorMessage } from "../resolveApiErrorMessage";
import { getSenderKey } from "@/utils/senderSelection";
import { popUpAlert } from "@/utils/alerts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export function useAction() {
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"delete" | "archive">("delete");
  const [actionTargets, setActionTargets] = useState<SenderStats[]>([]);
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
    onSuccess: ({ type, notArchived }) => {
      setActionStatus("success");
      if (type === "archive" && notArchived > 0) {
        popUpAlert(
          "Some senders were not archived because the account does not expose a compatible archive folder.",
          "info",
        );
      }
      setTimeout(() => {
        setActionModalOpen(false);
        setActionTargets([]);
        setIsProcessing(false);
        setActionStatus("idle");
      }, 1500);
    },
    onError: (error: unknown) => {
      setActionStatus("error");
      const fallback = `Failed to ${actionType === "delete" ? "delete" : "archive"} the selected emails.`;
      const message = resolveApiErrorMessage(error, fallback);
      popUpAlert(
        `Failed to ${actionType === "delete" ? "delete" : "archive"}: ` + message,
        "error",
      );
      setIsProcessing(false);
      setTimeout(() => {
        setActionStatus("idle");
      }, 2000);
    },
  });

  const confirmAction = (sender: SenderStats, type: "delete" | "archive") => {
    setActionTargets([sender]);
    setActionType(type);
    setActionModalOpen(true);
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
    isProcessing,
    actionStatus,
    confirmAction,
    confirmBulkAction,
    executeAction,
    lastActionResult: actionMutation.data,
  };
}
