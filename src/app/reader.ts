import { parseReading, type Reading } from "@/core/reader";
import type { Lang } from "@/core/types";

/**
 * The browser side of the sentence reader (see .kiro/specs/reader-worker). It sends one sentence and gets back two flags.
 * The answer is checked again here with `parseReading`: the worker is not trusted by the client either.
 * Nothing is stored. A failure never blocks the page, because the checkboxes still work.
 */
export const READER_URL = process.env.NEXT_PUBLIC_READER_URL ?? "https://atamagazon-reader.t88596565.workers.dev";
export const READER_TIMEOUT_MS = 6000;

export type ReadFailureKind = "unreachable" | "timeout" | "limit" | "invalid";
export type ReadResult = { ok: true; reading: Reading } | { ok: false; kind: ReadFailureKind };

export async function readSentence(
  url: string,
  text: string,
  lang: Lang,
  timeoutMs: number = READER_TIMEOUT_MS,
  fetchImpl: typeof fetch = fetch,
): Promise<ReadResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, lang }),
      signal: controller.signal,
    });
    if (res.status === 429) return { ok: false, kind: "limit" };
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      return { ok: false, kind: "unreachable" };
    }
    if (typeof body !== "object" || body === null) return { ok: false, kind: "invalid" };
    const b = body as { ok?: unknown; reason?: unknown; reading?: unknown };
    if (b.ok === true) {
      const reading = parseReading(b.reading);
      return reading ? { ok: true, reading } : { ok: false, kind: "invalid" };
    }
    if (b.reason === "limit") return { ok: false, kind: "limit" };
    if (b.reason === "invalid") return { ok: false, kind: "invalid" };
    return { ok: false, kind: "unreachable" };
  } catch (e) {
    const aborted = e instanceof Error && e.name === "AbortError";
    return { ok: false, kind: aborted ? "timeout" : "unreachable" };
  } finally {
    clearTimeout(timer);
  }
}
