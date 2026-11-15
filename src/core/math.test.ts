import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { entropy, fisherRao, geodesicPoint, jsd, kl, normalize, sum } from "./math";

/** Random categorical distribution of the given size, with strictly positive mass. */
const dist = (n: number) =>
  fc
    .array(fc.double({ min: 0.001, max: 1, noNaN: true }), { minLength: n, maxLength: n })
    .map((xs) => normalize(xs));

describe("normalize", () => {
  it("sums to 1 and keeps non-negativity", () => {
    fc.assert(
      fc.property(dist(6), (p) => {
        expect(sum(p)).toBeCloseTo(1, 10);
        expect(p.every((x) => x >= 0)).toBe(true);
      }),
    );
  });
});

describe("fisherRao", () => {
  it("is symmetric", () => {
    fc.assert(
      fc.property(dist(5), dist(5), (p, q) => {
        expect(fisherRao(p, q)).toBeCloseTo(fisherRao(q, p), 10);
      }),
    );
  });

  it("is zero on identical distributions and stays within [0, pi]", () => {
    fc.assert(
      fc.property(dist(5), dist(5), (p, q) => {
        expect(fisherRao(p, p)).toBeLessThan(1e-6);
        const d = fisherRao(p, q);
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(Math.PI + 1e-12);
      }),
    );
  });

  it("satisfies the triangle inequality", () => {
    fc.assert(
      fc.property(dist(5), dist(5), dist(5), (p, q, r) => {
        expect(fisherRao(p, r)).toBeLessThanOrEqual(fisherRao(p, q) + fisherRao(q, r) + 1e-9);
      }),
    );
  });

  it("is exactly pi for distributions with disjoint support", () => {
    expect(fisherRao([1, 0], [0, 1])).toBeCloseTo(Math.PI, 12);
  });

  it("is locally twice the square root of KL for nearby distributions", () => {
    const p = [0.5, 0.3, 0.2];
    const q = [0.5 + 1e-4, 0.3 - 1e-4, 0.2];
    expect(fisherRao(p, q)).toBeCloseTo(Math.sqrt(2 * kl(p, q)), 6);
  });
});

describe("geodesicPoint", () => {
  const t01 = fc.double({ min: 0, max: 1, noNaN: true });

  it("is a distribution", () => {
    fc.assert(
      fc.property(dist(5), dist(5), t01, (p, q, t) => {
        const x = geodesicPoint(p, q, t);
        expect(sum(x)).toBeCloseTo(1, 10);
        expect(x.every((v) => v >= 0)).toBe(true);
      }),
    );
  });

  it("starts at p and ends at q", () => {
    fc.assert(
      fc.property(dist(5), dist(5), (p, q) => {
        geodesicPoint(p, q, 0).forEach((v, i) => expect(v).toBeCloseTo(p[i], 8));
        geodesicPoint(p, q, 1).forEach((v, i) => expect(v).toBeCloseTo(q[i], 8));
      }),
    );
  });

  it("moves at constant speed along the arc", () => {
    fc.assert(
      fc.property(dist(5), dist(5), t01, (p, q, t) => {
        const d = fisherRao(p, q);
        const x = geodesicPoint(p, q, t);
        expect(fisherRao(p, x)).toBeCloseTo(t * d, 6);
        expect(fisherRao(x, q)).toBeCloseTo((1 - t) * d, 6);
      }),
    );
  });

  it("is symmetric: from p to q at t equals from q to p at 1 - t", () => {
    fc.assert(
      fc.property(dist(5), dist(5), t01, (p, q, t) => {
        const a = geodesicPoint(p, q, t);
        const b = geodesicPoint(q, p, 1 - t);
        a.forEach((v, i) => expect(v).toBeCloseTo(b[i], 7));
      }),
    );
  });
});

describe("jsd", () => {
  it("is zero when everyone agrees", () => {
    fc.assert(
      fc.property(dist(5), (p) => {
        expect(jsd([p, p, p])).toBeLessThan(1e-12);
      }),
    );
  });

  it("is non-negative and bounded by ln(number of parties)", () => {
    fc.assert(
      fc.property(dist(5), dist(5), dist(5), (a, b, c) => {
        const v = jsd([a, b, c]);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(Math.log(3) + 1e-9);
      }),
    );
  });
});

describe("entropy", () => {
  it("is maximal for the uniform distribution", () => {
    fc.assert(
      fc.property(dist(6), (p) => {
        expect(entropy(p)).toBeLessThanOrEqual(Math.log(6) + 1e-12);
      }),
    );
  });
});

