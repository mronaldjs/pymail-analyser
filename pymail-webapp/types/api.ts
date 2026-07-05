import type { components } from "./api.generated";

/**
 * API types re-exported from the backend OpenAPI schema (single source of truth).
 *
 * `types/api.generated.ts` is produced from `openapi.json` by `npm run gen:types`
 * (see the Makefile `openapi`/`gen-types` targets). Do not hand-edit the API
 * shapes below — regenerate instead. Only the frontend-only types further down
 * are maintained by hand.
 */
export type DomainReputation = components["schemas"]["DomainReputation"];
export type IMAPCredentials = components["schemas"]["IMAPCredentials"];
export type SenderStats = components["schemas"]["SenderStats"];
export type AnalysisResponse = components["schemas"]["AnalysisResponse"];
export type DeleteRequest = components["schemas"]["DeleteRequest"];
export type ReadyResponse = components["schemas"]["ReadyResponse"];

/**
 * Structured error payload returned by the IMAP endpoints. Not part of the
 * OpenAPI schema (the handlers return it via JSONResponse), so it stays
 * hand-written here — kept in sync with `_error_payload` in pymail-api/main.py.
 */
export interface ApiErrorResponse {
  detail?: string;
  error_code?: string;
  request_id?: string;
}

// --- Frontend-only types (not part of the API schema) ---

export type ScanProgressEvent =
  | { type: "progress"; phase: "imap_fetch"; fetched: number }
  | { type: "progress"; phase: "unsub_scan"; checked: number; total: number }
  | { type: "progress"; phase: "dns_lookup"; checked: number; total: number };

export interface ScanProgress {
  phase: "idle" | "counting" | "fetching" | "scanning" | "processing";
  /** total de e-mails do período (vindo do /count) */
  total: number;
  /** quantos itens já processados na fase ativa */
  current: number;
  /** total da fase ativa (igual a total em fetching, nº de domínios em processing) */
  phaseTotal: number;
  /** porcentagem unificada 0-100 (fetch 0-60%, unsub 60-75%, dns 75-100%) */
  percentage: number;
  /** estimativa em segundos para conclusão, null se ainda indisponível */
  etaSeconds: number | null;
}
