"use client";

import { useEffect, useMemo, useState } from "react";
import {
  chooseNextQuestion,
  DEFAULT_STOP,
  priorFromStated,
  rankSolutions,
  shouldStop,
  statedGap,
  updateBelief,
  type StopReason,
} from "@/core/engine";
import { entropy } from "@/core/math";
import { ANSWERS, type Answer, type Lang, type Solution } from "@/core/types";
import { kb } from "@/data/kb";

type Step = "welcome" | "ask" | "shelf" | "spec";
interface Entry {
  qid: string;
  answer: Answer;
}

const ui = {
  window: { ja: "真夜中の百貨店 セットアップ", en: "Midnight Department Store Setup" },
  brand: { ja: "真夜中の\n百貨店", en: "Midnight\nDepartment\nStore" },
  welcomeHead: { ja: "真夜中の百貨店へようこそ", en: "Welcome to the Midnight Department Store" },
  welcomeBody: {
    ja: "このウィザードは、あなたの「困りごと」を聞いて、本当に必要なものを探します。作りたいものではなく、困っていることを教えてください。",
    en: "This wizard listens to what hurts and looks for what you really need. Tell me the trouble, not the thing to build.",
  },
  statedLegend: {
    ja: "もう思いついている解決策（任意）",
    en: "A solution you already have in mind (optional)",
  },
  none: { ja: "（特にない）", en: "(nothing yet)" },
  askHead: { ja: "最近の出来事について", en: "About something recent" },
  answers: {
    yes: { ja: "はい", en: "Yes" },
    probably: { ja: "たぶんそう", en: "Probably" },
    unknown: { ja: "分からない", en: "I don't know" },
    probablyNot: { ja: "たぶん違う", en: "Probably not" },
    no: { ja: "いいえ", en: "No" },
  } satisfies Record<Answer, Record<Lang, string>>,
  beliefLegend: { ja: "いま推定している本当の困りごと", en: "What I think really hurts" },
  gapWarnHead: { ja: "警告", en: "Warning" },
  gapWords: {
    close: { ja: "挙げられた解決策は、いまの推定とほぼ一致しています。", en: "The solution you named matches the current estimate." },
    differ: { ja: "挙げられた解決策と、いまの推定には少しずれがあります。", en: "The solution you named is a little off from the current estimate." },
    far: {
      ja: "挙げられた解決策は、本当の困りごとに届いていない可能性があります（XY問題）。",
      en: "The solution you named may miss the real problem (an XY problem).",
    },
  },
  stopReason: {
    confident: { ja: "十分に絞り込めました。", en: "Narrowed down enough." },
    budget: { ja: "質問の上限に達しました。", en: "Reached the question limit." },
    "low-value": { ja: "これ以上聞いても得るものが少なそうです。", en: "More questions would add little." },
    exhausted: { ja: "聞くことがなくなりました。", en: "Nothing left to ask." },
  } satisfies Record<StopReason, Record<Lang, string>>,
  shelfHead: { ja: "こちらの棚はいかがでしょう", en: "May I show you these shelves?" },
  shelfBody: {
    ja: "断っても構いません。それぞれ代償も書いてあります。",
    en: "You may decline any of them. Costs are listed.",
  },
  named: { ja: "あなたが挙げたもの", en: "you named this" },
  suggested: { ja: "店主の提案", en: "suggested" },
  costLabel: { ja: "代償", en: "Cost" },
  fitLabel: { ja: "適合", en: "Fit" },
  specHead: { ja: "セットアップが完了しました", en: "Setup is complete" },
  specLegend: { ja: "出力された仕様", en: "Generated spec" },
  auditLegend: { ja: "引き込み監査", en: "Persuasion audit" },
  auditNamed: { ja: "最初に挙げた解決策", en: "Solution named first" },
  auditChosen: { ja: "最終的に選んだもの", en: "What you chose" },
  auditSame: { ja: "最初の考えのままです。提案には動かされていません。", en: "Same as your first idea. Suggestions did not move you." },
  auditMoved: {
    ja: "提案を見て選択が変わりました。自分の意思か、もう一度確認してください。",
    en: "Your choice changed after seeing suggestions. Please check it is really yours.",
  },
  auditNone: { ja: "最初に挙げたものはありませんでした。", en: "You had not named anything at first." },
  back: { ja: "< 戻る", en: "< Back" },
  next: { ja: "次へ >", en: "Next >" },
  cancel: { ja: "キャンセル", en: "Cancel" },
  finish: { ja: "完了", en: "Finish" },
  copy: { ja: "コピー", en: "Copy" },
  copied: { ja: "コピーしました", en: "Copied" },
  detail: { ja: "数式の詳細", en: "Math details" },
  start: { ja: "スタート", en: "Start" },
  statusQ: { ja: "質問", en: "Question" },
  statusNote: {
    ja: "LLMは使っていません。確率は答えから更新した近似です。",
    en: "No LLM. Probabilities are an approximation updated from your answers.",
  },
} as const;

const t = (x: { ja: string; en: string }, lang: Lang) => x[lang];

function gapBand(gap: number): "close" | "differ" | "far" {
  if (gap < 0.35) return "close";
  if (gap < 0.9) return "differ";
  return "far";
}

/** 12 x 10 pixel pumpkin. o = orange, k = black, g = green. */
const PUMPKIN = [
  "....gg......",
  "...gg.......",
  "..oooooooo..",
  ".oooooooooo.",
  "oooooooooooo",
  "ooookooookoo",
  "oooooookoooo",
  "ooookkkkkkoo",
  ".oooooooooo.",
  "..oooooooo..",
];
const PIXEL_COLOR: Record<string, string> = { o: "#ff8a1f", k: "#1a1a1a", g: "#3a8a2a" };

function Pumpkin() {
  return (
    <svg className="pumpkin" viewBox="0 0 12 10" aria-hidden="true" shapeRendering="crispEdges">
      {PUMPKIN.flatMap((row, y) =>
        [...row].map((c, x) =>
          PIXEL_COLOR[c] ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={PIXEL_COLOR[c]} /> : null,
        ),
      )}
    </svg>
  );
}

function buildSpec(
  solution: Solution,
  needTitle: string,
  confidence: number,
  statedTitle: string | null,
  lang: Lang,
): string {
  const lines = [
    `# ${solution.title[lang]}`,
    "",
    lang === "ja" ? "## 背景（本当の困りごと）" : "## Background (underlying need)",
    `${needTitle} (${Math.round(confidence * 100)}%)`,
    "",
    lang === "ja" ? "## 要件（EARS）" : "## Requirements (EARS)",
    ...solution.requirements.map((r, i) => `${i + 1}. ${r[lang]}`),
    "",
    lang === "ja" ? "## 代償・注意" : "## Costs and cautions",
    solution.cost[lang],
  ];
  if (statedTitle) {
    lines.push("", lang === "ja" ? "## 最初に挙げられた解決策" : "## Solution named first", statedTitle);
  }
  return lines.join("\n");
}

export default function Shop() {
  const [lang, setLang] = useState<Lang>("ja");
  const [step, setStep] = useState<Step>("welcome");
  const [stated, setStated] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [pending, setPending] = useState<Answer | null>(null);
  const [chosen, setChosen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setClock(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  // The belief is always replayed from the answers, so "Back" is exact.
  const belief = useMemo(() => {
    let b = priorFromStated(kb, stated);
    for (const e of entries) {
      const q = kb.questions.find((x) => x.id === e.qid);
      if (q) b = updateBelief(b, kb, q, e.answer);
    }
    return b;
  }, [stated, entries]);

  const askedIds = useMemo(() => entries.map((e) => e.qid), [entries]);
  const next = useMemo(() => chooseNextQuestion(belief, kb, askedIds), [belief, askedIds]);
  const stop = useMemo(() => shouldStop(belief, kb, askedIds), [belief, askedIds]);
  const gap = statedGap(kb, stated, belief);
  const ranked = useMemo(() => rankSolutions(belief, kb), [belief]);
  const topIdx = belief.indexOf(Math.max(...belief));

  const shelves = ranked.slice(0, 3);
  const statedRanked = stated ? ranked.find((r) => r.solution.id === stated) : undefined;
  const shown =
    statedRanked && !shelves.some((s) => s.solution.id === stated) ? [...shelves, statedRanked] : shelves;
  const chosenSolution = shown.find((r) => r.solution.id === chosen)?.solution;
  const statedTitle = stated ? (kb.solutions.find((s) => s.id === stated)?.title[lang] ?? null) : null;

  function reset() {
    setStep("welcome");
    setStated(null);
    setEntries([]);
    setPending(null);
    setChosen(null);
  }

  function goNext() {
    if (step === "welcome") {
      setEntries([]);
      setPending(null);
      setChosen(null);
      setStep("ask");
    } else if (step === "ask" && next && pending) {
      const nextEntries = [...entries, { qid: next.question.id, answer: pending }];
      setEntries(nextEntries);
      setPending(null);
      // Decide on the updated belief, replayed in the same way as the memo above.
      let b = priorFromStated(kb, stated);
      for (const e of nextEntries) {
        const q = kb.questions.find((x) => x.id === e.qid)!;
        b = updateBelief(b, kb, q, e.answer);
      }
      if (shouldStop(b, kb, nextEntries.map((e) => e.qid)) !== null) setStep("shelf");
    } else if (step === "shelf" && chosen) {
      setStep("spec");
    } else if (step === "spec") {
      reset();
    }
  }

  function goBack() {
    if (step === "ask") {
      if (entries.length === 0) setStep("welcome");
      else setEntries(entries.slice(0, -1));
      setPending(null);
    } else if (step === "shelf") {
      setEntries(entries.slice(0, -1));
      setStep("ask");
    } else if (step === "spec") {
      setStep("shelf");
    }
  }

  const canNext =
    step === "welcome" ||
    (step === "ask" && pending !== null && next !== null) ||
    (step === "shelf" && chosen !== null) ||
    step === "spec";

  const specText = chosenSolution
    ? buildSpec(chosenSolution, kb.needs[topIdx].title[lang], belief[topIdx], statedTitle, lang)
    : "";

  const progress = Math.min(100, Math.round((entries.length / DEFAULT_STOP.maxQuestions) * 100));

  return (
    <>
      <div className="desk">
        <div className="window win">
          <div className="title-bar">
            <div className="title-bar-text">{t(ui.window, lang)}</div>
            <div className="title-bar-controls">
              <button aria-label="Minimize" disabled />
              <button aria-label="Maximize" disabled />
              <button aria-label="Close" onClick={reset} />
            </div>
          </div>

          <div className="window-body">
            <div className="wizard">
              <aside className="side">
                <Pumpkin />
                <div className="brand" style={{ whiteSpace: "pre-line" }}>
                  {t(ui.brand, lang)}
                </div>
                <div className="sub">atama-ga-amata</div>
              </aside>

              <section className="main">
                {step === "welcome" && (
                  <div className="stack">
                    <h2>{t(ui.welcomeHead, lang)}</h2>
                    <p>{t(ui.welcomeBody, lang)}</p>
                    <fieldset>
                      <legend>{t(ui.statedLegend, lang)}</legend>
                      <div className="field-row">
                        <select
                          aria-label={t(ui.statedLegend, lang)}
                          value={stated ?? ""}
                          onChange={(e) => setStated(e.target.value === "" ? null : e.target.value)}
                          style={{ width: "100%" }}
                        >
                          <option value="">{t(ui.none, lang)}</option>
                          {kb.solutions.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.title[lang]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </fieldset>
                  </div>
                )}

                {step === "ask" && next && (
                  <div className="stack">
                    <h2>{t(ui.askHead, lang)}</h2>
                    <p className="q">{next.question.text[lang]}</p>
                    <div role="radiogroup">
                      {ANSWERS.map((a) => (
                        <div className="field-row" key={a}>
                          <input
                            id={`ans-${a}`}
                            type="radio"
                            name="answer"
                            checked={pending === a}
                            onChange={() => setPending(a)}
                          />
                          <label htmlFor={`ans-${a}`}>{ui.answers[a][lang]}</label>
                        </div>
                      ))}
                    </div>
                    <div
                      className="progress-indicator segmented"
                      role="progressbar"
                      aria-valuenow={progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <span className="progress-indicator-bar" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {step === "shelf" && (
                  <div className="stack">
                    <h2>{t(ui.shelfHead, lang)}</h2>
                    <p>
                      {stop ? `${t(ui.stopReason[stop], lang)} ` : ""}
                      {t(ui.shelfBody, lang)}
                    </p>
                    <div className="sunken-panel sunken" role="radiogroup">
                      {shown.map(({ solution, score }) => (
                        <div className="pick" key={solution.id}>
                          <div className="field-row">
                            <input
                              id={`sol-${solution.id}`}
                              type="radio"
                              name="solution"
                              checked={chosen === solution.id}
                              onChange={() => setChosen(solution.id)}
                            />
                            <label htmlFor={`sol-${solution.id}`}>
                              <strong>{solution.title[lang]}</strong>
                              <span className={solution.id === stated ? "tag named" : "tag"}>
                                {solution.id === stated ? t(ui.named, lang) : t(ui.suggested, lang)}
                              </span>
                            </label>
                          </div>
                          <div className="meta">{solution.pitch[lang]}</div>
                          <div className="meta">
                            {t(ui.costLabel, lang)}: {solution.cost[lang]} / {t(ui.fitLabel, lang)}:{" "}
                            {Math.round(score * 100)}%
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === "spec" && chosenSolution && (
                  <div className="stack">
                    <h2>{t(ui.specHead, lang)}</h2>
                    <fieldset>
                      <legend>{t(ui.specLegend, lang)}</legend>
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
                        {t(ui.auditChosen, lang)}: <strong>{chosenSolution.title[lang]}</strong>
                      </p>
                      <p>
                        {stated === null
                          ? t(ui.auditNone, lang)
                          : stated === chosenSolution.id
                            ? t(ui.auditSame, lang)
                            : t(ui.auditMoved, lang)}
                      </p>
                    </fieldset>
                  </div>
                )}

                {step !== "welcome" && step !== "spec" && (
                  <div className="stack" style={{ marginTop: 12 }}>
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
                      <p>{t(ui.gapWords[gapBand(gap)], lang)}</p>
                    ) : null}
                    <fieldset>
                      <legend>{t(ui.beliefLegend, lang)}</legend>
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
                      <details style={{ marginTop: 6 }}>
                        <summary>{t(ui.detail, lang)}</summary>
                        <code>
                          H = {entropy(belief).toFixed(3)} / {Math.log(kb.needs.length).toFixed(3)} nats
                          {gap !== null && <> | Fisher-Rao d = {gap.toFixed(3)} / {Math.PI.toFixed(3)}</>}
                          {next && step === "ask" && <> | next gain = {next.gain.toFixed(3)} nats</>}
                        </code>
                      </details>
                    </fieldset>
                  </div>
                )}
              </section>
            </div>

            <hr className="etched" />
            <div className="buttons">
              <button onClick={goBack} disabled={step === "welcome"}>
                {t(ui.back, lang)}
              </button>
              <button className="default" onClick={goNext} disabled={!canNext}>
                {step === "spec" ? t(ui.finish, lang) : t(ui.next, lang)}
              </button>
              <button onClick={reset}>{t(ui.cancel, lang)}</button>
            </div>
          </div>

          <div className="status-bar">
            <p className="status-bar-field">
              {t(ui.statusQ, lang)} {Math.min(entries.length, DEFAULT_STOP.maxQuestions)}/{DEFAULT_STOP.maxQuestions}
            </p>
            <p className="status-bar-field">{t(ui.statusNote, lang)}</p>
          </div>
        </div>
      </div>

      <div className="taskbar">
        <button className="start" onClick={reset}>
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
