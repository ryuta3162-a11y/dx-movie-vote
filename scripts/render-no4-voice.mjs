/**
 * NO4 ナレーション合成 → output/dx-award-movie-no4-voice.mp4
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import {
  NO4_AFTER_SCENE_MS,
  NO4_BEFORE_SCENE_MS,
  NO4_PROFILE_SCENE_MS,
} from "../no4-video.constants.mjs";
import { NO4_NARRATION_SEGMENTS } from "./no4-narration-segments.mjs";
import { readMp4DurationSeconds } from "./read-mp4-duration.mjs";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "output");
const WORK_DIR = path.join(OUTPUT_DIR, "no4-voice-work");
const INPUT_VIDEO = path.join(OUTPUT_DIR, "dx-award-movie-no4.mp4");
const MERGED_WAV = path.join(WORK_DIR, "no4-narration-merged.wav");
const CONCAT_LIST = path.join(WORK_DIR, "concat.txt");
const OUTPUT_VIDEO = path.join(OUTPUT_DIR, "dx-award-movie-no4-voice.mp4");

const EDGE_VOICE = process.env.NO4_NARRATION_VOICE ?? "ja-JP-NanamiNeural";
const EDGE_RATE = process.env.NO4_VOICE_RATE ?? "+14%";

function buildSegmentsFromConstants() {
  if (NO4_NARRATION_SEGMENTS.length !== 3) {
    throw new Error("no4-narration-segments.mjs は 3 文である必要があります。");
  }
  const ms = [NO4_PROFILE_SCENE_MS, NO4_BEFORE_SCENE_MS, NO4_AFTER_SCENE_MS];
  return NO4_NARRATION_SEGMENTS.map((text, i) => ({
    text,
    sec: Math.max(0.5, ms[i] / 1000),
  }));
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: ROOT,
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} failed (code ${code})`));
    });
  });
}

async function resolveFfmpegCommand() {
  const candidates = [];
  if (process.env.FFMPEG_PATH) candidates.push(process.env.FFMPEG_PATH);
  if (process.env.LOCALAPPDATA) {
    candidates.push(
      path.join(
        process.env.LOCALAPPDATA,
        "Microsoft",
        "WinGet",
        "Packages",
        "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
        "ffmpeg-8.1-full_build",
        "bin",
        "ffmpeg.exe",
      ),
    );
  }
  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // continue
    }
  }
  return "ffmpeg";
}

async function edgeTtsToMp3(text, outMp3) {
  const txtPath = `${outMp3}.txt`;
  await fs.writeFile(txtPath, `${text}\n`, "utf8");
  await runCommand(
    "python",
    ["-m", "edge_tts", "-f", txtPath, "-v", EDGE_VOICE, "--rate", EDGE_RATE, "--write-media", outMp3],
    { shell: false },
  );
}

async function padSegment(ffmpeg, inPath, sec, outWav) {
  await runCommand(
    ffmpeg,
    [
      "-y",
      "-i",
      inPath,
      "-af",
      `atrim=0:${sec},asetpts=PTS-STARTPTS,apad=whole_dur=${sec}`,
      "-t",
      String(sec),
      "-ar",
      "48000",
      "-ac",
      "1",
      "-c:a",
      "pcm_s16le",
      outWav,
    ],
    { shell: false },
  );
}

async function main() {
  await fs.mkdir(WORK_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.access(INPUT_VIDEO);

  const SEGMENTS = buildSegmentsFromConstants();
  const totalSec = SEGMENTS.reduce((a, s) => a + s.sec, 0);
  const videoDur = (await readMp4DurationSeconds(INPUT_VIDEO)) ?? totalSec;
  if (Math.abs(videoDur - totalSec) > 0.25) {
    console.warn(
      `注意: 動画 ${videoDur}s と音声合計 ${totalSec}s がずれています。prep:no4-voice-timeline 後に render:no4 を再実行したか確認してください。`,
    );
  }

  const ffmpeg = await resolveFfmpegCommand();
  console.log(`1/4 edge-tts (${EDGE_VOICE}, ${EDGE_RATE}) …`);
  const paddedWavs = [];
  for (let i = 0; i < SEGMENTS.length; i += 1) {
    const { sec, text } = SEGMENTS[i];
    const rawMp3 = path.join(WORK_DIR, `seg-${String(i).padStart(2, "0")}.mp3`);
    const padWav = path.join(WORK_DIR, `seg-${String(i).padStart(2, "0")}-${sec}s.wav`);
    console.log(`    [${i + 1}/${SEGMENTS.length}] ${sec}s`);
    await edgeTtsToMp3(text, rawMp3);
    await padSegment(ffmpeg, rawMp3, sec, padWav);
    paddedWavs.push(padWav);
  }

  console.log("2/4 音声つなぎ …");
  const listBody = paddedWavs
    .map((p) => {
      const u = p.replace(/\\/g, "/");
      return `file '${u.replace(/'/g, "'\\''")}'`;
    })
    .join("\n");
  await fs.writeFile(CONCAT_LIST, listBody, "utf8");
  await runCommand(
    ffmpeg,
    ["-y", "-f", "concat", "-safe", "0", "-i", CONCAT_LIST, "-c", "copy", MERGED_WAV],
    { shell: false },
  );

  console.log("3/4 mux …");
  const outSeconds = Math.max(videoDur, totalSec);
  const padVideoBy = totalSec - videoDur;
  const needsVideoPad = padVideoBy > 0.05;
  const filterComplex = needsVideoPad
    ? `[0:v]tpad=stop_mode=clone:stop_duration=${padVideoBy.toFixed(3)}[vout];[1:a]apad=whole_dur=${outSeconds.toFixed(3)}[aout]`
    : `[1:a]apad=whole_dur=${outSeconds.toFixed(3)}[aout]`;
  const videoMaps = needsVideoPad ? ["-map", "[vout]"] : ["-map", "0:v:0"];
  const videoCodec = needsVideoPad
    ? ["-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p"]
    : ["-c:v", "copy"];

  await runCommand(
    ffmpeg,
    [
      "-y",
      "-i",
      INPUT_VIDEO,
      "-i",
      MERGED_WAV,
      "-filter_complex",
      filterComplex,
      ...videoMaps,
      "-map",
      "[aout]",
      ...videoCodec,
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-ar",
      "48000",
      "-t",
      outSeconds.toFixed(3),
      "-movflags",
      "+faststart",
      OUTPUT_VIDEO,
    ],
    { shell: false },
  );

  console.log(`4/4 完了 → ${OUTPUT_VIDEO}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

