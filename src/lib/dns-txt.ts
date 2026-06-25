// Parse a TXT data field returned by Google DNS (https://dns.google/resolve).
// RFC 1035 allows a TXT record to be composed of one or more <character-string>
// values (each ≤255 bytes) that callers must concatenate to recover the
// logical TXT value. Google's JSON DNS API returns those segments as
// space-separated quoted strings (e.g. `"part1" "part2"`). Some clients hand
// back a single quoted blob. This helper handles both shapes, and unescapes
// `\"` and `\\` per RFC 1035 §5.1.
export function parseTxt(raw: string): string {
  const segments = raw.match(/"((?:[^"\\]|\\.)*)"/g);
  if (segments && segments.length > 0) {
    return segments
      .map((s) => s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\"))
      .join("");
  }
  return raw.replace(/^"|"$/g, "");
}
