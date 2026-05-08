/**
 * NO2 用ナレーションを no2-video.constants.mjs の各シーン秒に合わせて合成する。
 * 台本は scripts/no2-narration-segments.mjs。尺は `npm run prep:no2-voice-timeline` で更新。
 *
 * 前提: pip install edge-tts、インターネット接続
 *
 * 環境変数:
 *   NO2_NARRATION_VOICE  既定 ja-JP-NanamiNeural
 *   NO2_VOICE_RATE       既定 +28%
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import {
  NO2_BEFORE_SCENE_MS,
  NO2_DASHBOARD_TICK_MS,
  NO2_OUTRO_SCENE_MS,
  NO2_PROFILE_SCENE_MS,
  NO2_TRANSITION_SCENE_MS,
} from "../no2-video.constants.mjs";
import { NO2_NARRATION_SEGMENTS } from "./no2-narration-segments.mjs";
import { readMp4DurationSeconds } from "./read-mp4-duration.mjs";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "output");
const WORK_DIR = path.join(OUTPUT_DIR, "no2-voice-work");
const INPUT_VIDEO = path.join(OUTPUT_DIR, "dx-award-movie-no2.mp4");
const MERGED_WAV = path.join(WORK_DIR, "no2-narration-merged.wav");
const CONCAT_LIST = path.join(WORK_DIR, "concat.txt");
const OUTPUT_VIDEO = path.join(OUTPUT_DIR, "dx-award-movie-no2-voice.mp4");

const EDGE_VOICE = process.env.NO2_NARRATION_VOICE ?? "ja-JP-NanamiNeural";
const EDGE_RATE = process.env.NO2_VOICE_RATE ?? "+28%";

function buildSegmentsFromConstants() {
  const ticks = NO2_DASHBOARD_TICK_MS;
  if (!Array.isArray(ticks) || ticks.length !== 4) {
    throw new Error("no2-video.constants.mjs の NO2_DASHBOARD_TICK_MS は長さ4の配列である必要があります。");
  }
  if (NO2_NARRATION_SEGMENTS.length !== 7 && NO2_NARRATION_SEGMENTS.length !== 8) {
    throw new Error("no2-narration-segments.mjs は 7 文（アウトロなし）または 8 文（アウトロあり）である必要があります。");
  }
  const baseMs = [
    NO2_PROFILE_SCENE_MS,
    NO2_BEFORE_SCENE_MS,
    NO2_TRANSITION_SCENE_MS,
    ...ticks,
  ];
  const ms = NO2_NARRATION_SEGMENTS.length === 8 ? [...baseMs, NO2_OUTRO_SCENE_MS] : baseMs;
  return NO2_NARRATION_SEGMENTS.map((text, i) => ({
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
      // try next
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
      `注意: 動画の長さ ${videoDur}s とセグメント合計 ${totalSec}s が一致しません。prep:no2-voice-timeline の後に render:no2 を再実行したか確認してください。`,
    );
  }

  const ffmpeg = await resolveFfmpegCommand();

  console.log(`1/4 edge-tts セグメント生成 (${EDGE_VOICE}, rate ${EDGE_RATE}) …`);
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

  console.log("3/4 動画へ mux …");
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

  console.log("4/4 完了");
  console.log(`出力: ${OUTPUT_VIDEO}`);
  console.log(`作業フォルダ: ${WORK_DIR}`);
}

main().catch((err) => {
  console.error(err);
  console.error("\nヒント: pip install edge-tts と、ネット接続を確認してください。");
  process.exitCode = 1;
});

