import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2, Archive, CheckCircle2, MailX } from "lucide-react";
import { SenderStats } from "@/types/api";

interface ActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "delete" | "archive";
  actionTargets: SenderStats[];
  isProcessing: boolean;
  actionStatus: "idle" | "processing" | "success" | "error";
  onConfirm: () => void;
}

export function ActionModal({
  open,
  onOpenChange,
  actionType,
  actionTargets,
  isProcessing,
  actionStatus,
  onConfirm,
}: ActionModalProps) {
  const totalEmails = actionTargets.reduce((sum, s) => sum + s.email_count, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionType === "delete"
              ? "Confirm Delete"
              : "Confirm Archive"}
          </DialogTitle>
          <DialogDescription>
            You are about to{" "}
            {actionType === "delete" ? "delete" : "archive"}{" "}
            <strong>{totalEmails}</strong> email(s) from{" "}
            <strong>{actionTargets.length}</strong> selected source(s).
            {actionType === "delete"
              ? " This action will move items to the Trash."
              : " The emails will be moved to the archive folder."}
          </DialogDescription>
        </DialogHeader>

        {actionStatus === "idle" && (
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant={actionType === "delete" ? "destructive" : "secondary"}
              onClick={onConfirm}
              disabled={isProcessing}
              className="cursor-pointer"
            >
              <span className="flex items-center">
                {isProcessing ? (
                  <Loader2 key="btn-loader" className="mr-2 h-4 w-4 animate-spin" />
                ) : actionType === "delete" ? (
                  <Trash2 key="btn-delete" className="mr-2 h-4 w-4" />
                ) : (
                  <Archive key="btn-archive" className="mr-2 h-4 w-4" />
                )}
                Confirm {actionType === "delete" ? "Delete" : "Archive"}
              </span>
            </Button>
          </DialogFooter>
        )}

        {actionStatus === "processing" && (
          <div className="py-6 space-y-4">
            <div className="flex justify-center">
              <Loader2
                key="processing-loader"
                className="w-12 h-12 text-blue-500 animate-spin"
              />
            </div>
            <div className="space-y-2">
              {/* Indeterminate: a single delete/archive request has no real
                  progress signal, so we show activity rather than a fake %. */}
              <div className="h-4 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-full rounded-full bg-linear-to-r from-primary to-accent animate-pulse" />
              </div>
              <p className="text-xs text-center text-muted-foreground">
                {actionType === "delete" ? "Deleting" : "Archiving"} emails…
              </p>
            </div>
          </div>
        )}

        {actionStatus === "success" && (
          <div className="py-6 space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle2
                key="success-icon"
                className="w-12 h-12 text-green-500"
              />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-green-600">
                {actionType === "delete" ? "Delete" : "Archive"}{" "}
                completed!
              </p>
              <p className="text-sm text-muted-foreground">
                The selected emails have been{" "}
                {actionType === "delete"
                  ? "moved to Trash"
                  : "archived"}
                .
              </p>
            </div>
          </div>
        )}

        {actionStatus === "error" && (
          <div className="py-6 space-y-4 text-center">
            <div className="flex justify-center">
              <MailX key="error-icon" className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-red-600">
                Error during {actionType === "delete" ? "delete" : "archive"}
              </p>
              <p className="text-sm text-muted-foreground">
                Check your connection and try again.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full cursor-pointer"
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
