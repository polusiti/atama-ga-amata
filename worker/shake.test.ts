import { describe, expect, it, vi } from "vitest";
import { SHAKE_MODEL, handleShake, shakePrompt, type ShakeDeps } from "./shake";

const SITE = "https://polusiti.github.io";

function req(body: unknown, init: { origin?: string | null; method?: string; ip?: string } = {}): Request {
  const headers: Record<string, string> = { "content-type": "application/json" };
  const origin = init.origin === undefined ? SITE : init.origin;
  if (origin !== null) headers.origin = origin;
  if (init.ip) headers["cf-connecting-ip"] = init.ip;
  return new Request("https://reader.example/shake", {
    method: init.method ?? "POST",
    headers,
    body: init.method === "OPTIONS" || init.method === "GET" ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });
}

const good = () => ({
  moves: [
    { title: "Run it backwards", how: "Do the steps in the opposite order for five minutes.", minutes: 5 },
    { title: "Cut it in half", how: "Remove half of the input and see if it still fails.", minutes: 8 },
    { title: "Draw it", how: "Draw the data flow with arrows on paper.", minutes: 6 },
  ],
});

function deps(response: unknown, opts: { allow?: boolean; throws?: string } = {}) {
  const run = vi.fn(async () => {
    if (opts.throws) throw new Error(opts.throws);
    return { response };
  });
  const limit = vi.fn(async () => opts.allow ?? true);
  const words = vi.fn(() => ["lantern", "ferry"]);
  const d: ShakeDeps = { ai: { run }, limit, words };
  return { d, run, limit, words };
}

describe("shake worker: who may call", () => {
  it("refuses another origin and no origin, before the limiter and the model", async () => {
    const { d, run, limit } = deps(good());
    expect((await handleShake(req({ lang: "en" }, { origin: "https://evil.example" }), {}, d)).status).toBe(403);
    expect((await handleShake(req({ lang: "en" }, { origin: null }), {}, d)).status).toBe(403);
    expect(run).not.toHaveBeenCalled();
    expect(limit).not.toHaveBeenCalled();
  });

  it("answers the preflight for the allowed origin only, and refuses other methods", async () => {
    const { d } = deps(null);
    expect((await handleShake(req(null, { method: "OPTIONS" }), {}, d)).status).toBe(204);
    expect((await handleShake(req(null, { method: "GET" }), {}, d)).status).toBe(405);
  });

  it("rejects a body that is not JSON before the limiter and the model", async () => {
    const { d, run, limit } = deps(good());
    for (const c of ["{", "null", "7"]) expect((await handleShake(req(c), {}, d)).status, c).toBe(400);
    expect(run).not.toHaveBeenCalled();
    expect(limit).not.toHaveBeenCalled();
  });

  it("returns 429 over the limit, and does not call the model", async () => {
    const { d, run, limit } = deps(good(), { allow: false });
    const res = await handleShake(req({ lang: "en" }, { ip: "203.0.113.7" }), {}, d);
    expect(res.status).toBe(429);
    expect(limit).toHaveBeenCalledWith("203.0.113.7");
    expect(run).not.toHaveBeenCalled();
  });
});

describe("shake worker: nothing of the person's goes to the model", () => {
  it("sends the model only the language, the number of failures and the two seed words, even if the caller sends more", async () => {
    const { d, run } = deps(good());
    await handleShake(req({ lang: "ja", failures: 4, text: "my-private-secret-77", situation: "my-private-secret-77", extra: { a: 1 } }), {}, d);
    const [model, payload] = run.mock.calls[0] as unknown as [string, { messages: { role: string; content: string }[] }];
    expect(model).toBe(SHAKE_MODEL);
    const user = payload.messages.find((m) => m.role === "user")!;
    expect(JSON.parse(user.content)).toEqual({ language: "Japanese", sameApproachFailures: 4, seedWords: ["lantern", "ferry"] });
    expect(JSON.stringify(payload)).not.toContain("my-private-secret");
  });

  it("falls back to English and zero failures when the values are missing or wrong", async () => {
    const { d, run } = deps(good());
    await handleShake(req({ lang: "fr", failures: -3 }), {}, d);
    const [, payload] = run.mock.calls[0] as unknown as [string, { messages: { role: string; content: string }[] }];
    expect(JSON.parse(payload.messages.find((m) => m.role === "user")!.content)).toMatchObject({ language: "English", sameApproachFailures: 0 });
  });

  it("asks for context-free provocations, forbids destructive ones and false claims, and gives no problem to the model", () => {
    const p = shakePrompt();
    expect(p).toMatch(/must not ask about it/);
    expect(p).toMatch(/ANY stuck problem/);
    expect(p).toMatch(/Nothing destructive/);
    expect(p).toMatch(/you cannot/);
    expect(p).toMatch(/Do not praise or agree/);
  });
});

describe("shake worker: what comes back", () => {
  it("returns three provocations that pass the rules", async () => {
    const { d } = deps(good());
    const body = (await (await handleShake(req({ lang: "en" }), {}, d)).json()) as { ok: boolean; shakes: unknown[] };
    expect(body.ok).toBe(true);
    expect(body.shakes.length).toBe(3);
  });

  it("returns nothing when the answer breaks a rule, and logs only the name of the rule", async () => {
    const claim = good();
    claim.moves[1].how = "I ran it and it passes now.";
    const logged: unknown[][] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...a: unknown[]) => void logged.push(a));
    for (const bad of [claim, { moves: good().moves.slice(0, 2) }, "Sure, here you go!", null, { moves: good().moves.map((m) => ({ ...m, minutes: 99 })) }]) {
      const { d } = deps(bad);
      expect(await (await handleShake(req({ lang: "en" }), {}, d)).json()).toMatchObject({ ok: false, reason: "invalid", rule: expect.stringMatching(/^[a-z-]+(:[a-z-]+)?$/) });
    }
    expect(JSON.stringify(logged)).not.toContain("I ran it");
    spy.mockRestore();
  });

  it("rejects an answer in the wrong language", async () => {
    const { d } = deps(good());
    expect(await (await handleShake(req({ lang: "ja" }), {}, d)).json()).toEqual({ ok: false, reason: "invalid", rule: "wrong-language" });
  });

  it("answers 502 when the model call fails, and does not log anything the model said", async () => {
    const logged: unknown[][] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((...a: unknown[]) => void logged.push(a));
    const { d } = deps(null, { throws: "5028: model gone" });
    const res = await handleShake(req({ lang: "en" }), {}, d);
    expect(res.status).toBe(502);
    expect(JSON.stringify(logged)).toMatch(/5028: model gone/);
    spy.mockRestore();
  });

  it("uses the SHAKE_MODEL variable when set, and the default when it is not", async () => {
    const { d, run } = deps(good());
    await handleShake(req({ lang: "en" }), {}, d);
    await handleShake(req({ lang: "en" }), { SHAKE_MODEL: "@cf/example/other" }, d);
    await handleShake(req({ lang: "en" }), { SHAKE_MODEL: "  " }, d);
    expect(run.mock.calls.map((c) => (c as unknown as [string])[0])).toEqual([SHAKE_MODEL, "@cf/example/other", SHAKE_MODEL]);
  });
});
