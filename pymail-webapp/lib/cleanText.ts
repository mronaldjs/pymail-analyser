export function cleanText(input?: string | null) {
  if (!input) return '';
  let s = String(input);

  // Remove encoded-words like =?UTF-8?Q?Foo?=
  s = s.replace(/=\?[^?]*\?[BbQq]\?[^?]*\?=/g, '');

  // Remove HTML tags
  s = s.replace(/<[^>]*>/g, '');

  // Remove control characters
  s = s.replace(/[\x00-\x1F\x7F]/g, '');

  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}
