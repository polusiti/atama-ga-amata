# デモ動画の台本(日本語の指示つき)

英文は `docs/demo-script.md` と同じです。ここでは、操作の指示と、英文の意味を日本語で書いています。英文を読むのはあなたです。画面だけを先に録画し(音なし)、そのあと動画を見ながら、場面ごとに英文を読んで録音します。

## 準備
- Chrome で Ctrl+Shift+N を押して、シークレットウィンドウを開きます。タブは 1 枚だけで、サイトだけを開きます。他のタブや、拡張機能のアイコンを映さないためです。
- ウィンドウを最大化して、Ctrl+0 でズームを 100% に戻します。ショップの窓がページの右に並んでいるか、見てください。下に落ちていたら、Ctrl+−(マイナス)を 1 回押します。
- 言語を英語にします(右下の EN/JA ボタン)。
- 「Get ideas」に貼る文を、用意しておきます: `The build fails with a missing module error. I asked the AI to reinstall it three times and got the same result.`
- レート制限は、ゆるくしてあります(読み取り 30、アイデア 10、ゴースト 60 回 / 分)。操作の間に待たなくて構いません。

## 場面

| 時間 | 操作 | 読む英文 | 英文の意味 |
|---|---|---|---|
| 0:00 | 入口の画面を映します。クリックしません。 | On the day I built this, my own coding agent sent the same long command four times. Each one was interrupted, and each time it called it bad luck. That is an antlion pit: every struggle makes the slope slide. | これを作った日、私のコーディングエージェントが、同じ長いコマンドを 4 回送りました。毎回中断され、毎回それを「運が悪い」と呼びました。これがアリジゴクです。もがくほど、斜面が崩れます。 |
| 0:15 | 「Test my skill」を押します。「Start」を押します。2 問に答えます。1 問ごとに、理由と出典のところで止まります。「Stop here」を押します。 | First it tests you. Each question has an answer, and each answer comes with the reason and a source. There is no score, and a miss never becomes a label on you. | まず、あなたを試します。問いには答えがあり、答えには理由と出典が付きます。点数はなく、間違えても、あなたへのレッテルにはなりません。 |
| 0:40 | THE PIT に戻ります。「Add a try that did not work」を 3 回押します。判定と、2 つの数字のところで止まります。 | Then you add what you tried. Three tries of the same approach, three failures. The verdict says No to the approach, never to you. Two numbers sit side by side: one more try of the same approach, and a fresh start. Both are set by hand, and the page says so. | 次に、試したことを足します。同じやり方を 3 回試して、3 回失敗しました。判定は、やり方に No と言い、あなたには言いません。2 つの数字が並びます。同じやり方をもう 1 回試す場合と、新しく始める場合です。どちらも手で決めた数字で、ページにもそう書いてあります。 |
| 1:10 | 「Shake it」を押します。次に、ショップの下の例を 1 つ選びます。 | A shake gives three provocations that have nothing to do with your problem. The ghost shopkeeper adds one odd line, written by a language model from random seed words. It is a jolt, not advice. | 揺さぶりは、あなたの問題と関係のない挑発を 3 つ出します。ゴーストの店主が、変な一言を足します。ランダムな種の単語から、言語モデルが書いたものです。助言ではなく、ショックです。 |
| 1:30 | 「Get ideas」を押します。用意した文を貼ります。「Get five」を押します。(待ち時間は、編集で切ります。) | For real ideas, a larger model writes five of different kinds, each with a ten-minute test. Fixed rules reject anything that claims it ran something. The numbers never come from the model. | 本物のアイデアのために、大きなモデルが、種類の違う 5 つを書きます。それぞれに、10 分で試せる確認があります。決まったルールが、「実行した」と主張するものを弾きます。数字は、モデルからは出ません。 |
| 1:50 | リポジトリを映します。`.kiro` フォルダ、次に `docs/incidents.md` です。 | Kiro built this: seventeen specs, five hooks, seven steering files, two custom agents, and an MCP tool called pit_check that my own agent must call after two failed tries. Every rule in its conduct file names the incident that caused it. | Kiro がこれを作りました。仕様 17、フック 5、ステアリング 7、カスタムエージェント 2、そして、2 回失敗したあとに私自身のエージェントが必ず呼ぶ MCP のツール pit_check です。行動規則の 1 つ 1 つに、原因になった事故の名前が付いています。 |
| 2:15 | サイトに戻ります。ABOUT のタブか、入口の画面を映します。 | No real user has tried it yet. The two numbers are set by hand. The sentence reader finds a new approach in only three or four of ten sentences. I would rather say so than hide it. | 本物のユーザーは、まだ使っていません。2 つの数字は手で決めたものです。文の読み取りが「新しいやり方」を見つけるのは、10 文のうち 3〜4 文だけです。隠すより、言うほうがよいと考えました。 |

## メモ
- 英文は約 270 語で、普通の速さなら約 2 分です。声を録ったあとで、長さを測ります。審査されるのは、最初の 3 分だけです。
- 力量チェックでは、領域を選べません。Docker から始まります。2 問答えて「Stop here」で止めると、Docker だけの結果が出ます。
- ゴーストの一言は、毎回違います。その一言に合わせた台詞は、書いていません。
- 声は、あなたが読みます。Windows のサウンドレコーダーか OBS で、静かな部屋で、場面ごとに録ります。失敗しても、その場面だけ撮り直せます。「pit_check」は「ピット チェック」、「antlion」は「アント ライオン」と読みます。英語が難しければ、日本語で話して、英文を字幕にします(審査員は英語を読みます)。
- 未確認のこと: 3 回失敗したあとに出る判定の数字です。録画のときに、画面から読みます。台詞には入れていません。
- 仕様・フック・ステアリング・エージェントの数は、11 月 21 日に数えた値です。録画の前に、数え直します。
