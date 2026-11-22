import { describe, expect, it } from "vitest";
import { getShake } from "./shake";
const good = { ok: true, shakes: [
  { title: "Invert it", how: "Write the opposite of your goal and look for what you already do that matches.", minutes: 5 },
  { title: "Shrink it", how: "Cut the problem to one line of input and solve only that.", minutes: 4 },
  { title: "Swap roles", how: "Explain the bug to a rubber duck as if you were the duck.", minutes: 3 },
] };
const fetchOf = (body: unknown): typeof fetch => (async () => new Response(JSON.stringify(body))) as unknown as typeof fetch;
describe("getShake", () => {
  it("uses the deck in Japanese and never calls the network", async () => {
    let called = false;
    const f = (async () => { called = true; return new Response("{}"); }) as unknown as typeof fetch;
    const r = await getShake("ja", 3, Math.random, "http://x", 1000, f);
    expect(called).toBe(false);
    expect(r.source).toBe("deck");
    expect(r.shakes).toHaveLength(3);
  });
  it("returns the model's moves in English when they pass the rules", async () => {
    const r = await getShake("en", 3, Math.random, "http://x", 1000, fetchOf(good));
    expect(r.source).toBe("ai");
    expect(r.shakes[0].title).toBe("Invert it");
  });
  it("falls back to the deck when the answer breaks a rule", async () => {
    const bad = { ok: true, shakes: [{ title: "a", how: "b", minutes: 99 }] };
    const r = await getShake("en", 3, Math.random, "http://x", 1000, fetchOf(bad));
    expect(r.source).toBe("deck");
    expect(r.shakes).toHaveLength(3);
  });
  it("falls back to the deck when the network fails", async () => {
    const f = (async () => { throw new Error("down"); }) as unknown as typeof fetch;
    const r = await getShake("en", 3, Math.random, "http://x", 1000, f);
    expect(r.source).toBe("deck");
  });
  it("sends only the language and the number of failures", async () => {
    let sent = "";
    const f = (async (_u: unknown, init: RequestInit) => { sent = String(init.body); return new Response(JSON.stringify(good)); }) as unknown as typeof fetch;
    await getShake("en", 3, Math.random, "http://x", 1000, f);
    expect(Object.keys(JSON.parse(sent)).sort()).toEqual(["failures", "lang"]);
  });
});
