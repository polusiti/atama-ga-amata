import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { describeReading, parseReading, type Reading } from "./reader";

const flag = fc.constantFrom(true, false, null);

describe("parseReading: the shape is fixed", () => {
  it("accepts every combination of the two flags and returns the same values", () => {
    fc.assert(
      fc.property(flag, flag, (newApproach, newFact) => {
        expect(parseReading({ newApproach, newFact })).toEqual({ newApproach, newFact });
      }),
    );
  });

  it("accepts the same object as a JSON string", () => {
    fc.assert(
      fc.property(flag, flag, (newApproach, newFact) => {
        expect(parseReading(JSON.stringify({ newApproach, newFact }))).toEqual({ newApproach, newFact });
      }),
    );
  });

  it("rejects an extra key, whatever its value", () => {
    fc.assert(
      fc.property(flag, flag, fc.string({ minLength: 1 }).filter((k) => k !== "newApproach" && k !== "newFact"), fc.anything(), (a, f, k, v) => {
        const obj = Object.create(null) as Record<string, unknown>;
        obj.newApproach = a;
        obj.newFact = f;
        obj[k] = v;
        expect(parseReading(obj)).toBeNull();
      }),
    );
  });

  it("rejects a missing key", () => {
    expect(parseReading({ newApproach: true })).toBeNull();
    expect(parseReading({ newFact: false })).toBeNull();
    expect(parseReading({})).toBeNull();
  });

  it("rejects a value that is not true, false or null", () => {
    const bad = fc.anything().filter((v) => v !== true && v !== false && v !== null);
    fc.assert(
      fc.property(bad, flag, (v, other) => {
        expect(parseReading({ newApproach: v, newFact: other })).toBeNull();
        expect(parseReading({ newApproach: other, newFact: v })).toBeNull();
      }),
    );
  });

  it("rejects text, numbers, arrays, null and undefined", () => {
    for (const v of ["hello", "", 1, 0, [], [true, false], null, undefined, true]) expect(parseReading(v)).toBeNull();
  });

  it("rejects broken JSON, and JSON that is not the shape", () => {
    expect(parseReading("{")).toBeNull();
    expect(parseReading('{"newApproach": true, "newFact": "yes"}')).toBeNull();
    expect(parseReading('{"newApproach": true, "newFact": false, "advice": "stop"}')).toBeNull();
    expect(parseReading('{"__proto__": {"newApproach": true, "newFact": true}}')).toBeNull();
  });

  it("is sound: whatever it accepts has exactly the two keys with flag values", () => {
    fc.assert(
      fc.property(fc.anything(), (raw) => {
        const r = parseReading(raw);
        if (r === null) return;
        expect(Object.keys(r).sort()).toEqual(["newApproach", "newFact"]);
        expect([true, false, null]).toContain(r.newApproach);
        expect([true, false, null]).toContain(r.newFact);
      }),
    );
  });

  it("is sound for any JSON text too", () => {
    fc.assert(
      fc.property(fc.json(), (text) => {
        const r = parseReading(text);
        if (r === null) return;
        expect(Object.keys(r).sort()).toEqual(["newApproach", "newFact"]);
      }),
    );
  });
});

describe("describeReading: the sentence the shopkeeper shows", () => {
  const all: Reading[] = [true, false, null].flatMap((newApproach) => [true, false, null].map((newFact) => ({ newApproach, newFact })));

  it("asks before adding, in both languages, for every reading", () => {
    for (const r of all) {
      expect(describeReading(r, "en")).toMatch(/Add it to your list of tries\?$/);
      expect(describeReading(r, "ja")).toMatch(/足しますか？$/);
    }
  });

  it("says plainly when it could not tell", () => {
    expect(describeReading({ newApproach: null, newFact: true }, "en")).toMatch(/could not tell whether the approach changed/);
    expect(describeReading({ newApproach: true, newFact: null }, "ja")).toMatch(/新しい事実が出たかは分からない/);
    expect(describeReading({ newApproach: true, newFact: false }, "en")).toBe("So that try used a different approach. Nothing new turned up. Add it to your list of tries?");
    expect(describeReading({ newApproach: false, newFact: true }, "ja")).toBe("こう読みました: 前と同じやり方、新しい事実あり。違っていたら、あとで画面で直せます。リストに足しますか？");
  });

  it("never claims to understand the person (voice rule 3)", () => {
    for (const r of all) {
      expect(describeReading(r, "en")).not.toMatch(/understand|I see/i);
      expect(describeReading(r, "ja")).not.toMatch(/理解|わかりました|分かりました/);
    }
  });
});
