import { useEffect, useState } from "react";
import axios from "axios";
import { ReadyResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Consulta /ready uma vez no mount para detectar capacidades opcionais do
 * backend (ex.: VirusTotal). Silencia erros — se o backend estiver offline
 * a UI principal já trata isso no fluxo de análise.
 */
export function useReadiness() {
  const [readiness, setReadiness] = useState<ReadyResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    axios
      .get<ReadyResponse>(`${API_BASE_URL}/ready`, { timeout: 4000 })
      .then((resp) => {
        if (!cancelled) setReadiness(resp.data);
      })
      .catch(() => {
        if (!cancelled) setReadiness(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return readiness;
}
