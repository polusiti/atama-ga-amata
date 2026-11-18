import {
  DEFAULT_STOP,
  chooseNextQuestion,
  rankSolutions,
  replayBelief,
  shouldStop,
  type AnswerEntry,
} from "@/core/engine";
import { exitMoves, roughMoves } from "@/core/escape";
import { contributions, explainWhy, traceBelief } from "@/core/explain";
import { PIT_PARAMS, pitCheck, type Attempt } from "@/core/pit";
import { establishedSteps, stepStates } from "@/core/fringe";
import { ANSWERS, type Answer, type KnowledgeBase, type L10n } from "@/core/types";
import { packs, type Pack, type PackId } from "@/data/packs";

/** Stateless tools: every call carries the full answer list. Pure, no I/O. */

export interface ToolInput {
  pack?: string;
  answers?: { qid: string; answer: string }[];
  stated?: string | null;
  need?: string;
  /** For pit_check: the recent tries, oldest first. */
  attempts?: { newApproach: boolean; newFact?: boolean }[];
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

/**
 * The antlion pit. Given the recent tries, says whether another try of the same approach is still the better bet.
 * With a pack answer list it also ranks the likely causes and returns up to three exit moves that name a source.
 * The four numbers behind the verdict are set by hand; the result shows both probabilities and does not state a count of tries.
 */
export function pitCheckTool(input: ToolInput): ToolResult {
  const raw = input.attempts ?? [];
  if (!Array.isArray(raw)) return fail("attempts must be a list.");
  for (const a of raw) {
    if (typeof a !== "object" || a === null || typeof a.newApproach !== "boolean") {
      return fail("Each attempt needs newApproach: true or false.");
    }
  }
  const attempts: Attempt[] = raw.map((a) => ({ newApproach: a.newApproach }));
  const report = pitCheck(attempts);
  const newFacts = raw.filter((a) => a.newFact === true).length;

  const p = parse({ ...input, pack: input.pack ?? "devstuck" });
  if (typeof p === "string") return fail(p);
  const belief = replayBelief(p.kb, p.stated, p.entries);
  const move = (m: { solution: { id: string; title: L10n; cost: L10n; requirements: L10n[]; source?: L10n }; score: number }) => ({
    id: m.solution.id,
    title: en(m.solution.title),
    score: round(m.score),
    cost: en(m.solution.cost),
    steps: m.solution.requirements.map(en),
    source: m.solution.source ? en(m.solution.source) : "none given",
  });
  const sourced = exitMoves(p.kb, belief, 3);
  const verdict = report.verdict;
  return {
    ok: true,
    data: {
      verdict,
      sameApproachFailuresInRun: report.failuresInRun,
      newFactsReported: newFacts,
      chanceNextTryOfSameApproachWorks: round(report.pNext),
      chanceFreshApproachWorks: round(report.pSwitch),
      numbersAreSetByHand: { ...PIT_PARAMS },
      reading:
        verdict === "switch"
          ? "The same approach keeps failing. Another try of it is the worse bet by these numbers. Stop repeating it and choose an exit move."
          : "The same approach has not failed often enough to say it is the worse bet. Continue, and record each try.",
      exitMoves: verdict === "switch" ? sourced.map(move) : [],
      noSourcedMoveFits:
        verdict === "switch" && sourced.length === 0 ? "No move that names a source fits these answers. Rule-of-thumb moves are listed separately." : null,
      ruleOfThumbMoves: verdict === "switch" ? roughMoves(p.kb, belief, 2).map(move) : [],
    },
  };
}