import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/api";

export function resolveApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const errorCode = axiosError.response?.data?.error_code;
  const detail = axiosError.response?.data?.detail;

  if (errorCode === 'IMAP_AUTH_FAILED') {
    return 'IMAP authentication failed. Please check your email and app password.';
  }

  if (errorCode === 'IMAP_UNAVAILABLE') {
    return 'IMAP server is currently unavailable. Please try again shortly.';
  }

  if (errorCode === 'IMAP_OPERATION_FAILED') {
    return 'Failed to process IMAP operation. Please review host, credentials, and account permissions.';
  }

  if (detail && detail.trim().length > 0) {
    return detail;
  }

  return fallback;
}