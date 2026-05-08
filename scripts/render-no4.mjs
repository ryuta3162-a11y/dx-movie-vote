/**
 * NO4 プロフィールで完成 MP4 を `output/dx-award-movie-no4.mp4` に書き出す。
 * 使い方: npm run render:no4
 * 実機動画のクロップ・尺定数の更新も含める場合: npm run release:no4
 */
process.env.VITE_PROFILE_ID = "no4";
process.env.MOVIE_OUTPUT = "dx-award-movie-no4.mp4";
process.env.MOVIE_END_HOLD_MS = process.env.MOVIE_END_HOLD_MS ?? "0";

await import("./render-movie.mjs");
