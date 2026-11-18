import type { SpecSheet } from "@/core/types";

/**
 * Spec sheets for the developer moves that name a source. The theory is a short reading of the source by the author,
 * not a quotation, and it may be wrong. A level other than "none" describes where the move comes from,
 * not whether it works for a given person.
 * Moves without a source have no sheet, and the shop says "no theory or data recorded" for them.
 */
const METHOD = {
  level: "method-published" as const,
  note: {
    ja: "公開された手法です。この製品での効果は検証されていません。",
    en: "A published method. Its effect in this product has not been tested.",
  },
};

export const devstuckSheets: Record<string, SpecSheet> = {
  "fix-repro": {
    theory: {
      ja: "いつでも起こせる失敗は調べられますが、起こせない失敗は推測するしかありません。Zeller の手順は、まず失敗を追跡して再現することから始まります。",
      en: "A failure you can trigger on demand can be studied; one you cannot can only be guessed at. Zeller's process starts by tracking the failure and reproducing it.",
    },
    evidence: METHOD,
    unfitWhen: {
      ja: "どうしても再現できないとき（本番の負荷が要るなど）。その場合は、起きる頻度と条件を記録します。",
      en: "When the failure cannot be repeated at all (it needs production load, for example). Then record how often it happens and under what conditions.",
    },
  },
  "make-minimal": {
    theory: {
      ja: "不要な部分を1つずつ外して、それでも失敗する最小の例にします。外せなかった部分が、失敗に関わっています（Zeller の単純化）。",
      en: "Remove parts that look unrelated one at a time until the smallest case that still fails is left. The parts that cannot be removed matter (Zeller's simplification).",
    },
    evidence: METHOD,
    unfitWhen: {
      ja: "1回の実行に時間がかかりすぎるとき。縮める作業は、何度も実行する必要があります。",
      en: "When one run takes too long. Shrinking needs many runs.",
    },
  },
  "add-evidence": {
    theory: {
      ja: "読める事実があれば、推測を減らせます。仮説を立てる前に観察する、という Zeller の考え方に基づきます。",
      en: "Facts you can read replace guesses. It rests on Zeller's habit of observing before forming a hypothesis.",
    },
    evidence: METHOD,
    unfitWhen: {
      ja: "ログを足すこと自体が、動作を変えてしまうとき。",
      en: "When adding output changes the behavior itself.",
    },
  },
  predict: {
    theory: {
      ja: "変更の前に予想を書くと、外れた予想が、その仮説を捨てる理由になります（Zeller の、科学的な手順としてのデバッグ）。",
      en: "A prediction written before the change turns a miss into a reason to drop the hypothesis (Zeller's view of debugging as the scientific method).",
    },
    evidence: METHOD,
    unfitWhen: {
      ja: "まだ事実がなく、仮説の元になるものがないとき。先に事実を足します。",
      en: "When there are no facts yet to base a hypothesis on. Add facts first.",
    },
  },
  "diff-change": {
    theory: {
      ja: "動いていた版と動かない版の差分を半分ずつ試して、失敗を起こす変更を絞り込みます（Zeller のデルタデバッグ）。",
      en: "Try half of the differences between the working and the failing version at a time to narrow down the change that causes the failure (Zeller's delta debugging).",
    },
    evidence: METHOD,
    unfitWhen: {
      ja: "動いていた版が、もう手元にないとき。",
      en: "When no working version is available.",
    },
  },
  "split-problem": {
    theory: {
      ja: "入力から出力までを確かめられる区間に分け、区間ごとに入出力を確かめて、最初にずれる区間を見つけます（Zeller）。",
      en: "Divide the flow from input to output into segments you can check, check each one, and find the first segment where they disagree (Zeller).",
    },
    evidence: METHOD,
    unfitWhen: {
      ja: "区間ごとに、別々に確かめられないとき。",
      en: "When the segments cannot be checked separately.",
    },
  },
  "fresh-context": {
    theory: {
      ja: "複数回のやり取りでは、モデルは誤った道から戻りにくい、という研究があります（Laban ら 2025）。新しい会話に事実だけを渡せば、誤った道を持ち込みません。",
      en: "A study finds that models do not recover well from a wrong turn over many turns (Laban et al. 2025). A new conversation with only the facts leaves the wrong turns behind.",
    },
    evidence: {
      level: "problem-studied",
      note: {
        ja: "研究が示したのは、複数回の会話で性能が下がる問題です。新しく始め直すことが、その解決になるかは、検証されていません。",
        en: "The study shows the drop in long conversations. It does not test starting afresh as the remedy.",
      },
    },
    unfitWhen: {
      ja: "持ち越せる事実がまだないとき（先に目的の一文と、事実を足します）。",
      en: "When there are no facts to carry over yet (write the goal and add facts first).",
    },
  },
  refute: {
    theory: {
      ja: "アシスタントは、利用者の見方に合わせる傾向があります（Sharma ら 2023）。自分が間違っているなら何が証拠になるかを聞くと、その傾向に逆らえるかもしれません。",
      en: "Assistants tend to match the user's view (Sharma et al. 2023). Asking what evidence would show you are wrong may push against that.",
    },
    evidence: {
      level: "problem-studied",
      note: {
        ja: "研究が示したのは、同調の傾向です。この聞き方が効くかは、検証されていません。",
        en: "The study shows the tendency to agree. It does not test this way of asking.",
      },
    },
    unfitWhen: {
      ja: "返ってきた反証も AI の出力なので、実行や文書で確かめられないとき。",
      en: "When the rebuttal is itself AI output and cannot be checked by running or reading a document.",
    },
  },
};
