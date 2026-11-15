import type { Reading } from "./evidence";
import type { Lang } from "./types";

/**
 * The shopkeeper's turn-taking, as pure functions.
 * Ideas borrowed (not code): ELIZA's keyword fallback and memory of an earlier statement,
 * the OARS skills (open question, reflection, summary), and the confirm-before-acting step
 * of assistant frameworks. Wording is hedged on purpose: the program never claims to understand.
 */
export type Kind = "greet" | "reflect" | "ladder" | "fallback" | "summary" | "summaryPlain" | "confirm";

export interface Utterance {
  kind: Kind;
  /** How many utterances of this kind came before. Picks the template, so repeats differ. */
  variant: number;
  needId?: string;
  solutionId?: string;
  first?: string;
  fit?: number;
}

export type DecideInput =
  | { event: "load"; history: readonly Kind[] }
  | { event: "text"; history: readonly Kind[]; reading: Reading }
  | { event: "stop"; history: readonly Kind[]; topNeedId: string; first: string | null }
  | { event: "cart-low"; history: readonly Kind[]; solutionId: string; fit: number };

const count = (history: readonly Kind[], kind: Kind) => history.filter((k) => k === kind).length;

/** Decide what the shopkeeper says next. Deterministic: same input, same utterance. */
export function decide(input: DecideInput): Utterance {
  const v = (kind: Kind) => count(input.history, kind);
  switch (input.event) {
    case "load":
      return { kind: "greet", variant: v("greet") };
    case "text": {
      if (input.reading.named) return { kind: "ladder", variant: v("ladder"), solutionId: input.reading.named };
      if (input.reading.top) return { kind: "reflect", variant: v("reflect"), needId: input.reading.top };
      return { kind: "fallback", variant: v("fallback") };
    }
    case "stop":
      return input.first
        ? { kind: "summary", variant: v("summary"), needId: input.topNeedId, first: input.first }
        : { kind: "summaryPlain", variant: v("summaryPlain"), needId: input.topNeedId };
    case "cart-low":
      return { kind: "confirm", variant: v("confirm"), solutionId: input.solutionId, fit: input.fit };
  }
}

export const templates: Record<Kind, Record<Lang, readonly string[]>> = {
  greet: {
    ja: [
      "いらっしゃいませ。最近いちばん引っかかっていることを、一言で聞かせてください。",
      "いらっしゃいませ。何にお困りか、思いつくままにどうぞ。",
    ],
    en: [
      "Welcome. Tell me in a sentence what has been bothering you lately.",
      "Welcome. What is troubling you? Say it any way you like.",
    ],
  },
  reflect: {
    ja: [
      "「{need}」のあたりでお困りなのでしょうか。違っていたら、遠慮なくおっしゃってください。",
      "「{need}」に近いお話に聞こえました。もう少し聞かせていただけますか。",
      "なるほど。「{need}」ということでしょうか。",
    ],
    en: [
      'It may be about "{need}". Please correct me if not.',
      'That seems close to "{need}". Could you tell me a little more?',
      'I see. Is it "{need}", perhaps?',
    ],
  },
  ladder: {
    ja: [
      "「{sol}」をお考えなのですね。それがうまくいったら、何が楽になりますか？",
      "「{sol}」ですね。それで、いちばん片づけたいのはどんなことでしょう。",
    ],
    en: [
      '"{sol}" is on your mind. If it worked, what would get easier?',
      '"{sol}", then. What is the thing you most want to be rid of?',
    ],
  },
  fallback: {
    ja: [
      "すみません、うまく拾えませんでした。たとえば、こんなお困りごとはいかがでしょう。",
      "申し訳ありません、ことばを拾いきれませんでした。近いものを、下の例から選んでいただけますか。",
    ],
    en: [
      "Sorry, I could not pick that up. How about one of these troubles?",
      "I am afraid I missed that. Could you pick the closest example below?",
    ],
  },
  summary: {
    ja: [
      "ここまでをまとめます。最初に「{first}」とおっしゃっていました。いまは「{need}」に近いお困りごとと見ています。",
      "整理させてください。最初のお話は「{first}」でした。ここまでの答えでは、「{need}」に寄っているようです。",
    ],
    en: [
      'Let me sum up. You first said "{first}". So far it looks closest to "{need}".',
      'Allow me to gather this. Your first words were "{first}". Your answers lean toward "{need}".',
    ],
  },
  summaryPlain: {
    ja: [
      "ここまでをまとめます。いまは「{need}」に近いお困りごとと見ています。",
      "整理させてください。ここまでの答えでは、「{need}」に寄っているようです。",
    ],
    en: [
      'Let me sum up. It looks closest to "{need}".',
      'Allow me to gather this. Your answers lean toward "{need}".',
    ],
  },
  confirm: {
    ja: [
      "「{sol}」は、いまのところ合う度合いが{fit}%です。それでもカートに入れますか？",
      "「{sol}」は、いまの推定では{fit}%ほどです。本当にこれにしますか？",
    ],
    en: [
      '"{sol}" fits only about {fit}% right now. Add it to the cart anyway?',
      'For now "{sol}" is about {fit}%. Do you really want this one?',
    ],
  },
};

export interface Lookup {
  need: (id: string, lang: Lang) => string;
  solution: (id: string, lang: Lang) => string;
}

/** Fill a template. Titles are resolved at render time so switching language re-renders old lines. */
export function render(u: Utterance, lang: Lang, lookup: Lookup): string {
  const list = templates[u.kind][lang];
  const template = list[u.variant % list.length];
  return template.replace(/\{(need|sol|first|fit)\}/g, (_, key: string) => {
    switch (key) {
      case "need":
        return u.needId ? lookup.need(u.needId, lang) : "";
      case "sol":
        return u.solutionId ? lookup.solution(u.solutionId, lang) : "";
      case "first":
        return u.first ?? "";
      default:
        return u.fit === undefined ? "" : String(Math.round(u.fit * 100));
    }
  });
}
