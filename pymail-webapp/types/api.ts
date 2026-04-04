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
  end_date?: string;   // ISO format YYYY-MM-DD
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
}

export interface DeleteRequest {
  credentials: IMAPCredentials;
  sender_emails: string[];
}
