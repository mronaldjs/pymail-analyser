import { Loader2, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScanProgressEvent } from "@/types/api";

interface LoadingScreenProps {
  progress?: ScanProgressEvent | null;
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  const isImap = progress?.phase === "imap_fetch";
  const isDns = progress?.phase === "dns_lookup";
  const dnsPercent =
    isDns && progress?.phase === "dns_lookup"
      ? Math.round((progress.checked / Math.max(1, progress.total)) * 100)
      : 0;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-slate-900 to-slate-800 p-4">
      <div className="flex flex-col items-center space-y-6 w-full max-w-sm">
        <div className="relative w-16 h-16">
          {isDns ? (
            <ShieldCheck className="w-16 h-16 text-blue-500 animate-pulse" />
          ) : (
            <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
          )}
        </div>

        <div className="text-center space-y-2 w-full">
          <h2 className="text-2xl font-bold text-white">
            {isDns
              ? "Verificando reputação dos remetentes"
              : isImap
                ? "Lendo sua caixa de entrada"
                : "Analisando sua caixa de entrada..."}
          </h2>

          {progress?.phase === "imap_fetch" && (
            <p className="text-slate-400 tabular-nums">
              {progress.fetched > 0
                ? `${progress.fetched.toLocaleString("pt-BR")} emails lidos`
                : "Conectando ao servidor IMAP..."}
            </p>
          )}

          {progress?.phase === "dns_lookup" && (
            <div className="w-full space-y-2">
              <p className="text-slate-400 text-sm text-center">
                {progress.checked} de {progress.total} domínios verificados
              </p>
              <Progress value={dnsPercent} className="h-2 bg-slate-700" />
            </div>
          )}

          {!isImap && !isDns && (
            <p className="text-slate-400">Isso pode levar alguns segundos</p>
          )}

          {!isDns && (
            <div className="mt-4 flex justify-center gap-1">
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0s" }}
              />
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.15s" }}
              />
              <div
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.3s" }}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
