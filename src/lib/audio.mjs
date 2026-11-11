// Local lossless PCM WAV audio engine: seamless loop (equal-power crossfade),
// RMS high-energy peak finder, local trim fallback, and optional FFmpeg MP3/demo export.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

/**
 * Parse a 16-bit PCM WAV buffer into header metadata and Int16Array samples.
 */
export function parseWav(buf) {
  if (buf.length < 44 || buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
    throw new Error("Invalid WAV file: missing RIFF/WAVE header");
  }
  let offset = 12;
  let numChannels = 2;
  let sampleRate = 48000;
  let bitsPerSample = 16;
  let audioFormat = 1;
  let dataOffset = -1;
  let dataSize = 0;

  while (offset + 8 <= buf.length) {
    const chunkId = buf.toString("ascii", offset, offset + 4);
    const chunkSize = buf.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    if (chunkId === "fmt ") {
      audioFormat = buf.readUInt16LE(chunkStart);
      numChannels = buf.readUInt16LE(chunkStart + 2);
      sampleRate = buf.readUInt32LE(chunkStart + 4);
      bitsPerSample = buf.readUInt16LE(chunkStart + 14);
    } else if (chunkId === "data") {
      dataOffset = chunkStart;
      dataSize = Math.min(chunkSize, buf.length - chunkStart);
      break;
    }
    offset = chunkStart + chunkSize + (chunkSize % 2);
  }

  if (audioFormat !== 1 || bitsPerSample !== 16 || dataOffset < 0) {
    throw new Error(`Unsupported WAV format (format=${audioFormat}, bits=${bitsPerSample}); 16-bit PCM required`);
  }

  const totalSamples = Math.floor(dataSize / 2);
  const samples = new Int16Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) {
    samples[i] = buf.readInt16LE(dataOffset + i * 2);
  }

  return {
    numChannels,
    sampleRate,
    bitsPerSample,
    totalFrames: Math.floor(totalSamples / numChannels),
    duration: totalSamples / (numChannels * sampleRate),
    samples,
  };
}

/**
 * Encode an Int16Array of interleaved samples into a standard 44-byte header WAV Buffer.
 */
export function encodeWav(samples, { numChannels = 2, sampleRate = 48000 } = {}) {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buf = Buffer.alloc(44 + dataSize);

  buf.write("RIFF", 0, 4, "ascii");
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write("WAVE", 8, 4, "ascii");
  buf.write("fmt ", 12, 4, "ascii");
  buf.writeUInt32LE(16, 16); // PCM fmt chunk size
  buf.writeUInt16LE(1, 20);  // PCM = 1
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * numChannels * bytesPerSample, 28);
  buf.writeUInt16LE(numChannels * bytesPerSample, 32);
  buf.writeUInt16LE(16, 34); // 16-bit
  buf.write("data", 36, 4, "ascii");
  buf.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    buf.writeInt16LE(samples[i], 44 + i * 2);
  }
  return buf;
}

/**
 * Scan audio samples with a sliding window to find the highest-energy (most climactic) segment.
 */
export function findPeakWindow(wav, windowSec = 16.5, stepSec = 1.0) {
  const { samples, numChannels, sampleRate, totalFrames } = wav;
  const winFrames = Math.min(totalFrames, Math.floor(windowSec * sampleRate));
  const stepFrames = Math.max(1, Math.floor(stepSec * sampleRate));
  // Avoid picking the very last 2 seconds where fade-out may occur
  const maxStartFrame = Math.max(0, totalFrames - winFrames - Math.floor(2 * sampleRate));

  let bestStartFrame = 0;
  let bestSumSq = -1;

  // Coarse stride inside window for fast RMS calculation
  const stride = Math.max(1, Math.floor(sampleRate / 200));

  for (let startF = 0; startF <= maxStartFrame; startF += stepFrames) {
    let sumSq = 0;
    let count = 0;
    for (let f = startF; f < startF + winFrames; f += stride) {
      const idx = f * numChannels;
      for (let ch = 0; ch < numChannels; ch++) {
        const v = samples[idx + ch];
        sumSq += v * v;
        count++;
      }
    }
    if (sumSq > bestSumSq) {
      bestSumSq = sumSq;
      bestStartFrame = startF;
    }
  }

  const rms = bestSumSq > 0 ? Math.sqrt(bestSumSq / Math.max(1, Math.floor(winFrames / stride) * numChannels)) : 0;
  const db = rms > 0 ? Number((20 * Math.log10(rms / 32768)).toFixed(1)) : -99;
  return {
    startSec: Number((bestStartFrame / sampleRate).toFixed(2)),
    rmsDb: db,
  };
}

/**
 * Create a seamless single-track loop from a WAV file using Equal-Power Crossfade
 * and micro-edge zero-crossing smoothing.
 */
export function createSeamlessLoop(inputWavPath, outputWavPath, {
  loopSec = 15,
  startSec = null,
  autoPeak = false,
  crossfadeSec = 1.5,
  edgeMs = 8,
  demoCount = 0,
  exportMp3 = true,
} = {}) {
  const wav = parseWav(fs.readFileSync(inputWavPath));
  const { numChannels, sampleRate, totalFrames, samples } = wav;

  const targetLoopSec = Number(loopSec);
  if (!(targetLoopSec > 0)) throw new Error("loop duration must be > 0 seconds");
  const fadeSec = Math.min(Number(crossfadeSec) || 1.5, targetLoopSec * 0.45);

  let chosenStartSec = startSec != null ? Number(startSec) : 0;
  let peakDb = null;
  if (autoPeak && startSec == null) {
    const peak = findPeakWindow(wav, targetLoopSec + fadeSec);
    chosenStartSec = peak.startSec;
    peakDb = peak.rmsDb;
  }

  const startFrame = Math.min(Math.max(0, Math.floor(chosenStartSec * sampleRate)), Math.max(0, totalFrames - 1));
  const loopFrames = Math.min(Math.floor(targetLoopSec * sampleRate), totalFrames - startFrame);
  const fadeFrames = Math.min(Math.floor(fadeSec * sampleRate), Math.floor(loopFrames / 2));

  const outSamples = new Int16Array(loopFrames * numChannels);

  // 1. Equal-power crossfade on the head: blend [startFrame .. startFrame+fadeFrames] with tail [startFrame+loopFrames .. startFrame+loopFrames+fadeFrames]
  for (let i = 0; i < fadeFrames; i++) {
    const p = fadeFrames > 0 ? i / fadeFrames : 1;
    const gainIn = Math.sin((p * Math.PI) / 2);
    const gainOut = Math.cos((p * Math.PI) / 2);

    const headFrame = startFrame + i;
    const tailFrame = startFrame + loopFrames + i;

    for (let ch = 0; ch < numChannels; ch++) {
      const sIn = samples[headFrame * numChannels + ch] || 0;
      const sOut = tailFrame < totalFrames ? samples[tailFrame * numChannels + ch] : 0;
      const mixed = Math.round(sIn * gainIn + sOut * gainOut);
      outSamples[i * numChannels + ch] = Math.max(-32768, Math.min(32767, mixed));
    }
  }

  // 2. Copy body frames unchanged
  for (let i = fadeFrames; i < loopFrames; i++) {
    const srcFrame = startFrame + i;
    for (let ch = 0; ch < numChannels; ch++) {
      outSamples[i * numChannels + ch] = samples[srcFrame * numChannels + ch] || 0;
    }
  }

  // 3. Micro-edge cosine smoothing (default 8ms) to guarantee zero click/pop at loop boundary
  const edgeFrames = Math.min(Math.floor((edgeMs / 1000) * sampleRate), Math.floor(loopFrames / 10));
  for (let i = 0; i < edgeFrames; i++) {
    const factor = 0.5 - 0.5 * Math.cos((Math.PI * i) / edgeFrames);
    const tailFrameIdx = loopFrames - 1 - (edgeFrames - 1 - i);
    for (let ch = 0; ch < numChannels; ch++) {
      outSamples[i * numChannels + ch] = Math.round(outSamples[i * numChannels + ch] * factor);
      outSamples[tailFrameIdx * numChannels + ch] = Math.round(outSamples[tailFrameIdx * numChannels + ch] * factor);
    }
  }

  fs.mkdirSync(path.dirname(outputWavPath), { recursive: true });
  fs.writeFileSync(outputWavPath, encodeWav(outSamples, { numChannels, sampleRate }));

  const result = {
    wavFile: outputWavPath,
    mp3File: null,
    demoFile: null,
    duration: Number((loopFrames / sampleRate).toFixed(2)),
    startSec: chosenStartSec,
    crossfadeSec: fadeSec,
    peakDb,
  };

  if ((exportMp3 || demoCount > 1) && hasFfmpeg()) {
    const baseNoExt = outputWavPath.replace(/\.wav$/i, "");
    if (exportMp3) {
      const mp3Path = `${baseNoExt}.mp3`;
      if (runFfmpeg(["-y", "-i", outputWavPath, "-b:a", "320k", mp3Path])) {
        result.mp3File = mp3Path;
      }
    }
    if (demoCount > 1) {
      const demoPath = `${baseNoExt}_demo_${demoCount}x.mp3`;
      if (runFfmpeg(["-y", "-stream_loop", String(demoCount - 1), "-i", outputWavPath, "-b:a", "320k", demoPath])) {
        result.demoFile = demoPath;
      }
    }
  }

  return result;
}

/**
 * Local lossless trim on a WAV file (with subtle 10ms fade-in/out to prevent clicks).
 */
export function trimWavLocal(inputWavPath, outputWavPath, { startSec = 0, endSec, exportMp3 = false } = {}) {
  const wav = parseWav(fs.readFileSync(inputWavPath));
  const { numChannels, sampleRate, totalFrames, samples } = wav;

  const sFrame = Math.max(0, Math.min(totalFrames, Math.floor(Number(startSec) * sampleRate)));
  const eFrame = endSec != null ? Math.max(sFrame, Math.min(totalFrames, Math.floor(Number(endSec) * sampleRate))) : totalFrames;
  const lenFrames = eFrame - sFrame;
  if (lenFrames <= 0) throw new Error(`Invalid trim range: ${startSec}s to ${endSec}s`);

  const outSamples = new Int16Array(lenFrames * numChannels);
  for (let i = 0; i < lenFrames; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      outSamples[i * numChannels + ch] = samples[(sFrame + i) * numChannels + ch];
    }
  }

  const edgeFrames = Math.min(Math.floor(0.01 * sampleRate), Math.floor(lenFrames / 4));
  for (let i = 0; i < edgeFrames; i++) {
    const factor = i / edgeFrames;
    const tailIdx = lenFrames - 1 - (edgeFrames - 1 - i);
    for (let ch = 0; ch < numChannels; ch++) {
      outSamples[i * numChannels + ch] = Math.round(outSamples[i * numChannels + ch] * factor);
      outSamples[tailIdx * numChannels + ch] = Math.round(outSamples[tailIdx * numChannels + ch] * (1 - i / edgeFrames));
    }
  }

  fs.mkdirSync(path.dirname(outputWavPath), { recursive: true });
  fs.writeFileSync(outputWavPath, encodeWav(outSamples, { numChannels, sampleRate }));

  let mp3File = null;
  if (exportMp3 && hasFfmpeg()) {
    const mp3Path = outputWavPath.replace(/\.wav$/i, ".mp3");
    if (runFfmpeg(["-y", "-i", outputWavPath, "-b:a", "320k", mp3Path])) mp3File = mp3Path;
  }

  return {
    wavFile: outputWavPath,
    mp3File,
    duration: Number((lenFrames / sampleRate).toFixed(2)),
    startSec: Number(startSec),
    endSec: Number((eFrame / sampleRate).toFixed(2)),
  };
}

let _ffmpegChecked = null;
export function hasFfmpeg() {
  if (_ffmpegChecked !== null) return _ffmpegChecked;
  try {
    const r = spawnSync("ffmpeg", ["-version"], { stdio: "ignore" });
    _ffmpegChecked = r.status === 0;
  } catch {
    _ffmpegChecked = false;
  }
  return _ffmpegChecked;
}

function runFfmpeg(args) {
  try {
    const r = spawnSync("ffmpeg", args, { stdio: "ignore" });
    return r.status === 0;
  } catch {
    return false;
  }
}
