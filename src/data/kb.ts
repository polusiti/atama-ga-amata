import type { KnowledgeBase } from "@/core/types";

/**
 * First shelf of the midnight department store.
 * Needs are situations that hurt. Solutions are things that could be built.
 * Numbers are authored judgments, not measured data. See docs on assumptions.
 */
export const kb: KnowledgeBase = {
  needs: [
    {
      id: "spend-blind",
      title: { ja: "お金がいつの間にか消える", en: "Money disappears and I can't see where" },
      gloss: { ja: "使った額と行き先が見えていない", en: "Spending is invisible until it is too late" },
    },
    {
      id: "forget-deadline",
      title: { ja: "期限や約束を忘れる", en: "I forget deadlines and promises" },
      gloss: { ja: "覚えておく負担が頭に乗っている", en: "Remembering is a load carried in my head" },
    },
    {
      id: "no-progress",
      title: { ja: "進んでいる実感がない", en: "I can't feel any progress" },
      gloss: { ja: "努力と成果のつながりが見えない", en: "Effort and results are not connected in view" },
    },
    {
      id: "info-scatter",
      title: { ja: "情報が散らばって探せない", en: "Information is scattered and unfindable" },
      gloss: { ja: "どこに置いたか分からなくなる", en: "I lose track of where things are" },
    },
    {
      id: "slow-unknown",
      title: { ja: "遅いと言われるが原因が不明", en: "It's called slow but nobody knows why" },
      gloss: { ja: "原因を測らずに対処している", en: "Fixes are applied without measuring the cause" },
    },
    {
      id: "team-misalign",
      title: { ja: "認識がそろわず手戻りが多い", en: "We are not on the same page, so we redo work" },
      gloss: { ja: "「思っていたのと違う」が起きる", en: "\"That's not what I meant\" keeps happening" },
    },
    {
      id: "habit-drop",
      title: { ja: "始めても続かない", en: "I start things and drop them" },
      gloss: { ja: "続ける仕組みがない", en: "Nothing keeps the habit alive" },
    },
    {
      id: "manual-chore",
      title: { ja: "同じ手作業に時間を取られる", en: "Same manual chore eats my time" },
      gloss: { ja: "毎回同じ手順を人がやっている", en: "A person repeats the same steps every time" },
    },
  ],

  questions: [
    {
      id: "q-recall-money",
      text: {
        ja: "最近、何にいくら使ったか思い出せなくて困ったことがある？",
        en: "Recently, was there a time you couldn't recall what you spent money on?",
      },
      cost: 1,
      base: 0.15,
      yes: { "spend-blind": 0.95 },
    },
    {
      id: "q-forgot",
      text: {
        ja: "この1か月で、締め切りや約束を忘れて困ったことがある？",
        en: "In the past month, did you forget a deadline or promise and regret it?",
      },
      cost: 1,
      base: 0.15,
      yes: { "forget-deadline": 0.95, "manual-chore": 0.2, "no-progress": 0.3 },
    },
    {
      id: "q-effort",
      text: {
        ja: "頑張った量のわりに、成果が見えないと感じることが多い？",
        en: "Do you often feel your results don't show for the effort you put in?",
      },
      cost: 1,
      base: 0.15,
      yes: { "no-progress": 0.95, "habit-drop": 0.5 },
    },
    {
      id: "q-cant-find",
      text: {
        ja: "保存したはずのものが、どこにあるか分からなくなることがある？",
        en: "Do you sometimes lose track of where you saved something?",
      },
      cost: 1,
      base: 0.15,
      yes: { "info-scatter": 0.95, "team-misalign": 0.3 },
    },
    {
      id: "q-told-slow",
      text: {
        ja: "他の人から「遅い」「重い」と言われたことがある？",
        en: "Has someone told you that something of yours is slow or heavy?",
      },
      cost: 1,
      base: 0.1,
      yes: { "slow-unknown": 0.95 },
    },
    {
      id: "q-misread",
      text: {
        ja: "「言った・言わない」や「思っていたのと違う」が最近あった？",
        en: "Recently, did a \"said / didn't say\" or \"that's not what I meant\" happen?",
      },
      cost: 1,
      base: 0.15,
      yes: { "team-misalign": 0.95, "info-scatter": 0.35 },
    },
    {
      id: "q-quit",
      text: {
        ja: "始めたことを、数日〜数週間でやめてしまうことが多い？",
        en: "Do you often stop things you started within days or weeks?",
      },
      cost: 1,
      base: 0.15,
      yes: { "habit-drop": 0.95, "no-progress": 0.5, "manual-chore": 0.15 },
    },
    {
      id: "q-weekly",
      text: {
        ja: "毎週のように、同じ手順を手でくり返している作業がある？",
        en: "Is there a task you repeat by hand, with the same steps, almost every week?",
      },
      cost: 1,
      base: 0.15,
      yes: { "manual-chore": 0.95, "forget-deadline": 0.25 },
    },
    {
      id: "q-measured",
      text: {
        ja: "困っている原因を、実際に測ったり確かめたりしたことがある？",
        en: "Have you actually measured or verified the cause of the problem?",
      },
      cost: 1.2,
      base: 0.5,
      yes: { "slow-unknown": 0.1, "team-misalign": 0.3 },
    },
    {
      id: "q-many-people",
      text: {
        ja: "その困りごとには、あなた以外にも何人か関わっている？",
        en: "Does this problem involve other people besides you?",
      },
      cost: 1,
      base: 0.3,
      yes: {
        "team-misalign": 0.95,
        "info-scatter": 0.5,
        "slow-unknown": 0.6,
        "manual-chore": 0.4,
        "forget-deadline": 0.3,
        "habit-drop": 0.1,
        "no-progress": 0.1,
      },
    },
    {
      id: "q-charts",
      text: {
        ja: "数字やグラフで見えたら、安心しそう？",
        en: "Would seeing numbers or a chart make you feel better?",
      },
      cost: 1,
      base: 0.3,
      yes: { "spend-blind": 0.85, "no-progress": 0.85, "slow-unknown": 0.7, "habit-drop": 0.6 },
    },
    {
      id: "q-five-min",
      text: {
        ja: "毎日5分なら、記録や確認に使えそう？",
        en: "Could you spare five minutes a day to record or check something?",
      },
      cost: 1,
      base: 0.4,
      yes: { "habit-drop": 0.85, "no-progress": 0.6, "spend-blind": 0.6, "manual-chore": 0.2 },
    },
  ],

  solutions: [
    {
      id: "expense-ledger",
      title: { ja: "家計簿アプリ", en: "Expense ledger app" },
      pitch: {
        ja: "使った額を一つずつ記録して、あとから見返せます。",
        en: "Log each expense and review it later.",
      },
      cost: { ja: "毎回の入力が手間で、続かないことも", en: "Entry for every expense; many people stop" },
      fit: { "spend-blind": 0.75, "habit-drop": 0.15 },
      requirements: [
        {
          ja: "ユーザーが支出を入力したとき、システムは日付・金額・カテゴリを保存する。",
          en: "WHEN the user enters an expense, THE SYSTEM SHALL store date, amount and category.",
        },
        {
          ja: "ユーザーが月を選んだとき、システムはカテゴリ別の合計を表示する。",
          en: "WHEN the user selects a month, THE SYSTEM SHALL show totals per category.",
        },
      ],
    },
    {
      id: "pace-alert",
      title: { ja: "使いすぎペース通知", en: "Spending-pace alert" },
      pitch: {
        ja: "月のペースを超えそうな日に、一言だけ知らせます。入力は最小で済みます。",
        en: "A single nudge on days you are on track to overspend. Minimal input.",
      },
      cost: { ja: "予算の初期設定が必要", en: "Needs an initial budget" },
      fit: { "spend-blind": 0.9, "habit-drop": 0.4 },
      requirements: [
        {
          ja: "当月の支出が日割り予算を超える見込みのとき、システムは通知を1日1回までに制限して送る。",
          en: "WHEN projected spending exceeds the daily-prorated budget, THE SYSTEM SHALL send at most one notification per day.",
        },
        {
          ja: "ユーザーが通知を無効にしたとき、システムは以後の通知を止める。",
          en: "WHEN the user disables alerts, THE SYSTEM SHALL stop sending them.",
        },
      ],
    },
    {
      id: "deadline-reminder",
      title: { ja: "期限リマインダー", en: "Deadline reminder" },
      pitch: {
        ja: "期限の前に、決めたタイミングで知らせます。覚える役目を手放せます。",
        en: "Reminds you at times you choose, so you can stop holding it all in your head.",
      },
      cost: { ja: "通知が多いと無視される", en: "Too many reminders get ignored" },
      fit: { "forget-deadline": 0.95, "manual-chore": 0.2 },
      requirements: [
        {
          ja: "ユーザーが期限を登録したとき、システムは指定した時刻に通知を送る。",
          en: "WHEN the user registers a deadline, THE SYSTEM SHALL notify at the chosen times.",
        },
        {
          ja: "ユーザーが完了にしたとき、システムはその期限の通知を止める。",
          en: "WHEN the user marks it done, THE SYSTEM SHALL cancel its pending reminders.",
        },
      ],
    },
    {
      id: "weekly-review",
      title: { ja: "週次の振り返りレポート", en: "Weekly review report" },
      pitch: {
        ja: "1週間でやったことを自動でまとめ、前進を見える形にします。",
        en: "Automatically summarizes the week so progress becomes visible.",
      },
      cost: { ja: "記録の元データが必要", en: "Needs source data to summarize" },
      fit: { "no-progress": 0.85, "habit-drop": 0.45, "spend-blind": 0.3 },
      requirements: [
        {
          ja: "毎週決まった曜日に、システムはその週の記録を集計して表示する。",
          en: "WHEN the week ends, THE SYSTEM SHALL aggregate and show that week's records.",
        },
        {
          ja: "前週との差があるとき、システムは増減を示す。",
          en: "WHEN a previous week exists, THE SYSTEM SHALL show the change against it.",
        },
      ],
    },
    {
      id: "streak-tracker",
      title: { ja: "連続記録の習慣トラッカー", en: "Streak habit tracker" },
      pitch: {
        ja: "続いた日数を見せて、途切れたら再開しやすくします。",
        en: "Shows your streak and makes it easy to restart after a gap.",
      },
      cost: { ja: "途切れた時に落ち込みやすい", en: "A broken streak can feel discouraging" },
      fit: { "habit-drop": 0.9, "no-progress": 0.4 },
      requirements: [
        {
          ja: "ユーザーがその日の実施を記録したとき、システムは連続日数を更新する。",
          en: "WHEN the user logs today's action, THE SYSTEM SHALL update the streak count.",
        },
        {
          ja: "1日記録が抜けたとき、システムは連続を0に戻さず、再開を促す。",
          en: "WHEN a day is missed, THE SYSTEM SHALL invite a restart instead of silently resetting to zero.",
        },
      ],
    },
    {
      id: "unified-search",
      title: { ja: "横断検索", en: "Unified search" },
      pitch: {
        ja: "ノート・ファイル・メッセージを一か所から探せます。",
        en: "Find notes, files and messages from one place.",
      },
      cost: { ja: "最初に取り込む作業が必要", en: "Initial import work" },
      fit: { "info-scatter": 0.95, "team-misalign": 0.3 },
      requirements: [
        {
          ja: "ユーザーが検索語を入力したとき、システムは全ての取り込み済み情報源から一致する項目を返す。",
          en: "WHEN the user enters a query, THE SYSTEM SHALL return matches from all imported sources.",
        },
        {
          ja: "項目を開いたとき、システムは元の場所へのリンクを示す。",
          en: "WHEN a result is opened, THE SYSTEM SHALL show a link to its original location.",
        },
      ],
    },
    {
      id: "measure-first",
      title: { ja: "まず計測する（プロファイラ導入）", en: "Measure first (add profiling)" },
      pitch: {
        ja: "遅い箇所を数字で特定してから直します。当てずっぽうの最適化を避けられます。",
        en: "Pinpoint the slow part with numbers before fixing, instead of guessing.",
      },
      cost: { ja: "最初は直接の改善にならない", en: "No direct speed-up at first" },
      fit: { "slow-unknown": 0.95, "no-progress": 0.2 },
      requirements: [
        {
          ja: "リクエストを処理するとき、システムは処理時間を記録する。",
          en: "WHEN a request is handled, THE SYSTEM SHALL record its duration.",
        },
        {
          ja: "ユーザーが計測画面を開いたとき、システムは遅い順に上位の処理を示す。",
          en: "WHEN the user opens the report, THE SYSTEM SHALL list the slowest operations first.",
        },
      ],
    },
    {
      id: "add-cache",
      title: { ja: "キャッシュを追加する", en: "Add a cache" },
      pitch: {
        ja: "同じ結果を使い回して応答を速くします。",
        en: "Reuse results to answer faster.",
      },
      cost: { ja: "原因が別なら効かず、古いデータの不具合を生む", en: "Useless if the cause is elsewhere; can serve stale data" },
      fit: { "slow-unknown": 0.4 },
      requirements: [
        {
          ja: "同じ入力の要求が来たとき、システムは有効期間内なら保存済みの結果を返す。",
          en: "WHEN an identical request arrives within the TTL, THE SYSTEM SHALL return the cached result.",
        },
      ],
    },
    {
      id: "shared-spec",
      title: { ja: "合意用の共通仕様テンプレート", en: "Shared spec template for agreement" },
      pitch: {
        ja: "作る前に、全員が同じ受け入れ条件に目を通して合意する形にします。",
        en: "Everyone reviews the same acceptance criteria before work starts.",
      },
      cost: { ja: "最初の合意に時間がかかる", en: "Agreeing up front takes time" },
      fit: { "team-misalign": 0.95, "info-scatter": 0.3 },
      requirements: [
        {
          ja: "作業を始める前に、システムは受け入れ条件を一覧で表示し、関係者全員の確認を求める。",
          en: "BEFORE work starts, THE SYSTEM SHALL show acceptance criteria and require confirmation from every stakeholder.",
        },
        {
          ja: "条件が変更されたとき、システムは変更点と変更者を全員に知らせる。",
          en: "WHEN a criterion changes, THE SYSTEM SHALL notify everyone of what changed and who changed it.",
        },
      ],
    },
    {
      id: "task-automation",
      title: { ja: "定型作業の自動化", en: "Automate the routine task" },
      pitch: {
        ja: "毎回同じ手順を、決めた時間に自動で実行します。",
        en: "Run the same steps automatically on a schedule.",
      },
      cost: { ja: "例外処理の設計が要る", en: "Edge cases need design" },
      fit: { "manual-chore": 0.95, "forget-deadline": 0.3 },
      requirements: [
        {
          ja: "設定した時刻になったとき、システムは登録された手順を順に実行する。",
          en: "WHEN the scheduled time arrives, THE SYSTEM SHALL run the registered steps in order.",
        },
        {
          ja: "手順が失敗したとき、システムは失敗を通知して後続を止める。",
          en: "WHEN a step fails, THE SYSTEM SHALL notify the user and halt the remaining steps.",
        },
      ],
    },
  ],
};
