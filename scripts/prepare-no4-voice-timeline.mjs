/**
 * NO4: TTS 3セグメント → no4-video.constants.mjs の PROFILE / BEFORE / AFTER / MOVIE_DURATION を更新。
 * NO4_PLAYBACK_RATE 等は既存ファイルから保持（prep:no4-video の直後に実行推奨）。
 */
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { NO4_NARRATION_SEGMENTS } from "./no4-narration-segments.mjs";
import { readAudioDurationSeconds } from "./read-audio-duration-ffmpeg.mjs";

const ROOT = process.cwd();
const CONST_FILE = path.join(ROOT, "no4-video.constants.mjs");
const WORK_DIR = path.join(ROOT, "output", "no4-voice-work");
const EDGE_VOICE = process.env.NO4_NARRATION_VOICE ?? "ja-JP-NanamiNeural";
const EDGE_RATE = process.env.NO4_VOICE_RATE ?? "+18%";
const PAD_MS = Number(process.env.NO4_TIMELINE_PAD_MS ?? "240");
const MIN_MS = Number(process.env.NO4_TIMELINE_MIN_MS ?? "900");
const BEFORE_SCENE_MIN_MS = Number(process.env.NO4_BEFORE_SCENE_MIN_MS ?? "20000");
const AFTER_SCENE_MIN_MS = Number(process.env.NO4_AFTER_SCENE_MIN_MS ?? "45000");
const AFTER_MARGIN_MS = Number(process.env.NO4_AFTER_MARGIN_MS ?? "4500");

function parseExport(text, name) {
  const m = text.match(new RegExp(`export const ${name} = ([^;\\n]+);`));
  return m ? m[1].trim() : null;
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

function clampMs(ms) {
  const padded = Math.ceil(ms) + (Number.isFinite(PAD_MS) ? PAD_MS : 240);
  const floor = Number.isFinite(MIN_MS) ? MIN_MS : 900;
  return Math.max(floor, padded);
}

async function main() {
  const raw = await fs.readFile(CONST_FILE, "utf8");
  const playback = parseExport(raw, "NO4_PLAYBACK_RATE");
  const screenSrc = parseExport(raw, "NO4_SCREEN_VIDEO_SRC");
  const clipInset = parseExport(raw, "NO4_VISUAL_CLIP_INSET");
  const sourceDur = parseExport(raw, "NO4_SOURCE_DURATION_SEC");
  if (!playback || !screenSrc || !clipInset || !sourceDur) {
    throw new Error("no4-video.constants.mjs に NO4_PLAYBACK_RATE 等が見つかりません。先に npm run prep:no4-video を実行してください。");
  }
  let tailMs = parseExport(raw, "NO4_MOVIE_TAIL_MS");
  if (tailMs == null) tailMs = "2500";
  const tail = Number(tailMs);

  await fs.mkdir(WORK_DIR, { recursive: true });
  const ffmpeg = await resolveFfmpegCommand();

  const displayMsList = [];
  for (let i = 0; i < NO4_NARRATION_SEGMENTS.length; i += 1) {
    const text = NO4_NARRATION_SEGMENTS[i];
    const rawMp3 = path.join(WORK_DIR, `timeline-probe-${String(i).padStart(2, "0")}.mp3`);
    console.log(`[${i + 1}/${NO4_NARRATION_SEGMENTS.length}] TTS 生成・計測 …`);
    await edgeTtsToMp3(text, rawMp3);
    const rawSec = await readAudioDurationSeconds(ffmpeg, rawMp3);
    if (rawSec == null || !Number.isFinite(rawSec) || rawSec <= 0) {
      throw new Error(`音声長の取得に失敗: ${rawMp3}`);
    }
    const ms = clampMs(rawSec * 1000);
    displayMsList.push(ms);
    console.log(`    生 ${rawSec.toFixed(3)}s → 表示 ${ms}ms`);
  }

  const [profileMs, beforeMsRaw, afterMsRaw] = displayMsList;
  const playbackNum = Number(playback);
  const sourceDurNum = Number(sourceDur);
  const beforeFloor = Number.isFinite(BEFORE_SCENE_MIN_MS) ? Math.max(0, BEFORE_SCENE_MIN_MS) : 20000;
  const afterFloor = Number.isFinite(AFTER_SCENE_MIN_MS) ? Math.max(0, AFTER_SCENE_MIN_MS) : 45000;
  const afterFromVideoMs =
    Number.isFinite(playbackNum) && playbackNum > 0 && Number.isFinite(sourceDurNum) && sourceDurNum > 0
      ? Math.ceil((sourceDurNum / playbackNum) * 1000) + (Number.isFinite(AFTER_MARGIN_MS) ? AFTER_MARGIN_MS : 4500)
      : 0;

  const beforeMs = Math.max(beforeFloor, beforeMsRaw);
  const afterMs = Math.max(afterFloor, afterMsRaw, afterFromVideoMs);
  if (beforeMs > beforeMsRaw) {
    console.log(`    beforeシーンを最低尺 ${beforeFloor}ms に拡張（計測値 ${beforeMsRaw}ms）`);
  }
  if (afterMs > afterMsRaw) {
    console.log(
      `    afterシーンを拡張（計測値 ${afterMsRaw}ms / 固定下限 ${afterFloor}ms / 動画下限 ${afterFromVideoMs}ms → 採用 ${afterMs}ms）`,
    );
  }
  const movieMs = profileMs + beforeMs + afterMs + (Number.isFinite(tail) ? tail : 2500);

  const beforeComment =
    "/** Auto-generated: prepare-no4-screen-record + prepare-no4-voice-timeline — prep:no4-video 後に prep:no4-voice-timeline */";

  const body = `${beforeComment}
export const NO4_PLAYBACK_RATE = ${playback};
export const NO4_SCREEN_VIDEO_SRC = ${screenSrc};
/** CSS clip（元の prep:no4-video の説明はバックアップ参照） */
export const NO4_VISUAL_CLIP_INSET = ${clipInset};
/** 実際に使う尺（秒） */
export const NO4_SOURCE_DURATION_SEC = ${sourceDur};
export const NO4_PROFILE_SCENE_MS = ${profileMs};
export const NO4_MOVIE_TAIL_MS = ${tail};
/** NO4「課題（DX前）」シーン */
export const NO4_BEFORE_SCENE_MS = ${beforeMs};
export const NO4_AFTER_SCENE_MS = ${afterMs};
export const NO4_MOVIE_DURATION_MS = ${movieMs};
`;

  await fs.writeFile(CONST_FILE, body, "utf8");
  console.log(`\n書き出し: ${CONST_FILE}`);
  console.log(`NO4_MOVIE_DURATION_MS = ${movieMs}（約 ${(movieMs / 1000).toFixed(2)} 秒）`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

