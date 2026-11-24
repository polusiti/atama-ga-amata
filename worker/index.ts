import { handleRead, type ReaderEnv } from "./handler";
import { handleIdeas, type IdeasEnv } from "./ideas";
import { handleShake, type ShakeEnv } from "./shake";
import { seedWords } from "../src/data/shake-deck";
import { handleGhost, type GhostEnv } from "./ghost";
import { ghostSeeds } from "../src/data/ghost-seeds";

/** Cloudflare bindings used by this worker. Declared here to avoid a type package. */
interface Env extends ReaderEnv, IdeasEnv, ShakeEnv, GhostEnv {
  AI: { run(model: string, input: unknown): Promise<unknown> };
  READER_LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
  IDEAS_LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
  GHOST_LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
}

/** Two distinct seed words, picked with the platform's random source. */
function twoWords(): string[] {
  const buf = new Uint32Array(2);
  crypto.getRandomValues(buf);
  const a = buf[0] % seedWords.length;
  let b = buf[1] % seedWords.length;
  if (b === a) b = (b + 1) % seedWords.length;
  return [seedWords[a], seedWords[b]];
}

/** One seed of each kind (place, spot, food, thing), picked with the platform's random source. */
function fourSeeds(lang: "en" | "ja"): string[] {
  const kinds = [ghostSeeds.place, ghostSeeds.spot, ghostSeeds.food, ghostSeeds.thing, ghostSeeds.form];
  const buf = new Uint32Array(kinds.length);
  crypto.getRandomValues(buf);
  return kinds.map((list, i) => list[buf[i] % list.length][lang]);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
    if (path === "/ghost") {
      return handleGhost(request, env, {
        ai: env.AI,
        limit: async (key) => (await env.GHOST_LIMITER.limit({ key })).success,
        seeds: fourSeeds,
      });
    }
    if (path === "/shake") {
      return handleShake(request, env, {
        ai: env.AI,
        limit: async (key) => (await env.IDEAS_LIMITER.limit({ key: "shake:" + key })).success,
        words: twoWords,
      });
    }
    if (path === "/ideas") {
      return handleIdeas(request, env, {
        ai: env.AI,
        limit: async (key) => (await env.IDEAS_LIMITER.limit({ key })).success,
      });
    }
    return handleRead(request, env, {
      ai: env.AI,
      limit: async (key) => (await env.READER_LIMITER.limit({ key })).success,
    });
  },
};
