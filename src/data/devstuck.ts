import type { KnowledgeBase, Lexicon } from "@/core/types";

/**
 * Shelf for engineers whose back-and-forth with an AI has stopped making progress.
 * Needs are the kinds of stall. Steps are the next moves. Numbers are authored judgments.
 *
 * Sources actually read:
 * - Laban et al. 2025, arXiv:2505.06120 (multi-turn conversations: models take wrong turns and do not recover).
 * - Sharma et al. 2023, arXiv:2310.13548 (AI assistants tend to match the user's views).
 * - Zeller, "Why Programs Fail": TRAFFIC (Track, Reproduce, Automate, Find origins, Focus, Isolate, Correct),
 *   and delta debugging for "worked yesterday, not today".
 * Everything else is labeled "rule of thumb, not tested".
 */
const RULE = { ja: "経験則（検証していません）", en: "Rule of thumb, not tested" };
const TRAFFIC = { ja: "Zeller『Why Programs Fail』の TRAFFIC", en: "Zeller, Why Programs Fail (TRAFFIC)" };

export const devstuck: KnowledgeBase = {
  needs: [
    {
      id: "no-repro",
      short: { ja: "再現", en: "Repro" },
      title: { ja: "毎回同じ失敗を起こせない", en: "I can't make it fail the same way every time" },
      gloss: { ja: "確かめようにも、同じ条件が作れない", en: "Without a fixed case there is nothing to test against" },
    },
    {
      id: "no-evidence",
      short: { ja: "観測", en: "Evidence" },
      title: { ja: "推測で進んでいる（ログや数字が足りない）", en: "I am guessing: not enough logs or numbers" },
      gloss: { ja: "事実より、もっともらしい説明が先に立つ", en: "Plausible stories run ahead of facts" },
    },
    {
      id: "goal-swapped",
      short: { ja: "目的", en: "Goal" },
      title: { ja: "目的が、手段にすり替わっている", en: "The goal got replaced by a method" },
      gloss: { ja: "「どうやるか」ばかり聞いて、「何が困りか」が薄れる", en: "We keep asking how, and lose what hurts" },
    },
    {
      id: "context-loop",
      short: { ja: "堂々巡り", en: "Looping" },
      title: { ja: "同じ会話の中で堂々巡りしている", en: "Going in circles in the same conversation" },
      gloss: {
        ja: "失敗した案が会話に積もり、同じ案が戻ってくる",
        en: "Failed attempts pile up in the context and the same ideas come back",
      },
    },
    {
      id: "agreeable-ai",
      short: { ja: "同調", en: "Agreeing" },
      title: { ja: "AIが同調して、確認が内側で完結している", en: "The AI agrees with me, so checking stays inside the loop" },
      gloss: { ja: "こちらの見立てに合う答えが返りやすい", en: "Answers tend to match my own view" },
    },
    {
      id: "unfalsifiable",
      short: { ja: "反証", en: "Falsify" },
      title: { ja: "仮説が、外れる形になっていない", en: "My hypothesis cannot be proven wrong" },
      gloss: { ja: "試しても、正しいか誤りか分からない", en: "A test would tell me neither yes nor no" },
    },
    {
      id: "env-mismatch",
      short: { ja: "変更点", en: "Changes" },
      title: { ja: "何が変わったのか分からない（昨日は動いていた）", en: "I don't know what changed (it worked yesterday)" },
      gloss: { ja: "版・設定・依存の違いが見えていない", en: "Differences in versions, settings or dependencies are invisible" },
    },
    {
      id: "too-big",
      short: { ja: "切り分け", en: "Scope" },
      title: { ja: "問題が大きすぎて、切り分けていない", en: "The problem is too big and not split" },
      gloss: { ja: "候補が広がり、どこから手を付けるか決まらない", en: "Candidates keep multiplying and I cannot pick a start" },
    },
  ],

  questions: [
    {
      id: "p-repro",
      text: { ja: "このバグを、毎回同じ手順で起こせますか？", en: "Can you trigger this bug with the same steps every time?" },
      cost: 1,
      base: 0.55,
      practice: "fix-repro",
      yes: { "no-repro": 0.08, "env-mismatch": 0.4 },
    },
    {
      id: "s-flaky",
      text: {
        ja: "たまにしか起きない、または環境によって起きたり起きなかったりしますか？",
        en: "Does it happen only sometimes, or only in some environments?",
      },
      cost: 1,
      base: 0.2,
      yes: { "no-repro": 0.92, "env-mismatch": 0.5 },
    },
    {
      id: "p-minimal",
      text: { ja: "数十行ほどの最小の再現例を、手元に持っていますか？", en: "Do you have a minimal reproduction of a few dozen lines?" },
      cost: 1,
      base: 0.45,
      practice: "make-minimal",
      yes: { "too-big": 0.1, "no-repro": 0.1, "context-loop": 0.3 },
    },
    {
      id: "p-new-facts",
      text: {
        ja: "ここ5往復で、AIに渡した「新しい事実」（ログ・数値・手順）は増えましたか？",
        en: "In the last five exchanges, did you give the AI any new facts (logs, numbers, steps)?",
      },
      cost: 1,
      base: 0.55,
      practice: "add-evidence",
      yes: { "no-evidence": 0.08, "context-loop": 0.12, "agreeable-ai": 0.35 },
    },
    {
      id: "p-goal-sentence",
      text: {
        ja: "いま困っていることを、解決策を含めずに一文で書けますか？",
        en: "Can you write what is wrong in one sentence, without mentioning a fix?",
      },
      cost: 1,
      base: 0.55,
      practice: "state-goal",
      yes: { "goal-swapped": 0.08, "too-big": 0.35 },
    },
    {
      id: "s-same-idea",
      text: {
        ja: "ここ数往復、AIが同じ原因・同じ修正案をくり返していますか？",
        en: "In the last few exchanges, has the AI repeated the same cause or the same fix?",
      },
      cost: 1,
      base: 0.25,
      yes: { "context-loop": 0.92, "agreeable-ai": 0.4, "no-evidence": 0.5, unfalsifiable: 0.4 },
    },
    {
      id: "s-quick-flip",
      text: {
        ja: "AIに「それは違うのでは」と言ったら、すぐに意見を変えましたか？",
        en: "When you said \"I think that's wrong\", did the AI change its view right away?",
      },
      cost: 1,
      base: 0.3,
      yes: { "agreeable-ai": 0.9, "context-loop": 0.5 },
    },
    {
      id: "p-primary",
      text: {
        ja: "AIの答えを、AI以外（公式文書・ソース・実行結果）で確かめましたか？",
        en: "Did you check the AI's answer against something other than the AI (docs, source, a run)?",
      },
      cost: 1,
      base: 0.55,
      practice: "primary-source",
      yes: { "agreeable-ai": 0.1, "no-evidence": 0.2, "env-mismatch": 0.35 },
    },
    {
      id: "p-predict",
      text: {
        ja: "「これを変えれば、こう変わる」と、試す前に予測を書きましたか？",
        en: "Before trying a change, did you write down what you expect it to do?",
      },
      cost: 1,
      base: 0.5,
      practice: "predict",
      yes: { unfalsifiable: 0.08, "no-evidence": 0.25, "agreeable-ai": 0.3 },
    },
    {
      id: "p-diff",
      text: {
        ja: "最後に正しく動いていた版と、いまの版の差分を、実際に見ましたか？",
        en: "Did you actually look at the diff between the last working version and now?",
      },
      cost: 1,
      base: 0.5,
      practice: "diff-change",
      yes: { "env-mismatch": 0.08, "no-repro": 0.35 },
    },
    {
      id: "p-fresh",
      text: {
        ja: "問題を整理して、新しい会話で聞き直したことがありますか？",
        en: "Have you restated the problem and asked again in a fresh conversation?",
      },
      cost: 1,
      base: 0.5,
      practice: "fresh-context",
      yes: { "context-loop": 0.12, "agreeable-ai": 0.35 },
    },
    {
      id: "s-many-causes",
      text: {
        ja: "原因の候補が三つ以上に広がって、何から手を付けるか決まらないですか？",
        en: "Have the possible causes spread to three or more, so you can't pick where to start?",
      },
      cost: 1,
      base: 0.3,
      yes: { "too-big": 0.9, "no-evidence": 0.6 },
    },
    {
      id: "p-outside",
      text: {
        ja: "同僚・別のツール・別のモデルなど、この会話の外の目に見せましたか？",
        en: "Did you show it to an eye outside this conversation (a colleague, another tool, another model)?",
      },
      cost: 1,
      base: 0.5,
      practice: "outside-view",
      yes: { "agreeable-ai": 0.12, "context-loop": 0.2, "goal-swapped": 0.35 },
    },
    {
      id: "p-timebox",
      text: {
        ja: "この問題に使う時間の上限を、決めていますか？",
        en: "Have you set a time limit for this problem?",
      },
      cost: 1,
      base: 0.5,
      practice: "timebox",
      yes: { "context-loop": 0.2, "too-big": 0.3 },
    },
    {
      id: "s-how-questions",
      text: {
        ja: "AIへの質問は、「〜するにはどうすればいい？」という手段の形が多いですか？",
        en: "Are most of your questions to the AI of the form \"how do I do X?\" (a method)?",
      },
      cost: 1,
      base: 0.3,
      yes: { "goal-swapped": 0.88 },
    },
    {
      id: "p-split",
      text: {
        ja: "原因を一つずつ切り分けて、順番に潰していますか？",
        en: "Are you splitting the causes and ruling them out one at a time?",
      },
      cost: 1,
      base: 0.5,
      practice: "split-problem",
      yes: { "too-big": 0.1, "no-evidence": 0.3 },
    },
    {
      id: "p-refute",
      text: {
        ja: "AIに「この仮説が間違っているなら、どんな証拠が出るか」と聞いたことがありますか？",
        en: "Have you asked the AI \"if this hypothesis were wrong, what evidence would show it?\"",
      },
      cost: 1,
      base: 0.5,
      practice: "refute",
      yes: { "agreeable-ai": 0.1, unfalsifiable: 0.25 },
    },
  ],

  solutions: [
    {
      id: "fix-repro",
      title: { ja: "再現手順を固定する", en: "Pin down a reproduction" },
      pitch: {
        ja: "同じ手順で、毎回同じ失敗が起きる形にします。確かめる土台ができます。",
        en: "Make the same steps fail the same way every time. It gives you something to test against.",
      },
      cost: { ja: "最初は、直接の前進に見えない", en: "At first it does not look like progress" },
      fit: { "no-repro": 0.95, "env-mismatch": 0.4, "no-evidence": 0.3, "too-big": 0.2, unfalsifiable: 0.2 },
      source: TRAFFIC,
      requirements: [
        { ja: "起こす手順を、他の人が同じ結果になる形で書く（環境・版・入力を含める）。", en: "Write the steps so another person gets the same result (include environment, versions, input)." },
        { ja: "手順どおりに3回実行して、毎回同じ失敗になるか確かめる。", en: "Run the steps three times and check it fails the same way each time." },
        { ja: "たまにしか起きないなら、起きる頻度と条件を記録する。", en: "If it only fails sometimes, record how often and under what conditions." },
      ],
    },
    {
      id: "make-minimal",
      title: { ja: "最小の再現例まで削る", en: "Shrink it to a minimal example" },
      pitch: {
        ja: "関係ない部分を削って、失敗に必要なものだけを残します。AIにも人にも渡しやすくなります。",
        en: "Cut everything not needed for the failure. It is easy to hand to an AI or a person.",
      },
      cost: { ja: "削る作業に時間がかかる", en: "Cutting takes time" },
      fit: { "too-big": 0.8, "no-repro": 0.5, "context-loop": 0.4, "agreeable-ai": 0.3 },
      requires: ["fix-repro"],
      source: TRAFFIC,
      requirements: [
        { ja: "関係なさそうな部分を一つ削って、まだ失敗するか確かめる。", en: "Remove one part that looks unrelated and check it still fails." },
        { ja: "失敗が消えたら、その部分は関係があるので戻す。", en: "If the failure disappears, put that part back: it matters." },
        { ja: "これ以上削れなくなるまで繰り返す。", en: "Repeat until nothing more can be removed." },
        { ja: "残った例を、そのまま人にもAIにも渡せる形にする。", en: "Keep the result in a form you can hand to a person or an AI as is." },
      ],
    },
    {
      id: "add-evidence",
      title: { ja: "ログと計測で、事実を足す", en: "Add facts with logs and measurements" },
      pitch: {
        ja: "推測をいったん止めて、見えていない値を出力させます。もっともらしい説明より、事実が先に立ちます。",
        en: "Pause guessing and print the values you cannot see, so facts come before plausible stories.",
      },
      cost: { ja: "ログを足す手間と、出力を読む負担", en: "Effort to add logging and to read the output" },
      fit: { "no-evidence": 0.95, "context-loop": 0.5, "agreeable-ai": 0.4, "env-mismatch": 0.4, unfalsifiable: 0.3 },
      source: TRAFFIC,
      requirements: [
        { ja: "疑っている箇所の前後に、入力・出力・時刻を出すログを足す。", en: "Add logging of inputs, outputs and time around the suspected spot." },
        { ja: "失敗したときと成功したときの出力を並べて比べる。", en: "Put the output of a failing run next to a passing run." },
        { ja: "読み取れた事実だけを箇条書きにする（推測は別に書く）。", en: "List only the facts you read, in bullets (write guesses separately)." },
      ],
    },
    {
      id: "state-goal",
      title: { ja: "目的を、解決策抜きの一文で書き直す", en: "Restate the goal in one sentence, without a fix" },
      pitch: {
        ja: "「何が困りか」を、手段を入れずに書きます。ずれていた質問の向きが戻ります。",
        en: "Write what is wrong without naming a method. Questions that drifted toward a method get back on course.",
      },
      cost: { ja: "書くだけだが、案外むずかしい", en: "Only writing, but harder than it looks" },
      fit: { "goal-swapped": 0.95, "context-loop": 0.4, "too-big": 0.3, "agreeable-ai": 0.2 },
      source: { ja: "XY問題として知られる失敗の型。経験則（検証していません）", en: "Known as the XY problem. Rule of thumb, not tested" },
      requirements: [
        { ja: "「〜したい」「〜するには」を使わずに、いま何が困っているかを一文で書く。", en: "Write what is wrong in one sentence without \"I want to\" or \"how do I\"." },
        { ja: "「なぜそれが困るのか」を一回だけ書き足す。", en: "Add one line on why it matters." },
        { ja: "その一文を、AIへの最初の質問にする。", en: "Use that sentence as the first question to the AI." },
      ],
    },
    {
      id: "fresh-context",
      title: { ja: "新しい会話で、事実だけ渡して再開する", en: "Restart in a fresh conversation with only the facts" },
      pitch: {
        ja: "失敗した案が積もった会話を離れ、分かっている事実だけを持って、まっさらな会話で聞き直します。",
        en: "Leave the conversation piled with failed attempts and ask again with only what you know.",
      },
      cost: { ja: "整理に手間がかかり、会話の勢いは失う", en: "Takes effort to summarize, and you lose momentum" },
      fit: { "context-loop": 0.95, "agreeable-ai": 0.5, "no-evidence": 0.2, "goal-swapped": 0.2 },
      requires: ["state-goal"],
      source: {
        ja: "Laban ら2025（複数ターンでは、一度誤ると戻れない傾向）。再開の手順は経験則（検証していません）",
        en: "Laban et al. 2025 (models do not recover from wrong turns). The restart routine is a rule of thumb, not tested",
      },
      requirements: [
        { ja: "分かった事実（再現手順・ログ・環境）を、推測と分けて書き出す。", en: "List what you know (steps, logs, environment), separate from guesses." },
        { ja: "試して失敗した案を、一行ずつ、理由つきで書く。", en: "List failed attempts, one line each, with the reason." },
        { ja: "新しい会話で、目的の一文・事実・失敗した案・制約だけを渡す。", en: "In a new conversation, give only the goal sentence, facts, failed attempts and constraints." },
        { ja: "古い会話の仮説は、渡さない。", en: "Do not carry over the old conversation's hypotheses." },
      ],
    },
    {
      id: "predict",
      title: { ja: "「こう変えれば、こうなる」と予測を書いてから試す", en: "Write a prediction before each change" },
      pitch: {
        ja: "外れる形の仮説にします。結果が、正しさか誤りのどちらかを教えてくれます。",
        en: "Make the hypothesis one that can be wrong, so the result tells you something.",
      },
      cost: { ja: "試す前に、一手間かかる", en: "One extra step before each try" },
      fit: { unfalsifiable: 0.95, "no-evidence": 0.4, "agreeable-ai": 0.3, "context-loop": 0.2 },
      requires: ["add-evidence"],
      source: TRAFFIC,
      requirements: [
        { ja: "仮説を「Aが原因なら、Bを変えるとCになる」の形で書く。", en: "Write the hypothesis as: if A is the cause, changing B will give C." },
        { ja: "予測が外れたら、その仮説を捨てると先に決める。", en: "Decide beforehand that a failed prediction means dropping the hypothesis." },
        { ja: "一度に一つだけ変えて試す。", en: "Change one thing at a time." },
        { ja: "結果を、予測と並べて書く。", en: "Write the result next to the prediction." },
      ],
    },
    {
      id: "refute",
      title: { ja: "AIに「この仮説が誤りなら、出る証拠」を挙げさせる", en: "Ask the AI for evidence that would show you are wrong" },
      pitch: {
        ja: "AIは、こちらの見立てに合わせやすい傾向があります。あえて、誤りを探す役をさせます。",
        en: "AI assistants tend to match your view. Ask it to look for how you could be wrong.",
      },
      cost: { ja: "返ってきた反証も、AIの出力なので、確認が要る", en: "The rebuttal is also AI output and needs checking" },
      fit: { "agreeable-ai": 0.9, "context-loop": 0.5, unfalsifiable: 0.5 },
      requires: ["predict"],
      source: {
        ja: "Sharma ら2023（AIは利用者の見解に合わせる傾向）。この頼み方は経験則（検証していません）",
        en: "Sharma et al. 2023 (assistants tend to match the user's view). This way of asking is a rule of thumb, not tested",
      },
      requirements: [
        { ja: "仮説と予測を、AIに一度だけ渡す。", en: "Give the AI the hypothesis and prediction once." },
        { ja: "「この仮説が誤りだとしたら、どんな証拠が出るか」と聞く。", en: "Ask: if this hypothesis were wrong, what evidence would show it?" },
        { ja: "返ってきた証拠のうち、実際に確かめられるものだけを選ぶ。", en: "Pick only the evidence you can actually check." },
        { ja: "確かめた結果は、AIの言葉でなく、実行結果や資料で判断する。", en: "Judge by runs or documents, not by what the AI says." },
      ],
    },
    {
      id: "primary-source",
      title: { ja: "公式文書・ソース・issue で、一次資料を確かめる", en: "Check primary sources: docs, source code, issues" },
      pitch: {
        ja: "AIの説明を、元の資料に当てます。会話の外に、確認の足場ができます。",
        en: "Check the AI's explanation against the original. You get a footing outside the conversation.",
      },
      cost: { ja: "読む時間がかかる", en: "Reading takes time" },
      fit: { "agreeable-ai": 0.8, "env-mismatch": 0.5, "no-evidence": 0.5, "context-loop": 0.3 },
      source: RULE,
      requirements: [
        { ja: "AIの主張のうち、結論に効くものを一つ選ぶ。", en: "Pick the one claim of the AI's that your conclusion depends on." },
        { ja: "その主張を、公式文書・ソース・issue のどれかで探す。", en: "Look for it in the official docs, the source, or an issue." },
        { ja: "見つからない、または食い違うなら、その主張は保留にする。", en: "If you cannot find it or it differs, put the claim on hold." },
      ],
    },
    {
      id: "diff-change",
      title: { ja: "最後に動いた状態との差分をとる", en: "Diff against the last working state" },
      pitch: {
        ja: "「昨日は動いていた」なら、変わった部分が原因の候補です。半分ずつ試して絞ります。",
        en: "If it worked yesterday, what changed is the suspect. Halve the changes until you find it.",
      },
      cost: { ja: "動いていた版を取り戻す手間", en: "Effort to get the working version back" },
      fit: { "env-mismatch": 0.95, "no-repro": 0.3, "too-big": 0.3 },
      requires: ["fix-repro"],
      source: { ja: "Zeller の差分デバッグ（delta debugging）", en: "Zeller, delta debugging" },
      requirements: [
        { ja: "最後に正しく動いていた版（日時・コミット）を探す。", en: "Find the last version that worked (date or commit)." },
        { ja: "動いた版と今の版の差分を、半分ずつ試して、失敗を起こす変更に絞る。", en: "Try half of the differences at a time to narrow down the change that causes the failure." },
        { ja: "絞れた変更を一つ戻して、直るか確かめる。", en: "Revert that change and check that it fixes the failure." },
      ],
    },
    {
      id: "outside-view",
      title: { ja: "会話の外の目に当てる（同僚・別のツール・別のモデル）", en: "Bring in an eye from outside (colleague, other tool, other model)" },
      pitch: {
        ja: "同じ会話の中では、同じ見立てが強まります。別の見方に、そのまま渡して見てもらいます。",
        en: "Inside one conversation the same view gets stronger. Hand the case to a different viewpoint as is.",
      },
      cost: { ja: "人に頼む気後れと、説明する手間", en: "Asking someone and explaining takes effort" },
      fit: { "agreeable-ai": 0.8, "context-loop": 0.7, "goal-swapped": 0.4, unfalsifiable: 0.3 },
      requires: ["fix-repro"],
      source: RULE,
      requirements: [
        { ja: "再現手順と、分かっている事実だけを、相手に渡す（自分の仮説は後で）。", en: "Give the other party the repro and the facts only; share your hypothesis afterwards." },
        { ja: "相手に、まず自分の見立てを言ってもらう。", en: "Let them state their own view first." },
        { ja: "こちらの見立てと違う点を、一つ選んで確かめる。", en: "Pick one point where the views differ and check it." },
      ],
    },
    {
      id: "split-problem",
      title: { ja: "問題を小さく分けて、一つずつ潰す", en: "Split the problem and rule parts out one by one" },
      pitch: {
        ja: "大きな問題を、確かめられる大きさに分けます。「どこから」が決まります。",
        en: "Cut a big problem into pieces you can test. It settles where to start.",
      },
      cost: { ja: "分け方を間違えると、遠回りになる", en: "A bad split costs a detour" },
      fit: { "too-big": 0.95, "no-repro": 0.3, "goal-swapped": 0.3, "no-evidence": 0.3 },
      requires: ["state-goal"],
      source: TRAFFIC,
      requirements: [
        { ja: "入口から出口までの流れを、確かめられる区間に分ける。", en: "Divide the flow from input to output into segments you can check." },
        { ja: "各区間の入出力が正しいか、一つずつ確かめる。", en: "Check the input and output of each segment, one at a time." },
        { ja: "最初に食い違った区間に、絞る。", en: "Narrow down to the first segment where they disagree." },
      ],
    },
    {
      id: "timebox",
      title: { ja: "時間の上限を決め、区切りで「新しい事実が増えたか」を見る", en: "Set a time limit and, at each checkpoint, ask if new facts appeared" },
      pitch: {
        ja: "壁打ちの止め時を、先に決めます。事実が増えていなければ、会話の外の手に切り替えます。",
        en: "Decide in advance when to stop bouncing ideas. If no new facts appeared, switch to a move outside the chat.",
      },
      cost: { ja: "上限の決め方が、勘になる", en: "The limit itself is a guess" },
      fit: { "context-loop": 0.6, "too-big": 0.4, "no-evidence": 0.3, "agreeable-ai": 0.2 },
      source: RULE,
      requirements: [
        { ja: "上限（たとえば30分）を、最初に決める。", en: "Set a limit up front (for example thirty minutes)." },
        { ja: "区切りごとに、新しい事実が増えたかを確かめる。", en: "At each checkpoint, check whether new facts appeared." },
        { ja: "増えていなければ、再現・計測・他の人など、会話の外の手に切り替える。", en: "If not, switch to a move outside the chat: repro, measurement, another person." },
      ],
    },
  ],
};

export const devstuckLexicon: Lexicon = {
  needWords: {
    "no-repro": [
      ["再現できない", 2], ["再現しない", 2], ["たまに", 1], ["時々", 1], ["不安定", 2], ["環境による", 1],
      ["flaky", 2], ["intermittent", 2], ["sometimes", 1], ["random", 1], ["can't reproduce", 2], ["cannot reproduce", 2],
    ],
    "no-evidence": [
      ["ログがない", 2], ["推測", 2], ["勘", 1], ["原因が分からない", 1], ["数字がない", 2], ["たぶん", 1],
      ["guess", 2], ["no logs", 2], ["not sure why", 1], ["no data", 2],
    ],
    "goal-swapped": [
      ["どうすれば", 1], ["やり方", 1], ["方法を", 1], ["実装したい", 1], ["回避", 1],
      ["how do i", 1], ["how to", 1], ["workaround", 2], ["is there a way", 1],
    ],
    "context-loop": [
      ["堂々巡り", 2], ["同じ修正", 2], ["同じ案", 2], ["繰り返し", 1], ["何度も", 1], ["ループ", 2], ["同じ答え", 2],
      ["going in circles", 2], ["again and again", 2], ["same fix", 2], ["same answer", 2], ["loop", 1], ["keeps suggesting", 2],
    ],
    "agreeable-ai": [
      ["同調", 2], ["すぐ謝", 2], ["すぐ同意", 2], ["おだて", 1], ["言いなり", 1],
      ["sycophan", 2], ["agrees with everything", 2], ["just agrees", 2], ["apologizes", 1],
    ],
    unfalsifiable: [
      ["反証", 2], ["確かめようがない", 2], ["検証できない", 2], ["試しても分からない", 2],
      ["unfalsifiable", 2], ["can't tell if", 1], ["no way to test", 2], ["cannot test", 2],
    ],
    "env-mismatch": [
      ["昨日は動いて", 2], ["昨日まで動いて", 2], ["動いていたのに", 2], ["アップデート後", 2], ["バージョン", 1], ["依存", 1], ["環境が違う", 2],
      ["worked yesterday", 2], ["regression", 2], ["after the update", 2], ["after upgrading", 2], ["version", 1],
    ],
    "too-big": [
      ["大きすぎ", 2], ["どこから", 2], ["手が付けられ", 2], ["複雑", 1], ["多すぎ", 1], ["切り分け", 1],
      ["where to start", 2], ["too big", 2], ["too many", 1], ["overwhelming", 2], ["too complex", 1],
    ],
  },
  solutionAliases: {
    "fix-repro": ["再現手順", "reproduction steps"],
    "make-minimal": ["最小再現", "minimal repro", "minimal example"],
    "add-evidence": ["ログを足", "ログを入れ", "add logging", "add logs"],
    "state-goal": ["目的を書", "restate the goal"],
    "fresh-context": ["新しい会話", "new chat", "fresh chat", "new conversation"],
    predict: ["予測を書", "write a prediction"],
    refute: ["反証を", "ask for counterexamples"],
    "primary-source": ["公式ドキュメント", "公式文書", "read the docs", "read the source"],
    "diff-change": ["差分", "git bisect", "bisect"],
    "outside-view": ["同僚に", "別のモデル", "another model", "ask a colleague"],
    "split-problem": ["切り分けたい", "split the problem"],
    timebox: ["タイムボックス", "time limit", "timebox"],
  },
  wantMarkers: ["したい", "試したい", "やってみ", "やろう", "i want to", "i will try", "i'm going to", "i plan to", "try to", "let me try", "wouldlike"],
};

export const devstuckSamples: { needId: string; ja: string; en: string }[] = [
  { needId: "context-loop", ja: "AIと同じ修正案を何度もやりとりして、堂々巡りになっている", en: "The AI and I keep going in circles with the same fix" },
  { needId: "env-mismatch", ja: "昨日まで動いていたのに、アップデート後に動かなくなった", en: "It worked yesterday but broke after the update" },
  { needId: "no-repro", ja: "たまにしか失敗しなくて、再現できない", en: "It only fails sometimes and I can't reproduce it" },
  { needId: "agreeable-ai", ja: "AIに反論するとすぐ同意されて、確認にならない", en: "When I push back the AI just agrees, so it is no check at all" },
  { needId: "too-big", ja: "原因の候補が多すぎて、どこから手を付けるか決まらない", en: "There are too many suspects and I can't tell where to start" },
  { needId: "no-evidence", ja: "ログがなくて、推測で直している", en: "I have no logs and I'm fixing by guesswork" },
];
