import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { PIT_PARAMS, failuresInRun, pHard, pNext, pitCheck, switchPoint, type Attempt, type PitParams } from "./pit";

const paramsArb: fc.Arbitrary<PitParams> = fc
  .tuple(
    fc.double({ min: 0.2, max: 0.9, noNaN: true }), // pe
    fc.double({ min: 0.001, max: 0.15, noNaN: true }), // ph
    fc.double({ min: 0.05, max: 0.95, noNaN: true }), // w0
    fc.double({ min: 0.01, max: 0.6, noNaN: true }), // pSwitch
  )
  .map(([pe, ph, w0, pSwitch]) => ({ pe, ph, w0, pSwitch }));

describe("pit: the same approach gets worse with each failure", () => {
  it("pNext never increases with the number of failures (when easy is easier than hard)", () => {
    fc.assert(
      fc.property(paramsArb, fc.integer({ min: 0, max: 60 }), (p, k) => {
        expect(pNext(k + 1, p)).toBeLessThanOrEqual(pNext(k, p) + 1e-12);
      }),
    );
  });

  it("starts at the prior mean with no failures", () => {
    fc.assert(
      fc.property(paramsArb, (p) => {
        expect(pNext(0, p)).toBeCloseTo(p.w0 * p.ph + (1 - p.w0) * p.pe, 12);
      }),
    );
  });

  it("pHard rises toward 1 and stays within [0, 1]", () => {
    fc.assert(
      fc.property(paramsArb, fc.integer({ min: 0, max: 80 }), (p, k) => {
        const w = pHard(k, p);
        expect(w).toBeGreaterThanOrEqual(0);
        expect(w).toBeLessThanOrEqual(1);
        expect(pHard(k + 1, p)).toBeGreaterThanOrEqual(w - 1e-12);
      }),
    );
  });

  it("pNext stays between the hard and the easy success chances", () => {
    fc.assert(
      fc.property(paramsArb, fc.integer({ min: 0, max: 80 }), (p, k) => {
        const v = pNext(k, p);
        expect(v).toBeGreaterThanOrEqual(p.ph - 1e-12);
        expect(v).toBeLessThanOrEqual(p.pe + 1e-12);
      }),
    );
  });
});

describe("pit: history and verdict", () => {
  it("counts failures only since the last new approach", () => {
    const a = (newApproach: boolean): Attempt => ({ newApproach });
    expect(failuresInRun([])).toBe(0);
    expect(failuresInRun([a(false), a(false), a(false)])).toBe(3);
    expect(failuresInRun([a(false), a(false), a(true)])).toBe(0);
    expect(failuresInRun([a(false), a(true), a(false), a(false)])).toBe(2);
  });

  it("a new approach gives the same report as a fresh start", () => {
    const worn: Attempt[] = Array.from({ length: 9 }, () => ({ newApproach: false }));
    const afterNew = pitCheck([...worn, { newApproach: true }]);
    const fresh = pitCheck([]);
    expect(afterNew.pNext).toBeCloseTo(fresh.pNext, 12);
    expect(afterNew.verdict).toBe(fresh.verdict);
  });

  it("the report has no time input: the same history gives the same report", () => {
    const h: Attempt[] = [{ newApproach: false }, { newApproach: false }, { newApproach: false }];
    expect(pitCheck(h)).toEqual(pitCheck(h));
  });

  it("switches after enough failures and persists at the start, with the default numbers", () => {
    expect(pitCheck([]).verdict).toBe("persist");
    const sp = switchPoint();
    expect(sp).not.toBeNull();
    const h = (n: number): Attempt[] => Array.from({ length: n }, () => ({ newApproach: false }));
    expect(pitCheck(h(sp! - 1)).verdict).toBe("persist");
    expect(pitCheck(h(sp!)).verdict).toBe("switch");
  });

  it("a higher chance for a fresh approach never makes the verdict less willing to switch", () => {
    fc.assert(
      fc.property(paramsArb, fc.integer({ min: 0, max: 40 }), fc.double({ min: 0, max: 0.3, noNaN: true }), (p, k, bump) => {
        const h: Attempt[] = Array.from({ length: k }, () => ({ newApproach: false }));
        const low = pitCheck(h, p);
        const high = pitCheck(h, { ...p, pSwitch: Math.min(0.99, p.pSwitch + bump) });
        if (low.verdict === "switch") expect(high.verdict).toBe("switch");
      }),
    );
  });

  it("returns both numbers it compared", () => {
    const r = pitCheck([{ newApproach: false }, { newApproach: false }]);
    expect(r.pNext).toBeGreaterThan(0);
    expect(r.pSwitch).toBe(PIT_PARAMS.pSwitch);
  });
});
