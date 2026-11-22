import { checkShakes, deckToShakes, drawFromDeck, SHAKE_COUNT, type Shake } from "@/core/shake";
import { shakeDeck } from "@/data/shake-deck";
import type { Lang } from "@/core/types";
/**
 * The browser side of the shake (see .kiro/specs/shake). It sends only the language and the number of failures: nothing the
 * person typed. In Japanese it does not call the model at all, because the live model returned an empty or wrong-language
 * answer in 13 of 13 calls on 2026-11-21. Anywhere else a failure falls back to the author's deck, and the result says which.
 */
export const SHAKE_URL = process.env.NEXT_PUBLIC_SHAKE_URL ?? "https://atamagazon-reader.t88596565.workers.dev/shake";
export const SHAKE_TIMEOUT_MS = 20000;
export type ShakeSource = "ai" | "deck";
export interface ShakeResult {
  shakes: Shake[];
  source: ShakeSource;
}
function fromDeck(lang: Lang, rand: () => number): ShakeResult {
  return { shakes: deckToShakes(drawFromDeck(shakeDeck, SHAKE_COUNT, rand), lang), source: "deck" };
}
export async function getShake(
  lang: Lang,
  failures: number,
  rand: () => number = Math.random,
  url: string = SHAKE_URL,
  timeoutMs: number = SHAKE_TIMEOUT_MS,
  fetchImpl: typeof fetch = fetch,
): Promise<ShakeResult> {
  if (lang === "ja") return fromDeck(lang, rand);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ lang, failures }),
      signal: controller.signal,
    });
    const body = (await res.json()) as { ok?: unknown; shakes?: unknown } | null;
    if (body && body.ok === true) {
      const checked = checkShakes(body.shakes, { lang });
      if (checked.shakes) return { shakes: checked.shakes, source: "ai" };
    }
    return fromDeck(lang, rand);
  } catch {
    return fromDeck(lang, rand);
  } finally {
    clearTimeout(timer);
  }
}
