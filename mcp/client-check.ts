import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

/** Starts the real server over stdio and calls every tool once. Exit code 1 on any failure. */
const transport = new StdioClientTransport({ command: "npx", args: ["tsx", "mcp/server.ts"], stderr: "inherit" });
const client = new Client({ name: "check", version: "0.0.0" });
const text = (r: any) => r.content?.[0]?.text as string;

async function main() {
  await client.connect(transport);
  const tools = (await client.listTools()).tools.map((t) => t.name).sort();
  const want = ["diagnose", "explain", "list_packs", "next_question"];
  if (JSON.stringify(tools) !== JSON.stringify(want)) throw new Error(`tools: ${tools}`);

  const q = JSON.parse(text(await client.callTool({ name: "next_question", arguments: { pack: "devstuck", answers: [] } })));
  if (!q.question?.id) throw new Error("no question");
  const answers = [{ qid: q.question.id, answer: "yes" }];
  const d = JSON.parse(text(await client.callTool({ name: "diagnose", arguments: { answers } })));
  if (!d.needs?.length) throw new Error("no needs");
  const e = JSON.parse(text(await client.callTool({ name: "explain", arguments: { answers, need: d.needs[0].id } })));
  if (e.how?.length !== 1) throw new Error("explain");
  const bad = await client.callTool({ name: "next_question", arguments: { pack: "nope" } });
  if (!bad.isError) throw new Error("bad input was not an error");
  console.log("mcp ok:", tools.join(", "), "| first probe:", q.question.text);
}
main().catch((err) => {
  console.error("mcp check failed:", err);
  process.exitCode = 1;
}).finally(() => client.close());

