// Zero-dependency Model Context Protocol (MCP) stdio server (JSON-RPC 2.0).
// Supports --no-spend credit guard (inspired by gflow-cli) to expose only zero-cost tools when desired.
import readline from "node:readline";
import { PRESETS, buildProfessionalPrompt } from "./presets.mjs";
import { searchCatalog } from "./catalog.mjs";

export const MCP_PROTOCOL_VERSION = "2024-11-05";

/**
 * Return the list of MCP tools. When noSpend is true, credit-consuming tools are omitted.
 */
export function getMcpTools({ noSpend = false } = {}) {
  const freeTools = [
    {
      name: "flowmusic_presets",
      description: "List all 24 professional music presets across 9 categories (Ceremony, Cinematic, Corporate, Electronic, Lo-Fi, Pop/R&B, Rock, Jazz/Funk, World/Guofeng/Game).",
      inputSchema: {
        type: "object",
        properties: {
          category: { type: "string", description: "Optional category filter" },
        },
      },
    },
    {
      name: "flowmusic_expand_prompt",
      description: "Rewrite and expand a brief or Chinese/English music idea into a professional 6-Component Lyria prompt (zero credits).",
      inputSchema: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "Raw music description or keywords" },
          preset: { type: "string", description: "Optional preset key (e.g. entrance-epic, lofi-study, guofeng-epic)" },
          bpm: { type: "number", description: "Optional target BPM" },
          loop: { type: "number", description: "Optional seamless loop target seconds" },
        },
        required: ["prompt"],
      },
    },
    {
      name: "flowmusic_loop",
      description: "Create a lossless seamless single-track loop (equal-power crossfade + auto-peak detection) from a clip ID or local WAV file (zero credits).",
      inputSchema: {
        type: "object",
        properties: {
          target: { type: "string", description: "Clip ID or path to local WAV file" },
          length: { type: "number", description: "Loop duration in seconds (default 15)" },
          start: { type: "number", description: "Explicit start second (omit to use autoPeak)" },
          autoPeak: { type: "boolean", description: "Automatically find the highest-energy climax segment (default true)" },
          crossfade: { type: "number", description: "Equal-power crossfade duration in seconds (default 1.5)" },
          demo: { type: "number", description: "Also render a continuous N-loop demo MP3 (e.g. 3)" },
        },
        required: ["target"],
      },
    },
    {
      name: "flowmusic_history",
      description: "Search or list locally recorded music generations and audio files from the offline catalog (zero credits).",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search keyword (title, prompt, preset, clip_id)" },
          limit: { type: "number", description: "Max results (default 20)" },
        },
      },
    },
    {
      name: "flowmusic_credits",
      description: "Check remaining FlowMusic account credits and tokens (zero credits).",
      inputSchema: { type: "object", properties: {} },
    },
  ];

  if (noSpend) return freeTools;

  const spendTools = [
    {
      name: "flowmusic_generate",
      description: "Generate a new song on FlowMusic (Lyria 3.5 / Lyria 3 Pro), optionally applying a preset, 6-component prompt expansion, and seamless loop post-processing.",
      inputSchema: {
        type: "object",
        properties: {
          prompt: { type: "string", description: "Music style/description" },
          preset: { type: "string", description: "Preset name (e.g. entrance-epic, cinematic-epic, lofi-study, guofeng-epic)" },
          expand: { type: "boolean", description: "Expand prompt using the 6-Component Sonic Formula" },
          instrumental: { type: "boolean", description: "Generate instrumental music without vocals" },
          lyrics: { type: "string", description: "Custom lyrics text" },
          title: { type: "string", description: "Track title" },
          bpm: { type: "number", description: "Target BPM" },
          length: { type: "number", description: "Target length in seconds" },
          loop: { type: "number", description: "Automatically slice a seamless N-second loop after generation" },
          autoPeak: { type: "boolean", description: "When loop is set, auto-locate the highest energy climax" },
          demo: { type: "number", description: "When loop is set, also export an N-repeat demo MP3" },
        },
        required: ["prompt"],
      },
    },
  ];

  return [...spendTools, ...freeTools];
}

/**
 * Handle a single JSON-RPC 2.0 request object and return a response object (or null for notifications).
 */
export async function handleMcpRequest(req, c, { noSpend = false } = {}) {
  if (!req || typeof req !== "object") return null;
  const { id, method, params = {} } = req;

  // Notifications have no id
  if (id === undefined) return null;

  const ok = (result) => ({ jsonrpc: "2.0", id, result });
  const err = (code, message) => ({ jsonrpc: "2.0", id, error: { code, message } });

  try {
    if (method === "initialize") {
      return ok({
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: { tools: {} },
        serverInfo: { name: "flowmusic-cli", version: "0.4.0" },
      });
    }
    if (method === "ping") return ok({});
    if (method === "tools/list") {
      return ok({ tools: getMcpTools({ noSpend }) });
    }
    if (method === "tools/call") {
      const { name, arguments: args = {} } = params;
      const tools = getMcpTools({ noSpend });
      if (!tools.some((t) => t.name === name)) {
        return err(-32601, noSpend ? `Tool "${name}" is disabled (--no-spend mode active)` : `Unknown tool "${name}"`);
      }

      let data;
      if (name === "flowmusic_presets") {
        const list = Object.entries(PRESETS)
          .filter(([, v]) => !args.category || v.category.toLowerCase().includes(args.category.toLowerCase()))
          .map(([k, v]) => ({ preset: k, ...v }));
        data = list;
      } else if (name === "flowmusic_expand_prompt") {
        data = buildProfessionalPrompt({
          prompt: args.prompt,
          preset: args.preset,
          expand: true,
          bpm: args.bpm,
          loop: args.loop,
        });
      } else if (name === "flowmusic_history") {
        data = searchCatalog(args.query || "", args.limit || 20);
      } else if (name === "flowmusic_credits") {
        data = (await c.f.get("/billing/credits")).data;
      } else if (name === "flowmusic_loop") {
        data = await c.runLoopTask(args.target, {
          loopSec: args.length || 15,
          startSec: args.start,
          autoPeak: args.autoPeak ?? true,
          crossfadeSec: args.crossfade || 1.5,
          demoCount: args.demo || 0,
        });
      } else if (name === "flowmusic_generate") {
        data = await c.createSong({
          prompt: args.prompt,
          preset: args.preset,
          expand: args.expand ?? true,
          instrumental: args.instrumental,
          lyrics: args.lyrics,
          title: args.title,
          bpm: args.bpm,
          length: args.length,
          loop: args.loop,
          "auto-peak": args.autoPeak ?? true,
          demo: args.demo,
        }, { quiet: true });
      }

      return ok({
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      });
    }

    return err(-32601, `Method not found: ${method}`);
  } catch (e) {
    return ok({
      isError: true,
      content: [{ type: "text", text: `Error: ${e.message}` }],
    });
  }
}

/**
 * Start the stdio JSON-RPC loop for MCP clients (Claude Code, Cursor, Antigravity, etc.).
 */
export async function startMcpServer(c, { noSpend = false } = {}) {
  const rl = readline.createInterface({ input: process.stdin, terminal: false });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const req = JSON.parse(trimmed);
      const res = await handleMcpRequest(req, c, { noSpend });
      if (res) process.stdout.write(JSON.stringify(res) + "\n");
    } catch (e) {
      process.stdout.write(JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: `Parse error: ${e.message}` },
      }) + "\n");
    }
  }
}
