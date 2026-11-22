import { describe, expect, it } from "vitest";
import { getGhostLine } from "./ghost";
const fetchOf = (body: unknown): typeof fetch => (async () => new Response(JSON.stringify(body))) as unknown as typeof fetch;
describe("getGhostLine", () => {
  it("returns the line the worker sends", async () => {
    expect(await getGhostLine("en", "http://x", 1000, fetchOf({ ok: true, line: "Bin the chicken in the tree?" }))).toBe("Bin the chicken in the tree?");
  });
  it("returns null, not a canned line, when the worker says no or the network fails", async () => {
    expect(await getGhostLine("en", "http://x", 1000, fetchOf({ ok: false, reason: "invalid" }))).toBeNull();
    const down = (async () => { throw new Error("down"); }) as unknown as typeof fetch;
    expect(await getGhostLine("ja", "http://x", 1000, down)).toBeNull();
  });
  it("sends only the language", async () => {
    let sent = "";
    const f = (async (_u: unknown, init: RequestInit) => { sent = String(init.body); return new Response(JSON.stringify({ ok: true, line: "x y" })); }) as unknown as typeof fetch;
    await getGhostLine("ja", "http://x", 1000, f);
    expect(Object.keys(JSON.parse(sent))).toEqual(["lang"]);
  });
});
