import { AxiosError } from "axios";
import { ApiErrorResponse } from "@/types/api";

export function resolveApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const errorCode = axiosError.response?.data?.error_code;
  const detail = axiosError.response?.data?.detail;

  if (errorCode === 'IMAP_AUTH_FAILED') {
    return 'Falha de autenticação IMAP. Verifique e-mail e senha de app.';
  }

  if (errorCode === 'IMAP_UNAVAILABLE') {
    return 'Servidor IMAP indisponível no momento. Tente novamente em instantes.';
  }

  if (errorCode === 'IMAP_OPERATION_FAILED') {
    return 'Falha ao processar a operação IMAP. Revise host, credenciais e permissões da conta.';
  }

  if (detail && detail.trim().length > 0) {
    return detail;
  }

  return fallback;
}