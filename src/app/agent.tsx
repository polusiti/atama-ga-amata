"use client";

import { useEffect, useRef, useState } from "react";
import type { Lang } from "@/core/types";
import { Mascot } from "./parts";

export interface Line {
  from: "shop" | "you";
  text: string;
}

interface Props {
  lang: Lang;
  title: string;
  lines: Line[];
  placeholder: string;
  send: string;
  chipsLabel: string;
  chips: string[];
  onSubmit: (text: string) => void;
  confirm: { yes: string; no: string; onYes: () => void; onNo: () => void } | null;
  voiceLabel: string;
}

const MAX_LEN = 200;

/** The shopkeeper's window. Text only; replies come from rules, never from a model. */
export function Agent(p: Props) {
  const [text, setText] = useState("");
  const [speakOn, setSpeakOn] = useState(false);
  const [canSpeak, setCanSpeak] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const lastSpoken = useRef(-1);

  // Offer speech only when this browser has a voice that runs on the device itself.
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const check = () =>
      setCanSpeak(
        window.speechSynthesis.getVoices().some((v) => v.localService && v.lang.toLowerCase().startsWith(p.lang)),
      );
    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", check);
  }, [p.lang]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [p.lines.length]);

  useEffect(() => {
    if (!speakOn || !canSpeak) return;
    const i = p.lines.length - 1;
    const last = p.lines[i];
    if (!last || last.from !== "shop" || lastSpoken.current === i) return;
    lastSpoken.current = i;
    const voice = window.speechSynthesis
      .getVoices()
      .find((v) => v.localService && v.lang.toLowerCase().startsWith(p.lang));
    if (!voice) return;
    const u = new SpeechSynthesisUtterance(last.text);
    u.voice = voice;
    u.lang = voice.lang;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }, [p.lines, speakOn, canSpeak, p.lang]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const v = text.trim();
    if (!v) return;
    p.onSubmit(v);
    setText("");
  }

  return (
    <div className="window agent">
      <div className="title-bar">
        <div className="title-bar-text">{p.title}</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" disabled />
          <button aria-label="Maximize" disabled />
          <button aria-label="Close" disabled />
        </div>
      </div>
      <div className="window-body">
        <div className="agent-head">
          <Mascot size={80} />
        </div>
        <div className="agent-log sunken-panel" ref={logRef} role="log" aria-live="polite">
          {p.lines.map((l, i) => (
            <p key={i} className={l.from === "shop" ? "bubble shop" : "bubble you"}>
              {l.text}
            </p>
          ))}
        </div>

        {p.confirm && (
          <div className="confirm">
            <div className="field-row">
              <button className="default" onClick={p.confirm.onYes}>
                {p.confirm.yes}
              </button>
              <button onClick={p.confirm.onNo}>{p.confirm.no}</button>
            </div>
          </div>
        )}

        {p.chips.length > 0 && (
          <div className="chips">
            <span className="small">{p.chipsLabel}</span>
            {p.chips.map((c) => (
              <button key={c} className="chip" onClick={() => p.onSubmit(c)}>
                {c}
              </button>
            ))}
          </div>
        )}

        <form className="agent-form" onSubmit={submit}>
          <input
            type="text"
            value={text}
            maxLength={MAX_LEN}
            placeholder={p.placeholder}
            aria-label={p.placeholder}
            onChange={(e) => setText(e.target.value)}
          />
          <button type="submit">{p.send}</button>
        </form>

        {canSpeak && (
          <div className="field-row" style={{ marginTop: 6 }}>
            <input id="speak" type="checkbox" checked={speakOn} onChange={(e) => setSpeakOn(e.target.checked)} />
            <label htmlFor="speak">{p.voiceLabel}</label>
          </div>
        )}
      </div>
    </div>
  );
}

