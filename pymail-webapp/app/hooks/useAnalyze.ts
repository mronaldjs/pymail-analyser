import { useRef, useState } from "react";
import axios from "axios";
import { IMAPCredentials, AnalysisResponse, ScanProgress } from "@/types/api";
import { resolveApiErrorMessage } from "../resolveApiErrorMessage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Peso de cada fase na barra unificada. Soma 1.0.
const FETCH_WEIGHT = 0.7;
const DNS_WEIGHT = 0.3;

const IDLE_PROGRESS: ScanProgress = {
  phase: "idle",
  total: 0,
  current: 0,
  phaseTotal: 0,
  percentage: 0,
  etaSeconds: null,
};

export function useAnalyze() {
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress>(IDLE_PROGRESS);

  // Marcações de tempo para estimativa de ETA.
  const fetchStartRef = useRef<number | null>(null);
  const dnsStartRef = useRef<number | null>(null);

  const computeEta = (
    startedAt: number | null,
    current: number,
    phaseTotal: number,
    remainingWeightFraction: number,
  ): number | null => {
    if (!startedAt || current <= 0 || phaseTotal <= 0) return null;
    const elapsedSec = (Date.now() - startedAt) / 1000;
    if (elapsedSec < 0.5) return null; // Amostra pequena demais.
    const ratePerItem = elapsedSec / current;
    const remainingItems = Math.max(0, phaseTotal - current);
    const remainingPhaseSec = ratePerItem * remainingItems;
    // Extrapola para as fases seguintes usando o peso restante (aproximação).
    const totalSec =
      remainingPhaseSec + elapsedSec * (remainingWeightFraction - 1) * 0;
    // remainingWeightFraction reservado para refinamento futuro; por enquanto
    // usamos apenas o restante da fase ativa (ambos usam o mesmo I/O pattern).
    void totalSec;
    return Math.max(1, Math.round(remainingPhaseSec));
  };

  const analyze = async (credentials: IMAPCredentials) => {
    setIsLoading(true);
    setScanProgress({ ...IDLE_PROGRESS, phase: "counting" });
    fetchStartRef.current = null;
    dnsStartRef.current = null;

    try {
      // Step 1: Pré-contagem rápida (UIDs server-side).
      const countResponse = await axios.post<{ total: number }>(
        `${API_BASE_URL}/count`,
        credentials,
      );
      const total = countResponse.data.total;

      fetchStartRef.current = Date.now();
      setScanProgress({
        phase: "fetching",
        total,
        current: 0,
        phaseTotal: total,
        percentage: 0,
        etaSeconds: null,
      });

      // Step 2: Stream NDJSON de eventos de progresso.
      const response = await fetch(`${API_BASE_URL}/analyze/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;

          try {
            const event = JSON.parse(line);

            if (event.type === "progress") {
              if (event.phase === "imap_fetch") {
                const current = event.fetched || 0;
                const fetchFraction =
                  total > 0 ? Math.min(1, current / total) : 0;
                const percentage = Math.round(
                  fetchFraction * FETCH_WEIGHT * 100,
                );
                const etaSeconds = computeEta(
                  fetchStartRef.current,
                  current,
                  total,
                  FETCH_WEIGHT + DNS_WEIGHT,
                );
                setScanProgress({
                  phase: "fetching",
                  total,
                  current,
                  phaseTotal: total,
                  percentage,
                  etaSeconds,
                });
              } else if (event.phase === "dns_lookup") {
                if (dnsStartRef.current === null) {
                  dnsStartRef.current = Date.now();
                }
                const checked = event.checked || 0;
                const dnsTotal = event.total || 0;
                const dnsFraction =
                  dnsTotal > 0 ? Math.min(1, checked / dnsTotal) : 0;
                const percentage = Math.round(
                  (FETCH_WEIGHT + dnsFraction * DNS_WEIGHT) * 100,
                );
                const etaSeconds = computeEta(
                  dnsStartRef.current,
                  checked,
                  dnsTotal,
                  DNS_WEIGHT,
                );
                setScanProgress({
                  phase: "processing",
                  total,
                  current: checked,
                  phaseTotal: dnsTotal,
                  percentage,
                  etaSeconds,
                });
              }
            } else if (event.type === "done") {
              setData(event.result);
              setIsLoading(false);
              setScanProgress({ ...IDLE_PROGRESS, percentage: 100 });
            } else if (event.type === "error") {
              throw new Error(event.payload?.detail || "Erro desconhecido");
            }
          } catch (parseError) {
            console.error("Error parsing event:", parseError, line);
          }
        }
      }
    } catch (error: unknown) {
      setIsLoading(false);
      const message = resolveApiErrorMessage(
        error,
        "Falha ao conectar com o servidor.",
      );
      alert("Falha ao conectar: " + message);
      setScanProgress(IDLE_PROGRESS);
    }
  };

  const reset = () => {
    setData(null);
    setIsLoading(false);
    setScanProgress(IDLE_PROGRESS);
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
