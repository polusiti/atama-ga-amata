"use client";

import { useEffect, useMemo, useState } from "react";
import { asksWhy, decide, render, type Kind, type Lookup, type Utterance } from "@/core/dialogue";
import {
  chooseNextQuestion,
  fitChanges,
  priorFromStated,
  rankSolutions,
  replayBelief,
  shouldStop,
  statedGap,
  type AnswerEntry,
} from "@/core/engine";
import { readText } from "@/core/evidence";
import { contributions, explainWhy, pathLength, traceBelief } from "@/core/explain";
import { checkCart } from "@/core/cart";
import { exitMoves, isSourced, roughMoves } from "@/core/escape";
import { pitCheck } from "@/core/pit";
import { establishedSteps, stepStates } from "@/core/fringe";
import {
  MAX_GUESSES,
  applyRejections,
  exportRecords,
  pickGuess,
  summarize,
  type GuessRecord,
  type Verdict,
} from "@/core/guess";
import { countAuthored } from "@/core/limits";
import { entropy, fisherRao, geodesicPoint } from "@/core/math";
import { ANSWERS, DEFAULT_PARAMS, type Answer, type KnowledgeBase, type Lang, type Solution } from "@/core/types";
import { DEFAULT_PACK, packs, type Pack, type PackId } from "@/data/packs";
import { type Reading } from "@/core/reader";
import { isCorrect, nextItem, report as knowledgeReport, type Answer as CheckAnswer, type Choice } from "@/core/knowledge";
import { knowledgeItems } from "@/data/knowledge-items";
import { Agent, type Line } from "./agent";
import { READER_URL, readSentence } from "./reader";
import { IDEAS_URL, MAX_SITUATION, getIdeas, type IdeasFailureKind } from "./ideas";
import { getShake, type ShakeResult } from "./shake";
import { getGhostLine } from "./ghost";
import { readingMarks } from "@/core/reader";
/** Decision 2026-11-22: the opening level question is off. The check is reached from the entrance button. The code stays. */
const ASK_LEVEL = false;
import { labelOf, type Idea } from "@/core/ideas";
import { GeodesicPlot } from "./geometry";
import { BrowserFrame, Pumpkin } from "./parts";
import { t, ui } from "./strings";

type Tab = "pit" | "check" | "home" | "shop" | "cart" | "about";
/** "shopText" is a line the shopkeeper says that is not one of the scripted utterances (the sentence reader's answers). */
type LogItem =
  | { from: "you"; text: string }
  | { from: "shop"; u: Utterance }
  | { from: "shopText"; text: string }
  /** The shopkeeper's opening line on the pit screen. It is kept as a key so that it follows the language switch. */
  | { from: "shopKey"; key: "pitHello" };
interface Note {
  text: string;
  likelihood: number[];
}

const REPO_URL = "https://github.com/polusiti/atama-ga-amata";
const MAX_SHELF = 5;
/** Below this expected fit the shopkeeper asks before putting a solution in the cart. */
const CONFIRM_BELOW = 0.5;

const makeLookup = (kb: KnowledgeBase): Lookup => ({
  need: (id, lang) => kb.needs.find((n) => n.id === id)?.short[lang] ?? id,
  solution: (id, lang) => kb.solutions.find((s) => s.id === id)?.title[lang] ?? id,
});

const cut = (s: string, n: number) => (s.length > n ? `${s.slice(0, n)}…` : s);
const pct = (x: number) => `${Math.round(x * 100)}%`;

function gapBand(gap: number): "close" | "differ" | "far" {
  if (gap < 0.35) return "close";
  if (gap < 0.9) return "differ";
  return "far";
}

function buildSpec(
  pack: Pack,
  solution: Solution,
  needTitle: string,
  confidence: number,
  statedTitle: string | null,
  lang: Lang,
): string {
  const o = pack.texts.output;
  const lines = [
    `# ${o.titlePrefix[lang]}${solution.title[lang]}`,
    "",
    `## ${o.background[lang]}`,
    `${needTitle} (${Math.round(confidence * 100)}%)`,
    "",
    `## ${o.requirements[lang]}`,
    ...solution.requirements.map((r, i) => `${i + 1}. ${r[lang]}`),
    "",
    `## ${o.costs[lang]}`,
    solution.cost[lang],
  ];
  if (solution.source) lines.push("", `## ${o.source[lang]}`, solution.source[lang]);
  if (statedTitle) lines.push("", `## ${o.stated[lang]}`, statedTitle);
  return lines.join("\n");
}

export default function Shop() {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const [packId, setPackId] = useState<PackId>(DEFAULT_PACK);
  const [tab, setTab] = useState<Tab>(packs[DEFAULT_PACK].sheets ? "pit" : "home");
  const [attempts, setAttempts] = useState<{ newApproach: boolean; newFact: boolean; text?: string }[]>([]);
  const [pendingText, setPendingText] = useState("");
  /** The knowledge check: the answers so far, whether it has started, and whether the explanation of the last answer is showing. */
  const [checkAnswers, setCheckAnswers] = useState<CheckAnswer[]>([]);
  const [checkStarted, setCheckStarted] = useState(false);
  const [checkShowing, setCheckShowing] = useState(false);
  const [checkStopped, setCheckStopped] = useState(false);
  /** A reading proposed by the sentence reader, waiting for the person's Yes or No. */
  const [pendingReading, setPendingReading] = useState<Reading | null>(null);
  /** The answer to the opening question (0 to 3), and whether the knowledge check is being offered. */
  const [level, setLevel] = useState<number | null>(null);
  const [offerCheck, setOfferCheck] = useState(false);
  /** The idea burst: the box is open, what was typed, the ideas that passed the rules, a failure, and whether a request is running. */
  const [ideasOpen, setIdeasOpen] = useState(false);
  const [ideasText, setIdeasText] = useState("");
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideasFailure, setIdeasFailure] = useState<IdeasFailureKind | null>(null);
  const [ideasBusy, setIdeasBusy] = useState(false);
  const [shake, setShake] = useState<ShakeResult | null>(null);
  const [shakeBusy, setShakeBusy] = useState(false);
  const [stated, setStated] = useState<string | null>(null);
  const [entries, setEntries] = useState<AnswerEntry[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [pendingCart, setPendingCart] = useState<{ id: string } | null>(null);
  const [browseNeed, setBrowseNeed] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [plan, setPlan] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [rejected, setRejected] = useState<number[]>([]);
  const [guessLog, setGuessLog] = useState<{ need: string; probability: number }[]>([]);
  const [outcome, setOutcome] = useState<{ verdict: Verdict; actual: string | null } | null>(null);
  const [records, setRecords] = useState<GuessRecord[]>([]);
  const [recCopied, setRecCopied] = useState(false);
  const [clock, setClock] = useState("");
  const [log, setLog] = useState<LogItem[]>(() => [
    packs[DEFAULT_PACK].sheets
      ? { from: "shopKey", key: "pitHello" }
      : { from: "shop", u: decide({ event: "load", history: [] }) },
  ]);

  const pack = packs[packId];
  const kb = pack.kb;
  const lookup = useMemo(() => makeLookup(kb), [kb]);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  const noteVectors = useMemo(() => notes.map((n) => n.likelihood), [notes]);
  const rawBelief = useMemo(
    () => replayBelief(kb, stated, entries, undefined, noteVectors),
    [kb, stated, entries, noteVectors],
  );
  // A rejected guess is lowered, not removed (see guess.ts).
  const belief = useMemo(() => applyRejections(rawBelief, rejected), [rawBelief, rejected]);
  const beforeLast = useMemo(
    () => (entries.length > 0 ? replayBelief(kb, stated, entries.slice(0, -1), undefined, noteVectors) : null),
    [kb, stated, entries, noteVectors],
  );
  const askedIds = useMemo(() => entries.map((e) => e.qid), [entries]);
  const next = useMemo(() => chooseNextQuestion(belief, kb, askedIds), [belief, kb, askedIds]);
  const stop = useMemo(() => shouldStop(belief, kb, askedIds), [belief, kb, askedIds]);
  const gap = statedGap(kb, stated, belief);
  const ranked = useMemo(() => rankSolutions(belief, kb), [belief, kb]);
  const topIdx = belief.indexOf(Math.max(...belief));
  const dim = entries.length === 0 && notes.length === 0 && stated === null && browseNeed === null;

  // Steps already in place, blocked or next (problem-solving packs only).
  const established = useMemo(() => establishedSteps(kb, entries), [kb, entries]);
  const sheets = pack.sheets;
  /** Pit-focus mode: a pack with spec sheets shows only what serves the pit check. The other parts stay in the code. */
  const focus = Boolean(sheets);
  const pitReport = useMemo(() => pitCheck(attempts), [attempts]);
  // While the explanation of the last answer is showing, the current question is that last one.
  const checkItem = useMemo(() => {
    if (checkShowing) return knowledgeItems.find((i) => i.id === checkAnswers[checkAnswers.length - 1]?.itemId) ?? null;
    return nextItem(knowledgeItems, checkAnswers);
  }, [checkAnswers, checkShowing]);
  const checkReport = useMemo(() => knowledgeReport(knowledgeItems, checkAnswers), [checkAnswers]);
  const exits = useMemo(() => exitMoves(kb, belief, 3), [kb, belief]);
  const rough = useMemo(() => roughMoves(kb, belief, 3), [kb, belief]);
  const planReport = useMemo(
    () => checkCart(kb, plan, new Set(established), sheets ?? {}),
    [kb, plan, established, sheets],
  );
  const states = useMemo(() => stepStates(kb, established), [kb, established]);
  const orderedRanked = useMemo(() => {
    if (!pack.useFringe) return ranked;
    const order = { next: 0, blocked: 1, done: 2 } as const;
    return [...ranked].sort(
      (a, b) =>
        order[states.get(a.solution.id)!.status] - order[states.get(b.solution.id)!.status] || b.score - a.score,
    );
  }, [ranked, states, pack.useFringe]);

  const whyData = useMemo(
    () => (next && stop === null ? explainWhy(kb, belief, next.question) : null),
    [kb, next, stop, belief],
  );

  const trace = useMemo(
    () => traceBelief(kb, stated, entries, undefined, noteVectors),
    [kb, stated, entries, noteVectors],
  );

  // Geometry: reference belief (named idea, or knowing nothing) versus now.
  const refBelief = useMemo(() => priorFromStated(kb, stated), [kb, stated]);
  const refDistance = fisherRao(refBelief, belief);
  const midBelief = useMemo(() => geodesicPoint(refBelief, belief, 0.5), [refBelief, belief]);
  const midIdx = midBelief.indexOf(Math.max(...midBelief));
  const travelled = pathLength(trace);
  const straight = fisherRao(trace.start, belief);
  const authored = useMemo(() => countAuthored(kb, pack.lexicon), [kb, pack.lexicon]);

  const howRows = useMemo(() => {
    return contributions(trace, topIdx)
      .filter((c) => Math.abs(Math.log(c.factor)) >= 0.02)
      .sort((a, b) => Math.abs(Math.log(b.factor)) - Math.abs(Math.log(a.factor)))
      .slice(0, 6);
  }, [trace, topIdx]);

  const howLabel = (c: { kind: "stated" | "note" | "answer"; index: number }) => {
    if (c.kind === "stated") {
      const title = kb.solutions.find((s) => s.id === stated)?.title[lang] ?? "";
      return ui.explain.howStated[lang](title);
    }
    if (c.kind === "note") return ui.explain.howNote[lang](cut(notes[c.index]?.text ?? "", 22));
    const e = entries[c.index];
    const q = kb.questions.find((x) => x.id === e?.qid);
    return `${cut(q?.text[lang] ?? "", 26)} \u2192 ${e ? ui.answers[e.answer][lang] : ""}`;
  };

  const movers = useMemo(
    () =>
      beforeLast
        ? fitChanges(kb, beforeLast, belief)
            .filter((c) => Math.abs(c.delta) >= 0.005)
            .slice(0, 4)
        : [],
    [kb, beforeLast, belief],
  );

  const shelf = useMemo(() => {
    if (browseNeed) {
      return kb.solutions
        .map((solution) => ({ solution, score: solution.fit[browseNeed] ?? 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SHELF);
    }
    const top = orderedRanked.slice(0, MAX_SHELF);
    const named = stated ? orderedRanked.find((r) => r.solution.id === stated) : undefined;
    return named && !top.some((r) => r.solution.id === stated) ? [...top, named] : top;
  }, [kb, orderedRanked, stated, browseNeed]);
  const coffin = useMemo(
    () =>
      orderedRanked.find(
        (r) => r.solution.id !== stated && (!pack.useFringe || states.get(r.solution.id)?.status === "next"),
      ),
    [orderedRanked, stated, pack.useFringe, states],
  );

  const cartSolution = cartId ? kb.solutions.find((s) => s.id === cartId) : undefined;
  const statedTitle = stated ? (kb.solutions.find((s) => s.id === stated)?.title[lang] ?? null) : null;
  const specText = cartSolution
    ? buildSpec(pack, cartSolution, kb.needs[topIdx].title[lang], belief[topIdx], statedTitle, lang)
    : "";
  const browseName = browseNeed ? kb.needs.find((n) => n.id === browseNeed)?.short[lang] : undefined;

  const shopHistory = (items: LogItem[]): Kind[] =>
    items.flatMap((i) => (i.from === "shop" ? [i.u.kind] : []));
  const firstStatement = log.find((i) => i.from === "you")?.text ?? null;

  function say(items: LogItem[], u: Utterance): LogItem[] {
    return [...items, { from: "shop", u }];
  }

  function submitText(text: string) {
    if (asksWhy(text)) {
      let asked: LogItem[] = [...log, { from: "you", text }];
      const ids = whyData ? whyData.leaders.map((l) => l.needId) : null;
      asked = say(asked, decide({ event: "why", history: shopHistory(asked), needIds: ids }));
      setLog(asked);
      setTab("shop");
      return;
    }
    if (focus) {
      // A button of the opening question comes in as its own text, in either language.
      const levelChoices: string[][] = [[...ui.level.choices.ja], [...ui.level.choices.en]];
      const levelIndex = Math.max(...levelChoices.map((c) => c.indexOf(text)));
      if (level === null && levelIndex >= 0) {
        answerLevel(levelIndex, text);
        return;
      }
      void submitToReader(text);
      return;
    }
    const reading = readText(kb, text, pack.lexicon);
    let nextLog: LogItem[] = [...log, { from: "you", text }];
    if (reading.top || reading.named) {
      setNotes([...notes, { text, likelihood: reading.likelihood }]);
    }
    if (reading.named && stated === null) setStated(reading.named);
    nextLog = say(nextLog, decide({ event: "text", history: shopHistory(nextLog), reading }));
    setLog(nextLog);
    setTab("shop");
  }

  /**
   * Pit screen: the typed sentence goes to the sentence reader, which proposes two marks. Nothing is added until the person
   * says Yes. If the reader cannot be used, the shopkeeper says so, and the marks on the screen still work.
   */
  async function submitToReader(text: string) {
    setPendingReading(null);
    setPendingText(text);
    setLog((l) => [...l, { from: "you", text }]);
    const result = await readSentence(READER_URL, text, lang);
    if (!result.ok) {
      setLog((l) => [...l, { from: "shopText", text: t(ui.reader.failed[result.kind], lang) }]);
      return;
    }
    const r = result.reading;
    if (r.newApproach === null && r.newFact === null) {
      void sayGhost();
      return;
    }
    setPendingReading(r);
    void sayGhost();
  }

  /** Records an answer of the knowledge check and shows the explanation. Nothing is stored or sent. */
  function answerCheck(choice: Choice) {
    const item = nextItem(knowledgeItems, checkAnswers);
    if (!item) return;
    setCheckAnswers([...checkAnswers, { itemId: item.id, choice }]);
    setCheckShowing(true);
  }

  /** Asks for five ideas of different kinds. Only ideas that pass the fixed rules are kept; otherwise a one-line failure is shown. */
  /** The ghost's line: one odd sentence from a language model, with nothing of the person's sent. No line if it fails (no canned one). */
  async function sayGhost() {
    const line = await getGhostLine(lang);
    if (line) setLog((l) => [...l, { from: "shopText", text: line }]);
  }

  /** Draws three provocations. Nothing the person typed is sent. Japanese and any failure use the author's deck, and the page says which. */
  async function requestShake() {
    if (shakeBusy) return;
    setShakeBusy(true);
    setShake(await getShake(lang, pitReport.failuresInRun));
    setShakeBusy(false);
  }

  async function requestIdeas() {
    const text = ideasText.trim();
    if (text.length === 0 || ideasBusy) return;
    setIdeasBusy(true);
    setIdeasFailure(null);
    setIdeas([]);
    const result = await getIdeas(IDEAS_URL, text, lang, pitReport.failuresInRun, kb.solutions.map((s) => s.id));
    setIdeasBusy(false);
    if (result.ok) setIdeas(result.ideas);
    else setIdeasFailure(result.kind);
  }

  /** The opening question: the person picked how much of the AI's code they read and fix. The choice only decides what is said next. */
  function answerLevel(index: number, text: string) {
    setLevel(index);
    const reply = ui.level.replies[lang][index];
    setLog((l) => [...l, { from: "you", text }, { from: "shopText", text: reply }]);
    // The first two choices (reads little, or asks the AI again) are offered the knowledge check.
    setOfferCheck(index <= 1);
  }

  function acceptCheckOffer() {
    setOfferCheck(false);
    setTab("check");
  }

  function declineCheckOffer() {
    setOfferCheck(false);
    setLog((l) => [...l, { from: "shopText", text: t(ui.level.afterNo, lang) }]);
  }

  function confirmReading() {
    if (!pendingReading) return;
    // A mark the reader could not tell is left off. The person can set it on the screen.
    setAttempts((xs) => [...xs, { newApproach: attempts.length > 0 && pendingReading.newApproach === true, newFact: pendingReading.newFact === true, text: pendingText }]);
    void sayGhost();
    setPendingReading(null);
  }

  function declineReading() {

    setPendingReading(null);
  }

  function answer(a: Answer) {
    if (!next) return;
    const nextEntries = [...entries, { qid: next.question.id, answer: a }];
    setEntries(nextEntries);
    const b = applyRejections(replayBelief(kb, stated, nextEntries, undefined, noteVectors), rejected);
    const reason = shouldStop(b, kb, nextEntries.map((e) => e.qid));
    if (reason !== null) {
      setLog(
        say(
          log,
          decide({
            event: "stop",
            history: shopHistory(log),
            topNeedId: kb.needs[b.indexOf(Math.max(...b))].id,
            first: firstStatement,
          }),
        ),
      );
    }
  }

  function requestCart(id: string, fit: number) {
    if (cartId === id) return;
    const st = pack.useFringe ? states.get(id) : undefined;
    if (st && st.status === "blocked") {
      setPendingCart({ id });
      setLog(
        say(
          log,
          decide({ event: "cart-blocked", history: shopHistory(log), solutionId: id, firstSolutionId: st.blockedBy[0] }),
        ),
      );
    } else if (fit < CONFIRM_BELOW) {
      setPendingCart({ id });
      setLog(say(log, decide({ event: "cart-low", history: shopHistory(log), solutionId: id, fit })));
    } else {
      setCartId(id);
    }
  }

  function clearGuess() {
    setRejected([]);
    setGuessLog([]);
    setOutcome(null);
    setRecCopied(false);
  }

  const guess = pickGuess(belief, rejected);
  const summary = useMemo(() => summarize(records), [records]);

  function finishRound(verdict: Verdict, actual: string | null, guesses: { need: string; probability: number }[]) {
    setRecords([...records, { pack: packId, answers: entries.length, guesses, verdict, actual }]);
    setOutcome({ verdict, actual });
    // The person named the closest stall: show that shelf instead of the rejected guesses.
    if (verdict === "wrong" && actual && actual !== "none") setBrowseNeed(actual);
  }
  function currentGuesses() {
    return guess ? [...guessLog, { need: kb.needs[guess.index].id, probability: guess.probability }] : guessLog;
  }
  function guessNotQuite() {
    if (!guess) return;
    setRejected([...rejected, guess.index]);
    setGuessLog(currentGuesses());
  }
  function copyRecords() {
    void navigator.clipboard?.writeText(exportRecords(records));
    setRecCopied(true);
  }

  /** Starts over. `forPack` is the shelf to start on; the current one when it is not given. */
  function reset(forPack?: Pack) {
    clearGuess();
    setTab("home");
    setStated(null);
    setEntries([]);
    setNotes([]);
    setCartId(null);
    setPlan([]);
    setAttempts([]);
    setCheckAnswers([]);
    setCheckStarted(false);
    setCheckShowing(false);
    setCheckStopped(false);
    setPendingReading(null);
    setPendingCart(null);
    setBrowseNeed(null);
    setLevel(null);
    setOfferCheck(false);
    setIdeasOpen(false);
    setShake(null);
    setIdeasText("");
    setIdeas([]);
    setIdeasFailure(null);
    setIdeasBusy(false);
    setOpenId(null);
    setLog([
      (forPack ?? pack).sheets
        ? { from: "shopKey", key: "pitHello" }
        : { from: "shop", u: decide({ event: "load", history: [] }) },
    ]);
  }

  function switchPack(id: PackId) {
    setPackId(id);
    reset(packs[id]);
    setTab(packs[id].sheets ? "pit" : "home");
  }

  const address = `http://www.atamagazon.example/exec/${tab}/${
    entries.length > 0 ? `need=${kb.needs[topIdx].id}/q=${entries.length}` : ""
  }`;

  const tabDefs: { id: Tab; label: string }[] = [
    ...(sheets ? [{ id: "pit" as Tab, label: t(ui.pit.tab, lang) }, { id: "check" as Tab, label: t(ui.check.tab, lang) }] : []),
    ...(focus ? [] : [{ id: "home" as Tab, label: t(ui.tabs.home, lang) }]),
    { id: "shop", label: t(ui.tabs.shop, lang) },
    focus
      ? { id: "cart", label: `${t(ui.plan.tab, lang)} (${plan.length})` }
      : { id: "cart", label: `${t(ui.tabs.cart, lang)} (${cartId ? 1 : 0})` },
    { id: "about", label: t(ui.tabs.about, lang) },
  ];
  const subnavTargets: Tab[] = ["about", "shop", "shop", "cart"];

  const lines: Line[] = log.map((i) =>
    i.from === "you"
      ? { from: "you", text: i.text }
      : i.from === "shopText"
        ? { from: "shop", text: i.text }
        : i.from === "shopKey"
          ? { from: "shop", text: t(ui.pit.shopHello, lang) }
          : { from: "shop", text: render(i.u, lang, lookup) },
  );
  const lastKind = [...log].reverse().find((i) => i.from === "shop");
  const showChips =
    !log.some((i) => i.from === "you") || (lastKind?.from === "shop" && lastKind.u.kind === "fallback");
  const pendingSolution = pendingCart ? kb.solutions.find((s) => s.id === pendingCart.id) : undefined;

  return (
    <>
      <div className="desk">
        <BrowserFrame
          title={t(ui.window, lang)}
          menu={ui.menu[lang]}
          address={address}
          addressLabel={t(ui.address, lang)}
          toolbar={{
            back: {
              label: `< ${t(ui.toolbar.back, lang)}`,
              onClick: () => setEntries(entries.slice(0, -1)),
              disabled: entries.length === 0,
            },
            forward: { label: `${t(ui.toolbar.forward, lang)} >` },
            stop: { label: t(ui.toolbar.stop, lang) },
            refresh: { label: t(ui.toolbar.refresh, lang), onClick: reset },
            home: { label: t(ui.toolbar.home, lang), onClick: () => setTab(focus ? "pit" : "home") },
          }}
          onClose={reset}
          statusLeft={t(ui.statusDone, lang)}
          statusMid={t(ui.statusHours, lang)}
          statusRight={t(ui.statusZone, lang)}
        >
          <header className="masthead">
            <div className="brand">
              <h1 className="wordmark">{ui.storeName}</h1>
              <Pumpkin size={30} />
              <span className="tagline">{t(pack.texts.tagline, lang)}</span>
            </div>
            <div className="toplinks">
              <button className="linkbtn" onClick={() => setTab("cart")}>
                {focus ? `${t(ui.plan.tab, lang)} (${plan.length})` : `${t(ui.topLinks.cart, lang)} (${cartId ? 1 : 0})`}
              </button>
              <span aria-hidden="true"> | </span>
              <button className="linkbtn" onClick={() => setTab("about")}>
                {t(ui.topLinks.help, lang)}
              </button>
            </div>
          </header>

          <div className="tabs" role="tablist">
            {tabDefs.map((d) => (
              <button
                key={d.id}
                role="tab"
                aria-selected={tab === d.id}
                className={tab === d.id ? "tab on" : "tab"}
                onClick={() => setTab(d.id)}
              >
                {d.label}
              </button>
            ))}
          </div>
          <nav className="subnav" aria-label="site" hidden={focus}>
            {ui.subnav[lang].map((label, i) => (
              <button key={label} onClick={() => setTab(subnavTargets[i])}>
                {label}
              </button>
            ))}
          </nav>
          <div className="hello" hidden={focus && tab === "pit"}>
            <b>{ui.hello[lang](entries.length)}</b>
          </div>

          <div className="content">
            {tab === "pit" && sheets && (
              <section data-testid="pit">
                {attempts.length === 0 ? (
                  <div className="entry" data-testid="entry">
                    <h2>{t(ui.entry.headline, lang)}</h2>
                    <p>{t(ui.entry.what, lang)}</p>
                    <h3>{t(ui.entry.stepsHead, lang)}</h3>
                    <ol>
                      <li>{t(ui.entry.step1, lang)}</li>
                      <li>{t(ui.entry.step2, lang)}</li>
                      <li>{t(ui.entry.step3, lang)}</li>
                    </ol>
                    <div className="example">
                      <b>{t(ui.entry.exampleHead, lang)}:</b> {t(ui.entry.example, lang)}
                    </div>
                    <p className="small">{t(ui.entry.shopkeeper, lang)}</p>
                    <p>
                      <button className="default" data-testid="entry-check" onClick={() => setTab("check")}>
                        {t(ui.entry.checkButton, lang)}
                      </button>
                    </p>
                    <p className="small">{t(ui.entry.checkNote, lang)}</p>
                  </div>
                ) : (
                  <h2>{t(ui.pit.head, lang)}</h2>
                )}
                {attempts.length > 0 && <p>{t(ui.pit.intro, lang)}</p>}
                {attempts.length > 0 && <p className="small">{t(ui.reader.notice, lang)}</p>}
                <fieldset>
                  <ol className="attempts">
                    {attempts.map((a, i) => (
                      <li key={i}>
                        <b>{ui.pit.tryN[lang](i + 1)}</b>{" "}
                        {a.text ? <q>{a.text}</q> : null}{" "}
                        <span className="field-row">
                          <input
                            id={`na-${i}`}
                            type="checkbox"
                            checked={a.newApproach}
                            onChange={(e) =>
                              setAttempts((xs) => xs.map((x, j) => (j === i ? { ...x, newApproach: e.target.checked } : x)))
                            }
                          />
                          <label htmlFor={`na-${i}`}>{t(ui.pit.newApproach, lang)}</label>
                        </span>{" "}
                        <span className="field-row">
                          <input
                            id={`nf-${i}`}
                            type="checkbox"
                            checked={a.newFact}
                            onChange={(e) =>
                              setAttempts((xs) => xs.map((x, j) => (j === i ? { ...x, newFact: e.target.checked } : x)))
                            }
                          />
                          <label htmlFor={`nf-${i}`}>{t(ui.pit.newFact, lang)}</label>
                        </span>{" "}
                        <button className="linkbtn small" onClick={() => setAttempts((xs) => xs.filter((_, j) => j !== i))}>
                          [{t(ui.remove, lang)}]
                        </button>
                      </li>
                    ))}
                  </ol>
                  <button className="default" onClick={() => setAttempts((xs) => [...xs, { newApproach: false, newFact: false }])}>
                    {t(ui.pit.add, lang)}
                  </button>
                </fieldset>
                {attempts.length === 0 ? (
                  <p>{t(ui.pit.empty, lang)}</p>
                ) : (
                  <fieldset data-testid="pit-verdict">
                    <p className="small">{ui.pit.run[lang](pitReport.failuresInRun)}</p>
                    <p>
                      {t(ui.pit.pNext, lang)}: <strong>{Math.round(pitReport.pNext * 100)}%</strong>
                      <br />
                      {t(ui.pit.pSwitch, lang)}: <strong>{Math.round(pitReport.pSwitch * 100)}%</strong>
                    </p>
                    <p className="small">{t(ui.pit.handSet, lang)}</p>
                    <p>
                      <strong>{t(pitReport.verdict === "switch" ? ui.pit.switch : ui.pit.persist, lang)}</strong>
                    </p>
                  </fieldset>
                )}
                {attempts.length > 0 && pitReport.verdict === "switch" && (
                  <fieldset data-testid="pit-exits">
                    <legend>{t(ui.pit.exitsHead, lang)}</legend>
                    <p className="small">
                      {t(ui.pit.rankNote, lang)}{" "}
                      <button className="linkbtn small" onClick={() => setTab("shop")}>
                        [{t(ui.pit.answerMore, lang)}]
                      </button>
                    </p>
                    {exits.length === 0 && <p>{t(ui.pit.noSourced, lang)}</p>}
                    <ul className="exits">
                      {exits.map((m) => (
                        <li key={m.solution.id}>
                          <strong>{m.solution.title[lang]}</strong>
                          <p>{m.solution.pitch[lang]}</p>
                          <p className="small">
                            {t(ui.costLabel, lang)}: {m.solution.cost[lang]}
                          </p>
                          {m.solution.source && (
                            <p className="small">
                              {t(ui.pack.sourceLabel, lang)}: {m.solution.source[lang]}
                            </p>
                          )}
                          <p className="small">
                            {t(ui.sheet.evidence, lang)}: {t(ui.sheet.levels[sheets[m.solution.id]?.evidence.level ?? "none"], lang)}
                          </p>
                          <p className="small">{t(ui.sheet.caveat, lang)}</p>
                          <button
                            onClick={() => setPlan((p) => (p.includes(m.solution.id) ? p : [...p, m.solution.id]))}
                            disabled={plan.includes(m.solution.id)}
                          >
                            {plan.includes(m.solution.id) ? t(ui.plan.inPlan, lang) : t(ui.plan.add, lang)}
                          </button>{" "}
                          <button onClick={() => setAttempts((xs) => [...xs, { newApproach: true, newFact: false }])}>
                            {t(ui.pit.tried, lang)}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="small">{t(ui.pit.triedNote, lang)}</p>
                    {rough.length > 0 && (
                      <>
                        <h3>{t(ui.pit.roughHead, lang)}</h3>
                        <p className="small">{t(ui.pit.roughNote, lang)}</p>
                        <ul className="exits">
                          {rough.map((m) => (
                            <li key={m.solution.id}>
                              <strong>{m.solution.title[lang]}</strong> <span className="small">{m.solution.cost[lang]}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {checkReport.some((r) => r.readFirst.length > 0) && (
                      <div data-testid="read-first">
                        <p className="small">{t(ui.check.readFirstPit, lang)}</p>
                        <ul>
                          {checkReport
                            .filter((r) => r.readFirst.length > 0)
                            .map((r) => (
                              <li key={r.topic}>
                                <strong>{t(ui.check.topics[r.topic], lang)}</strong>{" "}
                                {r.readFirst.map((l) => (
                                  <a key={l.itemId} className="small" href={l.url} target="_blank" rel="noopener noreferrer">
                                    {l.url}
                                  </a>
                                ))}
                              </li>
                            ))}
                        </ul>
                      </div>
                    )}
                    {plan.length > 0 && (
                      <p>
                        <button className="linkbtn" onClick={() => setTab("cart")}>
                          [{t(ui.plan.head, lang)}: {plan.length}]
                        </button>
                      </p>
                    )}
                  </fieldset>
                )}
                {attempts.length > 0 && (pitReport.verdict === "switch" || ideasOpen || ideas.length > 0) && (
                      <div data-testid="ideas">
                        <fieldset data-testid="shake">
                          <legend>{t(ui.shake.head, lang)}</legend>
                          <p className="small">{t(ui.shake.notice, lang)}</p>
                          <p>
                            <button className="default" onClick={requestShake} disabled={shakeBusy}>
                              {shake ? t(ui.shake.again, lang) : t(ui.shake.button, lang)}
                            </button>{" "}
                            {shakeBusy && <span className="small">{t(ui.shake.working, lang)}</span>}
                          </p>
                          {shake && (
                            <>
                              <p className="small">{t(shake.source === "ai" ? ui.shake.fromAi : ui.shake.fromDeck, lang)}</p>
                              <ol>
                                {shake.shakes.map((s) => (
                                  <li key={s.title}>
                                    <strong>{s.title}</strong> ({ui.shake.minutes[lang](s.minutes)})
                                    <p>{s.how}</p>
                                  </li>
                                ))}
                              </ol>
                            </>
                          )}
                        </fieldset>
                        {!ideasOpen ? (
                          <p>
                            <button className="default" onClick={() => setIdeasOpen(true)}>
                              {t(ui.ideas.button, lang)}
                            </button>
                          </p>
                        ) : (
                          <fieldset>
                            <legend>{t(ui.ideas.head, lang)}</legend>
                            <p className="small">{t(ui.ideas.notice, lang)}</p>
                            <p>{t(ui.ideas.prompt, lang)}</p>
                            <textarea
                              aria-label={t(ui.ideas.prompt, lang)}
                              rows={3}
                              maxLength={MAX_SITUATION}
                              value={ideasText}
                              placeholder={t(ui.ideas.placeholder, lang)}
                              onChange={(e) => setIdeasText(e.target.value)}
                              style={{ width: "100%" }}
                            />
                            <p>
                              <button className="default" onClick={requestIdeas} disabled={ideasBusy || ideasText.trim().length === 0}>
                                {t(ui.ideas.go, lang)}
                              </button>{" "}
                              {ideasBusy && <span className="small">{t(ui.ideas.working, lang)}</span>}
                            </p>
                            {ideasFailure && <p data-testid="ideas-failure">{t(ui.ideas.failed[ideasFailure], lang)}</p>}
                            {ideas.length > 0 && (
                              <ol className="ideas">
                                {ideas.map((idea) => {
                                  const label = labelOf(idea, kb.solutions, isSourced);
                                  const move = kb.solutions.find((s) => s.id === idea.kind);
                                  return (
                                    <li key={idea.kind}>
                                      <strong>{idea.title}</strong>
                                      <p className="small">
                                        {t(ui.ideas.kind[label.kind], lang)}
                                        {label.moveTitle ? `: ${label.moveTitle[lang]}` : ""}
                                        {label.source ? ` (${t(ui.pack.sourceLabel, lang)}: ${label.source[lang]})` : ""}
                                      </p>
                                      <p>{idea.how}</p>
                                      <p className="small">
                                        <b>{t(ui.ideas.quickTest, lang)}:</b> {idea.quickTest}
                                      </p>
                                      {move && (
                                        <>
                                          <button
                                            onClick={() => setPlan((p) => (p.includes(move.id) ? p : [...p, move.id]))}
                                            disabled={plan.includes(move.id)}
                                          >
                                            {plan.includes(move.id) ? t(ui.plan.inPlan, lang) : t(ui.plan.add, lang)}
                                          </button>{" "}
                                        </>
                                      )}
                                      <button onClick={() => setAttempts((xs) => [...xs, { newApproach: true, newFact: false }])}>
                                        {t(ui.ideas.tried, lang)}
                                      </button>
                                    </li>
                                  );
                                })}
                              </ol>
                            )}
                          </fieldset>
                        )}
                      </div>
                )}
              </section>
            )}

            {tab === "check" && sheets && (
              <section data-testid="check">
                <h2>{t(ui.check.head, lang)}</h2>
                {!checkStarted ? (
                  <>
                    <p>{t(ui.check.intro, lang)}</p>
                    <button className="default" onClick={() => setCheckStarted(true)}>
                      {t(ui.check.start, lang)}
                    </button>
                  </>
                ) : checkItem && !checkStopped ? (
                  <fieldset data-testid="check-question">
                    <p className="small">{ui.check.progress[lang](checkAnswers.length + (checkShowing ? 0 : 1))}</p>
                    <p>
                      <strong>{checkItem.stem[lang]}</strong>
                    </p>
                    {checkItem.code && (
                      <pre className="codebox" data-testid="check-code">
                        {checkItem.code}
                      </pre>
                    )}
                    <ol className="statements" type="A">
                      {checkItem.statements.map((s, i) => {
                        const last = checkAnswers[checkAnswers.length - 1];
                        const mark = checkShowing ? (i === checkItem.wrong ? " \u2190" : "") : "";
                        return (
                          <li key={i}>
                            {checkShowing ? (
                              <span>
                                {s[lang]}
                                <b>{mark}</b>
                                {last && last.choice === i ? <em> ({t(ui.check.yourPick, lang)})</em> : null}
                              </span>
                            ) : (
                              <button className="linkbtn" onClick={() => answerCheck(i as Choice)}>
                                {s[lang]}
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                    {!checkShowing && (
                      <p>
                        <button onClick={() => answerCheck("unknown")}>{t(ui.check.unknown, lang)}</button>{" "}
                        <button className="linkbtn small" onClick={() => setCheckStopped(true)}>
                          [{t(ui.check.stop, lang)}]
                        </button>
                      </p>
                    )}
                    {checkShowing && (
                      <div data-testid="check-explain">
                        <p>
                          {checkAnswers[checkAnswers.length - 1]?.choice === "unknown"
                            ? t(ui.check.pickedUnknown, lang)
                            : isCorrect(checkItem, checkAnswers[checkAnswers.length - 1]?.choice as Choice)
                              ? t(ui.check.pickedRight, lang)
                              : t(ui.check.pickedOther, lang)}
                        </p>
                        <p>
                          <b>{t(ui.check.why, lang)}:</b> {checkItem.why[lang]}
                        </p>
                        <p className="small">
                          {t(ui.check.source, lang)}:{" "}
                          {"url" in checkItem.source ? (
                            <a href={checkItem.source.url} target="_blank" rel="noopener noreferrer">
                              {checkItem.source.url}
                            </a>
                          ) : (
                            t(ui.check.premise, lang)
                          )}
                        </p>
                        <button className="default" onClick={() => setCheckShowing(false)}>
                          {nextItem(knowledgeItems, checkAnswers) ? t(ui.check.next, lang) : t(ui.check.finish, lang)}
                        </button>{" "}
                        <button className="linkbtn small" onClick={() => { setCheckShowing(false); setCheckStopped(true); }}>
                          [{t(ui.check.stop, lang)}]
                        </button>
                      </div>
                    )}
                  </fieldset>
                ) : (
                  <fieldset data-testid="check-result">
                    <legend>{t(ui.check.resultHead, lang)}</legend>
                    <p className="small">{t(ui.check.resultNote, lang)}</p>
                    <ul className="topics">
                      {checkReport.map((r) => (
                        <li key={r.topic}>
                          <strong>{t(ui.check.topics[r.topic], lang)}</strong>: {t(ui.check.status[r.status], lang)}
                          {r.readFirst.length > 0 && (
                            <ul>
                              {r.readFirst.map((l) => (
                                <li key={l.itemId} className="small">
                                  <a href={l.url} target="_blank" rel="noopener noreferrer">
                                    {l.url}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => {
                        setCheckAnswers([]);
                        setCheckShowing(false);
                        setCheckStopped(false);
                      }}
                    >
                      {t(ui.check.restart, lang)}
                    </button>
                  </fieldset>
                )}
              </section>
            )}

            {tab === "home" && (
              <section>
                <h2>{t(pack.texts.homeHead, lang)}</h2>
                <p>{t(pack.texts.homeBody, lang)}</p>
                <fieldset>
                  <legend>{t(ui.pack.choose, lang)}</legend>
                  <div className="field-row">
                    <select
                      aria-label={t(ui.pack.choose, lang)}
                      value={packId}
                      onChange={(e) => switchPack(e.target.value as PackId)}
                      style={{ flex: 1 }}
                    >
                      {Object.values(packs).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label[lang]}
                        </option>
                      ))}
                    </select>
                  </div>
                </fieldset>
                <fieldset>
                  <legend>{t(pack.texts.statedLegend, lang)}</legend>
                  <div className="field-row">
                    <select
                      aria-label={t(pack.texts.statedLegend, lang)}
                      value={stated ?? ""}
                      onChange={(e) => setStated(e.target.value === "" ? null : e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="">{t(ui.none, lang)}</option>
                      {kb.solutions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title[lang]}
                        </option>
                      ))}
                    </select>
                    <button className="default" onClick={() => setTab("shop")}>
                      {t(ui.enter, lang)}
                    </button>
                  </div>
                </fieldset>
                <ul className="news">
                  {pack.texts.newItems[lang].map((line) => (
                    <li key={line}>
                      <span className="blink">{t(ui.newBadge, lang)}!</span> {line}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {tab === "shop" && (
              <div className={focus ? "cols focus" : "cols"}>
                <aside className="left">
                  <div className="sbox">
                    <h3>{t(ui.questionBox, lang)}</h3>
                    <div className="sbody yellow">
                      {stop === null && next ? (
                        <>
                          <p className="qn">
                            {t(ui.questionN, lang)} {entries.length + 1}
                          </p>
                          <p className="qtext">{next.question.text[lang]}</p>
                          <ul className="answers">
                            {ANSWERS.map((a) => (
                              <li key={a}>
                                <button className="linkbtn" onClick={() => answer(a)}>
                                  {ui.answers[a][lang]}
                                </button>
                              </li>
                            ))}
                          </ul>
                          {whyData && (
                            <details className="why">
                              <summary>{t(ui.explain.whyLink, lang)}</summary>
                              <div className="whybody">
                                <p className="small">{t(ui.explain.whyLeaders, lang)}</p>
                                <ul>
                                  {whyData.leaders.map((l) => (
                                    <li key={l.needId}>
                                      {kb.needs.find((n) => n.id === l.needId)?.short[lang]} {pct(l.probability)}
                                      {" / "}
                                      {l.strength.toFixed(2)}
                                    </li>
                                  ))}
                                </ul>
                                <p className="small">{t(ui.explain.whyOutcomes, lang)}</p>
                                <ul>
                                  {whyData.outcomes.map((o) => (
                                    <li key={o.answer}>
                                      {ui.answers[o.answer][lang]} ({pct(o.probability)}) {"\u2192"}{" "}
                                      {kb.needs.find((n) => n.id === o.topNeedId)?.short[lang]} {pct(o.topProbability)}
                                    </li>
                                  ))}
                                </ul>
                                <p className="small">
                                  {t(ui.explain.whyEffort, lang)} {whyData.gain.toFixed(3)} nats / {t(ui.explain.whyCost, lang)}{" "}
                                  {whyData.cost.toFixed(1)}
                                </p>
                              </div>
                            </details>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="small">
                            {stop ? t(ui.stopReason[stop], lang) : ""} {t(ui.stopNote, lang)}
                          </p>
                          {outcome ? (
                            <>
                              <p className="qtext">{t(ui.guess.thanks, lang)}</p>
                              <p className="small">
                                {ui.guess.tally[lang](summary.rounds, summary.right, summary.wrong, summary.unsure)}
                              </p>
                              {summary.rate !== null && (
                                <p className="small">
                                  {ui.guess.interval[lang](
                                    Math.round(summary.interval[0] * 100),
                                    Math.round(summary.interval[1] * 100),
                                  )}
                                </p>
                              )}
                              {summary.rate !== null && summary.meanFirstProbability !== null && (
                                <p className="small">
                                  {ui.guess.calibration[lang](
                                    Math.round(summary.meanFirstProbability * 100),
                                    Math.round(summary.rate * 100),
                                  )}
                                </p>
                              )}
                              <p className="small">{t(ui.guess.caution, lang)}</p>
                              <button className="linkbtn" onClick={copyRecords}>
                                {t(ui.guess.copy, lang)}
                              </button>
                              {recCopied && <p className="small">{t(ui.guess.copied, lang)}</p>}
                            </>
                          ) : rejected.length >= MAX_GUESSES || !guess ? (
                            <>
                              <p className="qtext">{t(ui.guess.pickHead, lang)}</p>
                              <ul className="answers">
                                {kb.needs.map((n) => (
                                  <li key={n.id}>
                                    <button className="linkbtn" onClick={() => finishRound("wrong", n.id, guessLog)}>
                                      {n.short[lang]}
                                    </button>
                                  </li>
                                ))}
                                <li>
                                  <button className="linkbtn" onClick={() => finishRound("wrong", "none", guessLog)}>
                                    {t(ui.guess.none, lang)}
                                  </button>
                                </li>
                              </ul>
                            </>
                          ) : (
                            <>
                              <p className="qn">{t(rejected.length === 0 ? ui.guess.head : ui.guess.headSecond, lang)}</p>
                              <p className="qtext">{kb.needs[guess.index].title[lang]}</p>
                              <p className="small">{kb.needs[guess.index].gloss[lang]}</p>
                              <ul className="answers">
                                <li>
                                  <button
                                    className="linkbtn"
                                    onClick={() => finishRound("right", kb.needs[guess.index].id, currentGuesses())}
                                  >
                                    {t(ui.guess.fits, lang)}
                                  </button>
                                </li>
                                <li>
                                  <button className="linkbtn" onClick={guessNotQuite}>
                                    {t(ui.guess.notQuite, lang)}
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="linkbtn"
                                    onClick={() => finishRound("unsure", null, currentGuesses())}
                                  >
                                    {t(ui.guess.cantTell, lang)}
                                  </button>
                                </li>
                              </ul>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="sbox">
                    <h3>{t(pack.texts.browse, lang)}</h3>
                    <ul className="browse">
                      {kb.needs.map((n) => (
                        <li key={n.id}>
                          <button
                            className={browseNeed === n.id ? "linkbtn on" : "linkbtn"}
                            onClick={() => setBrowseNeed(browseNeed === n.id ? null : n.id)}
                          >
                            {n.short[lang]}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {notes.length > 0 && (
                    <div className="sbox">
                      <h3>{t(ui.agent.notesHead, lang)}</h3>
                      <div className="sbody">
                        <ul className="notes">
                          {notes.map((n, i) => (
                            <li key={`${i}-${n.text}`}>
                              <span className="small">{n.text}</span>{" "}
                              <button
                                className="linkbtn small"
                                onClick={() => setNotes(notes.filter((_, j) => j !== i))}
                              >
                                [{t(ui.undo, lang)}]
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div className="sbox">
                    <h3>{t(ui.historyHead, lang)}</h3>
                    <div className="sbody">
                      {entries.length === 0 ? (
                        <p className="small">{t(ui.historyEmpty, lang)}</p>
                      ) : (
                        <ol className="history">
                          {entries.map((e, i) => {
                            const q = kb.questions.find((x) => x.id === e.qid)!;
                            return (
                              <li key={e.qid}>
                                <span className="small">{q.text[lang]}</span>
                                <br />
                                <strong>{ui.answers[e.answer][lang]}</strong>{" "}
                                <button className="linkbtn small" onClick={() => {
                                  setEntries(entries.slice(0, i));
                                  clearGuess();
                                }}>
                                  [{t(ui.undo, lang)}]
                                </button>
                              </li>
                            );
                          })}
                        </ol>
                      )}
                    </div>
                  </div>
                </aside>

                <main className={dim ? "center dim" : "center"}>
                  <h2 className="results-head">{t(pack.texts.results, lang)}</h2>
                  {browseNeed && browseName && (
                    <p className="banner">
                      {ui.browseBanner[lang](browseName)}{" "}
                      <button className="linkbtn" onClick={() => setBrowseNeed(null)}>
                        {t(ui.browseClear, lang)}
                      </button>
                    </p>
                  )}
                  {outcome?.actual === "none" && <p className="banner">{t(ui.guess.noneBanner, lang)}</p>}
                  {dim && <p className="dimnote">{t(ui.dimNote, lang)}</p>}
                  <ol className="items">
                    {shelf.map(({ solution, score }) => {
                      const st = pack.useFringe ? states.get(solution.id) : undefined;
                      return (
                        <li key={solution.id} className={st?.status === "done" ? "item done" : "item"}>
                          <div className="itembody">
                            <button
                              className="linkbtn title"
                              aria-expanded={openId === solution.id}
                              onClick={() => setOpenId(openId === solution.id ? null : solution.id)}
                            >
                              {solution.title[lang]}
                            </button>
                            <span className={solution.id === stated ? "tag named" : "tag"}>
                              {solution.id === stated ? t(ui.named, lang) : t(ui.suggested, lang)}
                            </span>
                            {st && (
                              <span className={`tag status ${st.status}`}>
                                {st.status === "done"
                                  ? t(ui.pack.done, lang)
                                  : st.status === "next"
                                    ? t(ui.pack.next, lang)
                                    : ui.pack.blocked[lang](lookup.solution(st.blockedBy[0], lang))}
                              </span>
                            )}
                            <p>{solution.pitch[lang]}</p>
                            <p className="small">
                              {t(ui.costLabel, lang)}: {solution.cost[lang]}
                            </p>
                            {solution.source && (
                              <p className="small">
                                {t(ui.pack.sourceLabel, lang)}: {solution.source[lang]}
                              </p>
                            )}
                            {sheets && (
                              <details className="sheet">
                                <summary>{t(ui.sheet.head, lang)}</summary>
                                {sheets[solution.id] ? (
                                  <>
                                    <p className="small">
                                      <b>{t(ui.sheet.theory, lang)}:</b> {sheets[solution.id].theory[lang]}
                                    </p>
                                    <p className="small">
                                      <b>{t(ui.sheet.evidence, lang)}:</b>{" "}
                                      {t(ui.sheet.levels[sheets[solution.id].evidence.level], lang)}
                                      {lang === "ja" ? "。" : ". "}
                                      {sheets[solution.id].evidence.note[lang]}
                                    </p>
                                    <p className="small">
                                      <b>{t(ui.sheet.unfitWhen, lang)}:</b> {sheets[solution.id].unfitWhen[lang]}
                                    </p>
                                    <p className="small">{t(ui.sheet.caveat, lang)}</p>
                                  </>
                                ) : (
                                  <p className="small">{t(ui.sheet.none, lang)}</p>
                                )}
                              </details>
                            )}
                            {openId === solution.id && (
                              <div className="reqs">
                                <b>{t(ui.reqHead, lang)}</b>
                                <ol>
                                  {solution.requirements.map((r) => (
                                    <li key={r.en}>{r[lang]}</li>
                                  ))}
                                </ol>
                              </div>
                            )}
                            <div className="fit" aria-label={`${t(ui.fitLabel, lang)} ${Math.round(score * 100)}%`}>
                              <span>{t(ui.fitLabel, lang)}</span>
                              <div className="progress-indicator segmented">
                                <span
                                  className="progress-indicator-bar"
                                  style={{ width: `${Math.round(score * 100)}%` }}
                                />
                              </div>
                              <span>{Math.round(score * 100)}%</span>
                            </div>
                          </div>
                          <div className="itembtns">
                            <button
                              className={cartId === solution.id ? "" : "default"}
                              onClick={() => requestCart(solution.id, score)}
                              disabled={cartId === solution.id}
                            >
                              {cartId === solution.id ? t(ui.inCart, lang) : t(ui.addToCart, lang)}
                            </button>
                            {sheets && (
                              <button
                                onClick={() =>
                                  setPlan((p) => (p.includes(solution.id) ? p : [...p, solution.id]))
                                }
                                disabled={plan.includes(solution.id)}
                              >
                                {plan.includes(solution.id) ? t(ui.plan.inPlan, lang) : t(ui.plan.add, lang)}
                              </button>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </main>

                <aside className="right">
                  {coffin && (
                    <div className="sbox coffin">
                      <h3>{t(ui.coffinHead, lang)}</h3>
                      <div className="sbody">
                        <p className="small">{t(ui.coffinNote, lang)}</p>
                        <p>
                          <strong>{coffin.solution.title[lang]}</strong>
                          <br />
                          <span className="small">{coffin.solution.pitch[lang]}</span>
                        </p>
                        <button
                          onClick={() => requestCart(coffin.solution.id, coffin.score)}
                          disabled={cartId === coffin.solution.id}
                        >
                          {cartId === coffin.solution.id ? t(ui.inCart, lang) : t(ui.addToCart, lang)}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="sbox">
                    <h3>{t(ui.moversHead, lang)}</h3>
                    <div className="sbody">
                      {movers.length === 0 ? (
                        <p className="small">{t(ui.moversEmpty, lang)}</p>
                      ) : (
                        <ul className="movers">
                          {movers.map((c) => {
                            const pts = Math.round(c.delta * 100);
                            return (
                              <li key={c.solution.id}>
                                <span className={c.delta >= 0 ? "up" : "down"}>
                                  {c.delta >= 0 ? "\u25B2" : "\u25BC"} {c.delta >= 0 ? "+" : ""}
                                  {pts}
                                </span>{" "}
                                {c.solution.title[lang]}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="sbox">
                    <h3>{t(ui.geometry.head, lang)}</h3>
                    <div className="sbody">
                      <GeodesicPlot
                        theta={refDistance / 2}
                        startLabel={stated ? t(ui.geometry.startStated, lang) : t(ui.geometry.startUniform, lang)}
                        nowLabel={t(ui.geometry.now, lang)}
                        limitLabel={t(ui.geometry.limit, lang)}
                        ariaLabel={t(ui.geometry.aria, lang)}
                      />
                      <p className="small">{ui.geometry.distance[lang](refDistance)}</p>
                      <p className="small">
                        {refDistance < 1e-6
                          ? t(ui.geometry.still, lang)
                          : ui.geometry.midpoint[lang](kb.needs[midIdx].short[lang], pct(midBelief[midIdx]))}
                      </p>
                      {travelled > 1e-9 && (
                        <p className="small">
                          {ui.geometry.path[lang](travelled, straight, pct(Math.min(1, straight / travelled)))}
                        </p>
                      )}
                      <details>
                        <summary className="small">{t(ui.geometry.noteLink, lang)}</summary>
                        <p className="small">{t(ui.geometry.note, lang)}</p>
                      </details>
                    </div>
                  </div>

                  <div className="sbox">
                    <h3>{t(pack.texts.belief, lang)}</h3>
                    <div className="sbody">
                      {kb.needs
                        .map((n, i) => ({ n, p: belief[i] }))
                        .sort((a, b) => b.p - a.p)
                        .slice(0, 3)
                        .map(({ n, p }) => (
                          <div className="need-row" key={n.id}>
                            <span>{n.title[lang]}</span>
                            <div className="progress-indicator segmented">
                              <span className="progress-indicator-bar" style={{ width: `${Math.round(p * 100)}%` }} />
                            </div>
                            <span className="pct">{Math.round(p * 100)}%</span>
                          </div>
                        ))}
                      {kb.needs[topIdx].side === "self" && entries.length > 0 && (
                        <p className="small">{t(ui.pack.selfSide, lang)}</p>
                      )}
                      {gap !== null && gapBand(gap) === "far" ? (
                        <div className="msgbox" role="alert">
                          <div className="icon">!</div>
                          <div>
                            <strong>{t(ui.gapWarnHead, lang)}</strong>
                            <br />
                            {t(ui.gapWords.far, lang)}
                          </div>
                        </div>
                      ) : gap !== null ? (
                        <p className="small">{t(ui.gapWords[gapBand(gap)], lang)}</p>
                      ) : null}
                      <details>
                        <summary>{t(ui.detail, lang)}</summary>
                        <code>
                          H = {entropy(belief).toFixed(3)} / {Math.log(kb.needs.length).toFixed(3)} nats
                          {gap !== null && <> | Fisher-Rao d = {gap.toFixed(3)} / {Math.PI.toFixed(3)}</>}
                          {next && stop === null && <> | next gain = {next.gain.toFixed(3)} nats</>}
                        </code>
                      </details>
                      <details className="how">
                        <summary>{t(ui.explain.howLink, lang)}</summary>
                        <p className="small">{ui.explain.howHead[lang](kb.needs[topIdx].short[lang])}</p>
                        {howRows.length === 0 ? (
                          <p className="small">{t(ui.explain.howNone, lang)}</p>
                        ) : (
                          <ul className="howlist">
                            {howRows.map((c) => (
                              <li key={`${c.kind}-${c.index}`}>
                                <span className={c.factor >= 1 ? "up" : "down"}>{"\u00D7"}{c.factor.toFixed(2)}</span>{" "}
                                <span className="small">{howLabel(c)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </details>
                      <p className="small">
                        <button className="linkbtn small" onClick={() => setTab("about")}>
                          {t(ui.limits.link, lang)}
                        </button>
                      </p>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {tab === "cart" && (
              <section>
                <h2>{focus ? t(ui.plan.head, lang) : t(pack.texts.output.cartHead, lang)}</h2>
                {sheets && (
                  <fieldset>
                    {!focus && <legend>{t(ui.plan.head, lang)}</legend>}
                    {plan.length === 0 ? (
                      <p>{t(ui.plan.empty, lang)}</p>
                    ) : (
                      <>
                        {planReport.allNoData && <p>{t(ui.plan.allNoData, lang)}</p>}
                        <p className="small">{t(ui.plan.order, lang)}:</p>
                        <ol>
                          {planReport.order.map((id) => (
                            <li key={id}>
                              {kb.solutions.find((s) => s.id === id)?.title[lang]}{" "}
                              <button className="linkbtn small" onClick={() => setPlan((p) => p.filter((x) => x !== id))}>
                                [{t(ui.remove, lang)}]
                              </button>
                            </li>
                          ))}
                        </ol>
                        {planReport.suggestAdd.length > 0 && (
                          <>
                            <p className="small">{t(ui.plan.missing, lang)}:</p>
                            <ul>
                              {planReport.suggestAdd.map((id) => (
                                <li key={id}>
                                  {kb.solutions.find((s) => s.id === id)?.title[lang]}{" "}
                                  <button className="linkbtn small" onClick={() => setPlan((p) => [...p, id])}>
                                    [{t(ui.plan.addMissing, lang)}]
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        <p className="small">
                          {t(ui.plan.steps, lang)}: {planReport.steps}. {t(ui.plan.evidence, lang)}:{" "}
                          {t(ui.sheet.levels["method-published"], lang)} {planReport.evidence["method-published"]},{" "}
                          {t(ui.sheet.levels["problem-studied"], lang)} {planReport.evidence["problem-studied"]},{" "}
                          {t(ui.sheet.levels.none, lang)} {planReport.evidence.none}.
                        </p>
                        <p>{t(ui.plan.back, lang)}</p>
                      </>
                    )}
                  </fieldset>
                )}
                {focus ? null : !cartSolution ? (
                  <p>{t(ui.cartEmpty, lang)}</p>
                ) : (
                  <>
                    <p>
                      <strong>{cartSolution.title[lang]}</strong>{" "}
                      <button className="linkbtn small" onClick={() => setCartId(null)}>
                        [{t(ui.remove, lang)}]
                      </button>
                    </p>
                    <fieldset>
                      <legend>{t(pack.texts.output.specLegend, lang)}</legend>
                      <pre className="specbox">{specText}</pre>
                      <div className="field-row" style={{ marginTop: 8 }}>
                        <button
                          onClick={async () => {
                            await navigator.clipboard.writeText(specText);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                          }}
                        >
                          {copied ? t(ui.copied, lang) : t(ui.copy, lang)}
                        </button>
                      </div>
                    </fieldset>
                    <fieldset>
                      <legend>{t(ui.auditLegend, lang)}</legend>
                      <p>
                        {t(ui.auditNamed, lang)}: <strong>{statedTitle ?? "-"}</strong>
                        <br />
                        {t(ui.auditChosen, lang)}: <strong>{cartSolution.title[lang]}</strong>
                      </p>
                      <p>
                        {stated === null
                          ? t(ui.auditNone, lang)
                          : stated === cartSolution.id
                            ? t(ui.auditSame, lang)
                            : t(ui.auditMoved, lang)}
                      </p>
                    </fieldset>
                    <p>
                      <button onClick={() => reset()}>{t(ui.startOver, lang)}</button>
                    </p>
                  </>
                )}
              </section>
            )}

            {tab === "about" && (
              <section>
                <h2>{t(ui.limits.head, lang)}</h2>
                <fieldset>
                  <legend>{t(ui.plan.otherShelves, lang)}</legend>
                  <div className="field-row">
                    <select
                      aria-label={t(ui.plan.otherShelves, lang)}
                      value={packId}
                      onChange={(e) => switchPack(e.target.value as PackId)}
                      style={{ flex: 1 }}
                    >
                      {Object.values(packs).map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label[lang]}
                        </option>
                      ))}
                    </select>
                  </div>
                </fieldset>
                <p>{t(ui.limits.intro, lang)}</p>
                <fieldset>
                  <legend>{t(ui.limits.computedHead, lang)}</legend>
                  <ul className="limitlist">
                    {ui.limits.computed[lang].map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </fieldset>
                <fieldset>
                  <legend>{t(ui.limits.authoredHead, lang)}</legend>
                  <p data-testid="authored">
                    {ui.limits.authored[lang](
                      authored,
                      DEFAULT_PARAMS.sigma,
                      DEFAULT_PARAMS.unknown,
                      DEFAULT_PARAMS.mention,
                      DEFAULT_PARAMS.lapse,
                    )}
                  </p>
                  <p>{t(ui.limits.authoredTail, lang)}</p>
                </fieldset>
                <fieldset>
                  <legend>{t(ui.limits.beyondHead, lang)}</legend>
                  <ul className="limitlist">
                    {ui.limits.beyond[lang].map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </fieldset>
                <h2>{t(ui.aboutHead, lang)}</h2>
                {ui.aboutBody[lang].map((para) => (
                  <p key={para}>{para}</p>
                ))}
                <p>
                  <a href={REPO_URL} target="_blank" rel="noreferrer">
                    {t(ui.source, lang)}: {REPO_URL}
                  </a>
                </p>
              </section>
            )}
          </div>
        </BrowserFrame>

        <Agent
          lang={lang}
          title={t(ui.agent.title, lang)}
          lines={lines}
          placeholder={t(ui.agent.placeholder, lang)}
          send={t(ui.agent.send, lang)}
          chipsLabel={focus && ASK_LEVEL && level === null ? t(ui.level.pick, lang) : t(ui.agent.chipsLabel, lang)}
          chips={
            focus
              ? offerCheck
                ? []
                : ASK_LEVEL && level === null
                  ? [...ui.level.choices[lang]]
                  : [...ui.pit.examples[lang]]
              : showChips
                ? pack.samples.slice(0, 4).map((s) => s[lang])
                : []
          }
          onSubmit={submitText}
          voiceLabel={t(ui.agent.voice, lang)}
          confirm={
            pendingReading
              ? { yes: `${t(ui.agent.yes, lang)}: ${readingMarks(pendingReading, lang, attempts.length === 0)}`, no: t(ui.agent.no, lang), onYes: confirmReading, onNo: declineReading }
              : offerCheck
              ? { yes: t(ui.level.yes, lang), no: t(ui.level.no, lang), onYes: acceptCheckOffer, onNo: declineCheckOffer }
              : pendingCart && pendingSolution
              ? {
                  yes: t(ui.agent.yes, lang),
                  no: t(ui.agent.no, lang),
                  onYes: () => {
                    setCartId(pendingCart.id);
                    setPendingCart(null);
                  },
                  onNo: () => setPendingCart(null),
                }
              : null
          }
        />
      </div>

      <div className="taskbar">
        <button className="start" onClick={() => reset()}>
          {t(ui.start, lang)}
        </button>
        <div className="tray">
          <button onClick={() => setLang(lang === "ja" ? "en" : "ja")} aria-label="language">
            {lang === "ja" ? "EN" : "JA"}
          </button>
          <span>{clock}</span>
        </div>
      </div>
    </>
  );
}
