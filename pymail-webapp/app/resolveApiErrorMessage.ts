import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/api";

/**
 * Map a backend error_code (and optional detail) to a clear, actionable English
 * message. Shared by the axios path (resolveApiErrorMessage) and the NDJSON
 * stream path (useAnalyze), so both surface the same guidance.
 */
export function messageForErrorCode(
  errorCode: string | undefined,
  detail: string | undefined,
  fallback: string,
): string {
  switch (errorCode) {
    case "IMAP_AUTH_FAILED":
      return "Authentication failed. Gmail, Outlook and Yahoo require an App Password (not your normal password) with 2-Step Verification enabled — see “How to generate?”.";
    case "IMAP_UNAVAILABLE":
      return "The mail server is unavailable right now. Please try again shortly.";
    case "IMAP_HOST_NOT_ALLOWED":
      return "That IMAP host isn't allowed. Use your provider's public IMAP server (e.g. imap.gmail.com).";
    case "IMAP_PASSWORD_ENCODING_FAILED":
      return "The password contains characters the IMAP client can't send. Use an ASCII App Password.";
    case "IMAP_OPERATION_FAILED":
      return "Couldn't complete the IMAP operation. Check the host and that IMAP access is enabled on the account.";
    default:
      break;
  }
  if (detail && detail.trim().length > 0) return detail;
  return fallback;
}

export function resolveApiErrorMessage(
  error: unknown,
  fallback: string,
): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const errorCode = axiosError.response?.data?.error_code;
  const detail = axiosError.response?.data?.detail;
  return messageForErrorCode(errorCode, detail, fallback);
}
