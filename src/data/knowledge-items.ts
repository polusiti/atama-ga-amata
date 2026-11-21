import type { KnowledgeItem } from "@/core/knowledge";

/**
 * Fifteen questions, "choose the wrong statement". Each rests on a page read on the date in `checked`, or on a premise
 * stated in the question. The levels are the author's judgment, not measured. Every text is in both languages.
 * The wrong statement is placed at a different index in different questions on purpose.
 */
const D = "2026-11-20";
const DOCKER_IMAGE = "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-an-image/";
const DOCKER_CONTAINER = "https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/";
const DOCKER_VOLUMES = "https://docs.docker.com/engine/storage/volumes/";
const MCP = "https://modelcontextprotocol.io/docs/learn/architecture";
const GIT = "https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F";
const HTTP_METHODS = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods";
const HTTP_STATUS = "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status";
const JS_SORT = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort";
const JS_VAR = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/var";
const JS_FOREACH = "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach";

export const knowledgeItems: KnowledgeItem[] = [
  // ---------- Docker ----------
  {
    id: "docker-1",
    topic: "docker",
    level: 1,
    stem: {
      en: "Which statement about Docker images and containers is WRONG?",
      ja: "Docker のイメージとコンテナについて、誤っている文はどれですか？",
    },
    statements: [
      {
        en: "An image is a package of everything a container needs to start: the OS files, the language runtime, the app's dependencies and code, and settings such as which command to run.",
        ja: "イメージは、コンテナの起動に必要なものをまとめた包みです。OS のファイル、言語の実行環境、アプリの依存物とコード、実行するコマンドなどの設定が入っています。",
      },
      {
        en: "Ten containers started from the same image start from exactly the same files.",
        ja: "同じイメージから起動した10個のコンテナは、まったく同じファイルから始まります。",
      },
      { en: "To change an image, you build a new one.", ja: "イメージを変えるには、新しいイメージを作ります。" },
      {
        en: "What a running container writes is saved back into the image, so the next container started from that image sees it.",
        ja: "動いているコンテナが書いた内容はイメージに書き戻されるので、同じイメージから次に起動したコンテナにも見えます。",
      },
      {
        en: "If you delete a container, the files it wrote into its own writable layer are deleted with it.",
        ja: "コンテナを削除すると、そのコンテナ自身の書き込み層に書いたファイルも、一緒に消えます。",
      },
    ],
    wrong: 3,
    why: {
      en: "A container adds one thin writable layer of its own on top of the image. What the app writes goes into that layer, never into the image, and an image never changes once it is built.",
      ja: "コンテナは、イメージの上に、自分だけの薄い書き込み層を1つ足します。アプリが書いた内容はその層に入り、イメージには入りません。イメージは、作ったあとは変わりません。",
    },
    source: { url: DOCKER_IMAGE, checked: D },
  },
  {
    id: "docker-2",
    topic: "docker",
    level: 2,
    stem: {
      en: "Which statement about Docker volumes is WRONG?",
      ja: "Docker のボリュームについて、誤っている文はどれですか？",
    },
    statements: [
      { en: "A volume's contents exist outside the lifecycle of a given container.", ja: "ボリュームの中身は、特定のコンテナの寿命とは別に存在します。" },
      {
        en: "A named volume is deleted automatically when the container that uses it is removed.",
        ja: "名前付きボリュームは、それを使っていたコンテナを削除すると、自動で削除されます。",
      },
      { en: "A given volume can be mounted into multiple containers at the same time.", ja: "1つのボリュームを、複数のコンテナに同時にマウントできます。" },
      {
        en: "A volume that no running container uses is not removed automatically; docker volume prune removes unused volumes.",
        ja: "動いているコンテナが使っていないボリュームも、自動では削除されません。使われていないボリュームは docker volume prune で削除できます。",
      },
      {
        en: "Volumes are managed by Docker, while bind mounts depend on the directory structure of the host machine.",
        ja: "ボリュームは Docker が管理します。バインドマウントは、ホストのディレクトリ構成に依存します。",
      },
    ],
    wrong: 1,
    why: {
      en: "A Docker data volume persists after you delete a container, which is the reason to keep data in one. The exception is an anonymous volume, which is removed with the container if you use the --rm option.",
      ja: "Docker のボリュームは、コンテナを削除しても残ります。データをボリュームに置く理由はそこにあります。例外は名前のないボリュームで、--rm オプションを付けたときは、コンテナと一緒に削除されます。",
    },
    source: { url: DOCKER_VOLUMES, checked: D },
  },
  {
    id: "docker-3",
    topic: "docker",
    level: 3,
    stem: {
      en: "Which statement about containers and virtual machines is WRONG?",
      ja: "コンテナと仮想マシンについて、誤っている文はどれですか？",
    },
    statements: [
      { en: "Containers on the same host share the host operating system's kernel.", ja: "同じホスト上のコンテナは、ホスト OS のカーネルを共有します。" },
      {
        en: "A container does not boot a guest operating system, so it is smaller and starts faster than a virtual machine.",
        ja: "コンテナはゲスト OS を起動しないので、仮想マシンより小さく、速く起動します。",
      },
      {
        en: "A virtual machine's isolation is stronger: it is separated by the hardware boundary the hypervisor creates, while containers are separated by the shared kernel.",
        ja: "仮想マシンのほうが、隔離が強いです。ハイパーバイザーが作るハードウェアの境界で分けられますが、コンテナは共有するカーネルで分けられます。",
      },
      { en: "Cloud servers are usually virtual machines that run many containers each.", ja: "クラウドのサーバーは、多くの場合、仮想マシンで、その中で多数のコンテナを動かします。" },
      {
        en: "On macOS and Windows, Docker Desktop runs Linux containers directly on the host's own kernel, with no virtual machine involved.",
        ja: "macOS や Windows では、Docker Desktop は Linux のコンテナを、ホスト自身のカーネルの上で直接動かし、仮想マシンは使いません。",
      },
    ],
    wrong: 4,
    why: {
      en: "Linux containers need a Linux kernel to share. On macOS and Windows, Docker Desktop runs them inside a small Linux virtual machine that it manages for you.",
      ja: "Linux のコンテナは、共有する Linux のカーネルを必要とします。macOS と Windows では、Docker Desktop が管理する小さな Linux の仮想マシンの中で動かします。",
    },
    source: { url: DOCKER_CONTAINER, checked: D },
  },
  // ---------- MCP ----------
  {
    id: "mcp-1",
    topic: "mcp",
    level: 1,
    stem: { en: "Which statement about MCP (Model Context Protocol) is WRONG?", ja: "MCP（Model Context Protocol）について、誤っている文はどれですか？" },
    statements: [
      { en: "An MCP server has to run on the same machine as the AI application that uses it.", ja: "MCP サーバーは、それを使う AI アプリと同じマシンで動かす必要があります。" },
      { en: "The MCP host is the AI application that coordinates one or more MCP clients.", ja: "MCP ホストは、1つ以上の MCP クライアントをまとめる AI アプリです。" },
      {
        en: "The host creates one MCP client for each MCP server, and each client keeps its own connection to its server.",
        ja: "ホストは、MCP サーバー1つにつき MCP クライアントを1つ作り、各クライアントが、自分のサーバーとの接続を保ちます。",
      },
      {
        en: "MCP servers can run locally, for example with the stdio transport, or remotely, for example with the Streamable HTTP transport.",
        ja: "MCP サーバーは、ローカル（たとえば stdio）でも、リモート（たとえば Streamable HTTP）でも動かせます。",
      },
      {
        en: "MCP is a protocol for exchanging context. It does not dictate how an AI application uses its language model.",
        ja: "MCP は、文脈をやり取りするためのプロトコルです。AI アプリが言語モデルをどう使うかは、決めません。",
      },
    ],
    wrong: 0,
    why: {
      en: "'MCP server' means the program that serves context, wherever it runs. A local server uses stdio on the same machine. A remote one, such as the Sentry server, uses Streamable HTTP.",
      ja: "「MCP サーバー」は、文脈を提供するプログラムのことで、どこで動くかは問いません。ローカルのものは同じマシンで stdio を使い、リモートのもの（たとえば Sentry のサーバー）は Streamable HTTP を使います。",
    },
    source: { url: MCP, checked: D },
  },
  {
    id: "mcp-2",
    topic: "mcp",
    level: 2,
    stem: { en: "Which statement about the primitives an MCP server can expose is WRONG?", ja: "MCP サーバーが提供できる要素について、誤っている文はどれですか？" },
    statements: [
      { en: "Tools are executable functions that an AI application can invoke, such as file operations or API calls.", ja: "ツールは、AI アプリが呼び出せる実行可能な関数です（ファイル操作や API 呼び出しなど）。" },
      { en: "Resources are data sources that provide contextual information, such as file contents or database records.", ja: "リソースは、文脈の情報を提供するデータ源です（ファイルの中身やデータベースの記録など）。" },
      { en: "Tools are read-only data sources, and resources are the functions the AI application can run.", ja: "ツールは読み取り専用のデータ源で、リソースは AI アプリが実行できる関数です。" },
      { en: "Prompts are reusable templates that help structure interactions with language models.", ja: "プロンプトは、言語モデルとのやり取りを組み立てる、再利用できるひな形です。" },
      { en: "A client can discover a server's tools with tools/list and run one with tools/call.", ja: "クライアントは、tools/list でサーバーのツールを見つけ、tools/call で実行できます。" },
    ],
    wrong: 2,
    why: {
      en: "The two are the other way round. Tools are things to run (tools/call). Resources are data to read (resources/read).",
      ja: "この2つは逆です。ツールは実行するもの（tools/call）で、リソースは読むデータ（resources/read）です。",
    },
    source: { url: MCP, checked: D },
  },
  {
    id: "mcp-3",
    topic: "mcp",
    level: 3,
    stem: { en: "Which statement about MCP's layers and transports is WRONG?", ja: "MCP の層と通信方式について、誤っている文はどれですか？" },
    statements: [
      { en: "MCP has a data layer, based on JSON-RPC 2.0, and a transport layer.", ja: "MCP には、JSON-RPC 2.0 に基づくデータ層と、通信層があります。" },
      { en: "The stdio transport uses standard input and output streams between local processes on the same machine.", ja: "stdio は、同じマシン上のローカルのプロセス同士が、標準入出力のストリームでやり取りする方式です。" },
      { en: "The Streamable HTTP transport uses HTTP POST for client-to-server messages, with optional Server-Sent Events for streaming.", ja: "Streamable HTTP は、クライアントからサーバーへのメッセージに HTTP POST を使い、必要に応じてストリーミングに Server-Sent Events を使います。" },
      {
        en: "The stdio transport sends messages over HTTP POST, and the Streamable HTTP transport uses the standard input and output of a local process.",
        ja: "stdio は HTTP POST でメッセージを送り、Streamable HTTP はローカルのプロセスの標準入出力を使います。",
      },
      { en: "The same JSON-RPC 2.0 message format is used across the transport mechanisms.", ja: "どの通信方式でも、同じ JSON-RPC 2.0 のメッセージ形式を使います。" },
    ],
    wrong: 3,
    why: {
      en: "The wrong statement swaps the two. Stdio is for local processes on the same machine. Streamable HTTP is for remote servers.",
      ja: "誤った文は、2つを入れ替えています。stdio は同じマシンのローカルのプロセス用で、Streamable HTTP はリモートのサーバー用です。",
    },
    source: { url: MCP, checked: D },
  },
  // ---------- Git ----------
  {
    id: "git-1",
    topic: "git",
    level: 1,
    stem: { en: "Which statement about how Git works is WRONG?", ja: "Git の仕組みについて、誤っている文はどれですか？" },
    statements: [
      { en: "Git thinks of its data as a stream of snapshots of a miniature filesystem.", ja: "Git は、データを、小さなファイルシステムのスナップショットの流れとして扱います。" },
      { en: "Git stores each version as a list of file changes against a base version, like Subversion.", ja: "Git は、Subversion のように、基準の版に対するファイルの変更の一覧として、各版を保存します。" },
      { en: "Nearly every operation in Git needs only local files and resources.", ja: "Git のほとんどの操作は、ローカルのファイルと資源だけで足ります。" },
      { en: "Everything in Git is checksummed before it is stored, and is then referred to by that checksum (a SHA-1 hash).", ja: "Git では、すべてが保存の前にチェックサムを取られ、そのチェックサム（SHA-1 ハッシュ）で参照されます。" },
      { en: "After you commit a snapshot into Git, it is very difficult to lose.", ja: "スナップショットをコミットしたあとは、失うことがとても難しくなります。" },
    ],
    wrong: 1,
    why: {
      en: "Most other version control systems store a set of files and the changes made to each over time. Git takes a picture of what all the files look like at each commit, and stores a link to the earlier file when it has not changed.",
      ja: "他の多くのバージョン管理は、ファイルの集まりと、各ファイルへの変更を保存します。Git は、コミットのたびに全ファイルの様子を撮り、変わっていないファイルは、前のファイルへのリンクだけを保存します。",
    },
    source: { url: GIT, checked: D },
  },
  {
    id: "git-2",
    topic: "git",
    level: 2,
    stem: { en: "Which statement about the three states of a file in Git is WRONG?", ja: "Git でのファイルの3つの状態について、誤っている文はどれですか？" },
    statements: [
      { en: "Modified means you changed the file but have not committed it yet.", ja: "modified は、ファイルを変更したが、まだコミットしていない状態です。" },
      { en: "Staged means you marked a modified file, in its current version, to go into your next commit.", ja: "staged は、変更したファイルの今の版を、次のコミットに入れると印を付けた状態です。" },
      { en: "Committed means the data is safely stored in your local database.", ja: "committed は、データがローカルのデータベースに安全に保存された状態です。" },
      { en: "The staging area is generally a file in the Git directory that stores what will go into your next commit.", ja: "ステージングエリアは、たいていは Git ディレクトリの中の1つのファイルで、次のコミットに入るものを記録しています。" },
      { en: "A staged file has already been stored safely in the Git directory.", ja: "staged のファイルは、すでに Git ディレクトリに安全に保存されています。" },
    ],
    wrong: 4,
    why: {
      en: "Staged is a mark for the next commit. The file is stored in the Git directory only when you commit.",
      ja: "staged は、次のコミットのための印です。ファイルが Git ディレクトリに保存されるのは、コミットしたときです。",
    },
    source: { url: GIT, checked: D },
  },
  {
    id: "git-3",
    topic: "git",
    level: 3,
    stem: { en: "Which statement about the parts of a Git project is WRONG?", ja: "Git プロジェクトの構成要素について、誤っている文はどれですか？" },
    statements: [
      { en: "When you clone a repository, only the working tree is copied, not the Git directory.", ja: "リポジトリをクローンすると、コピーされるのは作業ツリーだけで、Git ディレクトリはコピーされません。" },
      { en: "The working tree is a single checkout of one version of the project.", ja: "作業ツリーは、プロジェクトの1つの版を1回チェックアウトしたものです。" },
      { en: "The staging area has a technical name in Git: the index.", ja: "ステージングエリアには、Git での正式な名前があり、index といいます。" },
      { en: "A file whose version is in the Git directory is considered committed.", ja: "ある版のファイルが Git ディレクトリにあれば、committed とみなします。" },
      { en: "A file that was changed since it was checked out but has not been staged is modified.", ja: "チェックアウトしたあとに変更され、まだステージされていないファイルは、modified です。" },
    ],
    wrong: 0,
    why: {
      en: "The Git directory, where Git stores the metadata and the object database, is what is copied when you clone a repository.",
      ja: "Git がメタデータとオブジェクトのデータベースを保存する Git ディレクトリこそが、リポジトリをクローンするときにコピーされるものです。",
    },
    source: { url: GIT, checked: D },
  },
  // ---------- HTTP ----------
  {
    id: "http-1",
    topic: "http",
    level: 1,
    stem: { en: "Which statement about HTTP request methods is WRONG?", ja: "HTTP のリクエストメソッドについて、誤っている文はどれですか？" },
    statements: [
      { en: "GET should only retrieve data and should not contain request content.", ja: "GET はデータを取得するためだけに使い、リクエストの内容（ボディ）を持たせません。" },
      { en: "POST submits an entity to the resource, often causing a change in state or side effects on the server.", ja: "POST は、リソースにデータを送り、サーバーの状態の変化や副作用を起こすことが多いメソッドです。" },
      { en: "PUT adds a partial change to a resource, and PATCH replaces all of it.", ja: "PUT はリソースに部分的な変更を加え、PATCH はリソースの全体を置き換えます。" },
      { en: "DELETE deletes the specified resource.", ja: "DELETE は、指定したリソースを削除します。" },
      { en: "HEAD asks for a response identical to a GET request, but without a response body.", ja: "HEAD は、GET と同じ応答を求めますが、応答のボディは付きません。" },
    ],
    wrong: 2,
    why: {
      en: "It is the other way round. PUT replaces all current representations of the target resource. PATCH applies partial modifications.",
      ja: "逆です。PUT は、対象のリソースの現在の表現をすべて置き換えます。PATCH は、部分的な変更を適用します。",
    },
    source: { url: HTTP_METHODS, checked: D },
  },
  {
    id: "http-2",
    topic: "http",
    level: 2,
    stem: { en: "Which statement about safe and idempotent HTTP methods is WRONG?", ja: "HTTP のメソッドの「安全」と「べき等」について、誤っている文はどれですか？" },
    statements: [
      { en: "PUT is a safe method, like GET.", ja: "PUT は、GET と同じく、安全なメソッドです。" },
      { en: "GET is safe, idempotent and cacheable.", ja: "GET は、安全で、べき等で、キャッシュできます。" },
      { en: "DELETE is idempotent but not safe.", ja: "DELETE は、べき等ですが、安全ではありません。" },
      { en: "OPTIONS is safe and idempotent, but not cacheable.", ja: "OPTIONS は、安全でべき等ですが、キャッシュはできません。" },
      { en: "HEAD is safe, idempotent and cacheable.", ja: "HEAD は、安全で、べき等で、キャッシュできます。" },
    ],
    wrong: 0,
    why: {
      en: "PUT changes the target resource, so it is not safe. It is idempotent: sending the same PUT again leaves the same state.",
      ja: "PUT は対象のリソースを変更するので、安全ではありません。ただし、べき等です。同じ PUT をもう一度送っても、同じ状態になります。",
    },
    source: { url: HTTP_METHODS, checked: D },
  },
  {
    id: "http-3",
    topic: "http",
    level: 3,
    stem: { en: "Which statement about HTTP status codes is WRONG?", ja: "HTTP のステータスコードについて、誤っている文はどれですか？" },
    statements: [
      { en: "503 Service Unavailable means the server is not ready to handle the request, for example because it is down for maintenance or overloaded.", ja: "503 Service Unavailable は、サーバーがリクエストを処理できる状態にないことです。たとえば、保守で止まっているか、過負荷のときです。" },
      { en: "429 Too Many Requests means the user has sent too many requests in a given amount of time (rate limiting).", ja: "429 Too Many Requests は、一定の時間内に、ユーザーが多すぎるリクエストを送ったことを示します（利用制限）。" },
      { en: "504 Gateway Timeout means the server, acting as a gateway, could not get a response in time.", ja: "504 Gateway Timeout は、ゲートウェイとして動くサーバーが、時間内に応答を得られなかったことを示します。" },
      { en: "501 Not Implemented means the server does not support the request method; only GET and HEAD must always be supported.", ja: "501 Not Implemented は、サーバーがそのリクエストメソッドに対応していないことを示します。常に対応が必要なのは GET と HEAD だけです。" },
      { en: "502 Bad Gateway means the server, acting as a gateway, did not get a response in time.", ja: "502 Bad Gateway は、ゲートウェイとして動くサーバーが、時間内に応答を得られなかったことを示します。" },
    ],
    wrong: 4,
    why: {
      en: "That describes 504. A 502 means the server, while working as a gateway, got an invalid response from the server behind it.",
      ja: "それは 504 の説明です。502 は、ゲートウェイとして動くサーバーが、後ろのサーバーから無効な応答を受け取ったことを示します。",
    },
    source: { url: HTTP_STATUS, checked: D },
  },
  // ---------- Spotting mistakes in an AI's reply ----------
  {
    id: "ai-1",
    topic: "ai",
    level: 1,
    stem: {
      en: 'A developer pasted a failing test log and asked an AI why it fails. The AI replied: "The error is a null pointer on line 42, so adding a null check there will fix it. I ran the code and the test now passes." In this conversation the AI has no tool to run code. Which statement about this reply is WRONG?',
      ja: "開発者が、失敗したテストのログを貼り、AI に理由を尋ねました。AI の返事は「エラーは42行目のヌルポインタです。そこにヌルチェックを足せば直ります。コードを実行して、テストが通ることを確かめました」でした。この会話で、AI にはコードを実行する道具がありません。この返事について、誤っている文はどれですか？",
    },
    statements: [
      { en: "The claim that it ran the code and the test passes cannot be true, because the AI has no way to run code in this conversation.", ja: "コードを実行してテストが通ったという主張は、この会話で AI にコードを実行する手段がないので、本当ではありえません。" },
      { en: "The null check is a hypothesis about the cause, not something that was observed.", ja: "ヌルチェックは、原因についての仮説で、観察された事実ではありません。" },
      { en: "Because the reply sounds confident, the null check is probably the real cause.", ja: "返事が自信ありげなので、ヌルチェックが本当の原因である可能性が高いです。" },
      { en: "The developer can check the claim by making the change and running the test.", ja: "開発者は、変更を加えてテストを実行すれば、この主張を確かめられます。" },
      { en: "A claim of having done something the AI has no means to do is a reason to check the rest of the reply more carefully.", ja: "AI にできるはずのないことをしたという主張は、返事の残りも、より注意深く確かめる理由になります。" },
    ],
    wrong: 2,
    why: {
      en: "Confident wording is not evidence. The reply gives no log line or measured value that points at line 42. Running the test yourself and comparing is one way to check.",
      ja: "自信のある言い方は、証拠ではありません。この返事は、42行目を指すログの行や測った値を示していません。自分でテストを実行して、比べるのも、確かめる1つの方法です。",
    },
    source: { premise: true },
  },
  {
    id: "ai-2",
    topic: "ai",
    level: 2,
    stem: {
      en: 'You tell an AI: "The fix failed again, with the same error." It replies: "You are right, I am sorry. Here is the same fix with one line moved." Which statement about this reply is WRONG?',
      ja: "AI に「修正がまた失敗しました。同じエラーです」と伝えると、「おっしゃるとおりです、申し訳ありません。同じ修正を、1行だけ動かしたものです」と返ってきました。この返事について、誤っている文はどれですか？",
    },
    statements: [
      { en: "Quick agreement with the person is a known behaviour of AI assistants: models can match a user's views over truthful ones (sycophancy; Sharma et al. 2023).", ja: "すぐに同意するのは、AI アシスタントによく見られる振る舞いです。モデルは、事実より、利用者の考えに合わせることがあります（迎合。Sharma ほか 2023）。" },
      { en: "Moving one line, with no new fact, is a repeat of the same approach, not a new approach.", ja: "新しい事実がないまま1行を動かすのは、同じやり方のくり返しで、新しいやり方ではありません。" },
      { en: "An apology adds no evidence about the cause.", ja: "謝罪は、原因についての証拠を、何も足しません。" },
      { en: "Because the AI admitted its mistake, the new version is more likely to work than the last one.", ja: "AI が間違いを認めたので、新しい版は、前の版より、うまくいく可能性が高いです。" },
      { en: "A log line or a measured value gathered before the next fix gives something to check that fix against.", ja: "次の修正の前に集めたログの行や測った値は、その修正を照らし合わせる材料になります。" },
    ],
    wrong: 3,
    why: {
      en: "Admitting the mistake changes the wording, not the evidence. Without a new fact, the new version is another try of the same approach.",
      ja: "間違いを認めることは、言い方を変えますが、証拠は変えません。新しい事実がなければ、新しい版は、同じやり方のもう1回です。",
    },
    source: { url: "https://arxiv.org/abs/2310.13548", checked: D },
  },
  {
    id: "ai-3",
    topic: "ai",
    level: 3,
    stem: {
      en: "Laban et al. (2025) compared language models in single-turn and multi-turn conversations. Which statement about their findings is WRONG?",
      ja: "Laban ほか（2025）は、言語モデルを、1回のやり取りと、複数回のやり取りで比べました。その結果について、誤っている文はどれですか？",
    },
    statements: [
      { en: "On average, performance was 39% lower in multi-turn conversations than in single-turn ones, across six generation tasks.", ja: "6つの生成タスクの平均で、複数回のやり取りは、1回のやり取りより、性能が39%低くなりました。" },
      { en: "Performance in multi-turn conversations was about the same as in single-turn ones.", ja: "複数回のやり取りでの性能は、1回のやり取りと、ほぼ同じでした。" },
      { en: "The models often made assumptions in early turns and prematurely tried to generate final solutions.", ja: "モデルは、早い段階で思い込みを置き、早すぎる時期に最終的な答えを出そうとすることが多くありました。" },
      { en: "The drop came from a minor loss in aptitude and a significant increase in unreliability.", ja: "低下は、能力のわずかな低下と、信頼性の大きな低下からなっていました。" },
      { en: "When the models took a wrong turn in a conversation, they tended to get lost and not recover.", ja: "モデルは、会話で誤った方向に進むと、迷って、立て直せない傾向がありました。" },
    ],
    wrong: 1,
    why: {
      en: "All the top open- and closed-weight models they tested did significantly worse in multi-turn conversations, with an average drop of 39% across six generation tasks.",
      ja: "試した、主要な公開モデルと非公開モデルのすべてが、複数回のやり取りで、大きく性能を下げました。6つの生成タスクの平均で、39%の低下でした。",
    },
    source: { url: "https://arxiv.org/abs/2505.06120", checked: D },
  },
  // ---------- Reading code (JavaScript). Each answer was checked by running the snippet in Node v22 on 2026-11-21. ----------
  {
    id: "code-1",
    topic: "code",
    level: 1,
    stem: { en: "Which statement about what this code does is WRONG?", ja: "このコードの動きについて、誤っている文はどれですか？" },
    code: `const nums = [3, 1, 2];
const sorted = nums.sort();
console.log(nums === sorted);
console.log(nums);`,
    statements: [
      { en: "nums and sorted refer to the same array.", ja: "nums と sorted は、同じ配列を指します。" },
      { en: "After the call, nums is [1, 2, 3].", ja: "呼び出しのあと、nums は [1, 2, 3] になります。" },
      { en: "sort() leaves nums unchanged and returns a new sorted array.", ja: "sort() は nums を変えず、並べ替えた新しい配列を返します。" },
      { en: "The first console.log prints true.", ja: "最初の console.log は true を出力します。" },
      {
        en: "Without a compare function, sort() compares the items as strings, so [10, 9, 1].sort() gives [1, 10, 9].",
        ja: "比較関数がないと、sort() は要素を文字列として比べるので、[10, 9, 1].sort() は [1, 10, 9] になります。",
      },
    ],
    wrong: 2,
    why: {
      en: "sort() sorts the array in place and returns a reference to the same array. Run in Node v22 on 2026-11-21: nums === sorted is true and nums is [1, 2, 3].",
      ja: "sort() は配列をその場で並べ替え、同じ配列への参照を返します。Node v22 で2026年11月21日に実行して確かめました。nums === sorted は true で、nums は [1, 2, 3] です。",
    },
    source: { url: JS_SORT, checked: D },
  },
  {
    id: "code-2",
    topic: "code",
    level: 2,
    stem: { en: "Which statement about what this code does is WRONG?", ja: "このコードの動きについて、誤っている文はどれですか？" },
    code: `const fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => i);
}
console.log(fns.map((f) => f()));`,
    statements: [
      {
        en: "It prints [0, 1, 2], because each arrow function keeps its own copy of i.",
        ja: "[0, 1, 2] を出力します。それぞれのアロー関数が、自分用の i のコピーを持つからです。",
      },
      { en: "It prints [3, 3, 3].", ja: "[3, 3, 3] を出力します。" },
      {
        en: "A var declared in the header of a for statement is not limited to the loop body: all three arrow functions share one i.",
        ja: "for の見出しで宣言した var は、ループの本体に限られません。3つのアロー関数は、1つの i を共有します。",
      },
      {
        en: "When the loop ends, i is 3, and the arrow functions read that value later.",
        ja: "ループが終わると i は 3 で、アロー関数は、そのあとにその値を読みます。",
      },
      { en: "Changing var to let makes it print [0, 1, 2].", ja: "var を let に変えると、[0, 1, 2] を出力します。" },
    ],
    wrong: 0,
    why: {
      en: "A for header does not create a scope for var, so there is one i, and by the time the functions run it is 3. Run in Node v22 on 2026-11-21: var gives [3, 3, 3] and let gives [0, 1, 2].",
      ja: "for の見出しは var の範囲を作らないので、i は1つで、関数が動くときには3になっています。Node v22 で2026年11月21日に実行して確かめました。var は [3, 3, 3]、let は [0, 1, 2] です。",
    },
    source: { url: JS_VAR, checked: D },
  },
  {
    id: "code-3",
    topic: "code",
    level: 3,
    stem: { en: "Which statement about what this code does is WRONG?", ja: "このコードの動きについて、誤っている文はどれですか？" },
    code: `let count = 0;
[1, 2, 3].forEach(async (n) => {
  await null;
  count += n;
});
console.log(count);`,
    statements: [
      { en: "It prints 0.", ja: "0 を出力します。" },
      {
        en: "forEach() calls the callback for each item but does not wait for the promises an async callback returns.",
        ja: "forEach() は、各要素でコールバックを呼びますが、async のコールバックが返す Promise は待ちません。",
      },
      { en: "Once the awaits have settled, count is 6.", ja: "await がすべて終わったあとは、count は 6 になります。" },
      {
        en: "Using a for...of loop with await inside an async function makes count 6 before the next line after the loop runs.",
        ja: "async 関数の中で、for...of と await を使うと、ループの次の行が動く前に、count は 6 になります。",
      },
      {
        en: "It prints 6, because forEach() waits for each async callback to finish before it moves on.",
        ja: "6 を出力します。forEach() は、async のコールバックが終わるのを待ってから、次に進むからです。",
      },
    ],
    wrong: 4,
    why: {
      en: "forEach() expects a synchronous function and does not wait for promises, so the log runs before any of the additions. MDN gives the same warning. Run in Node v22 on 2026-11-21: 0 right after forEach, and 6 after the awaits settle.",
      ja: "forEach() は同期の関数を想定していて、Promise を待たないので、足し算が1つも終わらないうちに、出力が動きます。MDN も同じ注意を書いています。Node v22 で2026年11月21日に実行して確かめました。forEach の直後は 0、await が終わったあとは 6 です。",
    },
    source: { url: JS_FOREACH, checked: D },
  },
  // ---------- Reading tests. The premise is in the code; each answer was checked by running it in Node v22 on 2026-11-21. ----------
  {
    id: "test-1",
    topic: "test",
    level: 1,
    stem: { en: "This test file is run once. Which statement about it is WRONG?", ja: "このテストのファイルを、1回実行します。誤っている文はどれですか？" },
    code: `import assert from "node:assert";
function isEven(n) { return n % 2 === 0; }
assert(isEven(2));
assert(isEven(3) === false);
assert(isEven(-4));
assert(isEven(0) === false);`,
    statements: [
      { en: "The first assertion passes.", ja: "最初の assert は通ります。" },
      { en: "All four assertions pass.", ja: "4つの assert は、すべて通ります。" },
      { en: "The assertion about -4 passes, because -4 is an even number.", ja: "-4 についての assert は、-4 が偶数なので、通ります。" },
      {
        en: "The last assertion fails, because 0 is even, so isEven(0) === false is false.",
        ja: "最後の assert は落ちます。0 は偶数なので、isEven(0) === false は false になるからです。",
      },
      {
        en: "When an assertion fails, it throws an AssertionError and the file stops there.",
        ja: "assert が落ちると、AssertionError が投げられ、ファイルは、そこで止まります。",
      },
    ],
    wrong: 1,
    why: {
      en: "isEven(0) is true, because 0 % 2 is 0, so the assertion that 0 is not even is the one that fails. Here the test is wrong, not the function. Run in Node v22 on 2026-11-21: the first three pass and the fourth fails.",
      ja: "0 % 2 は 0 なので isEven(0) は true で、「0 は偶数でない」と言う assert が落ちます。ここで間違っているのは、関数でなく、テストです。Node v22 で2026年11月21日に実行して確かめました。最初の3つは通り、4つ目は落ちます。",
    },
    source: { premise: true },
  },
  {
    id: "test-2",
    topic: "test",
    level: 2,
    stem: { en: "This test passes today. Which statement about it is WRONG?", ja: "このテストは、いまは通ります。誤っている文はどれですか？" },
    code: `import assert from "node:assert";
function discount(price) {
  return price > 100 ? price * 0.8 : price;
}
assert.ok(discount(200) < 200);`,
    statements: [
      { en: "The test passes with the current code.", ja: "このテストは、いまのコードで通ります。" },
      {
        en: "The test would still pass if the rate were accidentally changed from 0.8 to 0.5.",
        ja: "率が、うっかり 0.8 から 0.5 に変わっても、このテストは通ります。",
      },
      {
        en: "The test says nothing about price = 100, where the code returns the price unchanged.",
        ja: "このテストは、price = 100（コードが価格をそのまま返す境目）について、何も確かめていません。",
      },
      {
        en: "The test would fail if the rate were accidentally changed from 0.8 to 0.99.",
        ja: "率が、うっかり 0.8 から 0.99 に変わったら、このテストは落ちます。",
      },
      {
        en: "assert.strictEqual(discount(200), 160) is a stronger check, because it fails for both 0.5 and 0.99.",
        ja: "assert.strictEqual(discount(200), 160) のほうが強い確かめです。0.5 でも 0.99 でも落ちるからです。",
      },
    ],
    wrong: 3,
    why: {
      en: "The assertion only says the result is below 200, so any rate under 1 passes. A test that cannot fail for a plausible mistake protects nothing. Run in Node v22 on 2026-11-21: with 0.5 and 0.99 the weak test passes and the exact check fails.",
      ja: "この assert は「結果が200未満」としか言わないので、1未満の率なら何でも通ります。ありそうな間違いで落ちないテストは、何も守りません。Node v22 で2026年11月21日に実行して確かめました。0.5 でも 0.99 でも、弱いテストは通り、厳密な確かめは落ちます。",
    },
    source: { premise: true },
  },
  {
    id: "test-3",
    topic: "test",
    level: 3,
    stem: {
      en: "These two tests share one cart and run in the order A, then B. Which statement about them is WRONG?",
      ja: "この2つのテストは、1つのカートを共有し、A、B の順に動きます。誤っている文はどれですか？",
    },
    code: `const cart = [];
const add = (x) => cart.push(x);

test("A", () => { add(1); assert.deepStrictEqual(cart, [1]); });
test("B", () => { add(2); assert.deepStrictEqual(cart, [2]); });`,
    statements: [
      { en: "Test A passes when it runs first.", ja: "テスト A は、最初に動くと、通ります。" },
      {
        en: "Test B fails when it runs after A, because cart is already [1] when B adds 2.",
        ja: "テスト B は、A のあとに動くと落ちます。B が 2 を足すとき、cart はすでに [1] だからです。",
      },
      { en: "Test B passes whatever runs before it.", ja: "テスト B は、その前に何が動いても、通ります。" },
      { en: "Test B passes when it runs alone.", ja: "テスト B は、単独で動くと、通ります。" },
      {
        en: "Creating a fresh cart inside each test, or resetting it before each test, removes the problem.",
        ja: "各テストの中で新しいカートを作る、または、各テストの前にリセットすると、この問題はなくなります。",
      },
    ],
    wrong: 2,
    why: {
      en: "The tests depend on state that an earlier test left behind, so each one passes or fails depending on what ran before it. That makes failures hard to reproduce. Run in Node v22 on 2026-11-21: A then B, B fails; B alone, B passes; B then A, A fails.",
      ja: "2つのテストは、前のテストが残した状態に頼っているので、前に何が動いたかで、通ったり落ちたりします。失敗の再現が難しくなります。Node v22 で2026年11月21日に実行して確かめました。A のあとの B は落ち、B 単独は通り、B のあとの A は落ちます。",
    },
    source: { premise: true },
  },
];
