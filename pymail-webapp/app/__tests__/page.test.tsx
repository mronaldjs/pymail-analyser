import { describe, it, expect } from "vitest";
import { resolveApiErrorMessage } from "../resolveApiErrorMessage";

describe("resolveApiErrorMessage", () => {
  it("maps error_code IMAP_AUTH_FAILED to a user-friendly message", () => {
    const error = { response: { data: { error_code: "IMAP_AUTH_FAILED", detail: "IMAP authentication failed." } } };
    expect(resolveApiErrorMessage(error, "")).toMatch(/auth/i);
  });

  it("maps error_code IMAP_UNAVAILABLE to a user-friendly message", () => {
    const error = { response: { data: { error_code: "IMAP_UNAVAILABLE", detail: "IMAP server unavailable." } } };
    expect(resolveApiErrorMessage(error, "")).toMatch(/unavailable/i);
  });

  it("maps error_code IMAP_OPERATION_FAILED to a user-friendly message", () => {
    const error = { response: { data: { error_code: "IMAP_OPERATION_FAILED", detail: "Failed to process IMAP operation." } } };
    expect(resolveApiErrorMessage(error, "")).toMatch(/fail/i);
  });

  it("returns detail if error_code is not recognized", () => {
    const error = { response: { data: { error_code: "OTHER_ERROR", detail: "Unknown message." } } };
    expect(resolveApiErrorMessage(error, "")).toBe("Unknown message.");
  });

  it("returns fallback if there is no detail", () => {
    const error = { response: { data: { error_code: "OTHER_ERROR" } } };
    expect(resolveApiErrorMessage(error, "fallback")).toBe("fallback");
  });
});
