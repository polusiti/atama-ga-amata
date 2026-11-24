import { describe, expect, it } from "vitest";
import { checkGhost, handleGhost, type GhostDeps } from "./ghost";
const ORIGIN = "https://polusiti.github.io";
const req = (body: unknown, origin: string | null = ORIGIN) =>
  new Request("https://w.example/ghost", {
    method: "POST",
    headers: origin ? { origin, "content-type": "application/json" } : { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
const deps = (response: unknown, sent: unknown[] = []): GhostDeps => ({
  ai: { run: async (_m, input) => { sent.push(input); return { response }; } },
  limit: async () => true,
  seeds: () => ["Brazil", "on top of a tree", "fried chicken", "a trash can"],
});
describe("checkGhost", () => {
  it("accepts one short line in the right language", () => {
    expect(checkGhost({ line: "In Brazil, in a tree, would you bin the fried chicken?" }, "en").line).not.toBeNull();
    expect(checkGhost('{"line":"ブラジルの木の上で、からあげをゴミ箱に入れませんか？"}', "ja").line).not.toBeNull();
  });
  it("rejects an empty line, a number, the wrong language and extra fields", () => {
    expect(checkGhost({ line: "  " }, "en").reason).toBe("bad-text");
    expect(checkGhost({ line: "There is a 50% chance." }, "en").reason).toBe("has-number");
    expect(checkGhost({ line: "Brazil tree chicken bin?" }, "ja").reason).toBe("wrong-language");
    expect(checkGhost({ line: "ブラジルの木の上" }, "en").reason).toBe("wrong-language");
    expect(checkGhost({ line: "a", extra: 1 }, "en").reason).toBe("wrong-container");
  });
  it("rejects a line where the model's output broke down (measured live on 2026-11-24)", () => {
    const broken = "むかしむかし、キューバの自転車の上にマヨネーズと掃除機が')}assistantassistantiangleKickSite fishingHere site knowledge";
    expect(checkGhost({ line: broken }, "ja").line).toBeNull();
    expect(checkGhost({ line: "むかしむかし assistant fishing site 古い橋" }, "ja").line).toBeNull();
    expect(checkGhost({ line: "A line with {braces} in it" }, "en").reason).toBe("has-symbol");
  });

  it("rejects a claim of having run something", () => {
    expect(checkGhost({ line: "I ran the tests and they pass." }, "en").line).toBeNull();
  });
});
describe("handleGhost", () => {
  it("sends the model only the language and the seeds, even if the caller sends more", async () => {
    const sent: unknown[] = [];
    await handleGhost(req({ lang: "en", text: "my secret problem", failures: 3 }), {}, deps({ line: "Bin the chicken in the tree?" }, sent));
    const text = JSON.stringify(sent);
    expect(text).not.toMatch(/secret|failures/);
    expect(text).toMatch(/Brazil/);
  });
  it("returns no line (and no canned one) when the rules reject the answer", async () => {
    const res = await handleGhost(req({ lang: "en" }), {}, deps({ line: "" }));
    expect(await res.json()).toMatchObject({ ok: false, reason: "invalid" });
  });
  it("refuses an unknown origin", async () => {
    const res = await handleGhost(req({ lang: "en" }, "https://evil.example"), {}, deps({ line: "x y z" }));
    expect(res.status).toBe(403);
  });
});
