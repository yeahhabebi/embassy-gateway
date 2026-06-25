import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { parseTxt } from "./dns-txt";

// ---------- Helpers ----------

/**
 * Serialize a list of logical TXT segments into the wire-ish form Google's
 * DNS JSON API returns: each segment is quoted, `"` and `\` are escaped per
 * RFC 1035 §5.1, and segments are joined with a single space.
 */
function encodeSegments(segments: string[]): string {
  return segments
    .map(
      (s) =>
        `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
    )
    .join(" ");
}

// Arbitrary that produces strings containing the tricky characters: quotes,
// backslashes, spaces, and assorted printable ASCII. Empty strings allowed.
const segmentArb = fc.string({
  unit: fc.constantFrom(
    "a", "b", " ", "=", ".", "_", "-", ":", ";",
    '"', "\\", "\\\"", "\\\\", "x", "1", "9"
  ),
  minLength: 0,
  maxLength: 32,
});

describe("parseTxt — property-based fuzz tests", () => {
  it("never throws on arbitrary string input", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 256 }), (raw) => {
        expect(() => parseTxt(raw)).not.toThrow();
        expect(typeof parseTxt(raw)).toBe("string");
      }),
      { numRuns: 500 }
    );
  });

  it("never throws on arbitrary unicode input (including control chars)", () => {
    fc.assert(
      fc.property(fc.string({ unit: "binary", maxLength: 256 }), (raw: string) => {
        const out = parseTxt(raw);
        expect(typeof out).toBe("string");
      }),
      { numRuns: 300 }
    );
  });

  it("is deterministic — same input yields same output across calls", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 256 }), (raw) => {
        expect(parseTxt(raw)).toBe(parseTxt(raw));
      }),
      { numRuns: 300 }
    );
  });

  it("round-trips encoded segments: parseTxt(encode(segments)) === segments.join('')", () => {
    fc.assert(
      fc.property(fc.array(segmentArb, { minLength: 1, maxLength: 8 }), (segments) => {
        const encoded = encodeSegments(segments);
        expect(parseTxt(encoded)).toBe(segments.join(""));
      }),
      { numRuns: 500 }
    );
  });

  it("round-trips a single encoded segment (identity over content)", () => {
    fc.assert(
      fc.property(segmentArb, (s) => {
        expect(parseTxt(encodeSegments([s]))).toBe(s);
      }),
      { numRuns: 500 }
    );
  });

  it("ignores whitespace count between encoded segments", () => {
    fc.assert(
      fc.property(
        fc.array(segmentArb, { minLength: 2, maxLength: 6 }),
        fc.integer({ min: 1, max: 6 }),
        (segments, spaces) => {
          const joined = segments
            .map((s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
            .join(" ".repeat(spaces));
          expect(parseTxt(joined)).toBe(segments.join(""));
        }
      ),
      { numRuns: 300 }
    );
  });

  it("output length never exceeds raw input length", () => {
    // Every byte we emit comes from inside a quoted segment, minus the
    // delimiters/escapes, so output ≤ input in length.
    fc.assert(
      fc.property(fc.string({ maxLength: 256 }), (raw) => {
        expect(parseTxt(raw).length).toBeLessThanOrEqual(raw.length);
      }),
      { numRuns: 500 }
    );
  });

  it("falls back to stripping outer quotes when no balanced quoted segment exists", () => {
    fc.assert(
      fc.property(
        // strings with no `"` and no `\` cannot form a balanced segment
        fc.string({
          unit: fc.constantFrom("a", "b", "c", " ", "=", "x", "1"),
          maxLength: 32,
        }),
        (s) => {
          expect(parseTxt(s)).toBe(s.replace(/^"|"$/g, ""));
        }
      ),
      { numRuns: 200 }
    );
  });

  it("concatenation is associative across segment splits", () => {
    // Splitting one logical value into N quoted pieces yields the same parse
    // regardless of where the splits happen.
    fc.assert(
      fc.property(segmentArb, fc.array(fc.nat(32), { maxLength: 5 }), (whole, cuts) => {
        const sorted = [...cuts].sort((a, b) => a - b).filter((n) => n <= whole.length);
        const parts: string[] = [];
        let last = 0;
        for (const c of sorted) {
          parts.push(whole.slice(last, c));
          last = c;
        }
        parts.push(whole.slice(last));
        expect(parseTxt(encodeSegments(parts))).toBe(whole);
      }),
      { numRuns: 300 }
    );
  });
});
