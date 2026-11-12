import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { PRESETS, sanitizeMusicPrompt, analyzePromptComponents, buildProfessionalPrompt, formatPresetsList } from "../src/lib/presets.mjs";
import { parseWav, encodeWav, findPeakWindow, createSeamlessLoop, trimWavLocal } from "../src/lib/audio.mjs";
import { recordCatalog, loadCatalog, searchCatalog, findCatalogClip, batchSpecHash, saveBatchLedgerEntry, getCompletedBatchEntry } from "../src/lib/catalog.mjs";
import { handleMcpRequest, getMcpTools } from "../src/lib/mcp.mjs";

test("PRESETS library has 24 complete professional presets across 9 categories", () => {
  const keys = Object.keys(PRESETS);
  assert.ok(keys.length >= 24, `expected >= 24 presets, got ${keys.length}`);
  const categories = new Set();
  for (const [k, p] of Object.entries(PRESETS)) {
    categories.add(p.category);
    assert.ok(p.title && p.genre && p.mood && p.instruments && p.rhythm && p.production, `preset ${k} missing fields`);
    assert.equal(typeof p.bpm, "number");
  }
  assert.equal(categories.size, 9);
  assert.match(formatPresetsList("Ceremony"), /entrance-epic/);
});

test("sanitizeMusicPrompt removes banned anti-patterns and translates Chinese concepts", () => {
  const dirty = "Please make a song about 领导登场, best quality, 320kbps, masterpiece, guitars and drums";
  const clean = sanitizeMusicPrompt(dirty);
  assert.doesNotMatch(clean, /best quality|320kbps|masterpiece|Please make/i);
  assert.match(clean, /triumphant .* orchestral entrance fanfare/i);
  assert.match(clean, /articulate acoustic\/electric guitars/i);
});

test("buildProfessionalPrompt applies 6-Component Sonic Formula and presets", () => {
  const p1 = buildProfessionalPrompt({ prompt: "lofi study", expand: true });
  const comp = analyzePromptComponents(p1.prompt);
  assert.ok(comp.hasGenre && comp.hasMood && comp.hasInstruments && comp.hasRhythm && comp.hasProduction);
  assert.equal(p1.bpm, 82);

  const p2 = buildProfessionalPrompt({ prompt: "custom brass lead", preset: "entrance-epic", loop: 15 });
  assert.equal(p2.bpm, 128);
  assert.equal(p2.instrumental, true);
  assert.match(p2.prompt, /triumphant ceremonial orchestral anthem/i);
  assert.match(p2.prompt, /custom brass lead/);
  assert.match(p2.prompt, /seamless looping/);
});

test("WAV encode/parse round-trip, findPeakWindow, createSeamlessLoop, and trimWavLocal", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gfmusic-audio-"));
  try {
    const sampleRate = 8000;
    const numChannels = 2;
    const totalSec = 10;
    const totalFrames = sampleRate * totalSec;
    const samples = new Int16Array(totalFrames * numChannels);

    // 0-3s quiet (amp 500), 3-7s loud climax (amp 20000), 7-10s quiet (amp 500)
    for (let f = 0; f < totalFrames; f++) {
      const t = f / sampleRate;
      const amp = t >= 3 && t <= 7 ? 20000 : 500;
      const val = Math.round(amp * Math.sin(2 * Math.PI * 440 * t));
      samples[f * 2] = val;
      samples[f * 2 + 1] = val;
    }

    const srcWav = path.join(tmpDir, "source.wav");
    fs.writeFileSync(srcWav, encodeWav(samples, { numChannels, sampleRate }));

    const parsed = parseWav(fs.readFileSync(srcWav));
    assert.equal(parsed.sampleRate, sampleRate);
    assert.equal(parsed.numChannels, numChannels);
    assert.equal(parsed.totalFrames, totalFrames);

    const peak = findPeakWindow(parsed, 3.0, 0.5);
    assert.ok(peak.startSec >= 2.5 && peak.startSec <= 4.5, `expected peak around 3s, got ${peak.startSec}s`);

    const loopWav = path.join(tmpDir, "loop.wav");
    const loopRes = createSeamlessLoop(srcWav, loopWav, {
      loopSec: 3,
      autoPeak: true,
      crossfadeSec: 0.5,
      exportMp3: false,
    });
    assert.equal(loopRes.duration, 3);
    const loopParsed = parseWav(fs.readFileSync(loopWav));
    assert.equal(loopParsed.totalFrames, 3 * sampleRate);
    // Edge smoothing guarantees zero at exact start boundary
    assert.equal(loopParsed.samples[0], 0);

    const trimWav = path.join(tmpDir, "trim.wav");
    const trimRes = trimWavLocal(srcWav, trimWav, { startSec: 1, endSec: 4, exportMp3: false });
    assert.equal(trimRes.duration, 3);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test("Local Catalog (JSONL) & Batch Idempotency Ledger", () => {
  const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), "gfmusic-home-"));
  const prevHome = process.env.FLOWMUSIC_HOME;
  process.env.FLOWMUSIC_HOME = tmpHome;
  try {
    recordCatalog({ op: "gen", clip_id: "11112222-3333", title: "Epic Ceremony", preset: "entrance-epic", file: "out/a.wav", duration: 60 });
    recordCatalog({ op: "loop", clip_id: "11112222-3333", title: "Epic Ceremony (15s loop)", file: "out/a-loop.wav", duration: 15 });
    recordCatalog({ op: "gen", clip_id: "99998888-7777", title: "Cozy Cafe", preset: "lofi-study", file: "out/b.wav", duration: 120 });

    const all = loadCatalog();
    assert.equal(all.length, 2); // deduplicated by clip_id, files merged
    const hit = findCatalogClip("11112222");
    assert.ok(hit);
    assert.deepEqual(hit.files, ["out/a.wav", "out/a-loop.wav"]);

    const searchRes = searchCatalog("lofi-study");
    assert.equal(searchRes.length, 1);
    assert.equal(searchRes[0].clip_id, "99998888-7777");

    // Batch ledger test
    const spec = { prompt: "heroic entrance", preset: "entrance-epic", loop: 15 };
    const hash = batchSpecHash(spec);
    assert.equal(getCompletedBatchEntry(hash), null);
    saveBatchLedgerEntry(hash, spec, [{ clip_id: "11112222-3333", title: "Heroic" }]);
    const cached = getCompletedBatchEntry(hash);
    assert.ok(cached);
    assert.equal(cached.songs[0].clip_id, "11112222-3333");
  } finally {
    if (prevHome === undefined) delete process.env.FLOWMUSIC_HOME;
    else process.env.FLOWMUSIC_HOME = prevHome;
    fs.rmSync(tmpHome, { recursive: true, force: true });
  }
});

test("MCP Server JSON-RPC 2.0 handler and --no-spend guard", async () => {
  const initRes = await handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "initialize" }, {});
  assert.equal(initRes.result.serverInfo.name, "flowmusic-cli");

  const fullTools = getMcpTools({ noSpend: false });
  const safeTools = getMcpTools({ noSpend: true });
  assert.ok(fullTools.some((t) => t.name === "flowmusic_generate"));
  assert.ok(!safeTools.some((t) => t.name === "flowmusic_generate"));

  // Calling credit-spending tool in noSpend mode returns JSON-RPC error
  const blocked = await handleMcpRequest({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: { name: "flowmusic_generate", arguments: { prompt: "test" } },
  }, {}, { noSpend: true });
  assert.ok(blocked.error);
  assert.match(blocked.error.message, /no-spend/);

  // Calling free expand tool succeeds
  const expanded = await handleMcpRequest({
    jsonrpc: "2.0",
    id: 3,
    method: "tools/call",
    params: { name: "flowmusic_expand_prompt", arguments: { prompt: "领导登场", preset: "entrance-epic", loop: 15 } },
  }, {}, { noSpend: true });
  const payload = JSON.parse(expanded.result.content[0].text);
  assert.equal(payload.bpm, 128);
  assert.match(payload.prompt, /triumphant ceremonial orchestral anthem/i);
});
