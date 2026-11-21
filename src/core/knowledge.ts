import type { L10n } from "./types";

/**
 * A knowledge check: questions with an answer, in the form "choose the wrong statement".
 * A miss is used only to point at what to read first, never as a score or a label on the person
 * (see .kiro/specs/knowledge-check). The levels are set by hand; they are not calibrated from answers.
 */
export const TOPICS = ["docker", "mcp", "git", "http", "ai", "code", "test"] as const;
export type Topic = (typeof TOPICS)[number];

/** Where the facts of an item come from: a page that was read on a date, or a premise stated in the question itself. */
export type ItemSource = { url: string; checked: string } | { premise: true };

export interface KnowledgeItem {
  id: string;
  topic: Topic;
  /** 1 to 3, by hand. */
  level: 1 | 2 | 3;
  stem: L10n;
  /** A snippet shown under the stem, the same in both languages. Code and test questions are checked by running it. */
  code?: string;
  /** Five statements. */
  statements: readonly [L10n, L10n, L10n, L10n, L10n];
  /** Index of the wrong statement. */
  wrong: 0 | 1 | 2 | 3 | 4;
  why: L10n;
  source: ItemSource;
}

/** A choice is the index of the statement the person thinks is wrong, or "unknown". */
export type Choice = 0 | 1 | 2 | 3 | 4 | "unknown";
export interface Answer {
  itemId: string;
  choice: Choice;
}

export const MAX_PER_TOPIC = 2;

export function isCorrect(item: KnowledgeItem, choice: Choice): boolean {
  return choice === item.wrong;
}

function byId(items: readonly KnowledgeItem[]): Map<string, KnowledgeItem> {
  return new Map(items.map((i) => [i.id, i]));
}

function answeredIn(items: readonly KnowledgeItem[], answers: readonly Answer[], topic: Topic): { item: KnowledgeItem; answer: Answer }[] {
  const map = byId(items);
  return answers.flatMap((a) => {
    const item = map.get(a.itemId);
    return item && item.topic === topic ? [{ item, answer: a }] : [];
  });
}

/**
 * The next question, or null when there is none. Topics go in order. In a topic, the first question is at level 2.
 * If it was answered right, the second is at level 3; if it was answered wrong or with "unknown", the second is at level 1.
 * A topic gets at most two questions, and no question is asked twice.
 */
export function nextItem(items: readonly KnowledgeItem[], answers: readonly Answer[], topics: readonly Topic[] = TOPICS): KnowledgeItem | null {
  const askedIds = new Set(answers.map((a) => a.itemId));
  for (const topic of topics) {
    const done = answeredIn(items, answers, topic);
    if (done.length >= MAX_PER_TOPIC) continue;
    const pool = items.filter((i) => i.topic === topic && !askedIds.has(i.id));
    const want = done.length === 0 ? 2 : isCorrect(done[0].item, done[0].answer.choice) ? 3 : 1;
    const pick = pool.find((i) => i.level === want) ?? pool[0];
    if (pick) return pick;
  }
  return null;
}

export type TopicStatus = "notAsked" | "unclear" | "inPlace" | "partial" | "gap";

export interface TopicReport {
  topic: Topic;
  status: TopicStatus;
  /** Sources of the questions that were missed. Shown as "read this first" for partial and gap. */
  readFirst: { itemId: string; url: string }[];
}

/**
 * One status per topic. Two right: inPlace. One right: partial. None right: gap. Only one question answered: unclear.
 * There is no score. The links are the sources of the missed questions that have a URL.
 */
export function report(items: readonly KnowledgeItem[], answers: readonly Answer[], topics: readonly Topic[] = TOPICS): TopicReport[] {
  return topics.map((topic) => {
    const done = answeredIn(items, answers, topic);
    const right = done.filter((d) => isCorrect(d.item, d.answer.choice)).length;
    const status: TopicStatus =
      done.length === 0 ? "notAsked" : done.length === 1 ? "unclear" : right === 2 ? "inPlace" : right === 1 ? "partial" : "gap";
    const missed = done.filter((d) => !isCorrect(d.item, d.answer.choice));
    const readFirst =
      status === "partial" || status === "gap"
        ? missed.flatMap((d) => ("url" in d.item.source ? [{ itemId: d.item.id, url: d.item.source.url }] : []))
        : [];
    return { topic, status, readFirst };
  });
}
