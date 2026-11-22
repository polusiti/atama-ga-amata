import { fitTo, looksJapanese, textProblem } from "../src/core/ideas";
/**
 * The ghost shopkeeper's line. It reads only the language and the number of failures, never any text of the person. The model
 * gets four random seed words (a place, a spot, a food, a thing) and writes one odd question or order that mixes them. The line
 * has nothing to do with the person's problem on purpose: the point is a jolt out of the loop, not advice. The rules below check
 * the shape and the claims a model cannot make. If they reject the line, the page shows no line (there is no canned fallback).
 */
export const GHOST_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const DEFAULT_ORIGINS = ["https://polusiti.github.io"];
export const GHOST_MAX = 120;
export interface GhostEnv {
  ALLOWED_ORIGINS?: string;
  GHOST_MODEL?: string;
}
export interface GhostDeps {
  ai: { run(model: string, input: unknown): Promise<unknown> };
  limit(key: string): Promise<boolean>;
  /** Four seed words in the requested language: place, spot, food, thing. */
  seeds(lang: "en" | "ja"): string[];
}
export function ghostPrompt(): string {
  return [
    "You are a ghost who keeps a shop at midnight. A developer is stuck in a loop with an AI. You do not know their problem and must not ask about it.",
    "Say ONE short line: a strange question or a strange order that uses all four seed words in one absurd scene, as if it were a serious suggestion.",
    "Example of the spirit (do not copy): In Brazil, sitting in a tree, would you put fried chicken into a trash can?",
    "Do not explain. Do not give advice. Do not mention programming, code, AI, errors, numbers or percentages. Do not praise or agree. Do not say you ran or checked anything.",
    "At most 100 characters. Write it in the language given in the language field of the message.",
    "Reply with JSON only: an object with one field, line.",
  ].join(" ");
}
const SCHEMA = {
  type: "object",
  properties: { line: { type: "string" } },
  required: ["line"],
  additionalProperties: false,
};
export type GhostRejection = "not-json" | "wrong-container" | "bad-text" | "has-number" | "wrong-language";
/** Checks the model's answer. With `trimToFit` (the worker only) a line that is too long is cut at the end of a sentence first. */
export function checkGhost(raw: unknown, lang: "en" | "ja", trimToFit = false): { line: string | null; reason: GhostRejection | null } {
  const no = (reason: GhostRejection) => ({ line: null, reason });
  let value: unknown = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return no("not-json");
    }
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) return no("wrong-container");
  const keys = Object.keys(value);
  if (keys.length !== 1 || keys[0] !== "line") return no("wrong-container");
  let line = (value as { line: unknown }).line;
  if (trimToFit && typeof line === "string") line = fitTo(line, GHOST_MAX);
  if (textProblem(line, GHOST_MAX) !== null) return no("bad-text");
  const text = (line as string).trim();
  if (/[0-9０-９%％]/.test(text)) return no("has-number");
  if (lang === "ja" && !looksJapanese(text)) return no("wrong-language");
  if (lang === "en" && looksJapanese(text)) return no("wrong-language");
  return { line: text, reason: null };
}
function origins(env: GhostEnv): string[] {
  const list = (env.ALLOWED_ORIGINS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return list.length > 0 ? list : DEFAULT_ORIGINS;
}
function reply(body: unknown, status: number, origin: string | null): Response {
  const headers: Record<string, string> = { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" };
  if (origin) {
    headers["access-control-allow-origin"] = origin;
    headers["vary"] = "Origin";
  }
  return new Response(JSON.stringify(body), { status, headers });
}
export type GhostFailure = "origin" | "request" | "limit" | "model" | "invalid";
const fail = (reason: GhostFailure, status: number, origin: string | null) => reply({ ok: false, reason }, status, origin);
export async function handleGhost(req: Request, env: GhostEnv, deps: GhostDeps): Promise<Response> {
  const origin = req.headers.get("origin");
  if (origin === null || !origins(env).includes(origin)) return fail("origin", 403, null);
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": origin,
        "access-control-allow-methods": "POST, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-max-age": "600",
        vary: "Origin",
      },
    });
  }
  if (req.method !== "POST") return fail("request", 405, origin);
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("request", 400, origin);
  }
  if (typeof body !== "object" || body === null) return fail("request", 400, origin);
  // Only the language is read. Any other field the caller sends is ignored and never reaches the model.
  const lang: "en" | "ja" = (body as { lang?: unknown }).lang === "ja" ? "ja" : "en";
  const caller = req.headers.get("cf-connecting-ip") ?? "unknown";
  if (!(await deps.limit(caller))) return fail("limit", 429, origin);
  let raw: unknown;
  try {
    const out = (await deps.ai.run(env.GHOST_MODEL && env.GHOST_MODEL.trim() ? env.GHOST_MODEL.trim() : GHOST_MODEL, {
      messages: [
        { role: "system", content: ghostPrompt() },
        { role: "user", content: JSON.stringify({ language: lang === "ja" ? "Japanese" : "English", seedWords: deps.seeds(lang) }) },
      ],
      response_format: { type: "json_schema", json_schema: SCHEMA },
      max_tokens: 300,
      temperature: 1.1,
    })) as { response?: unknown } | null;
    raw = out?.response;
  } catch (e) {
    console.error("ghost: model call failed:", String(e instanceof Error ? e.message : e).slice(0, 200));
    return fail("model", 502, origin);
  }
  const checked = checkGhost(raw, lang, true);
  if (checked.line === null) {
    // Only the name of the rule is kept. What the model said is never logged.
    console.error("ghost: rejected by rule:", checked.reason);
    return reply({ ok: false, reason: "invalid", rule: checked.reason }, 200, origin);
  }
  return reply({ ok: true, line: checked.line }, 200, origin);
}
