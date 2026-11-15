"use client";

import { useEffect, useMemo, useState } from "react";
import {
  chooseNextQuestion,
  fitChanges,
  rankSolutions,
  replayBelief,
  shouldStop,
  statedGap,
  type AnswerEntry,
} from "@/core/engine";
import { entropy } from "@/core/math";
import { ANSWERS, type Answer, type Lang, type Solution } from "@/core/types";
import { kb } from "@/data/kb";
import { BrowserFrame, Pumpkin } from "./parts";
import { t, ui } from "./strings";

type Tab = "home" | "shop" | "cart" | "about";

const REPO_URL = "https://github.com/polusiti/atama-ga-amata";
const MAX_SHELF = 5;

function gapBand(gap: number): "close" | "differ" | "far" {
  if (gap < 0.35) return "close";
  if (gap < 0.9) return "differ";
  return "far";
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
  const [tab, setTab] = useState<Tab>("home");
  const [stated, setStated] = useState<string | null>(null);
  const [entries, setEntries] = useState<AnswerEntry[]>([]);
  const [cartId, setCartId] = useState<string | null>(null);
  const [browseNeed, setBrowseNeed] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
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

  const belief = useMemo(() => replayBelief(kb, stated, entries), [stated, entries]);
  const beforeLast = useMemo(
    () => (entries.length > 0 ? replayBelief(kb, stated, entries.slice(0, -1)) : null),
    [stated, entries],
  );
  const askedIds = useMemo(() => entries.map((e) => e.qid), [entries]);
  const next = useMemo(() => chooseNextQuestion(belief, kb, askedIds), [belief, askedIds]);
  const stop = useMemo(() => shouldStop(belief, kb, askedIds), [belief, askedIds]);
  const gap = statedGap(kb, stated, belief);
  const ranked = useMemo(() => rankSolutions(belief, kb), [belief]);
  const topIdx = belief.indexOf(Math.max(...belief));
  const dim = entries.length === 0 && stated === null && browseNeed === null;

  const movers = useMemo(
    () =>
      beforeLast
        ? fitChanges(kb, beforeLast, belief)
            .filter((c) => Math.abs(c.delta) >= 0.005)
            .slice(0, 4)
        : [],
    [beforeLast, belief],
  );

  const shelf = useMemo(() => {
    if (browseNeed) {
      return kb.solutions
        .map((solution) => ({ solution, score: solution.fit[browseNeed] ?? 0 }))
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_SHELF);
    }
    const top = ranked.slice(0, MAX_SHELF);
    const named = stated ? ranked.find((r) => r.solution.id === stated) : undefined;
    return named && !top.some((r) => r.solution.id === stated) ? [...top, named] : top;
  }, [ranked, stated, browseNeed]);
  const coffin = useMemo(() => ranked.find((r) => r.solution.id !== stated), [ranked, stated]);

  const cartSolution = cartId ? kb.solutions.find((s) => s.id === cartId) : undefined;
  const statedTitle = stated ? (kb.solutions.find((s) => s.id === stated)?.title[lang] ?? null) : null;
  const specText = cartSolution
    ? buildSpec(cartSolution, kb.needs[topIdx].title[lang], belief[topIdx], statedTitle, lang)
    : "";
  const browseName = browseNeed ? kb.needs.find((n) => n.id === browseNeed)?.short[lang] : undefined;

  function answer(a: Answer) {
    if (next) setEntries([...entries, { qid: next.question.id, answer: a }]);
  }

  function reset() {
    setTab("home");
    setStated(null);
    setEntries([]);
    setCartId(null);
    setBrowseNeed(null);
    setOpenId(null);
  }

  const address = `http://www.atamagazon.example/exec/${tab}/${
    entries.length > 0 ? `need=${kb.needs[topIdx].id}/q=${entries.length}` : ""
  }`;

  const tabDefs: { id: Tab; label: string }[] = [
    { id: "home", label: t(ui.tabs.home, lang) },
    { id: "shop", label: t(ui.tabs.shop, lang) },
    { id: "cart", label: `${t(ui.tabs.cart, lang)} (${cartId ? 1 : 0})` },
    { id: "about", label: t(ui.tabs.about, lang) },
  ];
  const subnavTargets: Tab[] = ["about", "shop", "shop", "cart"];

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
            home: { label: t(ui.toolbar.home, lang), onClick: () => setTab("home") },
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
              <span className="tagline">{t(ui.tagline, lang)}</span>
            </div>
            <div className="toplinks">
              <button className="linkbtn" onClick={() => setTab("cart")}>
                {t(ui.topLinks.cart, lang)} ({cartId ? 1 : 0})
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
          <nav className="subnav" aria-label="site">
            {ui.subnav[lang].map((label, i) => (
              <button key={label} onClick={() => setTab(subnavTargets[i])}>
                {label}
              </button>
            ))}
          </nav>
          <div className="hello">
            <b>{ui.hello[lang](entries.length)}</b>
          </div>

          <div className="content">
            {tab === "home" && (
              <section>
                <h2>{t(ui.homeHead, lang)}</h2>
                <p>{t(ui.homeBody, lang)}</p>
                <fieldset>
                  <legend>{t(ui.statedLegend, lang)}</legend>
                  <div className="field-row">
                    <select
                      aria-label={t(ui.statedLegend, lang)}
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
                  {ui.newItems[lang].map((line) => (
                    <li key={line}>
                      <span className="blink">{t(ui.newBadge, lang)}!</span> {line}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {tab === "shop" && (
              <div className="cols">
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
                        </>
                      ) : (
                        <p className="qtext">
                          {stop ? t(ui.stopReason[stop], lang) : ""} {t(ui.stopNote, lang)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="sbox">
                    <h3>{t(ui.browseBox, lang)}</h3>
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
                                <button className="linkbtn small" onClick={() => setEntries(entries.slice(0, i))}>
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
                  <h2 className="results-head">{t(ui.resultsHead, lang)}</h2>
                  {browseNeed && browseName && (
                    <p className="banner">
                      {ui.browseBanner[lang](browseName)}{" "}
                      <button className="linkbtn" onClick={() => setBrowseNeed(null)}>
                        {t(ui.browseClear, lang)}
                      </button>
                    </p>
                  )}
                  {dim && <p className="dimnote">{t(ui.dimNote, lang)}</p>}
                  <ol className="items">
                    {shelf.map(({ solution, score }) => (
                      <li key={solution.id} className="item">
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
                          <p>{solution.pitch[lang]}</p>
                          <p className="small">
                            {t(ui.costLabel, lang)}: {solution.cost[lang]}
                          </p>
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
                        <button
                          className={cartId === solution.id ? "" : "default"}
                          onClick={() => setCartId(solution.id)}
                          disabled={cartId === solution.id}
                        >
                          {cartId === solution.id ? t(ui.inCart, lang) : t(ui.addToCart, lang)}
                        </button>
                      </li>
                    ))}
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
                          onClick={() => setCartId(coffin.solution.id)}
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
                    <h3>{t(ui.beliefHead, lang)}</h3>
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
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {tab === "cart" && (
              <section>
                <h2>{t(ui.cartHead, lang)}</h2>
                {!cartSolution ? (
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
                      <button onClick={reset}>{t(ui.startOver, lang)}</button>
                    </p>
                  </>
                )}
              </section>
            )}

            {tab === "about" && (
              <section>
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
