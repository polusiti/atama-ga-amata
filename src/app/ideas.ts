import { checkIdeas, type Idea } from "@/core/ideas";
import type { Lang } from "@/core/types";

/**
 * The browser side of the idea burst (see .kiro/specs/idea-burst). It sends what the person typed and gets back five ideas.
 * The answer is checked again here with the same fixed rules, without cutting anything: the page checks what it is given.
 * Nothing is stored. A failure never blocks the page, because the exit moves with sources are still on the screen.
 */
export const IDEAS_URL = process.env.NEXT_PUBLIC_IDEAS_URL ?? "https://atamagazon-reader.t88596565.workers.dev/ideas";
export const IDEAS_TIMEOUT_MS = 30000;
export const MAX_SITUATION = 400;

export type IdeasFailureKind = "unreachable" | "timeout" | "limit" | "invalid";
export type IdeasResult = { ok: true; ideas: Idea[] } | { ok: false; kind: IdeasFailureKind };

export async function getIdeas(
  url: string,
  text: string,
  lang: Lang,
  failures: number,
  kinds: readonly string[],
  timeoutMs: number = IDEAS_TIMEOUT_MS,
  fetchImpl: typeof fetch = fetch,
): Promise<IdeasResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, lang, failures }),
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
    const b = body as { ok?: unknown; reason?: unknown; ideas?: unknown };
    if (b.ok === true) {
      const checked = checkIdeas(b.ideas, kinds, { lang });
      return checked.ideas ? { ok: true, ideas: checked.ideas } : { ok: false, kind: "invalid" };
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
