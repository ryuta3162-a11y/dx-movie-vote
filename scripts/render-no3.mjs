/**
 * NO3 を output/dx-award-movie-no3.mp4 に収録。
 * 尺は no3-video.constants.mjs（prep:no3-voice-timeline で更新）に追従。
 */
process.env.VITE_PROFILE_ID = "no3";
process.env.MOVIE_OUTPUT = "dx-award-movie-no3.mp4";
process.env.MOVIE_END_HOLD_MS = process.env.MOVIE_END_HOLD_MS ?? "0";

await import("./render-movie.mjs");

