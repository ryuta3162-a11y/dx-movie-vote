/**
 * NO7 プロフィールで完成 MP4 を `output/dx-award-movie-no7.mp4` に書き出す。
 * 使い方: npm run render:no7
 */
process.env.VITE_PROFILE_ID = "no7";
process.env.MOVIE_OUTPUT = "dx-award-movie-no7.mp4";
process.env.MOVIE_END_HOLD_MS = process.env.MOVIE_END_HOLD_MS ?? "0";

await import("./render-movie.mjs");
