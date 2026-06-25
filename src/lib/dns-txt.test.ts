import { describe, it, expect } from "vitest";
import { parseTxt } from "./dns-txt";

describe("parseTxt (RFC 1035 TXT parsing)", () => {
  it("returns a single quoted segment unwrapped", () => {
    expect(parseTxt('"hello world"')).toBe("hello world");
  });

  it("concatenates multiple space-separated quoted segments", () => {
    expect(parseTxt('"part1" "part2"')).toBe("part1part2");
  });

  it("concatenates three or more segments without inserting separators", () => {
    expect(parseTxt('"a" "b" "c"')).toBe("abc");
  });

  it("preserves spaces that live inside the quoted segments", () => {
    expect(parseTxt('"hello " "world"')).toBe("hello world");
  });

  it("joins a long value split at the 255-byte boundary", () => {
    const first = "x".repeat(255);
    const second = "y".repeat(120);
    const raw = `"${first}" "${second}"`;
    expect(parseTxt(raw)).toBe(first + second);
  });

  it("unescapes embedded escaped quotes", () => {
    expect(parseTxt('"foo=\\"bar\\""')).toBe('foo="bar"');
  });

  it("unescapes embedded backslashes", () => {
    expect(parseTxt('"a\\\\b"')).toBe("a\\b");
  });

  it("handles escaped quotes across multiple segments", () => {
    expect(parseTxt('"key=\\"" "value\\""')).toBe('key="value"');
  });

  it("falls back to stripping outer quotes when no quoted segments are present", () => {
    expect(parseTxt('"unterminated')).toBe("unterminated");
    expect(parseTxt('plain')).toBe("plain");
  });

  it("returns an empty string for an empty quoted segment", () => {
    expect(parseTxt('""')).toBe("");
  });

  it("ignores stray whitespace between segments", () => {
    expect(parseTxt('"a"   "b"')).toBe("ab");
  });

  it("preserves a TXT value that contains an equals sign and prefix (verification token shape)", () => {
    const raw = '"lovable-verification=abc123XYZ_-."';
    expect(parseTxt(raw)).toBe("lovable-verification=abc123XYZ_-.");
  });

  it("does not collapse a single segment that itself contains spaces", () => {
    expect(parseTxt('"v=spf1 include:_spf.example.com ~all"')).toBe(
      "v=spf1 include:_spf.example.com ~all"
    );
  });
  // ---------- Mixed empty segments ----------

  it("treats a lone empty segment as an empty string", () => {
    expect(parseTxt('""')).toBe("");
  });

  it("ignores empty segments between non-empty ones", () => {
    expect(parseTxt('"a" "" "b"')).toBe("ab");
  });

  it("handles leading and trailing empty segments", () => {
    expect(parseTxt('"" "payload" ""')).toBe("payload");
  });

  it("concatenates several consecutive empty segments to an empty string", () => {
    expect(parseTxt('"" "" ""')).toBe("");
  });

  // ---------- Multiple quoted strings per TXT record ----------

  it("joins four quoted segments preserving order", () => {
    expect(parseTxt('"v=" "spf1 " "include:_spf " "~all"')).toBe(
      "v=spf1 include:_spf ~all"
    );
  });

  it("joins segments split across the 255-byte boundary three times", () => {
    const a = "a".repeat(255);
    const b = "b".repeat(255);
    const c = "c".repeat(64);
    expect(parseTxt(`"${a}" "${b}" "${c}"`)).toBe(a + b + c);
  });

  it("does not insert separators between adjacent quoted segments with no inner whitespace", () => {
    expect(parseTxt('"alpha""beta""gamma"')).toBe("alphabetagamma");
  });

  it("parses a DKIM-style multi-segment record", () => {
    const raw =
      '"v=DKIM1; k=rsa; " "p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ" "DwIDAQAB"';
    expect(parseTxt(raw)).toBe(
      "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDwIDAQAB"
    );
  });

  // ---------- Adjacent escaped characters ----------

  it("handles two escaped quotes adjacent to each other", () => {
    expect(parseTxt('"\\"\\""')).toBe('""');
  });

  it("handles two escaped backslashes adjacent to each other", () => {
    expect(parseTxt('"\\\\\\\\"')).toBe("\\\\");
  });

  it("handles an escaped backslash followed by an escaped quote", () => {
    expect(parseTxt('"\\\\\\""')).toBe('\\"');
  });

  it("handles an escaped quote followed by an escaped backslash", () => {
    expect(parseTxt('"\\"\\\\"')).toBe('"\\');
  });

  it("preserves adjacent escapes when split across segments", () => {
    expect(parseTxt('"prefix\\"" "\\"suffix"')).toBe('prefix""suffix');
  });

  it("preserves adjacent backslash escapes when split across segments", () => {
    expect(parseTxt('"a\\\\" "\\\\b"')).toBe("a\\\\b");
  });

  it("does not greedily match across an unescaped quote boundary", () => {
    // Two separate segments — the parser must not collapse them into one
    // 5-character segment by ignoring the closing/opening quote pair.
    expect(parseTxt('"a\\"b" "c\\"d"')).toBe('a"bc"d');
  });
});
