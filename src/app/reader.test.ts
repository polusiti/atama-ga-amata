import { describe, expect, it } from "vitest";
import { readSentence } from "./reader";

const URL = "https://reader.example/read";

function json(body: unknown, status = 200): typeof fetch {
  return (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
}

describe("readSentence: what the page does with the worker's answer", () => {
  it("returns the reading when the worker answers in the shape", async () => {
    const r = await readSentence(URL, "hi", "en", 1000, json({ ok: true, reading: { newApproach: true, newFact: null } }));
    expect(r).toEqual({ ok: true, reading: { newApproach: true, newFact: null } });
  });

  it("checks the answer again: extra fields, wrong types or missing fields count as invalid", async () => {
    for (const reading of [{ newApproach: true, newFact: true, advice: "x" }, { newApproach: "yes", newFact: false }, { newApproach: true }, null, "text"]) {
      const r = await readSentence(URL, "hi", "en", 1000, json({ ok: true, reading }));
      expect(r, JSON.stringify(reading)).toEqual({ ok: false, kind: "invalid" });
    }
  });

  it("maps the limit, an invalid reading and a model failure to their kinds", async () => {
    expect(await readSentence(URL, "hi", "en", 1000, json({ ok: false, reason: "limit" }, 429))).toEqual({ ok: false, kind: "limit" });
    expect(await readSentence(URL, "hi", "en", 1000, json({ ok: false, reason: "limit" }, 200))).toEqual({ ok: false, kind: "limit" });
    expect(await readSentence(URL, "hi", "en", 1000, json({ ok: false, reason: "invalid" }))).toEqual({ ok: false, kind: "invalid" });
    expect(await readSentence(URL, "hi", "en", 1000, json({ ok: false, reason: "model" }, 502))).toEqual({ ok: false, kind: "unreachable" });
    expect(await readSentence(URL, "hi", "en", 1000, json({ ok: false, reason: "origin" }, 403))).toEqual({ ok: false, kind: "unreachable" });
  });

  it("treats a network error and a non-JSON answer as unreachable", async () => {
    const down = (async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    expect(await readSentence(URL, "hi", "en", 1000, down)).toEqual({ ok: false, kind: "unreachable" });
    const html = (async () => new Response("<html>", { status: 200 })) as unknown as typeof fetch;
    expect(await readSentence(URL, "hi", "en", 1000, html)).toEqual({ ok: false, kind: "unreachable" });
  });

  it("gives up after the timeout, and does not wait for a slow worker", async () => {
    const slow = ((_url: unknown, init: { signal: AbortSignal }) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => reject(Object.assign(new Error("aborted"), { name: "AbortError" })));
      })) as unknown as typeof fetch;
    const started = Date.now();
    const r = await readSentence(URL, "hi", "en", 50, slow);
    expect(r).toEqual({ ok: false, kind: "timeout" });
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it("sends the sentence and the language as JSON, and nothing else", async () => {
    let sent: { body?: unknown; method?: string } = {};
    const spy = (async (_u: unknown, init: { body: string; method: string }) => {
      sent = { body: JSON.parse(init.body), method: init.method };
      return new Response(JSON.stringify({ ok: false, reason: "invalid" }));
    }) as unknown as typeof fetch;
    await readSentence(URL, "I changed the approach", "ja", 1000, spy);
    expect(sent).toEqual({ method: "POST", body: { text: "I changed the approach", lang: "ja" } });
  });
});
