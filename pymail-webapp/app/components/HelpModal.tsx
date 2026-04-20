import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface HelpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpModal({ open, onOpenChange }: HelpModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Como gerar Senha de App</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <h3 className="font-semibold">Gmail / Google Workspace</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside pl-2">
              <li>Acesse Conta Google → Segurança</li>
              <li>Ative Verificação em 2 etapas</li>
              <li>Procure Senhas de app</li>
              <li>Gere nova senha para PyMail Analyser</li>
            </ol>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600"
              onClick={() =>
                window.open(
                  "https://myaccount.google.com/apppasswords",
                  "_blank",
                )
              }
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Abrir configurações do Google
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Outlook / Hotmail</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside pl-2">
              <li>Acesse Segurança da conta Microsoft</li>
              <li>Vá em Opções de segurança avançadas</li>
              <li>Clique em Senhas de aplicativo</li>
              <li>Crie nova senha</li>
            </ol>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600"
              onClick={() =>
                window.open(
                  "https://account.microsoft.com/security",
                  "_blank",
                )
              }
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Abrir configurações da Microsoft
            </Button>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Yahoo Mail</h3>
            <ol className="text-sm space-y-1 list-decimal list-inside pl-2">
              <li>Acesse Segurança da conta Yahoo</li>
              <li>Clique em Gerar senha de app</li>
              <li>Escolha Outro aplicativo</li>
              <li>Copie a senha (sem espaços)</li>
            </ol>
            <Button
              variant="link"
              className="p-0 h-auto text-blue-600"
              onClick={() =>
                window.open(
                  "https://login.yahoo.com/account/security",
                  "_blank",
                )
              }
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Abrir configurações do Yahoo
            </Button>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs">
              ⚠️ <strong>Importante:</strong> Suas credenciais não são
              armazenadas e são usadas apenas durante a sessão.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
