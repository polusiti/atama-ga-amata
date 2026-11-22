import type { DeckEntry } from "@/core/shake";

/**
 * Twenty-five provocations written by the author, in both languages. They depend on no problem in particular, so they work for
 * any stall. Each is safe (nothing here deletes data or touches production), takes at most ten minutes, and is a plain action.
 * Nothing shows that any of them helps: they are meant to break a lock, and the person decides. The deck is the fallback when the
 * model is not available, and a test requires every entry to pass the same rules as the model's answers.
 */
export const shakeDeck: DeckEntry[] = [
  { id: "reverse-order", title: { en: "Run it backwards", ja: "逆の順番でやる" }, how: { en: "Do your steps in the opposite order, for five minutes, and write down what changes.", ja: "いまの手順を、逆の順番で、5分やって、何が変わるかを書き留める。" }, minutes: 5 },
  { id: "undo-three", title: { en: "Undo the last three changes", ja: "直近の3つの変更を、戻す" }, how: { en: "Undo your last three edits (in a copy), run it once with nothing new added, and compare.", ja: "直近の3つの変更を（コピーの上で）戻し、何も足さずに1回動かして、比べる。" }, minutes: 6 },
  { id: "say-aloud", title: { en: "Say it out loud", ja: "声に出して言う" }, how: { en: "Say the problem aloud, one sentence at a time, to anyone or anything. Stop where you hesitate.", ja: "問題を、誰かに、または何かに向かって、1文ずつ声に出して言う。言いよどむ所で止まる。" }, minutes: 5 },
  { id: "ten-times-smaller", title: { en: "Make it ten times smaller", ja: "10分の1にする" }, how: { en: "Cut the input, the code or the goal to a tenth. Does the problem survive?", ja: "入力か、コードか、目的を、10分の1まで削る。問題は、残るか。" }, minutes: 8 },
  { id: "forbid-tool", title: { en: "Forbid your main tool", ja: "いつもの道具を、禁じる" }, how: { en: "Pick the tool you lean on most and solve the next step without it.", ja: "いちばん頼っている道具を1つ選び、それなしで、次の1歩を進める。" }, minutes: 10 },
  { id: "fail-on-purpose", title: { en: "Make it fail on purpose", ja: "わざと、失敗させる" }, how: { en: "Write down three ways to make it fail on purpose. Is one of them what is happening now?", ja: "わざと失敗させる方法を3つ書く。そのうち1つは、いま起きていることではないか。" }, minutes: 5 },
  { id: "draw-it", title: { en: "Draw it on paper", ja: "紙に描く" }, how: { en: "Draw the data flow with arrows. Mark the place where you stop knowing what happens.", ja: "データの流れを、矢印で紙に描く。何が起きるか分からなくなる所に、印を付ける。" }, minutes: 8 },
  { id: "ask-wrong", title: { en: "Ask for wrong answers", ja: "間違った答えを聞く" }, how: { en: "Ask for three answers you are sure are wrong, and write why each is wrong.", ja: "間違いだと確信できる答えを3つ出してもらい、それぞれが、なぜ間違いかを書く。" }, minutes: 7 },
  { id: "other-place", title: { en: "Run it somewhere else", ja: "別の場所で動かす" }, how: { en: "Run it on another machine, as another user, or from another folder, and see what differs.", ja: "別のマシンか、別の利用者か、別のフォルダで動かして、何が違うかを見る。" }, minutes: 10 },
  { id: "walk", title: { en: "Leave for ten minutes", ja: "10分、離れる" }, how: { en: "Leave the screen. When you come back, write the first thing you think of, before you read anything.", ja: "画面から離れる。戻ったら、何かを読む前に、最初に思ったことを書く。" }, minutes: 10 },
  { id: "first-error", title: { en: "Read only the first error", ja: "最初のエラーだけ読む" }, how: { en: "Ignore everything but the first error line. Read only that line, word by word.", ja: "最初のエラーの1行以外は、すべて無視する。その1行だけを、1語ずつ読む。" }, minutes: 4 },
  { id: "write-colleague", title: { en: "Write it to a colleague", ja: "同僚への手紙にする" }, how: { en: "Write the problem as a message to a colleague with every fact. Do not send it. See what you left out.", ja: "問題を、事実をすべて入れて、同僚への連絡として書く。送らない。書き落とした事実を探す。" }, minutes: 8 },
  { id: "empty-file", title: { en: "Start again from an empty file", ja: "空のファイルから、書き直す" }, how: { en: "Write the smallest version again from nothing, without looking at the old one.", ja: "いちばん小さい版を、古い版を見ずに、何もない所から、書き直す。" }, minutes: 10 },
  { id: "count", title: { en: "Count it", ja: "数える" }, how: { en: "Print how many times each step runs. A number you did not expect may be a lead.", ja: "各手順が何回動くかを出力する。予想しなかった数字は、手がかりかもしれない。" }, minutes: 6 },
  { id: "swap-role", title: { en: "Debug the explanation", ja: "説明の誤りを探す" }, how: { en: "Ask for a bug in your explanation of the problem, not in your code.", ja: "コードでなく、問題についての自分の説明に、誤りがないかを探してもらう。" }, minutes: 6 },
  { id: "bisect", title: { en: "Cut it in half", ja: "半分に切る" }, how: { en: "Remove half of the input or half of the code. Does it still fail? Repeat on the failing half.", ja: "入力か、コードの半分を外す。まだ失敗するか。失敗する側の半分で、くり返す。" }, minutes: 10 },
  { id: "simplest-input", title: { en: "Feed it the simplest input", ja: "いちばん単純な入力を与える" }, how: { en: "Run it with empty input, one item, and zero. Write down which of the three behaves differently.", ja: "空の入力、1つだけ、0 で動かす。3つのうち、挙動が違うものを書き留める。" }, minutes: 6 },
  { id: "helpers-off", title: { en: "Switch the helpers off", ja: "補助を、全部切る" }, how: { en: "Turn off the cache, the formatter, the plugin you forgot about. Run it once.", ja: "キャッシュ、整形、忘れていたプラグインを切る。1回動かす。" }, minutes: 6 },
  { id: "test-first", title: { en: "Write the test, not the fix", ja: "直さずに、テストを書く" }, how: { en: "Write one failing test that says what fixed means. Do not touch the code.", ja: "「直った」とは何かを表す、落ちるテストを1つ書く。コードには触らない。" }, minutes: 10 },
  { id: "three-assumptions", title: { en: "Name three assumptions", ja: "思い込みを3つ書く" }, how: { en: "Write three things you take for granted. Check the one you are most sure of first.", ja: "当然と思っていることを3つ書く。いちばん自信のあるものから、確かめる。" }, minutes: 8 },
  { id: "timer", title: { en: "Set a ten-minute timer", ja: "10分のタイマーを置く" }, how: { en: "When it ends, write what you know and what you guessed, in two columns.", ja: "鳴ったら、分かっていることと、推測を、2つの列に分けて書く。" }, minutes: 10 },
  { id: "env-diff", title: { en: "Compare the environments", ja: "環境を比べる" }, how: { en: "List the versions of everything on the two sides, one line each, and look for the difference.", ja: "両側の、あらゆるものの版を、1行ずつ並べて、違いを探す。" }, minutes: 8 },
  { id: "six-words", title: { en: "Say the goal in six words", ja: "目的を、10文字で言う" }, how: { en: "Write the goal in six words. If you cannot, the goal may not be clear yet.", ja: "目的を、10文字で書く。書けなければ、目的が、まだ決まっていないのかもしれない。" }, minutes: 3 },
  { id: "ugly-first", title: { en: "Do the ugliest thing that works", ja: "いちばん不格好な方法を、とる" }, how: { en: "Pick the ugliest way that gets a result, on purpose, and get the result first.", ja: "結果が出る、いちばん不格好な方法を、わざと選んで、先に結果を出す。" }, minutes: 10 },
  { id: "other-reader", title: { en: "Let a stranger read it", ja: "他人に読ませる" }, how: { en: "Give the problem and the facts to a person who does not know the code, and let them state their view first.", ja: "コードを知らない人に、問題と事実を渡して、先に、相手の見立てを言ってもらう。" }, minutes: 10 },
  { id: "name-change", title: { en: "Rename what confuses you", ja: "紛らわしい名前を、付け替える" }, how: { en: "Rename the thing whose name you keep misreading. Does the problem look different?", ja: "いつも読み違える名前を、付け替える。問題の見え方は、変わるか。" }, minutes: 5 },
];

/** Words for the worker to give the model as a spark, two at random, so that the answers do not repeat. Plain, concrete nouns. */
export const seedWords: string[] = [
  "river", "lantern", "bridge", "salt", "mirror", "ladder", "fog", "orchard", "anvil", "kite", "compass", "tide", "thread", "window",
  "candle", "harbor", "moss", "drum", "lock", "needle", "lighthouse", "quilt", "glacier", "whistle", "ferry", "pebble", "canyon", "loom",
  "ember", "meadow", "chisel", "clock", "maze", "feather", "tunnel", "kettle", "sparrow", "barn", "marble", "rope", "wheel", "chalk",
  "bell", "tent", "copper", "trellis", "valley", "paddle", "orbit", "prism",
];
