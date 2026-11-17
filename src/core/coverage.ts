import type { KnowledgeBase, Lexicon } from "./types";

/**
 * Coverage of a pack, per need. Pure. It reports; it never fills anything in.
 * The two thresholds are reading aids chosen by hand, not model parameters.
 */
export const DISCRIMINATING_GAP = 0.3;
export const FITTING = 0.5;
const ROUGH_LABELS = ["rule of thumb", "経験則"];

export interface NeedCoverage {
  needId: string;
  /** Probes whose answer moves this need away from the default by at least DISCRIMINATING_GAP. */
  probes: number;
  /** Moves with fit >= FITTING for this need. */
  moves: number;
  /** Of those moves, how many name a source instead of the rule-of-thumb label. */
  sourcedMoves: number;
  words: number;
  samples: number;
  gaps: string[];
}

export function needCoverage(
  kb: KnowledgeBase,
  lexicon: Lexicon,
  samples: readonly { needId: string }[],
): NeedCoverage[] {
  return kb.needs.map((need) => {
    const probes = kb.questions.filter((q) => Math.abs((q.yes[need.id] ?? q.base) - q.base) >= DISCRIMINATING_GAP).length;
    const fitting = kb.solutions.filter((s) => (s.fit[need.id] ?? 0) >= FITTING);
    const sourced = fitting.filter((s) => {
      const text = `${s.source?.en ?? ""} ${s.source?.ja ?? ""}`.toLowerCase();
      return text.trim().length > 0 && !ROUGH_LABELS.some((l) => text.includes(l));
    }).length;
    const words = (lexicon.needWords[need.id] ?? []).length;
    const sampleCount = samples.filter((x) => x.needId === need.id).length;
    const gaps: string[] = [];
    if (probes === 0) gaps.push("no discriminating probe");
    if (fitting.length === 0) gaps.push("no fitting move");
    if (words === 0) gaps.push("no lexicon word");
    if (sampleCount === 0) gaps.push("no sample sentence");
    return { needId: need.id, probes, moves: fitting.length, sourcedMoves: sourced, words, samples: sampleCount, gaps };
  });
}

export function hasGaps(rows: readonly NeedCoverage[]): boolean {
  return rows.some((r) => r.gaps.length > 0);
}
