import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { knowledgeItems } from "@/data/knowledge-items";
import { MAX_PER_TOPIC, TOPICS, isCorrect, nextItem, report, type Answer, type Choice } from "./knowledge";

const items = knowledgeItems;
const choiceArb = fc.constantFrom<Choice>(0, 1, 2, 3, 4, "unknown");

/** Plays a whole session with a function that picks the choice for each item. Stops at null. */
function play(pick: (id: string, index: number) => Choice): Answer[] {
  const answers: Answer[] = [];
  for (let guard = 0; guard < 100; guard++) {
    const item = nextItem(items, answers);
    if (!item) break;
    answers.push({ itemId: item.id, choice: pick(item.id, answers.length) });
  }
  return answers;
}

const right = (id: string): Choice => items.find((i) => i.id === id)!.wrong;
const wrongChoice = (id: string): Choice => ((items.find((i) => i.id === id)!.wrong + 1) % 5) as Choice;

describe("nextItem: which question comes next", () => {
  it("starts with a level 2 question of the first topic", () => {
    const first = nextItem(items, []);
    expect(first?.topic).toBe(TOPICS[0]);
    expect(first?.level).toBe(2);
  });

  it("goes up a level after a right answer, and down after a wrong answer or 'unknown'", () => {
    for (const topic of TOPICS) {
      const first = items.find((i) => i.topic === topic && i.level === 2)!;
      const afterRight = nextItem(items, [...priorTopics(topic), { itemId: first.id, choice: first.wrong }]);
      expect(afterRight?.topic, topic).toBe(topic);
      expect(afterRight?.level, topic).toBe(3);
      for (const bad of [wrongChoice(first.id), "unknown" as Choice]) {
        const afterWrong = nextItem(items, [...priorTopics(topic), { itemId: first.id, choice: bad }]);
        expect(afterWrong?.topic, topic).toBe(topic);
        expect(afterWrong?.level, topic).toBe(1);
      }
    }
  });

  it("asks at most two questions per topic, never the same one twice, and at most ten in all (whatever the answers)", () => {
    fc.assert(
      fc.property(fc.array(choiceArb, { minLength: 12, maxLength: 12 }), (picks) => {
        const answers = play((_id, i) => picks[i % picks.length]);
        const ids = answers.map((a) => a.itemId);
        expect(new Set(ids).size).toBe(ids.length);
        expect(answers.length).toBe(TOPICS.length * MAX_PER_TOPIC);
        for (const t of TOPICS) {
          const n = answers.filter((a) => items.find((i) => i.id === a.itemId)!.topic === t).length;
          expect(n).toBeLessThanOrEqual(MAX_PER_TOPIC);
        }
      }),
    );
  });

  it("is a function of the answers: the same answers give the same next question", () => {
    fc.assert(
      fc.property(fc.array(choiceArb, { minLength: 0, maxLength: 6 }), (picks) => {
        const answers = play((_id, i) => picks[i] ?? "unknown").slice(0, picks.length);
        expect(nextItem(items, answers)?.id).toBe(nextItem(items, [...answers])?.id);
      }),
    );
  });

  it("returns null when every topic has had its two questions", () => {
    const answers = play(() => "unknown");
    expect(answers.length).toBe(10);
    expect(nextItem(items, answers)).toBeNull();
  });

  it("limits the questions to the given topics", () => {
    const only = nextItem(items, [], ["git"]);
    expect(only?.topic).toBe("git");
  });
});

function priorTopics(topic: (typeof TOPICS)[number]): Answer[] {
  // Answer both questions of every earlier topic, so the walk reaches `topic`.
  const out: Answer[] = [];
  for (const t of TOPICS) {
    if (t === topic) break;
    const a = items.find((i) => i.topic === t && i.level === 2)!;
    const b = items.find((i) => i.topic === t && i.level === 3)!;
    out.push({ itemId: a.id, choice: a.wrong }, { itemId: b.id, choice: b.wrong });
  }
  return out;
}

describe("report: where each area stands", () => {
  it("says inPlace when both answers were right, partial when one was, gap when none was", () => {
    const allRight = play((id) => right(id));
    expect(report(items, allRight).every((r) => r.status === "inPlace")).toBe(true);
    const allWrong = play((id) => wrongChoice(id));
    expect(report(items, allWrong).every((r) => r.status === "gap")).toBe(true);
    const allUnknown = play(() => "unknown");
    expect(report(items, allUnknown).every((r) => r.status === "gap")).toBe(true);
    let n = 0;
    const alternating = play((id) => (n++ % 2 === 0 ? right(id) : wrongChoice(id)));
    expect(report(items, alternating).every((r) => r.status === "partial")).toBe(true);
  });

  it("says notAsked before any answer and unclear after a single answer", () => {
    expect(report(items, []).every((r) => r.status === "notAsked")).toBe(true);
    const one = nextItem(items, [])!;
    const r = report(items, [{ itemId: one.id, choice: one.wrong }]);
    expect(r.find((x) => x.topic === one.topic)?.status).toBe("unclear");
  });

  it("lists links to read first only for areas that are partial or gap, and only from missed questions", () => {
    fc.assert(
      fc.property(fc.array(choiceArb, { minLength: 12, maxLength: 12 }), (picks) => {
        const answers = play((_id, i) => picks[i % picks.length]);
        for (const rep of report(items, answers)) {
          if (rep.status === "inPlace" || rep.status === "notAsked" || rep.status === "unclear") expect(rep.readFirst).toEqual([]);
          for (const link of rep.readFirst) {
            const a = answers.find((x) => x.itemId === link.itemId)!;
            const item = items.find((i) => i.id === link.itemId)!;
            expect(isCorrect(item, a.choice)).toBe(false);
            expect(item.topic).toBe(rep.topic);
            expect("url" in item.source && item.source.url === link.url).toBe(true);
          }
        }
      }),
    );
  });

  it("has no score: a report carries only a topic, a status and links", () => {
    const rep = report(items, play((id) => right(id)));
    for (const r of rep) expect(Object.keys(r).sort()).toEqual(["readFirst", "status", "topic"]);
  });
});
