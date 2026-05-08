/**
 * NO2 を output/dx-award-movie-no2.mp4 に収録。
 * 尺は no2-video.constants.mjs（prep:no2-voice-timeline で更新）に追従。
 */
process.env.VITE_PROFILE_ID = "no2";
process.env.MOVIE_OUTPUT = "dx-award-movie-no2.mp4";

await import("./render-movie.mjs");
