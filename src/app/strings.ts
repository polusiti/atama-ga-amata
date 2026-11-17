import type { Answer, Lang } from "@/core/types";
import type { StopReason } from "@/core/engine";

export type L = { ja: string; en: string };
export const t = (x: L, lang: Lang) => x[lang];

export const ui = {
  window: { ja: "atamagazon - ウェブブラウザ", en: "atamagazon - Web Browser" },
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
  statusHours: { ja: "営業時間 0:00 - 4:00", en: "Open 0:00 - 4:00" },
  statusZone: { ja: "インターネット", en: "Internet" },

  storeName: "atamagazon",
  tagline: { ja: "夜中でいちばんの品ぞろえ", en: "Midnight's Biggest Selection" },
  topLinks: {
    cart: { ja: "カートを見る", en: "VIEW CART" },
    help: { ja: "ヘルプ", en: "HELP" },
  },
  tabs: {
    home: { ja: "ようこそ", en: "WELCOME" },
    shop: { ja: "お店", en: "SHOP" },
    cart: { ja: "カート", en: "CART" },
    about: { ja: "このサイトについて", en: "ABOUT" },
  },
  subnav: {
    ja: ["ご利用案内", "売れ筋", "今夜の棺", "カートを見る"],
    en: ["HOW IT WORKS", "TOP SELLERS", "COFFIN BOX", "VIEW CART"],
  },
  hello: {
    ja: (n: number) =>
      n === 0
        ? "いらっしゃいませ。お困りごとをお聞かせください。"
        : `いらっしゃいませ。${n}件のご回答をいただいています。`,
    en: (n: number) =>
      n === 0 ? "Welcome. Tell me what troubles you." : `Welcome. ${n} answer${n === 1 ? "" : "s"} so far.`,
  },

  homeHead: { ja: "何にお困りですか？", en: "What is troubling you?" },
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

  questionBox: { ja: "質問", en: "QUESTION" },
  questionN: { ja: "質問", en: "Question" },
  answers: {
    yes: { ja: "はい", en: "Yes" },
    probably: { ja: "たぶんそう", en: "Probably" },
    unknown: { ja: "分からない", en: "I don't know" },
    probablyNot: { ja: "たぶん違う", en: "Probably not" },
    no: { ja: "いいえ", en: "No" },
  } satisfies Record<Answer, L>,
  browseBox: { ja: "困りごとから探す", en: "BROWSE" },
  historyHead: { ja: "あなたの答え", en: "YOUR ANSWERS" },
  historyEmpty: { ja: "まだありません", en: "None yet" },
  undo: { ja: "取り消す", en: "undo" },
  stopReason: {
    confident: { ja: "お探しのものが見えてきました。", en: "I think I see what you are after." },
    budget: { ja: "質問はここまでにしましょう。", en: "That is enough questions." },
    "low-value": { ja: "これ以上は野暮というものです。", en: "Any more would be tiresome." },
    exhausted: { ja: "お聞きすることは以上です。", en: "That is all I wanted to ask." },
  } satisfies Record<StopReason, L>,
  stopNote: { ja: "どうぞ棚をご覧ください。", en: "Please, have a look at the shelves." },

  resultsHead: { ja: "おすすめの品（適合度順）", en: "Recommended (by fit)" },
  browseBanner: {
    ja: (name: string) => `「${name}」のお困りごと向けの棚を表示しています。`,
    en: (name: string) => `Showing the shelf for "${name}" troubles.`,
  },
  browseClear: { ja: "[解除]", en: "[clear]" },
  dimNote: { ja: "店内は消灯中です。左の質問にお答えください。", en: "The lights are off. Please answer the question on the left." },
  named: { ja: "あなたが挙げたもの", en: "you named this" },
  suggested: { ja: "店主の提案", en: "suggested" },
  costLabel: { ja: "代償", en: "Cost" },
  fitLabel: { ja: "適合度", en: "Fit" },
  addToCart: { ja: "カートに入れる", en: "Add to cart" },
  inCart: { ja: "カートに入っています", en: "In your cart" },
  reqHead: { ja: "この品の要件", en: "Requirements" },
  readMore: { ja: "詳しく見る", en: "details" },

  coffinHead: { ja: "今夜の棺（Coffin Box）", en: "Tonight's Coffin Box" },
  coffinNote: { ja: "お客様が挙げなかった品から、店主のおすすめです。", en: "The shopkeeper's pick from what you did not name." },
  moversHead: { ja: "動きのあった品", en: "Movers & Shakers" },
  moversEmpty: { ja: "まだ動きはありません。", en: "No movement yet." },
  beliefHead: { ja: "いま推定している困りごと", en: "WHAT HURTS" },
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
      "atamagazon は、リポジトリ名の atama-ga-amata（頭が数多）をもじった名前です。人も AI も、同じ目標に別々の絵を描いています。この店は、その絵のずれを小さくするためにあります。",
      "人は、解決策を頼みますが、本当に持っているのは困りごとです。200年前のおばあさんは、洗濯機がほしいとは言わず、冬の水仕事で手が痛いと言いました。",
      "この店は、あなたが挙げた解決策を、必要を示す証拠の一つとして扱います。答えから必要を推定し、挙げなかった選択肢も見せます。",
      "実行時にLLMは使いません。質問は、期待情報利得をコストで割った値で選びます。ずれは、フィッシャー・ラオ距離で測ります。",
      "店主は、決まった規則で動くプログラムです。キーワードを拾って、定型の文に当てはめているだけで、内容を分かっているわけではありません。人は、単純な規則の返事にも、理解を読み取ってしまうことがあります（ELIZA効果）。",
      "「なぜ聞くの？」と「なぜそう思う？」は、1970年代の診断システム MYCIN（Stanford）の、WHY と HOW の説明機能にならったものです。MYCIN は確実さ係数を使いましたが、ここでは確率のかけ算なので、倍率の積が結果と一致します。コードは写していません。",
      "店主の作りは、1966年の ELIZA（Weizenbaum）のキーワードと定型文の仕組みと、確認してから実行するアシスタントの流れを参考にしました。コードは写していません。聞き返しの言い回しは、動機づけ面接の聞き方（Miller と Rollnick）を借りたもので、効果があると主張するものではありません。",
      "数値は、作者が設定した判断です。実測ではありません。詳しくは docs/assumptions.md を見てください。",
      "見た目は、2000年前後のオンライン書店への敬意です。実在の企業のロゴや商標は使っていません。",
    ],
    en: [
      "atamagazon is a pun on the repository name atama-ga-amata (\"many heads\"). People and AIs paint different pictures of the same goal. This store exists to shrink that gap.",
      "People ask for solutions but what they have is a trouble. A woman two centuries ago would not ask for a washing machine; she would say her hands ache in winter water.",
      "This store treats the solution you name as one piece of evidence about the need. It infers the need from your answers and shows options you did not name.",
      "No LLM runs at runtime. Questions are chosen by expected information gain per unit cost. The gap is measured with the Fisher-Rao distance.",
      "The shopkeeper is a rule-based program. It spots keywords and fills fixed sentences; it does not understand what you say. People tend to read understanding into even simple rule-based replies (the ELIZA effect).",
      "\"Why ask?\" and \"Why do you think so?\" follow the WHY and HOW explanation features of MYCIN, a 1970s diagnosis system from Stanford. MYCIN used certainty factors; here the numbers are probabilities, so the multipliers multiply exactly to the result. No code was copied.",
      "Its design borrows the keyword-and-template idea of ELIZA (Weizenbaum, 1966) and the confirm-before-acting flow of assistant frameworks. No code was copied. The phrasing of reflections borrows from motivational interviewing (Miller and Rollnick) and makes no claim of effect.",
      "The numbers are the author's judgment, not measurements. See docs/assumptions.md.",
      "The look is a nod to online bookstores around 2000. No real company's logo or trademark is used.",
    ],
  },
  source: { ja: "ソースコード", en: "Source code" },

  geometry: {
    head: { ja: "距離の図", en: "GEOMETRY" },
    startStated: { ja: "挙げた品の想定", en: "your named idea" },
    startUniform: { ja: "何も知らない状態", en: "knowing nothing" },
    now: { ja: "いま", en: "now" },
    limit: { ja: "全く重ならない", en: "no overlap" },
    aria: { ja: "二つの考えの距離を、球面上の弧で表した図", en: "Distance between two beliefs drawn as an arc on a sphere" },
    distance: {
      ja: (d: number) => `距離 d = ${d.toFixed(2)}（最大 ${Math.PI.toFixed(2)}）`,
      en: (d: number) => `distance d = ${d.toFixed(2)} (max ${Math.PI.toFixed(2)})`,
    },
    midpoint: {
      ja: (need: string, p: string) => `弧の中間点で有力なのは「${need}」${p}`,
      en: (need: string, p: string) => `At the midpoint of the arc, "${need}" leads at ${p}`,
    },
    path: {
      ja: (len: number, line: number, eff: string) => `ここまでの歩き ${len.toFixed(2)} / まっすぐなら ${line.toFixed(2)}（効率 ${eff}）`,
      en: (len: number, line: number, eff: string) => `Path so far ${len.toFixed(2)} / straight line ${line.toFixed(2)} (efficiency ${eff})`,
    },
    still: { ja: "まだ動いていません。", en: "No movement yet." },
    noteLink: { ja: "この図について", en: "About this figure" },
    note: {
      ja: "弧の角度は、距離のちょうど半分です。二つの点は、球面の中心を通る一つの平面に必ず乗るので、この図はゆがみのない絵です。",
      en: "The arc angle is exactly half the distance. Two points on a sphere always share a plane through its center, so this picture is undistorted.",
    },
  },

  limits: {
    link: { ja: "この数字はどこまで？", en: "How far to trust these numbers?" },
    head: { ja: "数学の限界：ここから先は、数学ではありません", en: "Where the math stops" },
    intro: {
      ja: "この店は、人の意図に数学を持ち込んでいます。その分、どこまでが計算で、どこからが私の判断かを、言っておきます。",
      en: "This store pushes mathematics into human intent. So it says what is computed and what is the author's judgment.",
    },
    computedHead: { ja: "計算で出たもの（モデルに対して正確）", en: "Computed (exact for the model)" },
    computed: {
      ja: [
        "答えを聞いたあとの確率（ベイズ更新）",
        "質問の価値（期待情報利得）と、答えごとの見込み",
        "二つの考えのずれ（フィッシャー・ラオ距離）と、その最短の弧",
        "根拠ごとの倍率（かけると結果に一致）",
      ],
      en: [
        "Probabilities after each answer (Bayes update)",
        "Value of a question (expected information gain) and the odds of each answer",
        "The gap between two beliefs (Fisher-Rao distance) and its shortest arc",
        "Evidence multipliers (their product equals the result)",
      ],
    },
    authoredHead: { ja: "作者が手で決めたもの（実測ではありません）", en: "Set by hand by the author (not measured)" },
    authored: {
      ja: (n: { questionStrengths: number; solutionFits: number; keywordWeights: number; solutionAliases: number; total: number }, sigma: number, unknown: number, mention: number, lapse: number) =>
        `質問ごとの強さ ${n.questionStrengths} 個、解決策の適合度 ${n.solutionFits} 個、キーワードの重み ${n.keywordWeights} 個、解決策を指す言葉 ${n.solutionAliases} 個、モデルの定数 4 個（雑音 σ=${sigma}、「分からない」率 ${unknown}、解決策への固執 ${mention}、迷い（でたらめ）の率 ${lapse}）。合計 ${n.total} 個。`,
      en: (n: { questionStrengths: number; solutionFits: number; keywordWeights: number; solutionAliases: number; total: number }, sigma: number, unknown: number, mention: number, lapse: number) =>
        `${n.questionStrengths} question strengths, ${n.solutionFits} solution fits, ${n.keywordWeights} keyword weights, ${n.solutionAliases} solution words, and 4 model constants (noise sigma=${sigma}, "don't know" share ${unknown}, solution fixation ${mention}, lapse (random answers) ${lapse}). ${n.total} in total.`,
    },
    authoredTail: {
      ja: "ここが違えば、結果は変わります。結果の数字は、世界についての主張ではなく、このモデルの出力です。",
      en: "If any of these differ, the results change. The numbers are the model's output, not claims about the world.",
    },
    beyondHead: { ja: "数学では決まらないもの", en: "What mathematics cannot decide" },
    beyond: {
      ja: [
        "何を「困りごと」と呼ぶか",
        "本当に欲しいものは、聞かれるうちに変わりうること",
        "どの提案が、親切で、どの提案が押しつけか",
        "あなたの暮らしで、何がいちばん大事か",
      ],
      en: [
        "What counts as a \"trouble\"",
        "That what you want can change as you are asked",
        "Which suggestion is kind and which is pushy",
        "What matters most in your life",
      ],
    },
  },

  explain: {
    whyLink: { ja: "なぜ聞くの？", en: "Why ask?" },
    whyLeaders: { ja: "いま有力な困りごと（「はい」になりやすさ）", en: "Leading troubles now (how likely a \"yes\" is)" },
    whyOutcomes: { ja: "答えると、こうなります", en: "If you answer" },
    whyEffort: { ja: "情報利得", en: "Info gain" },
    whyCost: { ja: "手間", en: "effort" },
    howLink: { ja: "なぜそう思う？", en: "Why do you think so?" },
    howHead: {
      ja: (need: string) => `「${need}」と見ている根拠（かけ算の倍率）`,
      en: (need: string) => `Why "${need}" leads (odds multiplier)`,
    },
    howStated: { ja: (s: string) => `挙げた解決策「${s}」`, en: (s: string) => `Named solution "${s}"` },
    howNote: { ja: (s: string) => `あなたの言葉「${s}」`, en: (s: string) => `Your words "${s}"` },
    howNone: { ja: "まだ根拠がありません。", en: "No evidence yet." },
  },

  agent: {
    title: { ja: "店主.exe", en: "Shopkeeper.exe" },
    placeholder: { ja: "お困りごとを一言で", en: "Your trouble, in a sentence" },
    send: { ja: "送る", en: "Send" },
    chipsLabel: { ja: "たとえば：", en: "For example:" },
    yes: { ja: "はい、入れます", en: "Yes, add it" },
    no: { ja: "やめておく", en: "Never mind" },
    voice: { ja: "声で読み上げる（この端末内の音声のみ）", en: "Read aloud (on-device voice only)" },
    notesHead: { ja: "あなたの言葉", en: "YOUR WORDS" },
  },
  pack: {
    choose: { ja: "棚を選ぶ", en: "Choose a shelf" },
    done: { ja: "済み", en: "in place" },
    next: { ja: "次の一手", en: "next move" },
    blocked: {
      ja: (first: string) => `先に「${first}」を`,
      en: (first: string) => `first: "${first}"`,
    },
    sourceLabel: { ja: "出所", en: "Source" },
    selfSide: {
      ja: "この詰まりは、自分の手で確かめられる種類です。下の手を、一つ試してみてください。",
      en: "This kind of stall can be checked with your own hands. Try one of the moves below.",
    },
  },

  start: { ja: "スタート", en: "Start" },
} as const;




