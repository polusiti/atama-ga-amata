import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { packs } from "@/data/packs";
import { checkCart } from "./cart";

const kb = packs.devstuck.kb;
const sheets = packs.devstuck.sheets!;
const ids = kb.solutions.map((s) => s.id);
const cartArb = fc.uniqueArray(fc.constantFrom(...ids), { maxLength: 8 });
const estArb = fc.uniqueArray(fc.constantFrom(...ids), { maxLength: 5 }).map((a) => new Set(a));

describe("checkCart", () => {
  it("has no duplicates and puts every prerequisite that is in the cart before the move that needs it", () => {
    fc.assert(
      fc.property(cartArb, estArb, (cart, est) => {
        const r = checkCart(kb, cart, est, sheets);
        expect(new Set(r.order).size).toBe(r.order.length);
        expect(new Set(r.order)).toEqual(new Set(cart));
        const pos = new Map(r.order.map((id, i) => [id, i]));
        for (const id of r.order) {
          for (const need of kb.solutions.find((s) => s.id === id)!.requires ?? []) {
            if (pos.has(need)) expect(pos.get(need)!).toBeLessThan(pos.get(id)!);
          }
        }
      }),
    );
  });

  it("adding the suggested moves to the cart leaves nothing missing", () => {
    fc.assert(
      fc.property(cartArb, estArb, (cart, est) => {
        const r = checkCart(kb, cart, est, sheets);
        const again = checkCart(kb, [...cart, ...r.suggestAdd], est, sheets);
        expect(again.missing).toEqual([]);
        expect(again.suggestAdd).toEqual([]);
      }),
    );
  });

  it("never lists a move that is already in place or already in the cart as missing", () => {
    fc.assert(
      fc.property(cartArb, estArb, (cart, est) => {
        const r = checkCart(kb, cart, est, sheets);
        for (const m of r.missing) {
          for (const n of m.needs) {
            expect(est.has(n)).toBe(false);
            expect(cart.includes(n)).toBe(false);
          }
        }
        for (const s of r.suggestAdd) {
          expect(est.has(s)).toBe(false);
          expect(cart.includes(s)).toBe(false);
        }
      }),
    );
  });

  it("the suggested moves come in an order that respects their own prerequisites", () => {
    fc.assert(
      fc.property(cartArb, estArb, (cart, est) => {
        const r = checkCart(kb, cart, est, sheets);
        const pos = new Map(r.suggestAdd.map((id, i) => [id, i]));
        for (const id of r.suggestAdd) {
          for (const need of kb.solutions.find((s) => s.id === id)!.requires ?? []) {
            if (pos.has(need)) expect(pos.get(need)!).toBeLessThan(pos.get(id)!);
          }
        }
      }),
    );
  });

  it("the missing set and the evidence counts do not depend on the order of the cart", () => {
    fc.assert(
      fc.property(cartArb, estArb, (cart, est) => {
        const a = checkCart(kb, cart, est, sheets);
        const b = checkCart(kb, [...cart].reverse(), est, sheets);
        expect(new Set(a.suggestAdd)).toEqual(new Set(b.suggestAdd));
        expect(a.evidence).toEqual(b.evidence);
        expect(a.steps).toBe(b.steps);
      }),
    );
  });

  it("counts every cart move once in the evidence counts, and a move without a sheet as none", () => {
    fc.assert(
      fc.property(cartArb, (cart) => {
        const r = checkCart(kb, cart, new Set(), sheets);
        expect(r.evidence.none + r.evidence["problem-studied"] + r.evidence["method-published"]).toBe(cart.length);
        const noSheet = cart.filter((id) => !sheets[id]).length;
        expect(r.evidence.none).toBe(noSheet);
      }),
    );
  });

  it("gives empty results for an empty cart, and ignores unknown ids and repeats", () => {
    const r = checkCart(kb, [], new Set(), sheets);
    expect(r).toEqual({ order: [], missing: [], suggestAdd: [], steps: 0, evidence: { none: 0, "problem-studied": 0, "method-published": 0 }, allNoData: false });
    const odd = checkCart(kb, ["nope", "fix-repro", "fix-repro"], new Set(), sheets);
    expect(odd.order).toEqual(["fix-repro"]);
  });

  it("says allNoData only when the whole cart rests on moves without data", () => {
    expect(checkCart(kb, ["timebox", "step-away"], new Set(), sheets).allNoData).toBe(true);
    expect(checkCart(kb, ["timebox", "fix-repro"], new Set(), sheets).allNoData).toBe(false);
    expect(checkCart(kb, ["fix-repro"], new Set(), sheets).allNoData).toBe(false);
  });

  it("finds the prerequisite chain in the real data: diff-change needs fix-repro, and fresh-context needs state-goal", () => {
    const a = checkCart(kb, ["diff-change"], new Set(), sheets);
    expect(a.suggestAdd).toContain("fix-repro");
    const b = checkCart(kb, ["fresh-context"], new Set(), sheets);
    expect(b.suggestAdd).toContain("state-goal");
    const c = checkCart(kb, ["diff-change"], new Set(["fix-repro"]), sheets);
    expect(c.missing).toEqual([]);
  });
});
