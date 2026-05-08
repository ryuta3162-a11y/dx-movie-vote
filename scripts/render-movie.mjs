import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { chromium } from "playwright";
import net from "node:net";
import { NO1_MOVIE_DURATION_MS } from "../no1-video.constants.mjs";
import { NO2_MOVIE_DURATION_MS } from "../no2-video.constants.mjs";
import { NO4_MOVIE_DURATION_MS } from "../no4-video.constants.mjs";
import { NO3_MOVIE_DURATION_MS } from "../no3-video.constants.mjs";
import { NO5_MOVIE_DURATION_MS } from "../no5-video.constants.mjs";
import { NO6_MOVIE_DURATION_MS } from "../no6-video.constants.mjs";
import { NO7_MOVIE_DURATION_MS } from "../no7-video.constants.mjs";
import { readAudioDurationSeconds as readMediaDurationSeconds } from "./read-audio-duration-ffmpeg.mjs";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, "output");
const VIDEO_TMP_DIR = path.join(ROOT, ".recording-tmp");
const OUTPUT_MP4 = path.join(OUTPUT_DIR, process.env.MOVIE_OUTPUT ?? "dx-award-movie.mp4");
const PREVIEW_PORT = 4173;
const PROFILE_ID = (process.env.VITE_PROFILE_ID ?? "no1").toLowerCase();
const MOVIE_DURATION_MS = Number(
  process.env.MOVIE_DURATION_MS ??
    (PROFILE_ID === "no4"
      ? NO4_MOVIE_DURATION_MS
      : PROFILE_ID === "no3"
        ? NO3_MOVIE_DURATION_MS
        : PROFILE_ID === "no5"
          ? NO5_MOVIE_DURATION_MS
          : PROFILE_ID === "no6"
            ? NO6_MOVIE_DURATION_MS
          : PROFILE_ID === "no7"
            ? NO7_MOVIE_DURATION_MS
          : PROFILE_ID === "no2"
            ? NO2_MOVIE_DURATION_MS
            : PROFILE_ID === "no1"
              ? NO1_MOVIE_DURATION_MS
              : 40_000),
);
/** タイムライン終了後に最終画をそのまま留める時間（ms）。収録の先頭はページ読込なので、書き出しは末尾からこの長さを切り出す。 */
const MOVIE_END_HOLD_MS = Number(process.env.MOVIE_END_HOLD_MS ?? 5000);
const CAPTURE_MS = MOVIE_DURATION_MS + Math.max(0, MOVIE_END_HOLD_MS);
const CAPTURE_SECONDS = Math.max(1, CAPTURE_MS / 1000);
const H264_PRESET = process.env.MOVIE_PRESET ?? "slow";
const H264_CRF = process.env.MOVIE_CRF ?? "12";
const RECORD_DEVICE_SCALE = Number(process.env.MOVIE_DEVICE_SCALE ?? "2");

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
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed (code ${code})`));
      }
    });
  });
}

function runBackground(command, args) {
  return spawn(command, args, {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}

async function waitForServer(url, timeoutMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // retry
    }
    await sleep(500);
  }
  throw new Error(`Server did not start within ${timeoutMs}ms: ${url}`);
}

async function getRecordedWebmPath(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const webm = entries.find((entry) => entry.isFile() && entry.name.endsWith(".webm"));
  if (!webm) {
    throw new Error("No Playwright video was produced.");
  }
  return path.join(dir, webm.name);
}

async function ensureCleanDir(dir) {
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
}

async function resolveFfmpegCommand() {
  const candidates = [];
  if (process.env.FFMPEG_PATH) {
    candidates.push(process.env.FFMPEG_PATH);
  }

  if (process.env.LOCALAPPDATA) {
    const wingetFfmpegPath = path.join(
      process.env.LOCALAPPDATA,
      "Microsoft",
      "WinGet",
      "Packages",
      "Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe",
      "ffmpeg-8.1-full_build",
      "bin",
      "ffmpeg.exe"
    );
    candidates.push(wingetFfmpegPath);
  }

  if (process.env.LOCALAPPDATA) {
    const msPlaywrightDir = path.join(process.env.LOCALAPPDATA, "ms-playwright");
    try {
      const entries = await fs.readdir(msPlaywrightDir, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || !entry.name.startsWith("ffmpeg-")) continue;
        candidates.push(
          path.join(
            msPlaywrightDir,
            entry.name,
            process.platform === "win32" ? "ffmpeg-win64.exe" : "ffmpeg-linux"
          )
        );
      }
    } catch {
      // Ignore lookup errors and fall back.
    }
  }

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try next candidate.
    }
  }

  return "ffmpeg";
}

async function findAvailablePort(startPort, maxAttempts = 300) {
  for (let i = 0; i < maxAttempts; i += 1) {
    const port = startPort + i;
    const isFree = await new Promise((resolve) => {
      const server = net.createServer();
      server.once("error", () => resolve(false));
      server.once("listening", () => {
        server.close(() => resolve(true));
      });
      server.listen(port, "127.0.0.1");
    });
    if (isFree) return port;
  }
  throw new Error(`No available port found starting from ${startPort}.`);
}

async function main() {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  const npxCmd = process.platform === "win32" ? "npx.cmd" : "npx";

  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await ensureCleanDir(VIDEO_TMP_DIR);

  const ffmpegCommand = await resolveFfmpegCommand();
  const previewPort = await findAvailablePort(PREVIEW_PORT);
  const previewUrl = `http://127.0.0.1:${previewPort}`;

  console.log("1/4 Building production bundle...");
  await runCommand(npmCmd, ["run", "build"]);

  console.log("2/4 Starting preview server...");
  const preview = runBackground(npxCmd, [
    "vite",
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    String(previewPort),
    "--strictPort",
  ]);

  let browser;
  try {
    await waitForServer(previewUrl);

    console.log(
      `3/4 Recording movie playback… (timeline ${MOVIE_DURATION_MS}ms + end hold ${MOVIE_END_HOLD_MS}ms → output target ${CAPTURE_SECONDS.toFixed(2)}s)`,
    );
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: Number.isFinite(RECORD_DEVICE_SCALE) && RECORD_DEVICE_SCALE > 0 ? RECORD_DEVICE_SCALE : 2,
      recordVideo: {
        dir: VIDEO_TMP_DIR,
        size: { width: 1920, height: 1080 },
      },
    });

    const page = await context.newPage();
    await page.goto(previewUrl, { waitUntil: "networkidle" });
    await page.waitForTimeout(MOVIE_DURATION_MS + MOVIE_END_HOLD_MS);

    await context.close();
    await browser.close();
    browser = undefined;

    const webmPath = await getRecordedWebmPath(VIDEO_TMP_DIR);

    console.log("4/4 Converting webm to mp4 (trim lead-in from recording tail)…");
    const webmDur = await readMediaDurationSeconds(ffmpegCommand, webmPath);
    let ss = 0;
    let outSec = CAPTURE_SECONDS;
    if (webmDur != null && Number.isFinite(webmDur) && webmDur > CAPTURE_SECONDS + 0.08) {
      ss = webmDur - CAPTURE_SECONDS;
      console.log(
        `   WebM ${webmDur.toFixed(2)}s → skip first ${ss.toFixed(2)}s, encode ${CAPTURE_SECONDS.toFixed(2)}s`,
      );
    } else if (webmDur != null && Number.isFinite(webmDur)) {
      console.warn(
        `   WebM duration ${webmDur.toFixed(2)}s is not longer than target ${CAPTURE_SECONDS.toFixed(2)}s; encoding from start (no trim).`,
      );
      outSec = Math.min(CAPTURE_SECONDS, webmDur);
      ss = 0;
    } else {
      console.warn("   Could not read WebM duration; encoding from start with -t cap.");
    }

    await runCommand(
      ffmpegCommand,
      [
        "-y",
        ...(ss > 0 ? ["-ss", String(ss)] : []),
        "-i",
        webmPath,
        "-t",
        String(outSec),
        "-c:v",
        "libx264",
        "-preset",
        H264_PRESET,
        "-crf",
        H264_CRF,
        "-tune",
        "animation",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        OUTPUT_MP4,
      ],
      { shell: false }
    );

    console.log(`Done: ${OUTPUT_MP4}`);
  } finally {
    if (browser) {
      await browser.close();
    }
    preview.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
