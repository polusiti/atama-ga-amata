import { handleRead, type ReaderEnv } from "./handler";

/** Cloudflare bindings used by this worker. Declared here to avoid a type package. */
interface Env extends ReaderEnv {
  AI: { run(model: string, input: unknown): Promise<unknown> };
  READER_LIMITER: { limit(opts: { key: string }): Promise<{ success: boolean }> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRead(request, env, {
      ai: env.AI,
      limit: async (key) => (await env.READER_LIMITER.limit({ key })).success,
    });
  },
};
