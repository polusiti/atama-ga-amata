import { handleRead, type ReaderEnv } from "./handler";
import { handleIdeas, type IdeasEnv } from "./ideas";

/** Cloudflare bindings used by this worker. Declared here to avoid a type package. */
interface Env extends ReaderEnv, IdeasEnv {
  AI: { run(model: string, input: unknown): Promise<unknown> };
  READER_LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
  IDEAS_LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const path = new URL(request.url).pathname;
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
