import {
  DEFAULT_STOP,
  chooseNextQuestion,
  rankSolutions,
  replayBelief,
  shouldStop,
  type AnswerEntry,
} from "@/core/engine";
import { contributions, explainWhy, traceBelief } from "@/core/explain";
import { establishedSteps, stepStates } from "@/core/fringe";
import { ANSWERS, type Answer, type KnowledgeBase, type L10n } from "@/core/types";
import { packs, type Pack, type PackId } from "@/data/packs";

/** Stateless tools: every call carries the full answer list. Pure, no I/O. */

export interface ToolInput {
  pack?: string;
  answers?: { qid: string; answer: string }[];
  stated?: string | null;
  need?: string;
}

export type ToolResult = { ok: true; data: unknown } | { ok: false; error: string };

const en = (t: L10n) => t.en;
const fail = (error: string): ToolResult => ({ ok: false, error });

interface Parsed {
  pack: Pack;
  kb: KnowledgeBase;
  entries: AnswerEntry[];
  stated: string | null;
}

function parse(input: ToolInput): Parsed | string {
  const id = input.pack ?? "devstuck";
  if (!Object.prototype.hasOwnProperty.call(packs, id)) {
    return `Unknown pack "${id}". Known packs: ${Object.keys(packs).join(", ")}.`;
  }
  const pack = packs[id as PackId];
  const kb = pack.kb;
  const entries: AnswerEntry[] = [];
  const seen = new Set<string>();
  for (const a of input.answers ?? []) {
    if (!kb.questions.some((q) => q.id === a.qid)) return `Unknown question id "${a.qid}" in pack "${id}".`;
    if (!(ANSWERS as readonly string[]).includes(a.answer)) {
      return `Unknown answer "${a.answer}". Use one of: ${ANSWERS.join(", ")}.`;
    }
    if (seen.has(a.qid)) return `Question "${a.qid}" is answered twice.`;
    seen.add(a.qid);
    entries.push({ qid: a.qid, answer: a.answer as Answer });
  }
  const stated = input.stated ?? null;
  if (stated !== null && !kb.solutions.some((s) => s.id === stated)) {
    return `Unknown stated solution id "${stated}" in pack "${id}".`;
  }
  return { pack, kb, entries, stated };
}

const round = (x: number) => Math.round(x * 1000) / 1000;

export function listPacks(): ToolResult {
  return {
    ok: true,
    data: Object.values(packs).map((p) => ({
      id: p.id,
      label: en(p.label),
      needs: p.kb.needs.map((n) => ({ id: n.id, title: en(n.title) })),
      solutions: p.kb.solutions.map((s) => ({ id: s.id, title: en(s.title) })),
      answers: ANSWERS,
    })),
  };
}

export function nextQuestion(input: ToolInput): ToolResult {
  const p = parse(input);
  if (typeof p === "string") return fail(p);
  const belief = replayBelief(p.kb, p.stated, p.entries);
  const asked = p.entries.map((e) => e.qid);
  const stop = shouldStop(belief, p.kb, asked);
  const next = stop ? null : chooseNextQuestion(belief, p.kb, asked);
  return {
    ok: true,
    data: {
      asked: asked.length,
      budget: DEFAULT_STOP.maxQuestions,
      stop,
      question: next
        ? {
            id: next.question.id,
            text: en(next.question.text),
            gainNats: round(next.gain),
            cost: next.question.cost,
            answers: ANSWERS,
          }
        : null,
    },
  };
}

export function diagnose(input: ToolInput): ToolResult {
  const p = parse(input);
  if (typeof p === "string") return fail(p);
  const belief = replayBelief(p.kb, p.stated, p.entries);
  const asked = p.entries.map((e) => e.qid);
  const states = stepStates(p.kb, establishedSteps(p.kb, p.entries));
  const needs = p.kb.needs
    .map((n, i) => ({
      id: n.id,
      title: en(n.title),
      selfSide: n.side === "self",
      probability: round(belief[i]),
    }))
    .sort((a, b) => b.probability - a.probability);
  const moves = rankSolutions(belief, p.kb).map((r) => {
    const st = states.get(r.solution.id);
    return {
      id: r.solution.id,
      title: en(r.solution.title),
      score: round(r.score),
      status: p.pack.useFringe ? st?.status : undefined,
      blockedBy: st?.blockedBy,
      cost: en(r.solution.cost),
      requirements: r.solution.requirements.map(en),
      source: r.solution.source ? en(r.solution.source) : "none given",
    };
  });
  return {
    ok: true,
    data: { stop: shouldStop(belief, p.kb, asked), asked: asked.length, needs, moves },
  };
}

export function explain(input: ToolInput): ToolResult {
  const p = parse(input);
  if (typeof p === "string") return fail(p);
  const idx = p.kb.needs.findIndex((n) => n.id === input.need);
  if (idx < 0) return fail(`Unknown need id "${input.need ?? ""}" in pack "${p.pack.id}".`);
  const trace = traceBelief(p.kb, p.stated, p.entries);
  const how = contributions(trace, idx).map((c) => {
    const label =
      c.kind === "stated"
        ? "stated solution"
        : en(p.kb.questions.find((q) => q.id === p.entries[c.index]?.qid)?.text ?? { ja: "", en: "(note)" });
    return { evidence: label, answer: c.kind === "answer" ? p.entries[c.index]?.answer : undefined, factor: round(c.factor) };
  });
  const belief = replayBelief(p.kb, p.stated, p.entries);
  const asked = p.entries.map((e) => e.qid);
  const next = chooseNextQuestion(belief, p.kb, asked);
  const why = next ? explainWhy(p.kb, belief, next.question) : null;
  return {
    ok: true,
    data: {
      need: en(p.kb.needs[idx].title),
      how,
      why: why
        ? {
            question: en(why.question.text),
            gainNats: round(why.gain),
            leaders: why.leaders.map((l) => ({
              need: en(p.kb.needs.find((n) => n.id === l.needId)!.title),
              probability: round(l.probability),
              strength: round(l.strength),
            })),
          }
        : null,
    },
  };
}
