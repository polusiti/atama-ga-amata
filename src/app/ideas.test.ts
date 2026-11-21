import { describe, expect, it } from "vitest";
import { packs } from "@/data/packs";
import { getIdeas } from "./ideas";

const kinds = packs.devstuck.kb.solutions.map((s) => s.id);
const URL = "https://reader.example/ideas";

function five() {
  return [
    { kind: kinds[0], title: "A", how: "do a", quickTest: "test a" },
    { kind: kinds[1], title: "B", how: "do b", quickTest: "test b" },
    { kind: kinds[2], title: "C", how: "do c", quickTest: "test c" },
    { kind: kinds[3], title: "D", how: "do d", quickTest: "test d" },
    { kind: "other", title: "E", how: "do e", quickTest: "test e" },
  ];
}
function json(body: unknown, status = 200): typeof fetch {
  return (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
}

describe("getIdeas: what the page does with the worker's answer", () => {
  it("returns the five ideas when they pass the rules", async () => {
    const r = await getIdeas(URL, "stuck", "en", 3, kinds, 1000, json({ ok: true, ideas: five() }));
    expect(r.ok && r.ideas.length).toBe(5);
  });

  it("checks the answer again and does not cut: a text that is too long is invalid on the page", async () => {
    const long = five();
    long[0].how = "x".repeat(300);
    expect(await getIdeas(URL, "stuck", "en", 3, kinds, 1000, json({ ok: true, ideas: long }))).toEqual({ ok: false, kind: "invalid" });
  });

  it("treats a changed or broken answer as invalid", async () => {
    const dup = five();
    dup[1].kind = dup[0].kind;
    const ran = five();
    ran[2].how = "I ran the code and it works.";
    for (const ideas of [dup, ran, five().slice(0, 4), "text", null]) {
      expect(await getIdeas(URL, "stuck", "en", 3, kinds, 1000, json({ ok: true, ideas })), JSON.stringify(ideas)?.slice(0, 30)).toEqual({ ok: false, kind: "invalid" });
    }
  });

  it("maps the limit, an invalid answer and a model failure to their kinds", async () => {
    expect(await getIdeas(URL, "s", "en", 0, kinds, 1000, json({ ok: false, reason: "limit" }, 429))).toEqual({ ok: false, kind: "limit" });
    expect(await getIdeas(URL, "s", "en", 0, kinds, 1000, json({ ok: false, reason: "invalid" }))).toEqual({ ok: false, kind: "invalid" });
    expect(await getIdeas(URL, "s", "en", 0, kinds, 1000, json({ ok: false, reason: "model" }, 502))).toEqual({ ok: false, kind: "unreachable" });
  });

  it("treats a network error and a non-JSON answer as unreachable", async () => {
    const down = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    expect(await getIdeas(URL, "s", "en", 0, kinds, 1000, down)).toEqual({ ok: false, kind: "unreachable" });
    const html = (async () => new Response("<html>", { status: 200 })) as unknown as typeof fetch;
    expect(await getIdeas(URL, "s", "en", 0, kinds, 1000, html)).toEqual({ ok: false, kind: "unreachable" });
  });

  it("gives up after the timeout", async () => {
    const slow = ((_u: unknown, init: { signal: AbortSignal }) =>
      new Promise((_r, reject) => {
        init.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
      })) as unknown as typeof fetch;
    const started = Date.now();
    expect(await getIdeas(URL, "s", "en", 0, kinds, 50, slow)).toEqual({ ok: false, kind: "timeout" });
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it("sends the text, the language and the number of failures, and nothing else", async () => {
    let sent: unknown;
    const spy = (async (_u: unknown, init: { body: string }) => {
      sent = JSON.parse(init.body);
      return new Response(JSON.stringify({ ok: false, reason: "invalid" }));
    }) as unknown as typeof fetch;
    await getIdeas(URL, "the build fails", "ja", 2, kinds, 1000, spy);
    expect(sent).toEqual({ text: "the build fails", lang: "ja", failures: 2 });
  });
});
