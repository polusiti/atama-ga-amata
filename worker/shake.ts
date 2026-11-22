import { checkShakes } from "../src/core/shake";

/**
 * The shake request handling (see .kiro/specs/shake). It reads only the language and the number of failures. It never reads any
 * text of the person, so there is nothing of the person's to send to the model, to log or to return. The model gets two random
 * seed words as a spark and is asked for three provocations that work for any stuck problem.
 */
export const SHAKE_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const DEFAULT_ORIGINS = ["https://polusiti.github.io"];

export interface ShakeEnv {
  ALLOWED_ORIGINS?: string;
  SHAKE_MODEL?: string;
}

export interface ShakeDeps {
  ai: { run(model: string, input: unknown): Promise<unknown> };
  limit(key: string): Promise<boolean>;
  /** Two seed words, drawn at random. */
  words(): string[];
}

export function shakePrompt(): string {
  return [
    "You break a loop. A developer is stuck, repeating one approach, and you do not know their problem and must not ask about it.",
    "Give exactly three provocations that would work for ANY stuck problem: a concrete action of 1 to 10 minutes that changes how the person looks at it. Examples of the kind of move: invert it, remove something, shrink it, swap the roles, change the medium, change the place, forbid something.",
    "Use the two seed words only as a spark for the image behind each provocation. Do not name a programming language, a library or a tool.",
    "Each provocation has a title, how and minutes. Title at most 35 characters, how at most 130 characters, minutes an integer from 1 to 10. The three titles differ.",
    "Do not praise or agree. Do not say you ran or checked anything: you cannot. Nothing destructive: no deleting data, no touching production.",
    "Write the title and how in the language given in the language field of the message.",
    "Reply with JSON only: an object with one field, moves, an array of three objects with the fields title, how and minutes.",
  ].join(" ");
}

const SCHEMA = {
  type: "object",
  properties: {
    moves: {
      type: "array",
      items: {
        type: "object",
        properties: { title: { type: "string" }, how: { type: "string" }, minutes: { type: "integer" } },
        required: ["title", "how", "minutes"],
        additionalProperties: false,
      },
    },
  },
  required: ["moves"],
  additionalProperties: false,
};

function origins(env: ShakeEnv): string[] {
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

export type ShakeFailure = "origin" | "request" | "limit" | "model" | "invalid";
const fail = (reason: ShakeFailure, status: number, origin: string | null) => reply({ ok: false, reason }, status, origin);

export async function handleShake(req: Request, env: ShakeEnv, deps: ShakeDeps): Promise<Response> {
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
  // Only these two values are read. Any other field the caller sends is ignored and never reaches the model.
  const b = body as { lang?: unknown; failures?: unknown };
  const lang: "en" | "ja" = b.lang === "ja" ? "ja" : "en";
  const failures = typeof b.failures === "number" && Number.isInteger(b.failures) && b.failures >= 0 && b.failures <= 50 ? b.failures : 0;

  const caller = req.headers.get("cf-connecting-ip") ?? "unknown";
  if (!(await deps.limit(caller))) return fail("limit", 429, origin);

  let raw: unknown;
  try {
    const out = (await deps.ai.run(env.SHAKE_MODEL && env.SHAKE_MODEL.trim() ? env.SHAKE_MODEL.trim() : SHAKE_MODEL, {
      messages: [
        { role: "system", content: shakePrompt() },
        { role: "user", content: JSON.stringify({ language: lang === "ja" ? "Japanese" : "English", sameApproachFailures: failures, seedWords: deps.words() }) },
      ],
      response_format: { type: "json_schema", json_schema: SCHEMA },
      max_tokens: 1000,
      temperature: 1.0,
    })) as { response?: unknown } | null;
    raw = out?.response;
  } catch (e) {
    console.error("shake: model call failed:", String(e instanceof Error ? e.message : e).slice(0, 200));
    return fail("model", 502, origin);
  }

  const checked = checkShakes(raw, { trimToFit: true, lang });
  if (checked.shakes === null) {
    // Only the name of the rule is kept. What the model said is never logged.
    console.error("shake: rejected by rule:", checked.reason);
    return reply({ ok: false, reason: "invalid", rule: checked.reason }, 200, origin);
  }
  return reply({ ok: true, shakes: checked.shakes }, 200, origin);
}
