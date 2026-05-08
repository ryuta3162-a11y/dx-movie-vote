/**
 * NO5 プロフィールで完成 MP4 を `output/dx-award-movie-no5.mp4` に書き出す。
 * 使い方: npm run render:no5
 */
process.env.VITE_PROFILE_ID = "no5";
process.env.MOVIE_OUTPUT = "dx-award-movie-no5.mp4";

await import("./render-movie.mjs");
