import { spawn } from "node:child_process";

/**
 * ffmpeg -i の stderr から Duration を取得（ffprobe 不要）。
 * @param {string} ffmpegPath
 * @param {string} audioPath
 * @returns {Promise<number | null>} 秒。失敗時 null
 */
export function readAudioDurationSeconds(ffmpegPath, audioPath) {
  return new Promise((resolve) => {
    const chunks = [];
    const child = spawn(ffmpegPath, ["-hide_banner", "-i", audioPath], {
      shell: false,
    });
    child.stderr?.on("data", (d) => chunks.push(d));
    child.on("error", () => resolve(null));
    child.on("close", () => {
      const text = Buffer.concat(chunks).toString("utf8");
      const m = text.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
      if (!m) {
        resolve(null);
        return;
      }
      const h = Number(m[1]);
      const min = Number(m[2]);
      const sec = Number(m[3]);
      if (!Number.isFinite(h) || !Number.isFinite(min) || !Number.isFinite(sec)) {
        resolve(null);
        return;
      }
      resolve(h * 3600 + min * 60 + sec);
    });
  });
}
