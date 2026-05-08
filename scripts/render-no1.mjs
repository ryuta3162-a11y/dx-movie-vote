/**
 * NO1 を output/dx-award-movie-no1.mp4 に収録。
 * 尺は no1-video.constants.mjs（prep:no1-voice-timeline で更新）に追従。
 */
process.env.VITE_PROFILE_ID = "no1";
process.env.MOVIE_OUTPUT = "dx-award-movie-no1.mp4";

await import("./render-movie.mjs");
