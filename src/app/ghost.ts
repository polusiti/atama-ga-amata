import type { Lang } from "@/core/types";
/**
 * The browser side of the ghost's line (see worker/ghost.ts). It sends only the language: nothing the person typed. The answer
 * is one odd line from a language model, already checked by the worker. There is no canned fallback: on any failure the result
 * is null and the page shows no line.
 */
export const GHOST_URL = process.env.NEXT_PUBLIC_GHOST_URL ?? "https://atamagazon-reader.t88596565.workers.dev/ghost";
export const GHOST_TIMEOUT_MS = 12000;
export async function getGhostLine(
  lang: Lang,
  url: string = GHOST_URL,
  timeoutMs: number = GHOST_TIMEOUT_MS,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lang }),
      signal: controller.signal,
    });
    const body = (await res.json()) as { ok?: unknown; line?: unknown } | null;
    if (body && body.ok === true && typeof body.line === "string" && body.line.trim().length > 0 && body.line.length <= 200) {
      return body.line.trim();
    }
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
