"use client";

import { useMemo, useState } from "react";
import {
  chooseNextQuestion,
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

const ui = {
  title: { ja: "真夜中の百貨店", en: "The Midnight Department Store" },
  tagline: {
    ja: "「何を作るか」ではなく、「何に困っているか」を聞かせてください。",
    en: "Tell me what hurts, not what to build.",
  },
  startHead: {
    ja: "もう思いついている解決策はありますか？（なくても構いません）",
    en: "Do you already have a solution in mind? (Optional)",
  },
  none: { ja: "特にない", en: "Nothing yet" },
  begin: { ja: "お店に入る", en: "Step inside" },
  progress: { ja: "質問", en: "Question" },
  answers: {
    yes: { ja: "はい", en: "Yes" },
    probably: { ja: "たぶん", en: "Probably" },
    unknown: { ja: "分からない", en: "Don't know" },
    probablyNot: { ja: "たぶん違う", en: "Probably not" },
    no: { ja: "いいえ", en: "No" },
  } satisfies Record<Answer, Record<Lang, string>>,
  beliefHead: { ja: "いま推定している「本当の困りごと」", en: "What I currently think really hurts" },
  gapHead: { ja: "あなたが挙げた解決策とのずれ", en: "Gap from the solution you named" },
  gapWords: {
    close: { ja: "ほぼ一致しています", en: "Close match" },
    differ: { ja: "少しずれています", en: "Some gap" },
    far: { ja: "大きくずれています", en: "Large gap: it may miss the real need" },
  },
  detail: { ja: "数式の詳細", en: "Math details" },
  stopReason: {
    confident: { ja: "十分に絞れました。", en: "Narrowed down enough." },
    budget: { ja: "質問の予算に達しました。", en: "Question budget reached." },
    "low-value": { ja: "これ以上聞いても得るものが少なそうです。", en: "More questions would add little." },
    exhausted: { ja: "聞くことがなくなりました。", en: "Nothing left to ask." },
  } satisfies Record<StopReason, Record<Lang, string>>,
  shelfHead: { ja: "この棚はいかがでしょう", en: "May I show you these shelves" },
  named: { ja: "あなたが挙げたもの", en: "You named this" },
  suggested: { ja: "店主の提案", en: "Shopkeeper's suggestion" },
  costLabel: { ja: "代償", en: "Cost" },
  choose: { ja: "これにする", en: "Take this one" },
  specHead: { ja: "出力された仕様", en: "Generated spec" },
  copy: { ja: "コピー", en: "Copy" },
  copied: { ja: "コピーしました", en: "Copied" },
  restart: { ja: "最初から", en: "Start over" },
  auditHead: { ja: "引き込み監査", en: "Persuasion audit" },
  auditNamed: { ja: "最初にあなたが挙げた解決策", en: "Solution you named first" },
  auditChosen: { ja: "最終的に選んだもの", en: "What you chose" },
  auditVerdictSame: {
    ja: "最初の考えのままです。提案に動かされていません。",
    en: "Same as your first idea. The suggestions did not move you.",
  },
  auditVerdictMoved: {
    ja: "提案で選択が変わりました。納得して選んだか、もう一度確認してください。",
    en: "Your choice changed after suggestions. Please confirm you chose it on your own terms.",
  },
  auditVerdictNone: {
    ja: "最初に挙げたものはありませんでした。",
    en: "You had not named anything at first.",
  },
  honest: {
    ja: "確率は、質問の答えから明示したモデルで更新した近似です。LLMは使っていません。",
    en: "Probabilities are an explicit model updated by your answers. No LLM is used at runtime.",
  },
} as const;

const t = (x: { ja: string; en: string }, lang: Lang) => x[lang];

function gapBand(gap: number): "close" | "differ" | "far" {
  if (gap < 0.35) return "close";
  if (gap < 0.9) return "differ";
  return "far";
}

function buildSpec(
  solution: Solution,
  topNeedTitle: string,
  confidence: number,
  statedTitle: string | null,
  lang: Lang,
): string {
  const lines = [
    `# ${solution.title[lang]}`,
    "",
    lang === "ja" ? "## 背景（本当の困りごと）" : "## Background (underlying need)",
    `${topNeedTitle} (${Math.round(confidence * 100)}%)`,
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
  const [phase, setPhase] = useState<"start" | "ask" | "result">("start");
  const [stated, setStated] = useState<string | null>(null);
  const [belief, setBelief] = useState<number[]>(() => priorFromStated(kb, null));
  const [asked, setAsked] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [stop, setStop] = useState<StopReason | null>(null);

  const askedIds = asked;
  const next = useMemo(() => chooseNextQuestion(belief, kb, askedIds), [belief, askedIds]);
  const gap = statedGap(kb, stated, belief);
  const ranked = useMemo(() => rankSolutions(belief, kb), [belief]);
  const topNeedIdx = belief.indexOf(Math.max(...belief));

  function begin() {
    setBelief(priorFromStated(kb, stated));
    setAsked([]);
    setChosen(null);
    setPhase("ask");
  }

  function answer(a: Answer) {
    if (!next) return;
    const nb = updateBelief(belief, kb, next.question, a);
    const na = [...asked, next.question.id];
    setBelief(nb);
    setAsked(na);
    const reason = shouldStop(nb, kb, na);
    if (reason !== null) {
      setStop(reason);
      setPhase("result");
    }
  }

  function restart() {
    setStated(null);
    setBelief(priorFromStated(kb, null));
    setAsked([]);
    setChosen(null);
    setStop(null);
    setPhase("start");
  }

  const shelves = ranked.slice(0, 3);
  // The user's own named solution is always shown, even if it ranks low, so the comparison is honest.
  const statedSolution = stated ? ranked.find((r) => r.solution.id === stated) : undefined;
  const shown =
    statedSolution && !shelves.some((s) => s.solution.id === stated)
      ? [...shelves, statedSolution]
      : shelves;
  const chosenSolution = shown.find((r) => r.solution.id === chosen)?.solution;
  const statedTitle = stated ? kb.solutions.find((s) => s.id === stated)?.title[lang] ?? null : null;

  return (
    <main className="wrap">
      <header className="head">
        <div>
          <h1>{t(ui.title, lang)}</h1>
          <p className="tag">{t(ui.tagline, lang)}</p>
        </div>
        <button className="ghost" onClick={() => setLang(lang === "ja" ? "en" : "ja")}>
          {lang === "ja" ? "English" : "日本語"}
        </button>
      </header>

      {phase === "start" && (
        <section className="card">
          <h2>{t(ui.startHead, lang)}</h2>
          <div className="choices">
            <button className={stated === null ? "pick on" : "pick"} onClick={() => setStated(null)}>
              {t(ui.none, lang)}
            </button>
            {kb.solutions.map((s) => (
              <button
                key={s.id}
                className={stated === s.id ? "pick on" : "pick"}
                onClick={() => setStated(s.id)}
              >
                {s.title[lang]}
              </button>
            ))}
          </div>
          <button className="primary" onClick={begin}>
            {t(ui.begin, lang)}
          </button>
        </section>
      )}

      {phase === "ask" && next && (
        <section className="card">
          <p className="meta">
            {t(ui.progress, lang)} {asked.length + 1}
          </p>
          <h2 className="q">{next.question.text[lang]}</h2>
          <div className="answers">
            {ANSWERS.map((a) => (
              <button key={a} className={a === "unknown" ? "ans soft" : "ans"} onClick={() => answer(a)}>
                {ui.answers[a][lang]}
              </button>
            ))}
          </div>
        </section>
      )}

      {phase !== "start" && (
        <section className="card">
          <h3>{t(ui.beliefHead, lang)}</h3>
          <ul className="bars">
            {kb.needs
              .map((n, i) => ({ n, p: belief[i] }))
              .sort((a, b) => b.p - a.p)
              .slice(0, 4)
              .map(({ n, p }) => (
                <li key={n.id}>
                  <span className="label">{n.title[lang]}</span>
                  <span className="bar">
                    <span style={{ width: `${Math.round(p * 100)}%` }} />
                  </span>
                  <span className="pct">{Math.round(p * 100)}%</span>
                </li>
              ))}
          </ul>
          {gap !== null && (
            <p className="gap">
              <strong>{t(ui.gapHead, lang)}:</strong> {t(ui.gapWords[gapBand(gap)], lang)}
            </p>
          )}
          <details>
            <summary>{t(ui.detail, lang)}</summary>
            <p className="mono">
              entropy H = {entropy(belief).toFixed(3)} nats (max {Math.log(kb.needs.length).toFixed(3)})
              {gap !== null && <> | Fisher-Rao gap d = {gap.toFixed(3)} (max {Math.PI.toFixed(3)})</>}
              {next && phase === "ask" && <> | next gain = {next.gain.toFixed(3)} nats</>}
            </p>
          </details>
        </section>
      )}

      {phase === "result" && (
        <>
          <section className="card">
            {stop && <p className="meta">{t(ui.stopReason[stop], lang)}</p>}
            <h2>{t(ui.shelfHead, lang)}</h2>
            <ul className="shelf">
              {shown.map(({ solution, score }) => (
                <li key={solution.id} className={chosen === solution.id ? "item on" : "item"}>
                  <div className="row">
                    <strong>{solution.title[lang]}</strong>
                    <span className={solution.id === stated ? "badge named" : "badge"}>
                      {solution.id === stated ? t(ui.named, lang) : t(ui.suggested, lang)}
                    </span>
                  </div>
                  <p>{solution.pitch[lang]}</p>
                  <p className="cost">
                    {t(ui.costLabel, lang)}: {solution.cost[lang]} · {Math.round(score * 100)}%
                  </p>
                  <button className="primary small" onClick={() => setChosen(solution.id)}>
                    {t(ui.choose, lang)}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {chosenSolution && (
            <section className="card">
              <h2>{t(ui.specHead, lang)}</h2>
              <pre className="spec">
                {buildSpec(
                  chosenSolution,
                  kb.needs[topNeedIdx].title[lang],
                  belief[topNeedIdx],
                  statedTitle,
                  lang,
                )}
              </pre>
              <button
                className="ghost"
                onClick={async () => {
                  await navigator.clipboard.writeText(
                    buildSpec(
                      chosenSolution,
                      kb.needs[topNeedIdx].title[lang],
                      belief[topNeedIdx],
                      statedTitle,
                      lang,
                    ),
                  );
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? t(ui.copied, lang) : t(ui.copy, lang)}
              </button>
              <h3>{t(ui.auditHead, lang)}</h3>
              <p>
                {t(ui.auditNamed, lang)}: <strong>{statedTitle ?? "-"}</strong>
                <br />
                {t(ui.auditChosen, lang)}: <strong>{chosenSolution.title[lang]}</strong>
              </p>
              <p className="meta">
                {stated === null
                  ? t(ui.auditVerdictNone, lang)
                  : stated === chosenSolution.id
                    ? t(ui.auditVerdictSame, lang)
                    : t(ui.auditVerdictMoved, lang)}
              </p>
            </section>
          )}

          <button className="ghost" onClick={restart}>
            {t(ui.restart, lang)}
          </button>
        </>
      )}

      <footer className="foot">{t(ui.honest, lang)}</footer>
    </main>
  );
}
