import type { Answer, Lang } from "@/core/types";
import type { StopReason } from "@/core/engine";

export type L = { ja: string; en: string };
export const t = (x: L, lang: Lang) => x[lang];

export const ui = {
  window: { ja: "真夜中の百貨店 - ウェブブラウザ", en: "Midnight Department Store - Web Browser" },
  menu: {
    ja: ["ファイル(F)", "編集(E)", "表示(V)", "お気に入り(A)", "ツール(T)", "ヘルプ(H)"],
    en: ["File", "Edit", "View", "Favorites", "Tools", "Help"],
  },
  toolbar: {
    back: { ja: "戻る", en: "Back" },
    forward: { ja: "進む", en: "Forward" },
    stop: { ja: "中止", en: "Stop" },
    refresh: { ja: "更新", en: "Refresh" },
    home: { ja: "ホーム", en: "Home" },
  },
  address: { ja: "アドレス", en: "Address" },
  statusDone: { ja: "ページが表示されました", en: "Done" },
  statusZone: { ja: "インターネット", en: "Internet" },
  statusHours: { ja: "営業時間 0:00 - 4:00", en: "Open 0:00 - 4:00" },

  storeName: { ja: "真夜中の百貨店", en: "Midnight Dept. Store" },
  tagline: {
    ja: "夜中でいちばん品ぞろえの多い百貨店。困りごと8種、解決策10種、朝まで営業。",
    en: "The biggest department store after midnight. 8 troubles, 10 solutions, open till dawn.",
  },
  tabs: {
    home: { ja: "ホーム", en: "Home" },
    shop: { ja: "お店", en: "Shop" },
    cart: { ja: "カート", en: "Cart" },
    about: { ja: "このサイトについて", en: "About" },
  },

  homeHead: { ja: "いらっしゃいませ。何にお困りですか？", en: "Welcome. What is troubling you?" },
  homeBody: {
    ja: "何を作るかではなく、何にお困りかをお聞かせください。お答えのたびに、棚の並びが変わります。",
    en: "Tell me what troubles you, not what to build. Every answer rearranges the shelves.",
  },
  statedLegend: {
    ja: "もう思いついている解決策はありますか？（任意）",
    en: "Do you already have a solution in mind? (optional)",
  },
  none: { ja: "（特にない）", en: "(nothing yet)" },
  enter: { ja: "お店に入る", en: "Enter the shop" },
  newBadge: { ja: "NEW", en: "NEW" },
  newItems: {
    ja: ["今夜の棺（Coffin Box）、はじめました", "困りごと8種、新入荷"],
    en: ["Tonight's Coffin Box is now open", "8 new troubles in stock"],
  },

  sidebarQuestion: { ja: "絞り込み", en: "Narrow your search" },
  questionN: { ja: "質問", en: "Question" },
  answers: {
    yes: { ja: "はい", en: "Yes" },
    probably: { ja: "たぶんそう", en: "Probably" },
    unknown: { ja: "分からない", en: "I don't know" },
    probablyNot: { ja: "たぶん違う", en: "Probably not" },
    no: { ja: "いいえ", en: "No" },
  } satisfies Record<Answer, L>,
  historyHead: { ja: "あなたの答え", en: "Your answers" },
  historyEmpty: { ja: "まだありません", en: "None yet" },
  undo: { ja: "取り消す", en: "undo" },
  stopReason: {
    confident: { ja: "お探しのものが見えてきました。", en: "I think I see what you are after." },
    budget: { ja: "質問はここまでにしましょう。", en: "That is enough questions." },
    "low-value": { ja: "これ以上は野暮というものです。", en: "Any more would be tiresome." },
    exhausted: { ja: "お聞きすることは以上です。", en: "That is all I wanted to ask." },
  } satisfies Record<StopReason, L>,
  stopNote: { ja: "どうぞ棚をご覧ください。", en: "Please, have a look at the shelves." },

  resultsHead: { ja: "検索結果（適合度順）", en: "Results (by fit)" },
  dimNote: {
    ja: "店内は消灯中です。左の質問にお答えください。",
    en: "The lights are off. Please answer the question on the left.",
  },
  named: { ja: "あなたが挙げたもの", en: "you named this" },
  suggested: { ja: "店主の提案", en: "suggested" },
  costLabel: { ja: "代償", en: "Cost" },
  fitLabel: { ja: "適合度", en: "Fit" },
  addToCart: { ja: "カートに入れる", en: "Add to cart" },
  inCart: { ja: "カートに入っています", en: "In your cart" },

  coffinHead: { ja: "今夜の棺（Coffin Box）", en: "Tonight's Coffin Box" },
  coffinNote: {
    ja: "お客様が挙げなかった品から、店主のおすすめです。",
    en: "The shopkeeper's pick from what you did not name.",
  },
  beliefHead: { ja: "いま推定している困りごと", en: "What I think really hurts" },
  gapWarnHead: { ja: "警告", en: "Warning" },
  gapWords: {
    close: { ja: "お挙げの品は、お困りごとにほぼ合っています。", en: "What you named fits your trouble well." },
    differ: { ja: "お挙げの品は、お困りごととは少しずれているようです。", en: "What you named seems a little off from your trouble." },
    far: {
      ja: "お挙げの品は、本当のお困りごとに届いていないかもしれません（XY問題）。",
      en: "What you named may miss the real trouble (an XY problem).",
    },
  },
  detail: { ja: "数式の詳細", en: "Math details" },

  cartHead: { ja: "ショッピングカート", en: "Shopping cart" },
  cartEmpty: { ja: "カートは空です。お店で棚から選んでください。", en: "Your cart is empty. Pick something from the shelves." },
  remove: { ja: "削除", en: "Remove" },
  specLegend: { ja: "出力された仕様（EARS）", en: "Generated spec (EARS)" },
  copy: { ja: "コピー", en: "Copy" },
  copied: { ja: "コピーしました", en: "Copied" },
  auditLegend: { ja: "引き込み監査", en: "Persuasion audit" },
  auditNamed: { ja: "最初に挙げた解決策", en: "Solution named first" },
  auditChosen: { ja: "最終的に選んだもの", en: "What you chose" },
  auditSame: { ja: "最初の考えのままです。提案には動かされていません。", en: "Same as your first idea. Suggestions did not move you." },
  auditMoved: {
    ja: "提案を見て選択が変わりました。自分の意思か、もう一度確認してください。",
    en: "Your choice changed after seeing suggestions. Please check it is really yours.",
  },
  auditNone: { ja: "最初に挙げたものはありませんでした。", en: "You had not named anything at first." },
  startOver: { ja: "最初からやり直す", en: "Start over" },

  aboutHead: { ja: "このサイトについて", en: "About this site" },
  aboutBody: {
    ja: [
      "人は、解決策を頼みますが、本当に持っているのは困りごとです。200年前のおばあさんは、洗濯機がほしいとは言わず、冬の水仕事で手が痛いと言いました。",
      "この店は、あなたが挙げた解決策を、必要を示す証拠の一つとして扱います。答えから必要を推定し、挙げなかった選択肢も見せます。",
      "実行時にLLMは使いません。質問は、期待情報利得をコストで割った値で選びます。ずれは、フィッシャー・ラオ距離で測ります。",
      "数値は、作者が設定した判断です。実測ではありません。詳しくは docs/assumptions.md を見てください。",
      "見た目は、1990年代末のオンライン書店の雰囲気への敬意です。実在の企業のロゴや名称は使っていません。",
    ],
    en: [
      "People ask for solutions but what they have is a trouble. A woman two centuries ago would not ask for a washing machine; she would say her hands ache in winter water.",
      "This store treats the solution you name as one piece of evidence about the need. It infers the need from your answers and shows options you did not name.",
      "No LLM runs at runtime. Questions are chosen by expected information gain per unit cost. The gap is measured with the Fisher-Rao distance.",
      "The numbers are the author's judgment, not measurements. See docs/assumptions.md.",
      "The look is a nod to late-1990s online bookstores. No real company's logo or name is used.",
    ],
  },
  source: { ja: "ソースコード", en: "Source code" },

  start: { ja: "スタート", en: "Start" },
} as const;

