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
});
