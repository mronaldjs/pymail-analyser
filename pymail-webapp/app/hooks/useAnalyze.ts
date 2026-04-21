import { useState, useRef } from "react";
import {
  IMAPCredentials,
  AnalysisResponse,
  ScanProgressEvent,
} from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function _resolveStreamError(errorCode?: string, detail?: string): string {
  if (errorCode === "IMAP_AUTH_FAILED") {
    return "Falha de autenticação IMAP. Verifique e-mail e senha de app.";
  }

  if (errorCode === "IMAP_UNAVAILABLE") {
    return "Servidor IMAP indisponível no momento. Tente novamente em instantes.";
  }

  if (errorCode === "IMAP_OPERATION_FAILED") {
    return "Falha ao processar a operação IMAP. Revise host, credenciais e permissões da conta.";
  }

  if (detail && detail.trim().length > 0) {
    return detail;
  }

  return "Falha ao conectar com o servidor.";
}

export function useAnalyze() {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgressEvent | null>(
    null,
  );
  const abortRef = useRef<AbortController | null>(null);

  const analyze = (creds: IMAPCredentials) => {
    (async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setScanProgress(null);

      try {
        const response = await fetch(`${API_BASE_URL}/analyze/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(creds),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          const message = _resolveStreamError(
            errorBody?.error_code,
            errorBody?.detail,
          );
          throw new Error(message);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { value, done } = await reader.read();

          if (done) {
            // Process any remaining bytes in the buffer
            if (buffer.trim().length > 0) {
              try {
                const event = JSON.parse(buffer.trim());
                if (event.type === "done") {
                  setData(event.result as AnalysisResponse);
                  setIsLoading(false);
                  setScanProgress(null);
                } else if (event.type === "error") {
                  const message = _resolveStreamError(
                    event.payload?.error_code,
                    event.payload?.detail,
                  );
                  throw new Error(message);
                }
              } catch {
                // ignore parse errors on trailing buffer
              }
            }
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            let event: Record<string, unknown>;
            try {
              event = JSON.parse(trimmed);
            } catch {
              continue;
            }

            if (event.type === "progress") {
              setScanProgress(event as unknown as ScanProgressEvent);
            } else if (event.type === "done") {
              setData(event.result as AnalysisResponse);
              setIsLoading(false);
              setScanProgress(null);
              reader.cancel();
              return;
            } else if (event.type === "error") {
              const payload = event.payload as
                | { error_code?: string; detail?: string }
                | undefined;
              const message = _resolveStreamError(
                payload?.error_code,
                payload?.detail,
              );
              throw new Error(message);
            }
          }
        }
      } catch (err: unknown) {
        const error = err as Error;
        if (error.name === "AbortError") return;
        setIsLoading(false);
        setScanProgress(null);
        alert("Falha ao conectar: " + error.message);
      }
    })();
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setData(null);
    setIsLoading(false);
    setScanProgress(null);
  };

  return {
    data,
    setData,
    isLoading,
    scanProgress,
    analyze,
    reset,
  };
}
