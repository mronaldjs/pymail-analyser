export interface DomainReputation {
  primary_domain?: string;
  checked_domains?: string[];
  mx?: boolean;
  spf?: string;
  dmarc?: string;
  dns_trust?: number;
  summary_pt?: string;
  virustotal_malicious?: number;
  virustotal_suspicious?: number;
}

export interface IMAPCredentials {
  host: string;
  email: string;
  password: string;
  days_limit?: number;
  start_date?: string; // ISO format YYYY-MM-DD
  end_date?: string; // ISO format YYYY-MM-DD
}

export interface SenderStats {
  sender_name: string;
  sender_email: string;
  source_key?: string;
  sender_emails?: string[];
  email_count: number;
  open_rate: number;
  spam_score: number;
  /** high | medium | low — estimativa de risco de spam vs remetente oficial */
  spam_risk?: string;
  domain_reputation?: DomainReputation;
  unsubscribe_link?: string;
}

export interface AnalysisResponse {
  total_emails_scanned: number;
  ignored_senders: SenderStats[];
  health_score: number;
  source_grouping_mode?: "provider" | "tenant";
}

export interface DeleteRequest {
  credentials: IMAPCredentials;
  sender_emails: string[];
}

export interface ApiErrorResponse {
  detail?: string;
  error_code?: string;
}

export interface ReadyResponse {
  status: string;
  source_grouping_mode?: "provider" | "tenant";
  virustotal_enabled: boolean;
}

export type ScanProgressEvent =
  | { type: "progress"; phase: "imap_fetch"; fetched: number }
  | { type: "progress"; phase: "dns_lookup"; checked: number; total: number };

export interface ScanProgress {
  phase: "idle" | "counting" | "fetching" | "processing";
  /** total de e-mails do período (vindo do /count) */
  total: number;
  /** quantos itens já processados na fase ativa */
  current: number;
  /** total da fase ativa (igual a total em fetching, nº de domínios em processing) */
  phaseTotal: number;
  /** porcentagem unificada 0-100 (fetch 0-70%, dns 70-100%) */
  percentage: number;
  /** estimativa em segundos para conclusão, null se ainda indisponível */
  etaSeconds: number | null;
}
