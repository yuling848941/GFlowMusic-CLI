// Local Asset Catalog (append-only JSONL) & Batch Idempotency Ledger (credit protection).
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

function baseDir() {
  return process.env.FLOWMUSIC_HOME || path.join(os.homedir(), ".config", "gfmusic");
}

export const catalogPath = () => path.join(baseDir(), "catalog.jsonl");
export const ledgerPath = () => path.join(baseDir(), "batch-ledger.json");

/**
 * Append a generation / edit / loop record to the local catalog.jsonl.
 */
export function recordCatalog(entry) {
  const file = catalogPath();
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const row = {
    timestamp: new Date().toISOString(),
    ...entry,
  };
  fs.appendFileSync(file, JSON.stringify(row) + "\n", { encoding: "utf8", mode: 0o600 });
  return row;
}

/**
 * Load all records from catalog.jsonl, merging multiple updates by clip_id (newest first).
 */
export function loadCatalog({ dedupe = true } = {}) {
  const file = catalogPath();
  if (!fs.existsSync(file)) return [];
  const lines = fs.readFileSync(file, "utf8").split(/\r?\n/).filter(Boolean);
  const rows = [];
  for (const line of lines) {
    try { rows.push(JSON.parse(line)); } catch { /* ignore malformed line */ }
  }
  if (!dedupe) return rows.reverse();

  const map = new Map();
  for (const r of rows) {
    const key = r.clip_id || `${r.op}:${r.timestamp}:${r.file || ""}`;
    if (!map.has(key)) {
      map.set(key, { ...r, files: [...new Set([r.file, ...(r.files || [])].filter(Boolean))] });
    } else {
      const prev = map.get(key);
      const mergedFiles = [...new Set([...prev.files, r.file, ...(r.files || [])].filter(Boolean))];
      map.set(key, { ...prev, ...r, files: mergedFiles });
    }
  }
  return [...map.values()].reverse();
}

/**
 * Offline search across local catalog by keyword (matches title, prompt, preset, lyrics, clip_id).
 */
export function searchCatalog(query = "", limit = 25) {
  const all = loadCatalog();
  const q = String(query || "").trim().toLowerCase();
  if (!q) return all.slice(0, limit);
  return all.filter((r) => {
    const hay = [
      r.clip_id,
      r.title,
      r.prompt,
      r.raw_prompt,
      r.preset,
      r.lyrics,
      r.op,
      ...(r.files || []),
    ].filter(Boolean).join(" ").toLowerCase();
    return hay.includes(q);
  }).slice(0, limit);
}

/**
 * Find a single catalog entry by full clip_id or prefix.
 */
export function findCatalogClip(idOrPrefix) {
  if (!idOrPrefix) return null;
  const q = String(idOrPrefix).toLowerCase();
  const all = loadCatalog();
  return all.find((r) => r.clip_id && r.clip_id.toLowerCase().startsWith(q)) || null;
}

// ---------- Batch Ledger (Idempotent Resume & Credit Protection) ----------

/**
 * Compute a deterministic fingerprint for a batch specification.
 */
export function batchSpecHash(spec) {
  const normalized = {
    prompt: String(spec.prompt || "").trim(),
    preset: spec.preset || null,
    expand: Boolean(spec.expand),
    lyrics: String(spec.lyrics || "").trim(),
    instrumental: Boolean(spec.instrumental),
    length: spec.length != null ? Number(spec.length) : null,
    bpm: spec.bpm != null ? Number(spec.bpm) : null,
    model: spec.model || null,
    loop: spec.loop != null ? Number(spec.loop) : null,
  };
  return crypto.createHash("sha1").update(JSON.stringify(normalized)).digest("hex").slice(0, 16);
}

export function loadBatchLedger() {
  const file = ledgerPath();
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return {};
  }
}

export function saveBatchLedgerEntry(hash, spec, songs) {
  const file = ledgerPath();
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const ledger = loadBatchLedger();
  ledger[hash] = {
    completed_at: new Date().toISOString(),
    prompt: spec.prompt,
    preset: spec.preset || null,
    songs,
  };
  fs.writeFileSync(file, JSON.stringify(ledger, null, 2), { mode: 0o600 });
}

export function getCompletedBatchEntry(hash) {
  const ledger = loadBatchLedger();
  const item = ledger[hash];
  if (!item || !Array.isArray(item.songs) || !item.songs.length) return null;
  return item;
}
