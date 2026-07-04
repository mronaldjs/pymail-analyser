import { useRef, useState } from "react";
import {
  IMAPCredentials,
  AnalysisResponse,
  ScanProgress,
  ApiErrorResponse,
} from "@/types/api";
import { messageForErrorCode } from "../resolveApiErrorMessage";
import { popUpAlert } from "@/utils/alerts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Weight of each phase in the unified progress bar. Sums to 1.0.
const FETCH_WEIGHT = 0.6; // Email fetching: 0-60%
const UNSUB_WEIGHT = 0.15; // Unsubscribe scanning: 60-75%
const DNS_WEIGHT = 0.25; // DNS/VirusTotal lookup: 75-100%

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

  // Time markers for ETA estimation.
  const fetchStartRef = useRef<number | null>(null);
  const unsubStartRef = useRef<number | null>(null);
  const dnsStartRef = useRef<number | null>(null);
  // Controller for the in-flight stream so reset()/disconnect can cancel it.
  const abortRef = useRef<AbortController | null>(null);

  const computeEta = (
    startedAt: number | null,
    current: number,
    phaseTotal: number,
  ): number | null => {
    if (!startedAt || current <= 0 || phaseTotal <= 0) return null;
    const elapsedSec = (Date.now() - startedAt) / 1000;
    // Need at least 1 second of data for meaningful ETA
    if (elapsedSec < 1.0) return null;

    const ratePerItem = elapsedSec / current;
    const remainingItems = Math.max(0, phaseTotal - current);
    const remainingPhaseSec = ratePerItem * remainingItems;

    // Apply smoothing to avoid wild fluctuations
    return Math.max(1, Math.round(remainingPhaseSec));
  };

  const analyze = async (credentials: IMAPCredentials) => {
    setIsLoading(true);
    // Start immediately in "fetching" indeterminate mode — no pre-flight /count
    // needed. The stream's imap_fetch events supply a live running counter which
    // we use for ETA once we have enough samples.
    setScanProgress({ ...IDLE_PROGRESS, phase: "fetching" });
    fetchStartRef.current = Date.now();
    unsubStartRef.current = null;
    dnsStartRef.current = null;

    // Running total accumulated from imap_fetch events (no upfront count).
    let liveTotal = 0;

    // Cancel any previous in-flight run and start a fresh controller.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // Single IMAP connection: jump straight to the NDJSON stream.
      const response = await fetch(`${API_BASE_URL}/analyze/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        signal: controller.signal,
      });

      if (!response.ok) {
        let payload: ApiErrorResponse | undefined;
        try {
          payload = (await response.json()) as ApiErrorResponse;
        } catch {
          payload = undefined;
        }
        throw new Error(
          messageForErrorCode(
            payload?.error_code,
            payload?.detail,
            `Request failed (HTTP ${response.status}).`,
          ),
        );
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
                // Grow the live total to at least `current` — it never shrinks.
                liveTotal = Math.max(liveTotal, current);

                // Improved progress calculation:
                // Use a logarithmic approach for early progress to show movement faster
                let fetchFraction;
                if (current < 10) {
                  // First 10 emails show faster initial progress (0-20% of fetch phase)
                  fetchFraction = Math.min(0.2, current / 50);
                } else if (current < 50) {
                  // 10-50 emails progress to 50% of fetch phase
                  fetchFraction = 0.2 + ((current - 10) / 40) * 0.3;
                } else {
                  // Beyond 50, assume we're at 50-95% based on current vs estimated
                  const estimated = Math.max(liveTotal, current * 1.15);
                  fetchFraction =
                    0.5 + Math.min(0.45, (current / estimated) * 0.45);
                }

                const percentage = Math.round(
                  fetchFraction * FETCH_WEIGHT * 100,
                );
                const etaSeconds = computeEta(
                  fetchStartRef.current,
                  current,
                  Math.max(liveTotal, Math.round(current * 1.2)),
                );
                setScanProgress({
                  phase: "fetching",
                  total: liveTotal,
                  current,
                  phaseTotal: liveTotal,
                  percentage,
                  etaSeconds,
                });
              } else if (event.phase === "unsub_scan") {
                if (unsubStartRef.current === null) {
                  unsubStartRef.current = Date.now();
                }
                const checked = event.checked || 0;
                const unsubTotal = event.total || 1;
                const unsubFraction = Math.min(1, checked / unsubTotal);
                const percentage = Math.round(
                  (FETCH_WEIGHT + unsubFraction * UNSUB_WEIGHT) * 100,
                );
                const etaSeconds = computeEta(
                  unsubStartRef.current,
                  checked,
                  unsubTotal,
                );
                setScanProgress({
                  phase: "scanning",
                  total: liveTotal,
                  current: checked,
                  phaseTotal: unsubTotal,
                  percentage,
                  etaSeconds,
                });
              } else if (event.phase === "dns_lookup") {
                if (dnsStartRef.current === null) {
                  dnsStartRef.current = Date.now();
                }
                const checked = event.checked || 0;
                const dnsTotal = event.total || 1;
                const dnsFraction = Math.min(1, checked / dnsTotal);
                const percentage = Math.round(
                  (FETCH_WEIGHT + UNSUB_WEIGHT + dnsFraction * DNS_WEIGHT) *
                    100,
                );
                const etaSeconds = computeEta(
                  dnsStartRef.current,
                  checked,
                  dnsTotal,
                );
                setScanProgress({
                  phase: "processing",
                  total: liveTotal,
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
              throw new Error(
                messageForErrorCode(
                  event.payload?.error_code,
                  event.payload?.detail,
                  "Analysis failed.",
                ),
              );
            }
          } catch (parseError) {
            console.error("Error parsing event:", parseError, line);
          }
        }
      }
    } catch (error: unknown) {
      // A user-initiated abort (disconnect / new analysis) is not an error.
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      setIsLoading(false);
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to reach the server. Is the backend running?";
      popUpAlert(message, "error");
      setScanProgress(IDLE_PROGRESS);
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
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
