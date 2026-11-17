import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Checks .kiro configuration against names read from the IDE itself (extension schema, 2026-11-17).
 * It cannot prove the IDE loads a file; the IDE log can ("not a recognized name", "failed schema validation").
 */
const TRIGGERS = new Set([
  "SessionStart", "SessionEnd", "Stop", "SubagentStop", "PreToolUse", "PermissionRequest", "PostToolUse",
  "PreTaskExec", "PostTaskExec", "PreCompact", "PostCompact", "UserPromptSubmit",
  "PostFileCreate", "PostFileSave", "PostFileDelete", "Manual",
]);
const AGENT_FIELDS = new Set([
  "name", "description", "prompt", "tools", "excludedTools", "model", "effortLevel", "includeMcpJson",
  "includePowers", "mcpServers", "resources", "permissions", "welcomeMessage", "dispatchKind", "hooks",
]);
const LEGACY_AGENT_FIELDS = new Set(["allowedTools", "toolsSettings", "toolAliases", "keyboardShortcut"]);

const problems: string[] = [];
const bad = (file: string, msg: string) => problems.push(`${file}: ${msg}`);

function readJson(path: string): any | undefined {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    bad(path, `not valid JSON (${(e as Error).message})`);
    return undefined;
  }
}

// hooks
for (const f of readdirSync(".kiro/hooks").filter((x) => x.endsWith(".json"))) {
  const path = join(".kiro/hooks", f);
  const doc = readJson(path);
  if (!doc) continue;
  if (doc.version !== "v1") bad(path, `version should be "v1"`);
  if (!Array.isArray(doc.hooks) || doc.hooks.length === 0) bad(path, "hooks must be a non-empty array");
  for (const h of doc.hooks ?? []) {
    if (!h.name) bad(path, "hook without name");
    if (!TRIGGERS.has(h.trigger)) bad(path, `trigger "${h.trigger}" is not a recognized name`);
    const t = h.action?.type;
    if (t !== "command" && t !== "agent") bad(path, `action.type "${t}" must be command or agent`);
    if (t === "command" && !h.action.command) bad(path, "command action without command");
    if (t === "agent" && !h.action.prompt) bad(path, "agent action without prompt");
    if (h.matcher !== undefined) {
      try { new RegExp(h.matcher); } catch (e) { bad(path, `matcher is not a valid regex (${(e as Error).message})`); }
    }
  }
}

// agents
for (const f of readdirSync(".kiro/agents").filter((x) => x.endsWith(".json"))) {
  const path = join(".kiro/agents", f);
  const doc = readJson(path);
  if (!doc) continue;
  for (const key of Object.keys(doc)) {
    if (LEGACY_AGENT_FIELDS.has(key)) bad(path, `"${key}" is a CLI 2.x field, not part of the current schema`);
    else if (!AGENT_FIELDS.has(key)) bad(path, `"${key}" is not in the agent schema`);
  }
  const tools: string[] = Array.isArray(doc.tools) ? doc.tools : [];
  const usesMcp = tools.some((x) => x.startsWith("@") && x !== "@builtin");
  if (usesMcp && doc.includeMcpJson !== true && !doc.mcpServers) bad(path, "uses MCP tools but neither includeMcpJson nor mcpServers is set");
}

// mcp.json
const mcp = readJson(".kiro/settings/mcp.json");
if (mcp) {
  for (const [name, s] of Object.entries<any>(mcp.mcpServers ?? {})) {
    if (!s.command && !s.url) bad(".kiro/settings/mcp.json", `server ${name} has neither command nor url`);
  }
}

console.log(problems.length ? problems.join("\n") : "kiro config: no problems found");
process.exitCode = problems.length ? 1 : 0;
