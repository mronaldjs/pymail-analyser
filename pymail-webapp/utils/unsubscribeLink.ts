/**
 * Unsubscribe-link helpers, aligned with the backend's `_clean_unsubscribe_link`
 * (pymail-api/services/analyzer.py).
 *
 * A `List-Unsubscribe` header may carry several comma-separated targets wrapped
 * in angle brackets, mixing `mailto:` and `http(s)` links. These helpers pick the
 * best target and validate http(s) URLs before the app opens them.
 */

export function isValidHttpUrl(link: string): boolean {
  try {
    const url = new URL(link);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeUnsubscribeLink(link: string): string {
  if (!link) return "";

  const candidates = link
    .split(",")
    .map((item) => item.trim().replace(/^<|>$/g, ""))
    .filter(Boolean);

  const mailtoLink = candidates.find((item) =>
    item.toLowerCase().startsWith("mailto:"),
  );
  if (mailtoLink) {
    return mailtoLink;
  }

  const httpLink = candidates.find((item) => isValidHttpUrl(item));
  if (httpLink) {
    return httpLink;
  }

  return candidates[0] ?? "";
}
