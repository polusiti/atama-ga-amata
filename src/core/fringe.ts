import type { AnswerEntry } from "./engine";
import type { KnowledgeBase } from "./types";

/**
 * Where a step stands for this person.
 * Borrowed from knowledge space theory: what a person has in place is a set, and the steps they can
 * take next are those whose prerequisites are all in place (the "outer fringe" of that set).
 */
export type StepStatus = "done" | "blocked" | "next";

export interface StepState {
  solutionId: string;
  status: StepStatus;
  /** Required steps that are not in place yet. Empty unless blocked. */
  blockedBy: string[];
}

/** Steps the answers say are already in place: a probe with `practice` answered yes or probably. */
export function establishedSteps(kb: KnowledgeBase, entries: readonly AnswerEntry[]): Set<string> {
  const out = new Set<string>();
  for (const e of entries) {
    const q = kb.questions.find((x) => x.id === e.qid);
    if (q?.practice && (e.answer === "yes" || e.answer === "probably")) out.add(q.practice);
  }
  return out;
}

export function stepStates(kb: KnowledgeBase, established: ReadonlySet<string>): Map<string, StepState> {
  const out = new Map<string, StepState>();
  for (const s of kb.solutions) {
    if (established.has(s.id)) {
      out.set(s.id, { solutionId: s.id, status: "done", blockedBy: [] });
      continue;
    }
    const missing = (s.requires ?? []).filter((r) => !established.has(r));
    out.set(
      s.id,
      missing.length > 0
        ? { solutionId: s.id, status: "blocked", blockedBy: missing }
        : { solutionId: s.id, status: "next", blockedBy: [] },
    );
  }
  return out;
}

/** True if the `requires` relation has a cycle. Packs must be acyclic. */
export function hasCycle(kb: KnowledgeBase): boolean {
  const state = new Map<string, 0 | 1 | 2>();
  const byId = new Map(kb.solutions.map((s) => [s.id, s]));
  const visit = (id: string): boolean => {
    const st = state.get(id) ?? 0;
    if (st === 1) return true;
    if (st === 2) return false;
    state.set(id, 1);
    for (const r of byId.get(id)?.requires ?? []) if (visit(r)) return true;
    state.set(id, 2);
    return false;
  };
  return kb.solutions.some((s) => visit(s.id));
}
