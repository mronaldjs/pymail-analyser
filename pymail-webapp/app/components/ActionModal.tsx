import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Trash2, Archive, CheckCircle2, MailX } from "lucide-react";
import { SenderStats } from "@/types/api";

interface ActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionType: "delete" | "archive";
  actionTargets: SenderStats[];
  actionProgress: number;
  isProcessing: boolean;
  actionStatus: "idle" | "processing" | "success" | "error";
  onConfirm: () => void;
}

export function ActionModal({
  open,
  onOpenChange,
  actionType,
  actionTargets,
  actionProgress,
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
              ? "Confirmar Exclusão"
              : "Confirmar Arquivamento"}
          </DialogTitle>
          <DialogDescription>
            Você está prestes a{" "}
            {actionType === "delete" ? "excluir" : "arquivar"}{" "}
            <strong>{totalEmails}</strong> e-mail(is) de{" "}
            <strong>{actionTargets.length}</strong> fonte(s) selecionada(s).
            {actionType === "delete"
              ? " Esta ação moverá os itens para a Lixeira."
              : " Os e-mails serão movidos para o arquivo."}
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
              Cancelar
            </Button>
            <Button
              variant={actionType === "delete" ? "destructive" : "secondary"}
              onClick={onConfirm}
              disabled={isProcessing}
              className="cursor-pointer"
            >
              {isProcessing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : actionType === "delete" ? (
                <Trash2 className="mr-2 h-4 w-4" />
              ) : (
                <Archive className="mr-2 h-4 w-4" />
              )}
              Confirmar {actionType === "delete" ? "Exclusão" : "Arquivamento"}
            </Button>
          </DialogFooter>
        )}

        {actionStatus === "processing" && (
          <div className="py-6 space-y-4">
            <div className="flex justify-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
            <div className="space-y-2">
              <Progress value={actionProgress} className="w-full" />
              <p className="text-xs text-center text-muted-foreground">
                {actionType === "delete" ? "Excluindo" : "Arquivando"} e-mails:{" "}
                {Math.round(actionProgress)}%
              </p>
            </div>
          </div>
        )}

        {actionStatus === "success" && (
          <div className="py-6 space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-green-600">
                {actionType === "delete" ? "Exclusão" : "Arquivamento"}{" "}
                concluído!
              </p>
              <p className="text-sm text-muted-foreground">
                Os e-mails selecionados foram{" "}
                {actionType === "delete"
                  ? "movidos para a Lixeira"
                  : "arquivados"}
                .
              </p>
            </div>
          </div>
        )}

        {actionStatus === "error" && (
          <div className="py-6 space-y-4 text-center">
            <div className="flex justify-center">
              <MailX className="w-12 h-12 text-red-500" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-red-600">
                Erro no {actionType === "delete" ? "exclusão" : "arquivamento"}
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="w-full cursor-pointer"
            >
              Fechar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
