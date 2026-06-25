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

// =====================================================================
// Unicode / UTF-8 / escape edge-case fuzz tests
// =====================================================================

/**
 * Encode a list of logical TXT segments into the form Google's DNS JSON API
 * returns: each segment quoted with `"` and `\` escaped per RFC 1035 §5.1,
 * joined by a single space. Duplicated locally so the unicode block stays
 * self-contained.
 */
function encodeSegmentsUnicode(segments: string[]): string {
  return segments
    .map((s) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`)
    .join(" ");
}

// Full-unicode grapheme arbitrary — emits real BMP + astral plane code points
// (emoji, CJK, RTL marks, combining diacritics, surrogate pairs).
const graphemeArb = fc.string({ unit: "grapheme", minLength: 0, maxLength: 24 });

// Raw 16-bit code-unit strings: may contain unpaired surrogates, NULs, and
// other invalid UTF-16 sequences. Stresses regex behavior at the byte level.
const codeUnitArb = fc.string({ unit: "binary", minLength: 0, maxLength: 64 });

// A grapheme/escape mix: real unicode peppered with the structurally
// significant characters (`"`, `\`, space).
const mixedArb = fc.string({
  unit: fc.oneof(
    fc.constantFrom('"', "\\", " ", "\\\"", "\\\\"),
    fc.string({ unit: "grapheme", minLength: 1, maxLength: 1 })
  ),
  minLength: 0,
  maxLength: 32,
});

describe("parseTxt — unicode & UTF-8 fuzz", () => {
  it("never throws on full-unicode grapheme strings", () => {
    fc.assert(
      fc.property(graphemeArb, (raw: string) => {
        expect(() => parseTxt(raw)).not.toThrow();
        expect(typeof parseTxt(raw)).toBe("string");
      }),
      { numRuns: 500 }
    );
  });

  it("never throws on raw UTF-16 code-unit strings (including unpaired surrogates)", () => {
    fc.assert(
      fc.property(codeUnitArb, (raw: string) => {
        expect(() => parseTxt(raw)).not.toThrow();
        expect(typeof parseTxt(raw)).toBe("string");
      }),
      { numRuns: 500 }
    );
  });

  it("never throws on grapheme/escape-character mixes", () => {
    fc.assert(
      fc.property(mixedArb, (raw: string) => {
        expect(() => parseTxt(raw)).not.toThrow();
        expect(typeof parseTxt(raw)).toBe("string");
      }),
      { numRuns: 500 }
    );
  });

  it("round-trips encoded unicode segments byte-for-byte", () => {
    fc.assert(
      fc.property(fc.array(graphemeArb, { minLength: 1, maxLength: 6 }), (segments) => {
        expect(parseTxt(encodeSegmentsUnicode(segments))).toBe(segments.join(""));
      }),
      { numRuns: 400 }
    );
  });

  it("round-trips encoded mixed (grapheme + escape) segments", () => {
    fc.assert(
      fc.property(fc.array(mixedArb, { minLength: 1, maxLength: 6 }), (segments) => {
        expect(parseTxt(encodeSegmentsUnicode(segments))).toBe(segments.join(""));
      }),
      { numRuns: 400 }
    );
  });

  it("preserves a single emoji segment exactly", () => {
    fc.assert(
      fc.property(
        fc.string({ unit: "grapheme", minLength: 1, maxLength: 8 }),
        (s) => {
          expect(parseTxt(encodeSegmentsUnicode([s]))).toBe(s);
        }
      ),
      { numRuns: 300 }
    );
  });

  it("is deterministic on unicode input", () => {
    fc.assert(
      fc.property(graphemeArb, (raw: string) => {
        expect(parseTxt(raw)).toBe(parseTxt(raw));
      }),
      { numRuns: 300 }
    );
  });

  it("handles NUL bytes and control characters inside quoted segments", () => {
    fc.assert(
      fc.property(
        fc.string({
          unit: fc.constantFrom(
            "\u0000", "\u0001", "\u0007", "\u000a", "\u000d", "\u001b", "\u007f", "a"
          ),
          minLength: 0,
          maxLength: 16,
        }),
        (s) => {
          expect(parseTxt(encodeSegmentsUnicode([s]))).toBe(s);
        }
      ),
      { numRuns: 300 }
    );
  });

  it("handles strings whose code-point length differs from UTF-16 length", () => {
    // Astral-plane code points use 2 UTF-16 code units. Verify that splitting
    // such a string across multiple TXT segments still round-trips.
    fc.assert(
      fc.property(
        fc.array(
          fc.string({ unit: "grapheme", minLength: 1, maxLength: 4 }),
          { minLength: 2, maxLength: 5 }
        ),
        (segments) => {
          const out = parseTxt(encodeSegmentsUnicode(segments));
          expect(out).toBe(segments.join(""));
          // Sanity: output length is the sum of UTF-16 code-unit lengths.
          expect(out.length).toBe(segments.reduce((n, s) => n + s.length, 0));
        }
      ),
      { numRuns: 300 }
    );
  });

  it("output is always shorter than or equal to raw input length (unicode)", () => {
    fc.assert(
      fc.property(mixedArb, (raw: string) => {
        expect(parseTxt(raw).length).toBeLessThanOrEqual(raw.length);
      }),
      { numRuns: 500 }
    );
  });
});
