import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { diagnose, explain, listPacks, nextQuestion, type ToolResult } from "./tools";

const answers = z
  .array(z.object({ qid: z.string(), answer: z.string() }))
  .default([])
  .describe("All answers so far. The server keeps no state. answer: yes | probably | unknown | probablyNot | no");
const base = {
  pack: z.string().default("devstuck").describe("Pack id from list_packs"),
  answers,
  stated: z.string().nullable().optional().describe("Solution id the person asked for first, if any"),
};

const reply = (r: ToolResult) =>
  r.ok
    ? { content: [{ type: "text" as const, text: JSON.stringify(r.data, null, 2) }] }
    : { isError: true, content: [{ type: "text" as const, text: r.error }] };

const server = new McpServer({ name: "atamagazon", version: "0.1.0" });

server.tool("list_packs", "List the shelves (packs), their needs, moves and the answer scale.", {}, async () =>
  reply(listPacks()),
);
server.tool(
  "next_question",
  "Pick the next probe by expected information gain per cost, or report why to stop. Ask the person this exact question, then call again with the answer added.",
  base,
  async (a) => reply(nextQuestion(a)),
);
server.tool(
  "diagnose",
  "Rank the likely stalls and the next moves with sources and status (done, blocked, next). Call when next_question reports a stop reason.",
  base,
  async (a) => reply(diagnose(a)),
);
server.tool(
  "explain",
  "HOW (which answers moved one need) and WHY (why the next probe is asked) for one need.",
  { ...base, need: z.string().describe("Need id from list_packs") },
  async (a) => reply(explain(a)),
);

void server.connect(new StdioServerTransport());

