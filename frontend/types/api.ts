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
  email_count: number;
  open_rate: number;
  spam_score: number;
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
