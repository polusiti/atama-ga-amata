/**
 * Hand-written keyword lexicon (ELIZA-style keywords with a rank).
 * Weight 2 = strong signal, weight 1 = weak signal. Words are normalized when matched,
 * so write them naturally (katakana, kanji, English). English entries are stems.
 * These are authored judgments; coverage is small on purpose.
 */
export type Weighted = readonly [word: string, weight: 1 | 2];

export const needWords: Record<string, readonly Weighted[]> = {
  "spend-blind": [
    ["お金", 2], ["おかね", 2], ["家計", 2], ["出費", 2], ["使いすぎ", 2], ["散財", 2], ["月末", 2], ["残高", 1], ["給料", 1], ["貯金", 1], ["支出", 2],
    ["money", 2], ["spend", 2], ["budget", 2], ["broke", 2], ["salary", 1], ["expens", 2], ["savings", 1],
  ],
  "forget-deadline": [
    ["忘れ", 2], ["期限", 2], ["締め切り", 2], ["締切", 2], ["約束", 1], ["遅刻", 1], ["うっかり", 2], ["リマインド", 1], ["予定", 1],
    ["deadline", 2], ["forgot", 2], ["forget", 2], ["remind", 1], ["appointment", 1], ["late", 1],
  ],
  "no-progress": [
    ["成果", 2], ["進んでいる", 2], ["進捗", 2], ["実感", 2], ["上達", 2], ["伸びない", 2], ["成長", 1], ["効果", 1], ["結果が出", 2], ["勉強", 1],
    ["progress", 2], ["improv", 2], ["results", 1], ["plateau", 2], ["stuck", 1], ["studying", 1],
  ],
  "info-scatter": [
    ["探し", 2], ["見つからない", 2], ["どこに", 1], ["散らば", 2], ["整理", 2], ["ファイル", 1], ["メモ", 1], ["保存", 1], ["資料", 1],
    ["can't find", 2], ["cantfind", 2], ["find", 1], ["scatter", 2], ["organiz", 2], ["lost", 1], ["notes", 1], ["files", 1],
  ],
  "slow-unknown": [
    ["遅い", 2], ["重い", 2], ["もっさり", 2], ["パフォーマンス", 2], ["ラグ", 2], ["待たされ", 2], ["表示が", 1], ["レスポンス", 1],
    ["slow", 2], ["lag", 2], ["performance", 2], ["heavy", 1], ["latency", 2], ["speed", 1],
  ],
  "team-misalign": [
    ["認識", 2], ["食い違", 2], ["言った", 1], ["手戻り", 2], ["やり直し", 1], ["伝わらない", 2], ["誤解", 2], ["チーム", 1], ["仕様", 1], ["連携", 1], ["思っていたのと違う", 2],
    ["misunderstand", 2], ["miscommunic", 2], ["rework", 2], ["same page", 2], ["team", 1], ["requirement", 1], ["misalign", 2],
  ],
  "habit-drop": [
    ["続かない", 2], ["三日坊主", 2], ["習慣", 2], ["やめて", 1], ["挫折", 2], ["サボ", 1], ["モチベ", 2], ["途中で", 1],
    ["habit", 2], ["quit", 1], ["give up", 2], ["motivation", 2], ["procrastin", 2], ["consisten", 1],
  ],
  "manual-chore": [
    ["手作業", 2], ["毎週", 2], ["毎日", 1], ["繰り返し", 2], ["同じ作業", 2], ["面倒", 1], ["手間", 1], ["コピペ", 2], ["いちいち", 1],
    ["manual", 2], ["repetitive", 2], ["every week", 2], ["tedious", 2], ["copy and paste", 2], ["chore", 2], ["by hand", 2],
  ],
};

/** Words that name a solution. Used only together with a "want to build" marker. */
export const solutionAliases: Record<string, readonly string[]> = {
  "expense-ledger": ["家計簿", "ledger", "expensetracker"],
  "pace-alert": ["ペース通知", "使いすぎ通知", "spendingalert"],
  "deadline-reminder": ["リマインダー", "リマインド", "reminder"],
  "weekly-review": ["振り返り", "週次レポート", "weeklyreview"],
  "streak-tracker": ["トラッカー", "連続記録", "streak", "habittracker"],
  "unified-search": ["横断検索", "全文検索", "検索", "search"],
  "measure-first": ["プロファイラ", "計測", "profil", "measure"],
  "add-cache": ["キャッシュ", "cache"],
  "shared-spec": ["仕様書", "テンプレ", "template", "spec"],
  "task-automation": ["自動化", "スクリプト", "automat", "script"],
};

/** Phrases that signal "I want to build / add X". */
export const wantMarkers: readonly string[] = [
  "作りたい", "作って", "ほしい", "欲しい", "入れたい", "つけたい", "付けたい", "追加したい", "導入したい", "作ろう", "したい",
  "iwant", "iwould like", "build", "addan", "adda", "need a", "make a", "make an", "wouldlike",
];

/** Sample sentences used for coverage tests and as clickable chips. */
export const samples: { needId: string; ja: string; en: string }[] = [
  { needId: "spend-blind", ja: "月末になるとお金がいつの間にかなくなっている", en: "Money is gone by the end of the month and I don't know where" },
  { needId: "forget-deadline", ja: "締め切りをうっかり忘れてしまう", en: "I keep forgetting deadlines" },
  { needId: "no-progress", ja: "勉強しているのに成果が出ている実感がない", en: "I study but feel no progress" },
  { needId: "info-scatter", ja: "メモやファイルが散らばって見つからない", en: "My notes and files are scattered and I can't find them" },
  { needId: "slow-unknown", ja: "サイトが遅いと言われるけど原因が分からない", en: "People say my site is slow but I don't know why" },
  { needId: "team-misalign", ja: "チームで認識が食い違って手戻りが多い", en: "My team is misaligned and we redo a lot of work" },
  { needId: "habit-drop", ja: "何を始めても三日坊主で続かない", en: "I quit every habit after a few days" },
  { needId: "manual-chore", ja: "毎週同じ作業を手作業で繰り返している", en: "I repeat the same task by hand every week" },
];

