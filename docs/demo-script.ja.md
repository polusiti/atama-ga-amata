# デモ動画の台本(日本語の指示つき)

英文は `docs/demo-script.md` と同じです。ここでは、操作の指示と、英文の意味を日本語で書いています。画面だけを先に録画し(音なし)、声は別に作って、あとで重ねます。声は、Google AI Studio で作るか、あなたが読みます。

## 準備
- Chrome で Ctrl+Shift+N を押して、シークレットウィンドウを開きます。タブは 1 枚だけで、サイトだけを開きます。他のタブや、拡張機能のアイコンを映さないためです。
- ウィンドウを最大化して、Ctrl+0 でズームを 100% に戻します。ショップの窓がページの右に並んでいるか、見てください。下に落ちていたら、Ctrl+−(マイナス)を 1 回押します。
- 言語を英語にします(右下の EN/JA ボタン)。
- 「Get ideas」に貼る文を、用意しておきます: `The build fails with a missing module error. I asked the AI to reinstall it three times and got the same result.`
- レート制限は、ゆるくしてあります(読み取り 30、アイデア 10、ゴースト 60 回 / 分)。操作の間に待たなくて構いません。

## 場面

| 時間 | 操作 | 読む英文 | 英文の意味 |
|---|---|---|---|
| 0:00 | 入口の画面を映します。クリックしません。 | Hi. I'm a student in Japan, and this is atamagazon. Quick story. On the day I built this, my own coding agent sent the same long command four times in a row. Each time it was interrupted, and each time it called it bad luck. That is an antlion pit: the sand trap where every struggle makes the slope slide. And honestly, I have been in that pit with AI more often than I would like to admit. | こんにちは。日本の学生で、これは atamagazon です。小さな話をします。これを作った日、私のコーディングエージェントが、同じ長いコマンドを 4 回続けて送りました。毎回中断され、毎回それを「運が悪い」と呼びました。これがアリジゴクです。もがくほど斜面が崩れる、砂の罠です。正直、私も AI とこの穴に、認めたくないほど何度も落ちています。 |
| 0:23 | 「Test my skill」を押します。「Start」を押します。2 問に答えます。1 問ごとに、理由と出典のところで止まります。「Stop here」を押します。 | So the first thing the site does is ask what you actually know. There is no login and no score. Each question has an answer, and after each one you get the reason and a source, so even a miss teaches you something. The areas are Docker, MCP, Git, HTTP, spotting an AI's mistake, reading code, and reading tests. I answer two here. There are twenty-one in all, and every code answer was run to check the answer key. | このサイトが最初にするのは、あなたが実際に何を知っているかを聞くことです。ログインも点数もありません。問いには答えがあり、答えたあとに理由と出典が出るので、間違えても学べます。領域は、Docker、MCP、Git、HTTP、AI のミスを見抜くこと、コードを読むこと、テストを読むことです。ここでは 2 問だけ答えます。全部で 21 問あり、コードの問題の答えは、正しいか、全部実行して確かめてあります。 |
| 0:48 | THE PIT に戻ります。「Add a try that did not work」を 3 回押します。判定と、2 つの数字のところで止まります。 | Now the main part. Say you asked the AI for the same fix three times, and it failed three times. I press the button three times. And here is the verdict. It says No to the approach, never to you. Below it are two numbers: the chance that one more try of the same approach works, and the chance that a fresh start works. I set both by hand, and the page says so. I would rather show honest numbers than fake precision. | ここからが中心です。AI に同じ直しを 3 回頼んで、3 回失敗したとします。ボタンを 3 回押します。ここで判定が出ます。判定は、やり方に No と言い、あなたには言いません。その下に 2 つの数字があります。同じやり方をもう 1 回試して成功する見込みと、新しく始めて成功する見込みです。どちらも手で決めた数字で、ページにもそう書いてあります。偽物の精密さより、正直な数字を見せたいと思いました。 |
| 1:14 | 「Shake it」を押します。次に、ショップの下の例を 1 つ選びます。もう 1 つ選びます。 | If you are stuck, the next move cannot be more of the same. So there is a shake: three provocations that have nothing to do with your problem. And this ghost shopkeeper answers whatever you say with one odd line. Yes, it is weird. A language model gets four random words, a place, a spot, a food and a thing, and has to make one sentence. It is a jolt, not advice. If a line breaks the rules, the ghost stays silent. | 詰まっているなら、次の手は「同じこと」ではいけません。そこで「揺さぶり」があります。あなたの問題と関係のない挑発が 3 つ出ます。このゴーストの店主は、何を言っても、変な一言で返します。ええ、変です。言語モデルが、場所、場面、食べ物、物の 4 つのランダムな単語をもらって、1 文を作ります。ショックであり、助言ではありません。ルールを破った一言は、ゴーストが黙ります。 |
| 1:40 | 「Get ideas」を押します。用意した文を貼ります。「Get five」を押します。(待ち時間は、編集で切ります。) | For real ideas, I paste what is stuck. A bigger model writes five ideas of different kinds, each with a ten-minute test. While it thinks, a word on the rules: it cannot say it ran anything, it cannot make up numbers, and if the answer breaks the shape, the site throws it away. The numbers always come from plain code, never from the model. | 本物のアイデアのために、詰まっていることを貼ります。大きいモデルが、種類の違う 5 つのアイデアを書き、それぞれに 10 分で試せる確認が付きます。考えている間に、ルールの話をします。モデルは、何かを実行したとは言えず、数字を作ることもできず、答えの形が崩れたら、サイトがそれを捨てます。数字は、いつも普通のコードから出て、モデルからは出ません。 |
| 2:02 | リポジトリを映します。`.kiro` フォルダ、次に `docs/incidents.md` です。 | Behind the scenes, Kiro built all of this: seventeen specs, five hooks, seven steering files, two custom agents, and an MCP tool called pit check that my own coding agent has to call after two failed tries. My favorite part: every rule in the agent's conduct file names the incident that caused it. The agent really made those mistakes. | 裏側では、Kiro がこれを全部作りました。仕様 17、フック 5、ステアリング 7、カスタムエージェント 2、そして、2 回失敗したあとに私自身のコーディングエージェントが必ず呼ぶ MCP のツール pit check です。いちばん好きなのは、エージェントの行動規則の 1 つ 1 つに、原因になった事故の名前が付いていることです。エージェントは、本当にそれらの失敗をしました。 |
| 2:20 | サイトに戻ります。ABOUT のタブか、入口の画面を映します。 | One last thing, honestly. No real user has tried this yet, so I cannot tell you it works for you. The two numbers are set by hand. And the part that reads your sentences is weak: it spots a new approach in only three or four of ten sentences, so you can fix its marks on screen. Thanks for watching. | 最後に、正直に言います。本物のユーザーはまだ使っていないので、あなたに効くとは言えません。2 つの数字は手で決めたものです。文を読む部分は弱く、新しいやり方を見つけるのは 10 文のうち 3〜4 文だけなので、その印は、画面で直せるようにしてあります。見てくれて、ありがとう。 |

## メモ
- 英文は約 500 語です。最初に作った声は、268 語で 1 分 28 秒でした。同じ速さなら、約 2 分 45 秒になります。声を作ったあとで、本当の長さを測ります。審査されるのは、最初の 3 分だけなので、声は 2 分 50 秒より前に終えます。
- 力量チェックでは、領域を選べません。Docker から始まります。2 問答えて「Stop here」で止めると、Docker だけの結果が出ます。
- ゴーストの一言は、毎回違います。その一言に合わせた台詞は、書いていません。
- 声を AI で作った場合は、動画の説明欄に、そう書いておきます。AI の声を動画に使ってよいかは、未確認です。声のサービスの利用条件と Devpost のルールを、確認してください。
- 「pit check」と書いてあるのは、「pit_check」を声が読み間違えないためです。「antlion」を読み間違えたら、「ant-lion」と書き直します。
- 未確認のこと: 3 回失敗したあとに出る判定の数字です。録画のときに、画面から読みます。台詞には入れていません。
- 仕様・フック・ステアリング・エージェント・問題の数は、11 月 21 日と 24 日に数えた値です。録画の前に、数え直します。
