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
  guess: {
    head: { ja: "いまのお困りごとは、これに近いでしょうか？", en: "Does this sound like where you are stuck?" },
    headSecond: { ja: "では、こちらはいかがでしょう？", en: "Then perhaps this one?" },
    fits: { ja: "はい、近いです", en: "Yes, that fits" },
    notQuite: { ja: "ちょっと違う", en: "Not quite" },
    cantTell: { ja: "判断できない", en: "Can't tell" },
    pickHead: { ja: "では、いちばん近いのはどれでしょう？", en: "Then which is closest?" },
    none: { ja: "どれも違う", en: "None of these" },
    thanks: {
      ja: "ありがとうございます。この回の結果は、このタブの中だけに残ります。",
      en: "Thank you. This round stays in this tab only.",
    },
    tally: {
      ja: (n: number, right: number, wrong: number, unsure: number) =>
        `今回の来店で ${n} 回: 近い ${right} / 違う ${wrong} / 判断できない ${unsure}`,
      en: (n: number, right: number, wrong: number, unsure: number) =>
        `${n} round(s) this visit: fits ${right} / not ${wrong} / can't tell ${unsure}`,
    },
    interval: {
      ja: (lo: number, hi: number) => `近い割合の95%区間（Wilson）: ${lo}% から ${hi}%`,
      en: (lo: number, hi: number) => `95% interval for the share that fit (Wilson): ${lo}% to ${hi}%`,
    },
    calibration: {
      ja: (mean: number, rate: number) => `最初の推測につけた確率の平均は約 ${mean}%、近いと答えた割合は ${rate}%`,
      en: (mean: number, rate: number) => `My first guesses averaged about ${mean}%. You said ${rate}% fit.`,
    },
    caution: {
      ja: "回数が少ないうちは、ほとんど何も言えません。「近い」は、あなたの実感であって、原因だと確かめたわけではありません。",
      en: "With few rounds this says very little. 'Fits' means it felt right to you, not that it was the cause.",
    },
    noneBanner: {
      ja: "どの詰まりにも合わなかったので、下の棚は弱い当て推量です。出発点として見てください。",
      en: "None of my stalls fit, so the shelf below is a weak guess. Treat it as a starting point.",
    },
    copy: { ja: "結果をJSONでコピー", en: "Copy results as JSON" },
    copied: { ja: "コピーしました。どこにも送られていません。", en: "Copied. Nothing was sent anywhere." },
  },

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
      "言語モデルを使うのは2か所だけで、どちらもアリジゴク画面です。1つは、店主に打った文から、2つの印の案を出します。案は、あなたが「はい」と言うまで何にも使いません。もう1つは、詰まったときに、違う方向の案を5つ出します。案は、決まった規則で形を確かめますが、中身の正しさは確かめません。確かめ方は、各案に付けた、10分ほどで試せる方法です。判定の数字、出口の手の順番、質問の選び方は、どちらにも左右されず、決まった式で計算します。質問は、期待情報利得をコストで割った値で選びます。",
      "店主の返事は、決まった規則と定型の文でできています。アリジゴク画面で打った文だけは、言語モデルが印の案を出し、その案を定型の文で読み返します。どちらも、内容を分かっているわけではありません。人は、こうした返事にも、理解を読み取ってしまうことがあります（ELIZA効果）。",
      "「なぜ聞くの？」と「なぜそう思う？」は、1970年代の診断システム MYCIN（Stanford）の、WHY と HOW の説明機能にならったものです。MYCIN は確実さ係数を使いましたが、ここでは確率のかけ算なので、倍率の積が結果と一致します。コードは写していません。",
      "店主の作りは、1966年の ELIZA（Weizenbaum）のキーワードと定型文の仕組みと、確認してから実行するアシスタントの流れを参考にしました。コードは写していません。聞き返しの言い回しは、動機づけ面接の聞き方（Miller と Rollnick）を借りたもので、効果があると主張するものではありません。",
      "数値は、作者が設定した判断です。実測ではありません。詳しくは docs/assumptions.md を見てください。",
      "見た目は、2000年前後のオンライン書店への敬意です。実在の企業のロゴや商標は使っていません。",
    ],
    en: [
      "atamagazon is a pun on the repository name atama-ga-amata (\"many heads\"). People and AIs paint different pictures of the same goal. This store exists to shrink that gap.",
      "People ask for solutions but what they have is a trouble. A woman two centuries ago would not ask for a washing machine; she would say her hands ache in winter water.",
      "This store treats the solution you name as one piece of evidence about the need. It infers the need from your answers and shows options you did not name.",
      "A language model is used in two places only, both on the pit screen. One proposes two marks from a sentence you type to the shopkeeper, and the proposal is used for nothing until you say Yes. The other proposes five ideas in different directions when you are stuck. Fixed rules check the shape of the ideas, but not whether they are right. What tells you that is the ten-minute test attached to each idea. The pit numbers, the order of the exit moves and the choice of questions are computed by fixed formulas, and neither use of the model can change them. Questions are chosen by expected information gain per unit cost.",
      "The shopkeeper's replies are made of fixed rules and fixed sentences. Only for a sentence typed on the pit screen, a language model proposes the marks, and the proposal is read back in a fixed sentence. Neither understands what you say. People tend to read understanding into replies like these (the ELIZA effect).",
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
  check: {
    tab: { ja: "確かめる", en: "CHECK" },
    head: { ja: "仕組みの確かめ", en: "A check of how things work" },
    intro: {
      ja: "各問は、5つの文のうち誤っているものを1つ選ぶ形です。「分からない」も選べて、途中でやめられます。点数は付けません。答えのあとに、理由と出所を見せます。難しさは、作者が手で決めたもので、測った値ではありません。",
      en: "Each question has five statements, and you pick the one that is wrong. You can also pick \"I don't know\", and you can stop at any point. There is no score. After each answer, the reason and the source are shown. The difficulty levels were set by hand, not measured.",
    },
    start: { ja: "始める", en: "Start" },
    unknown: { ja: "分からない", en: "I don't know" },
    next: { ja: "次へ", en: "Next" },
    finish: { ja: "結果を見る", en: "See the result" },
    stop: { ja: "ここでやめる", en: "Stop here" },
    restart: { ja: "もう一度", en: "Again" },
    wrongWas: { ja: "誤っていたのは", en: "The wrong statement was" },
    yourPick: { ja: "あなたの選択", en: "Your pick" },
    pickedRight: { ja: "同じ文を選びました。", en: "You picked the same statement." },
    pickedOther: { ja: "別の文を選びました。", en: "You picked a different statement." },
    pickedUnknown: { ja: "「分からない」を選びました。", en: "You picked \"I don't know\"." },
    why: { ja: "理由", en: "Why" },
    source: { ja: "出所", en: "Source" },
    premise: { ja: "この問いの前提は、問いの中に書いてあります。", en: "The premise of this question is stated in the question." },
    progress: { ja: (n: number) => `${n}問目`, en: (n: number) => `Question ${n}` },
    resultHead: { ja: "結果", en: "Result" },
    resultNote: {
      ja: "点数ではなく、分野ごとの目安です。2問だけの結果なので、確かな判定ではありません。",
      en: "This is a guide for each area, not a score. It rests on two questions per area, so it is not a firm judgement.",
    },
    status: {
      notAsked: { ja: "出していません", en: "not asked" },
      unclear: { ja: "1問だけなので、まだ分かりません", en: "only one question, so unclear" },
      inPlace: { ja: "身についていそうです", en: "looks in place" },
      partial: { ja: "一部は身についていそうです", en: "partly in place" },
      gap: { ja: "先に読むと近道かもしれません", en: "worth reading first" },
    },
    topics: {
      docker: { ja: "Docker", en: "Docker" },
      mcp: { ja: "MCP", en: "MCP" },
      git: { ja: "Git", en: "Git" },
      http: { ja: "HTTP", en: "HTTP" },
      ai: { ja: "AI の返事の誤りを見つける", en: "Spotting mistakes in an AI's reply" },
      code: { ja: "コードを読む（JavaScript）", en: "Reading code (JavaScript)" },
      test: { ja: "テストを読む", en: "Reading tests" },
    },
    readFirst: { ja: "先に読むとよいかもしれないもの", en: "Worth reading first" },
    readFirstPit: {
      ja: "確かめの結果から、先に読むと近道かもしれないもの:",
      en: "From the check, these may be worth reading first:",
    },
  },
  level: {
    pick: { ja: "いちばん近いもの:", en: "Pick the closest:" },
    choices: {
      ja: [
        "ほとんど読まずに貼っている",
        "読むが、動かないと AI にそのまま聞き直す",
        "エラーやログを読んで、原因を自分でも考える",
        "仕様やテストで確かめてから採用する",
      ],
      en: [
        "I paste it without reading much",
        "I read it, but if it fails I just ask the AI again",
        "I read the errors and logs and think about the cause myself",
        "I check it against a spec or tests before I use it",
      ],
    },
    replies: {
      ja: [
        "「ほとんど読まずに貼っている」ということだね。その場合、AI の返事の誤りは見つけにくく、同じ修正のくり返しにつながりやすいかもしれない。先に短い確かめ（分野ごとに2問まで、やめたいときにやめられる）を見る？ それとも、試したことを一文で教えてくれる？",
        "「読むが、動かないと AI にそのまま聞き直す」ということだね。同じ聞き直しが続いているなら、そこが、くり返しの入口かもしれない。先に短い確かめを見る？ それとも、試したことを一文で教えてくれる？",
        "「エラーやログを読んで、原因を自分でも考える」ということだね。じゃあ、試したことを一文で教えてくれる？ 下の例のように、結果も添えてもらえると助かる。",
        "「仕様やテストで確かめてから採用する」ということだね。じゃあ、試したことを一文で教えてくれる？ 下の例のように、結果も添えてもらえると助かる。",
      ],
      en: [
        "So you paste it without reading much. If so, an AI's mistakes are hard to spot, and that may be part of why the same fix keeps coming back. Want a short check first (up to two questions per area, and you can stop whenever you like), or tell me one thing you tried?",
        "So you read it, but when it fails you ask the AI again as it is. If the same question keeps going back, that may be where the loop starts. Want a short check first, or tell me one thing you tried?",
        "So you read the errors and logs and think about the cause yourself. Then tell me one thing you tried, in one sentence. The examples below show the shape, with the result added.",
        "So you check it against a spec or tests before you use it. Then tell me one thing you tried, in one sentence. The examples below show the shape, with the result added.",
      ],
    },
    yes: { ja: "確かめを見る", en: "See the check" },
    no: { ja: "試したことを書く", en: "I'll describe a try" },
    afterNo: {
      ja: "じゃあ、試したことを一文で教えてくれる？ 下の例のように、結果も添えてもらえると助かる。",
      en: "Then tell me one thing you tried, in one sentence. The examples below show the shape, with the result added.",
    },
  },
  ideas: {
    button: { ja: "案を出してもらう", en: "Get ideas" },
    head: { ja: "違う方向の案を5つ", en: "Five ideas in different directions" },
    prompt: {
      ja: "いま何で詰まっているか、1〜2文で教えてもらえますか（400字まで）。",
      en: "In one or two sentences, what is stuck? (up to 400 characters)",
    },
    placeholder: {
      ja: "例: ビルドが、モジュールが見つからないエラーで失敗する。AI に入れ直しを3回頼んだが、同じ結果だった。",
      en: "Example: The build fails with a missing module error. I asked the AI to reinstall it three times and got the same result.",
    },
    go: { ja: "5つ出す", en: "Get five" },
    working: { ja: "考えています。10秒ほどかかります…", en: "Thinking. This takes about ten seconds…" },
    notice: {
      ja: "言語モデルが、あなたの書いた文から案を出します。この文は、案を作るために Cloudflare の AI に送られ、保存されません。案は、試していない考えで、事実ではありません。各案の「確かめ方」が、当たりかどうかを見分ける方法です。",
      en: "A language model writes these ideas from what you typed. The sentence is sent to Cloudflare's AI to make the ideas, and nothing is stored. They are untested ideas, not facts. The quick test under each one is how you find out.",
    },
    quickTest: { ja: "10分ほどで確かめる方法", en: "A quick way to find out" },
    kind: {
      sourced: { ja: "出所のある手", en: "A move with a source" },
      "rule-of-thumb": { ja: "経験則の手（出所なし）", en: "A rule of thumb (no source)" },
      other: { ja: "モデルの案（出所なし）", en: "The model's own idea (no source)" },
    },
    tried: { ja: "試したが、うまくいかなかった", en: "I tried this and it did not work" },
    failed: {
      unreachable: {
        ja: "いまは案を出せませんでした。下の出所のある手は、そのまま使えます。",
        en: "Ideas are not available right now. The moves with sources below still work.",
      },
      timeout: {
        ja: "案に時間がかかりすぎました。下の出所のある手は、そのまま使えます。",
        en: "The ideas took too long. The moves with sources below still work.",
      },
      limit: {
        ja: "案の利用が上限に達しました。少し待つと、また使えます。下の出所のある手は、そのまま使えます。",
        en: "The ideas have reached their limit for now, and they work again after a minute. The moves with sources below still work.",
      },
      invalid: {
        ja: "案が、決まりに合う形で返りませんでした。もう一度試せます。下の出所のある手は、そのまま使えます。",
        en: "The ideas did not come back in an acceptable form. You can try again. The moves with sources below still work.",
      },
    },
  },
  entry: {
    headline: {
      ja: "AI とのやり取りが、同じところで止まっていませんか？",
      en: "Stuck in the same spot with an AI?",
    },
    what: {
      ja: "試したことを1つずつ足すと、「同じやり方をもう一度試す」のと「やり方を変える」のと、どちらの見込みが高いかを、数字で見せます。",
      en: "Add what you tried, one at a time. The site shows which has the better chance: one more try of the same approach, or a change of approach.",
    },
    stepsHead: { ja: "使い方は3つです", en: "Three steps" },
    step1: { ja: "うまくいかなかった試みを、1つずつ足します。", en: "You add each try that did not work, one at a time." },
    step2: {
      ja: "「同じやり方」と「別のやり方」の見込みが、並んで出ます。",
      en: "Two chances appear side by side: the same approach, and a fresh one.",
    },
    step3: {
      ja: "別のやり方のほうが高ければ、出所のある手を最大3つ出します。選ぶのはあなたです。",
      en: "If a fresh approach looks better, up to three exit moves with sources are offered. You choose.",
    },
    exampleHead: { ja: "たとえば", en: "For example" },
    example: {
      ja: "AI に同じ修正を3回頼んで、3回とも失敗した。→ 下のボタンを3回押すと、3回分の試みが並びます。",
      en: "You asked an AI for the same fix three times, and it failed three times. → Pressing the button below three times lists three tries.",
    },
    shopkeeper: {
      ja: "右の店主に、試したことを文で打つこともできます。言語モデルが印の案を出し、あなたが「はい」と言うまで、何も足しません。",
      en: "You can also type what you tried to the shopkeeper on the right. A language model proposes the marks, and nothing is added until you say Yes.",
    },
  },
  reader: {
    notice: {
      ja: "右の店主に打った文は、言語モデルが、どの印が当てはまるかの案を出します。試みの印を取り違えることがあるので、あなたが確かめるまで、何も足しません。",
      en: "A language model reads the sentence you type to the shopkeeper and proposes which marks apply. It may mix up the marks of a try, so nothing is added until you confirm.",
    },
    reading: { ja: "読み取っています…", en: "Reading…" },
    nothing: {
      ja: "この文からは、読み取れることがありませんでした。画面の印で、試みを足せます。",
      en: "Nothing could be read from that sentence. You can add a try with the marks on the screen.",
    },
    added: {
      ja: "リストに足しました。読み取れなかった印は、外してあります。必要なら、画面で付けられます。",
      en: "Added to your list. A mark I could not tell is left unchecked, and you can set it on the screen.",
    },
    declined: { ja: "足しませんでした。", en: "Not added." },
    failed: {
      unreachable: {
        ja: "いまは読み取りを使えませんでした。画面の印で、試みを足せます。",
        en: "The reader is not available right now. You can add a try with the marks on the screen.",
      },
      timeout: {
        ja: "読み取りに時間がかかりすぎました。画面の印で、試みを足せます。",
        en: "The reader took too long. You can add a try with the marks on the screen.",
      },
      limit: {
        ja: "読み取りの利用が上限に達しました。画面の印で、試みを足せます。",
        en: "The reader has reached its limit for now. You can add a try with the marks on the screen.",
      },
      invalid: {
        ja: "うまく読み取れませんでした。画面の印で、試みを足せます。",
        en: "The reading did not come out right. You can add a try with the marks on the screen.",
      },
    },
  },
  pit: {
    shopHello: {
      ja: "やあ。まず聞くよ。AI が出したコードを、どのくらい自分で読んで直してる？下から、いちばん近いものを選んでね。",
      en: "Hey. First question. How much of the code an AI gives you do you actually read and fix yourself? Pick the closest one below.",
    },
    examples: {
      ja: [
        "同じ修正をもう一度試したが、同じエラーが出た",
        "修正をやめて、最小の再現例を書いた",
        "AI に聞かずに公式ドキュメントを見たら、オプション名が変わっていた",
        "AI と新しい会話を始めて、目的を最初から説明し直した",
      ],
      en: [
        "I ran the same fix again and got the same error",
        "I stopped patching and wrote a minimal reproduction",
        "I checked the official docs instead of asking the AI, and found the option was renamed",
        "I started a fresh conversation with the AI and described the goal from scratch",
      ],
    },
    tab: { ja: "アリジゴク", en: "THE PIT" },
    head: { ja: "同じやり方が続いていないか、一緒に見ます", en: "Let's look at whether one approach keeps repeating" },
    intro: {
      ja: "試したことを順に並べると、同じやり方をもう一度試す見込みと、別のやり方の見込みを並べて出します。人を責める判定ではありません。",
      en: "List what you tried in order. The shop shows the chance of one more try of the same approach next to the chance of a fresh one. It judges the approach, not you.",
    },
    add: { ja: "うまくいかなかった試みを足す", en: "Add a try that did not work" },
    newApproach: { ja: "前とは違うやり方だった", en: "A different approach from the one before" },
    newFact: {
      ja: "新しい事実がわかった（ログの行、測った値、再現）",
      en: "A new fact turned up (a log line, a measured value, a reproduction)",
    },
    tryN: { ja: (n: number) => `${n}回目`, en: (n: number) => `Try ${n}` },
    empty: { ja: "まだ試みがありません。上のボタンで一つ足すと、見込みを出します。", en: "No tries yet. Add one with the button above and the shop shows the chances." },
    run: {
      ja: (k: number) => `いまのやり方での連続した失敗: ${k}回（違うやり方に変えると数え直します）`,
      en: (k: number) => `Failures in a row with the current approach: ${k} (a different approach resets the count)`,
    },
    pNext: { ja: "同じやり方で、次がうまくいく見込み", en: "Chance the next try of the same approach works" },
    pSwitch: { ja: "別のやり方で、うまくいく見込み", en: "Chance a fresh approach works" },
    handSet: {
      ja: "この2つの数字は手で決めた値で、測った値ではありません。何回で切り替えるという決まりも示しません。",
      en: "Both numbers are set by hand, not measured. This does not give a rule of the form 'switch after N tries'.",
    },
    persist: {
      ja: "いまは、同じやり方のほうが見込みが高い。続けてよい。ただし、同じやり方は、失敗するたびに見込みが下がる。次に失敗したら、この数字をもう一度見る。",
      en: "For now the same approach still looks the better bet than a fresh one. Continuing is an option.",
    },
    switch: {
      ja: "このやり方は、もうダメだ。同じことをもう一度やるより、別のやり方のほうが、見込みが高い。ここで切り替える。",
      en: "This approach is dead. A fresh approach now has the higher chance than one more try of the same. Switch here.",
    },
    exitsHead: { ja: "抜け出しの手（出所のあるものだけ）", en: "Exit moves (only those that name a source)" },
    rankNote: {
      ja: "順番は、お店の質問への答えで変わります。答えるほど、いまの詰まりに近い手が上に来ます。",
      en: "The order changes with your answers in the shop. The more you answer, the closer the top moves sit to your stall.",
    },
    answerMore: { ja: "お店の質問に答える", en: "Answer the shop's questions" },
    noSourced: {
      ja: "出所のある手で、いまの答えに合うものは見つかりませんでした。",
      en: "No move that names a source fits the answers so far.",
    },
    roughHead: { ja: "経験則の手（出所なし）", en: "Rules of thumb (no source)" },
    roughNote: { ja: "試されたデータはありません。参考として並べます。", en: "No tested data. Listed for reference only." },
    tried: { ja: "試したが、うまくいかなかった", en: "I tried it and it did not work" },
    triedNote: {
      ja: "新しい試みとして足し、見込みを出し直します。",
      en: "Adds a new try and recomputes the chances.",
    },
  },
  sheet: {
    head: { ja: "仕様書き（理論とデータ）", en: "Spec sheet (theory and data)" },
    theory: { ja: "理論", en: "Theory" },
    evidence: { ja: "データ", en: "Data" },
    unfitWhen: { ja: "合わないとき", en: "May not fit when" },
    none: {
      ja: "この手について、記録した理論やデータはありません。",
      en: "No theory or data is recorded for this move.",
    },
    levels: {
      none: { ja: "データなし", en: "no data" },
      "problem-studied": { ja: "問題は研究されている", en: "the problem is studied" },
      "method-published": { ja: "手法が公表されている", en: "the method is published" },
    },
    caveat: {
      ja: "出所は手法の由来を示すだけで、この場面で効くとは示しません。",
      en: "A source says where a method comes from. It does not show the method works here.",
    },
  },
  plan: {
    head: { ja: "抜け出しの計画", en: "Exit plan" },
    tab: { ja: "計画", en: "PLAN" },
    otherShelves: {
      ja: "ほかの棚（以前の診断と、日常の悩みの棚）",
      en: "Other shelves (the earlier diagnosis, and the everyday shelf)",
    },
    add: { ja: "計画に入れる", en: "Add to plan" },
    inPlan: { ja: "計画に入っています", en: "In plan" },
    empty: { ja: "計画はまだ空です。手を選ぶと、順番と前提を確認します。", en: "The plan is empty. Pick moves and the shop checks order and prerequisites." },
    order: { ja: "進める順", en: "Order" },
    steps: { ja: "手順の数", en: "Steps" },
    missing: { ja: "先に必要かもしれない手", en: "Moves that may be needed first" },
    addMissing: { ja: "追加", en: "Add" },
    evidence: { ja: "データの内訳", en: "Evidence" },
    allNoData: {
      ja: "選んだ手は、どれも記録したデータがありません。経験則として、試せる範囲で試せます。",
      en: "None of the chosen moves has recorded data. They are rules of thumb, to try as far as you like.",
    },
    back: {
      ja: "試したあと、結果を持って戻ってこられます。新しい試みとして数え直します。",
      en: "After trying, you can come back with the result. It counts as a new attempt.",
    },
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




