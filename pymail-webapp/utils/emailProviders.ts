export const EMAIL_PROVIDERS: Record<string, string> = {
  "gmail.com": "imap.gmail.com",
  "googlemail.com": "imap.gmail.com",
  "outlook.com": "imap-mail.outlook.com",
  "hotmail.com": "imap-mail.outlook.com",
  "live.com": "imap-mail.outlook.com",
  "yahoo.com": "imap.mail.yahoo.com",
  "yahoo.com.br": "imap.mail.yahoo.com",
  "protonmail.com": "imap.protonmail.com",
  "proton.me": "imap.protonmail.com",
  "pm.me": "imap.protonmail.com",
};

export function inferIMAPHost(email: string): string | null {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return null;
  return EMAIL_PROVIDERS[domain] ?? null;
}

export type ProviderKind =
  | "google"
  | "microsoft"
  | "yahoo"
  | "proton"
  | "other";

/**
 * Detect the provider from an IMAP host. Works for institutional Google
 * Workspace / Microsoft 365 domains too, once the (inferred or manually entered)
 * host is known — e.g. a university on Google Workspace uses imap.gmail.com.
 */
export function getProviderKind(host: string): ProviderKind {
  const h = (host || "").toLowerCase();
  if (h.includes("gmail") || h.includes("google")) return "google";
  if (
    h.includes("outlook") ||
    h.includes("office365") ||
    h.includes("hotmail") ||
    h.includes("live.com")
  )
    return "microsoft";
  if (h.includes("yahoo")) return "yahoo";
  if (h.includes("proton")) return "proton";
  return "other";
}

/**
 * Gmail/Workspace, Microsoft and Yahoo block basic-password IMAP: an App Password
 * (with 2-Step Verification enabled) is required. Used to warn before submitting.
 */
export function requiresAppPassword(host: string): boolean {
  const kind = getProviderKind(host);
  return kind === "google" || kind === "microsoft" || kind === "yahoo";
}

export function getProviderName(email: string): string {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return "Unknown";

  const providerMap: Record<string, string> = {
    "gmail.com": "Gmail",
    "googlemail.com": "Gmail",
    "outlook.com": "Outlook",
    "hotmail.com": "Outlook",
    "live.com": "Outlook",
    "yahoo.com": "Yahoo Mail",
    "yahoo.com.br": "Yahoo Mail",
    "protonmail.com": "ProtonMail",
    "proton.me": "ProtonMail",
    "pm.me": "ProtonMail",
  };

  return providerMap[domain] ?? domain;
}
