
import { describe, it, expect } from "vitest";
import { resolveApiErrorMessage } from "../resolveApiErrorMessage";

describe("resolveApiErrorMessage", () => {
  it("mapeia error_code IMAP_AUTH_FAILED para mensagem amigável", () => {
    const error = { response: { data: { error_code: "IMAP_AUTH_FAILED", detail: "Falha de autenticação IMAP." } } };
    expect(resolveApiErrorMessage(error, "")).toMatch(/autentica/i);
  });

  it("mapeia error_code IMAP_UNAVAILABLE para mensagem amigável", () => {
    const error = { response: { data: { error_code: "IMAP_UNAVAILABLE", detail: "Servidor IMAP indisponível." } } };
    expect(resolveApiErrorMessage(error, "")).toMatch(/indispon[ií]vel/i);
  });

  it("mapeia error_code IMAP_OPERATION_FAILED para mensagem amigável", () => {
    const error = { response: { data: { error_code: "IMAP_OPERATION_FAILED", detail: "Falha ao processar a operação IMAP." } } };
    expect(resolveApiErrorMessage(error, "")).toMatch(/falha|erro/i);
  });

  it("retorna detail se error_code não for conhecido", () => {
    const error = { response: { data: { error_code: "OUTRO_ERRO", detail: "Mensagem desconhecida." } } };
    expect(resolveApiErrorMessage(error, "")).toBe("Mensagem desconhecida.");
  });

  it("retorna fallback se não houver detail", () => {
    const error = { response: { data: { error_code: "OUTRO_ERRO" } } };
    expect(resolveApiErrorMessage(error, "fallback")).toBe("fallback");
  });
});
