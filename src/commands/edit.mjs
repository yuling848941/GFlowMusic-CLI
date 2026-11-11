// Edit and analysis commands: extend, replace, cover, stems, loop, trim, speed, convert, modify, caption, transcribe.
import { clipIds } from "../lib/util.mjs";

export default (c) => {
  const { opts, f, log, need, num, readText, clipUrl, dur, emit, dbg, T, applyModel, waitClips, download, FORMATS, materialize, songLine, finish, createSong, renderEdit, baseTitle, seed, userId, listAllOwn, saveUrl, runLoopTask, runLocalTrim } = c;
  return {
    async extend() {
      const clip = need(opts._[1], "clip id");
      await finish(await renderEdit(clip, { node_type: "ExtendSection", instruction: opts.prompt || "", extend_s: num(opts.seconds, 20), extend_from_s: opts.from != null ? Number(opts.from) : null, seed: seed() }, opts.title || (await baseTitle(clip, "extended"))), "extend");
    },
    async replace() {
      const clip = need(opts._[1], "clip id");
      if (!opts.region.length) throw new Error("need at least one --region START-END (seconds)");
      const masks = opts.region.map((r) => { const [a, b] = r.split("-").map(Number); return { start_s: a, end_s: b }; });
      await finish(await renderEdit(clip, { node_type: "ReplaceSection", instruction: opts.prompt || "", masks, seed: seed() }, opts.title || (await baseTitle(clip, "replaced"))), "replace");
    },
    async cover() {
      const clip = need(opts._[1], "clip id");
      await finish(await renderEdit(clip, { node_type: "CoverSong", instruction: need(opts.prompt, "--prompt"), strength: num(opts.strength, 0.5), seed: seed() }, opts.title || (await baseTitle(clip, "cover"))), "cover");
    },
    async stems() { await finish(await T("audio__split_stems", { clip_id: need(opts._[1], "clip id") }), "stems"); },

    async loop() {
      const target = need(opts._[1], "clip id or local wav file");
      const loopSec = num(opts.length || opts.loop || opts.seconds, 15);
      const startSec = opts.start != null ? Number(opts.start) : null;
      const autoPeak = Boolean(opts["auto-peak"] || startSec == null);
      const crossfadeSec = num(opts.crossfade, 1.5);
      const demoCount = num(opts.demo, 0);
      const res = await runLoopTask(target, { loopSec, startSec, autoPeak, crossfadeSec, demoCount });
      const lines = [`${res.wavFile}  (${res.duration}s seamless loop, start=${res.startSec}s, crossfade=${res.crossfadeSec}s${res.peakDb != null ? `, peak=${res.peakDb}dB` : ""})`];
      if (res.mp3File) lines.push(`  mp3:  ${res.mp3File}`);
      if (res.demoFile) lines.push(`  demo: ${res.demoFile}`);
      emit(lines.join("\n"), res);
    },

    async trim() {
      const clip = need(opts._[1], "clip id or local wav file");
      const startS = num(need(opts.start, "--start"));
      const endS = num(need(opts.end, "--end"));
      if (opts.local || /\.wav$/i.test(clip)) {
        const res = await runLocalTrim(clip, { startSec: startS, endSec: endS });
        return emit(`${res.wavFile}${res.mp3File ? ` | ${res.mp3File}` : ""}  (${res.duration}s)`, res);
      }
      try {
        await finish(await T("audio__apply_effect", {
          graph: [{ node_type: "Input", node_id: "input", track_id: clip }, { node_type: "Trim", node_id: "trim", input_ids: ["input"], start_s: startS, end_s: endS }, { node_type: "Output", input_ids: ["trim"] }],
          output_title: opts.title || (await baseTitle(clip, "trim")),
        }), "trim");
      } catch (e) {
        log(`server trim failed (${e.message}); falling back to local lossless WAV trim...`);
        const res = await runLocalTrim(clip, { startSec: startS, endSec: endS });
        emit(`${res.wavFile}${res.mp3File ? ` | ${res.mp3File}` : ""}  (${res.duration}s)`, res);
      }
    },

    async speed() {
      const clip = need(opts._[1], "clip id");
      const speed = num(opts.factor, 1), semitones = num(opts.semitones, 0);
      if (speed === 1 && semitones === 0) throw new Error("give --factor (e.g. 0.85) and/or --semitones");
      await finish(await T("audio__apply_effect", {
        graph: [{ node_type: "Input", node_id: "input", track_id: clip }, { node_type: "TempoShift", node_id: "fx", input_ids: ["input"], speed, semitones }, { node_type: "Output", input_ids: ["fx"] }],
        output_title: opts.title || (await baseTitle(clip, `x${speed}${semitones ? ` ${semitones > 0 ? "+" : ""}${semitones}st` : ""}`)),
      }), "speed");
    },
    async convert() { // formats are produced by the download endpoint: no new clip, no credits
      const fmt = need(opts.format, `--format (${FORMATS.join("|")})`);
      const ids = opts._.slice(1);
      for (const id of need(ids.length ? ids : null, "clip id")) console.log(await download(id, null, opts.out || "out", fmt));
    },
    async modify() {
      const clip = need(opts._[1], "clip id");
      const instr = need(opts._.slice(2).join(" "), "instruction");
      f.extraContext = { current_song_id: clip, song_queue: [{ id: clip }] };
      const r = await f.runJob("chat", { conversation: await f.newConversation(), body: `Call audio__modify_song on the current song with the prompt ${JSON.stringify(instr)}. Do it now without asking questions.`, onEvent: dbg });
      if (r.error) throw new Error(r.error.message || JSON.stringify(r.error));
      const ids = [...new Set(r.returns.flatMap((x) => clipIds(typeof x.content === "object" ? x.content : {})))].filter((i) => i !== clip);
      if (!ids.length) { log(`producer: ${r.text}`); throw new Error("the agent did not produce a new clip"); }
      await finish({ clip_outputs: ids.map((clip_id) => ({ clip_id })) }, "modify", { reply: r.text });
    },

    async caption() {
      const clip = need(opts._[1], "clip id");
      const c = (await f.clips([clip]))[clip];
      const r = await T("audio__caption", { prompt: opts.prompt || "Describe the musical style, instruments, vocals, and overall mood of this track.", audio_url: c.audio_url });
      emit(r.caption, r);
    },
    async transcribe() {
      const clip = need(opts._[1], "clip id");
      const c = (await f.clips([clip]))[clip];
      const r = await T("audio__transcribe", { audio_url: c.audio_url });
      emit(r.lyrics, r);
    },
  };
};
