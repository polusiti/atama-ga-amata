import { mkdirSync, writeFileSync } from "node:fs";
import { it } from "vitest";
import { kb } from "../src/data/kb";
import {
  answerDistribution,
  chooseNextQuestion,
  shouldStop,
  strength,
  updateBelief,
} from "../src/core/engine";
import { uniform } from "../src/core/math";
import { ANSWERS, DEFAULT_PARAMS, type Answer } from "../src/core/types";

/**
 * Benchmark: does the engine get pulled into confident wrong beliefs?
 * Four kinds of simulated user answer the same probes. Report how often the engine stops "confident"
 * and how often it is right when it does. Run with `npm run bench`.
 *
 * Limits: the truthful user answers from the same model the engine assumes, so that row is optimistic.
 * The other three rows are deliberately outside the model. No real people are involved.
 */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sample(dist: readonly number[], r: () => number): number {
  const x = r();
  let acc = 0;
  for (let i = 0; i < dist.length; i++) {
    acc += dist[i];
    if (x < acc) return i;
  }
  return dist.length - 1;
}

type Responder = (qid: string, needIdx: number, r: () => number) => Answer;

function run(responder: Responder, needIdx: number, r: () => number) {
  let belief = uniform(kb.needs.length);
  const asked: string[] = [];
  let reason = shouldStop(belief, kb, asked);
  while (reason === null) {
    const next = chooseNextQuestion(belief, kb, asked)!;
    belief = updateBelief(belief, kb, next.question, responder(next.question.id, needIdx, r));
    asked.push(next.question.id);
    reason = shouldStop(belief, kb, asked);
  }
  const top = belief.indexOf(Math.max(...belief));
  return { top, topProb: belief[top], n: asked.length, reason };
}

const truthful: Responder = (qid, needIdx, r) => {
  const q = kb.questions.find((x) => x.id === qid)!;
  return ANSWERS[sample(answerDistribution(strength(q, kb.needs[needIdx].id), DEFAULT_PARAMS), r)];
};
const alwaysYes: Responder = () => "yes";
const randomAnswers: Responder = (_q, _n, r) => ANSWERS[Math.floor(r() * ANSWERS.length)];
// A person whose real trouble is not on the shelf: each answer reflects an unrelated strength.
const offShelf: Responder = (_q, _n, r) => ANSWERS[sample(answerDistribution(r(), DEFAULT_PARAMS), r)];

it("echo-chamber probe", () => {
  const N = 600;
  const rows: string[] = [
    `params: ${JSON.stringify(DEFAULT_PARAMS)}  runs per row: ${N}  seed: 12345`,
    "row | stopped confident | mean top prob | mean questions | accuracy when confident",
  ];
  const scenarios: [string, Responder][] = [
    ["truthful", truthful],
    ["always-yes", alwaysYes],
    ["random", randomAnswers],
    ["off-shelf", offShelf],
  ];
  for (const [name, responder] of scenarios) {
    const r = rng(12345);
    let confident = 0, confCorrect = 0, sumTop = 0, sumN = 0;
    for (let k = 0; k < N; k++) {
      const needIdx = Math.floor(r() * kb.needs.length);
      const res = run(responder, needIdx, r);
      sumTop += res.topProb;
      sumN += res.n;
      if (res.reason === "confident") {
        confident++;
        if (res.top === needIdx) confCorrect++;
      }
    }
    rows.push(
      `${name} | ${((confident / N) * 100).toFixed(1)}% | ${(sumTop / N).toFixed(3)} | ${(sumN / N).toFixed(2)} | ` +
        `${confident ? ((confCorrect / confident) * 100).toFixed(1) + "%" : "n/a"}`,
    );
  }
  mkdirSync("bench/results", { recursive: true });
  writeFileSync("bench/results/echo-probe.txt", rows.join("\n") + "\n", "utf8");
});
