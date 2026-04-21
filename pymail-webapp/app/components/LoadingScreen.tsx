import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScanProgress } from "@/types/api";

interface LoadingScreenProps {
  progress?: ScanProgress;
}

function formatEta(seconds: number | null): string | null {
  if (seconds === null || seconds <= 0) return null;
  if (seconds < 60) return `~${seconds}s restantes`;
  const minutes = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  if (minutes < 60) {
    return remSec > 0
      ? `~${minutes}min ${remSec}s restantes`
      : `~${minutes}min restantes`;
  }
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  return `~${hours}h ${remMin}min restantes`;
}

function IndeterminateBar() {
  return (
    <div className="relative w-full h-3 overflow-hidden rounded-full bg-slate-700">
      <div className="absolute top-0 bottom-0 rounded-full bg-blue-500 animate-indeterminate" />
    </div>
  );
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  const getPhaseMessage = () => {
    if (!progress) return "Analisando sua caixa de entrada...";

    switch (progress.phase) {
      case "counting":
        return "Contando e-mails no período especificado...";
      case "fetching":
        return "Buscando e-mails da caixa de entrada...";
      case "processing":
        return "Verificando reputação dos domínios...";
      default:
        return "Analisando sua caixa de entrada...";
    }
  };

  const getProgressDetails = () => {
    if (!progress || progress.phase === "idle") {
      return "Isso pode levar alguns segundos";
    }

    if (progress.phase === "counting") {
      return "Consultando o servidor IMAP";
    }

    if (progress.phase === "fetching") {
      return `${progress.current} de ${progress.phaseTotal} e-mails processados`;
    }

    if (progress.phase === "processing") {
      return `${progress.current} de ${progress.phaseTotal} domínios verificados`;
    }

    return "Processando...";
  };

  const isCounting = progress?.phase === "counting";
  const showDeterminateBar =
    progress &&
    progress.phase !== "idle" &&
    progress.phase !== "counting";
  const eta = progress ? formatEta(progress.etaSeconds) : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-linear-to-b from-slate-900 to-slate-800 p-4">
      <div className="flex flex-col items-center space-y-6 w-full max-w-md">
        <div className="relative w-16 h-16">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
        </div>

        <div className="text-center space-y-2 w-full">
          <h2 className="text-2xl font-bold text-white">{getPhaseMessage()}</h2>
          <p className="text-slate-400">{getProgressDetails()}</p>

          {showDeterminateBar && (
            <div className="mt-6 space-y-2 w-full px-4">
              <Progress
                value={progress.percentage}
                className="w-full h-3 bg-slate-700"
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300 font-semibold">
                  {progress.percentage}%
                </span>
                {eta && <span className="text-slate-400">{eta}</span>}
              </div>
            </div>
          )}

          {isCounting && (
            <div className="mt-6 w-full px-4">
              <IndeterminateBar />
            </div>
          )}

          {!progress && (
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
