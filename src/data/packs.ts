import { everydayLexicon, samples as everydaySamples } from "@/core/lexicon";
import type { KnowledgeBase, L10n, Lexicon, SpecSheet } from "@/core/types";
import { devstuck, devstuckLexicon, devstuckSamples } from "./devstuck";
import { devstuckSheets } from "./devstuck-sheets";
import { kb as everyday } from "./kb";

export type PackId = "devstuck" | "everyday";

export interface PackTexts {
  tagline: L10n;
  /** Heading of the list of kinds of trouble on the left (BROWSE). */
  browse: L10n;
  /** Heading of the box showing the inferred trouble. */
  belief: L10n;
  /** Heading of the shelf of results. */
  results: L10n;
  homeHead: L10n;
  homeBody: L10n;
  statedLegend: L10n;
  newItems: { ja: string[]; en: string[] };
  output: {
    titlePrefix: L10n;
    background: L10n;
    requirements: L10n;
    costs: L10n;
    stated: L10n;
    source: L10n;
    cartHead: L10n;
    specLegend: L10n;
  };
}

/** One shelf of the store: its knowledge, how to read free text, example sentences and wording. */
export interface Pack {
  id: PackId;
  label: L10n;
  kb: KnowledgeBase;
  lexicon: Lexicon;
  samples: { needId: string; ja: string; en: string }[];
  /** Show step status (done, blocked, next) built from the probes' `practice` and the steps' `requires`. */
  useFringe: boolean;
  /** Spec sheets by move id. A move without a sheet has no recorded theory or data. */
  sheets?: Record<string, SpecSheet>;
  texts: PackTexts;
}

export const packs: Record<PackId, Pack> = {
  devstuck: {
    id: "devstuck",
    label: { ja: "開発の詰まり（エンジニア × AI）", en: "Developer stuck (engineers x AI)" },
    kb: devstuck,
    lexicon: devstuckLexicon,
    samples: devstuckSamples,
    useFringe: true,
    sheets: devstuckSheets,
    texts: {
      tagline: { ja: "壁打ちが止まったら、次の一手を", en: "When the back-and-forth stalls, find the next move" },
      browse: { ja: "詰まりの種類から探す", en: "BROWSE BY STALL" },
      belief: { ja: "いま推定している詰まり", en: "WHERE YOU ARE STUCK" },
      results: { ja: "次の一手（優先順）", en: "Next moves (in order)" },
      homeHead: { ja: "どこで詰まっていますか？", en: "Where are you stuck?" },
      homeBody: {
        ja: "AIとの壁打ちを重ねても進まないときの診断です。「何を試すか」ではなく、「いま、何が固まっていないか」をお聞きします。答えると、すでにやっている手は飛ばして、次の一手を出します。",
        en: "A check for when many rounds with an AI have stopped making progress. I will not ask what to try; I will ask what is not yet pinned down. Moves you already make are skipped, and the next move is shown.",
      },
      statedLegend: { ja: "いま試そうとしていること（任意）", en: "What you are about to try (optional)" },
      newItems: {
        ja: [`詰まりの種類${devstuck.needs.length}種、次の一手${devstuck.solutions.length}種、入荷`, "次の一手には、出所がついています"],
        en: [`${devstuck.needs.length} kinds of stall and ${devstuck.solutions.length} next moves in stock`, "Every next move shows its source"],
      },
      output: {
        titlePrefix: { ja: "次の一手: ", en: "Next move: " },
        background: { ja: "いま詰まっているところ", en: "Where you are stuck" },
        requirements: { ja: "手順", en: "Steps" },
        costs: { ja: "手間・注意", en: "Cost and cautions" },
        stated: { ja: "最初に試そうとしていたこと", en: "What you first meant to try" },
        source: { ja: "出所", en: "Source" },
        cartHead: { ja: "次の一手（カート）", en: "Your next move (cart)" },
        specLegend: { ja: "手順", en: "Steps" },
      },
    },
  },
  everyday: {
    id: "everyday",
    label: { ja: "暮らしの困りごと", en: "Everyday troubles" },
    kb: everyday,
    lexicon: everydayLexicon,
    samples: everydaySamples,
    useFringe: false,
    texts: {
      tagline: { ja: "夜中でいちばんの品ぞろえ", en: "Midnight's Biggest Selection" },
      browse: { ja: "困りごとから探す", en: "BROWSE" },
      belief: { ja: "いま推定している困りごと", en: "WHAT HURTS" },
      results: { ja: "おすすめの品（適合度順）", en: "Recommended (by fit)" },
      homeHead: { ja: "何にお困りですか？", en: "What is troubling you?" },
      homeBody: {
        ja: "何を作るかではなく、何にお困りかをお聞かせください。お答えのたびに、棚の並びが変わります。",
        en: "Tell me what troubles you, not what to build. Every answer rearranges the shelves.",
      },
      statedLegend: {
        ja: "もう思いついている解決策はありますか？（任意）",
        en: "Do you already have a solution in mind? (optional)",
      },
      newItems: {
        ja: ["今夜の棺（Coffin Box）、はじめました", `困りごと${everyday.needs.length}種、新入荷`],
        en: ["Tonight's Coffin Box is now open", `${everyday.needs.length} new troubles in stock`],
      },
      output: {
        titlePrefix: { ja: "", en: "" },
        background: { ja: "背景（本当の困りごと）", en: "Background (underlying need)" },
        requirements: { ja: "要件（EARS）", en: "Requirements (EARS)" },
        costs: { ja: "代償・注意", en: "Costs and cautions" },
        stated: { ja: "最初に挙げられた解決策", en: "Solution named first" },
        source: { ja: "出所", en: "Source" },
        cartHead: { ja: "ショッピングカート", en: "Shopping cart" },
        specLegend: { ja: "出力された仕様（EARS）", en: "Generated spec (EARS)" },
      },
    },
  },
};

export const DEFAULT_PACK: PackId = "devstuck";

