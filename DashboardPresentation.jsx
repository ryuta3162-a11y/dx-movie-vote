import React, { useEffect, useMemo, useRef, useState } from "react";
import { NO1_DASH_SLIDE_CYCLE_SEC } from "./no1-video.constants.mjs";
import { NO2_DASH_SLIDE_CYCLE_SEC } from "./no2-video.constants.mjs";
import { NO4_PLAYBACK_RATE, NO4_SCREEN_VIDEO_SRC, NO4_VISUAL_CLIP_INSET } from "./no4-video.constants.mjs";
import { NO5_FORM_CAL_VIDEO_PLAY_DELAY_MS } from "./no5-video.constants.mjs";
import { PROFILE_ID } from "./profile-id.js";
const IS_NO1 = PROFILE_ID === "no1";
const IS_NO2 = PROFILE_ID === "no2";
const IS_NO3 = PROFILE_ID === "no3";
const IS_NO4 = PROFILE_ID === "no4";
const IS_NO5 = PROFILE_ID === "no5";
const IS_NO6 = PROFILE_ID === "no6";
const IS_NO7 = PROFILE_ID === "no7";
const NO1_TABS = ["PL管理", "会員数推移", "会員詳細", "売上・客単価"];
const NO2_TABS = ["競合店舗", "マシンスペック", "会員動向", "競合比較ランク"];
const NO3_TABS = ["スマホ画面収録"];
const NO4_TABS = ["工程自動生成"];
const NO5_TABS = ["訴求", "料金・予約", "申込"];
const NO7_TABS = ["タスク&DL管理フォーム"];
/** NO6 訴求3本柱（01→03 の順。タイトルはピル・タブと共通） */
const NO6_APPEAL_CONTENT = [
  {
    title: "ジム見学体験",
    bullets: [
      "Formから移行",
      "視認性の向上",
      "Googleアカウント不要で申請可能",
      "入力時間を3分削減〔30秒で申請可能〕",
      "スタッフ不在時間の申請を予防",
    ],
  },
  {
    title: "追加特典申請",
    bullets: [
      "内容・文言も時期により変更",
      "Googleアカウント不要で申請可能",
      "移籍証明画像のアップロードが簡単に",
      "学生証画像のアップロードが簡単に",
    ],
  },
  {
    title: "マシンラインナップ",
    bullets: [
      "無料で作成・編集が可能",
      "マシン画像が見えるため直感的に分かりやすい",
      "FW・有酸素マシン等分けて表示可能",
    ],
  },
];
const NO6_TABS = NO6_APPEAL_CONTENT.map((b) => b.title);
const NO6_CAMPAIGN_APPEAL_CONTENT = [
  {
    title: "ファーストビュー金額訴求",
    bullets: [
      "半年間3300円等）が見える事で目を引く",
      "カウントダウンが上部バナーに",
      "残り人数が表示されることで入会意思を上げる",
    ],
  },
  {
    title: "入会時金額が随時更新",
    bullets: ["初期費用等含む当月会費が分かる", "日割り計算を自動算出する為正確に表示"],
  },
  {
    title: "オプション訴求・注意事項",
    bullets: [
      "カルーセル型で表示させることで枠を削減",
      "画像付きで金額や内容も分かりやすく",
      "無料べた付けオプションと\n有料オプションを分けることで分かりやすく",
    ],
  },
];
const NO6_CAMPAIGN_TABS = ["金額アピール", "訴求強化", "トラブル防止"];
const SLIDE_FRAME_CLASS = "grid h-full min-h-0 grid-rows-[auto_1fr] gap-3 md:gap-4";
/** no1 は音声尺に合わせた配列。他は App.jsx の DASHBOARD_TICK_MS と揃えた固定秒 */
const DASH_SLIDE_CYCLE_SEC_DEFAULT = IS_NO3 || IS_NO4 || IS_NO5 || IS_NO6 ? 5.6 : 5;

function KpiCard({ borderClass, label, value, plan, diff, positive, neutral, primary = false, countDuration = 700 }) {
  const [displayValue, setDisplayValue] = useState(value);
  const numberInfo = useMemo(() => {
    const match = value.match(/-?[\d,]+(?:\.\d+)?/);
    if (!match || match.index === undefined) return null;
    const raw = match[0];
    const target = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(target)) return null;
    const decimals = (raw.split(".")[1] || "").length;
    const prefix = value.slice(0, match.index);
    const suffix = value.slice(match.index + raw.length);
    return { target, decimals, prefix, suffix };
  }, [value]);

  useEffect(() => {
    if (!numberInfo) {
      setDisplayValue(value);
      return;
    }
    let rafId = 0;
    let start = 0;
    const duration = countDuration;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numberInfo.target * eased;
      const formatted = current.toLocaleString("ja-JP", {
        minimumFractionDigits: numberInfo.decimals,
        maximumFractionDigits: numberInfo.decimals,
      });
      setDisplayValue(`${numberInfo.prefix}${formatted}${numberInfo.suffix}`);
      if (progress < 1) rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [numberInfo, value]);

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-xl bg-slate-800/90 px-4 py-4 shadow-lg shadow-black/30 md:px-5 md:py-5 ${
        primary
          ? "border border-cyan-400/55 shadow-[0_10px_32px_rgba(34,211,238,0.18)]"
          : "border border-slate-600/70"
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-0.5 ${borderClass}`} />
      <p className={`${IS_NO1 ? "text-xl md:text-2xl" : "text-lg md:text-xl"} font-semibold tracking-wide whitespace-nowrap ${primary ? "text-cyan-100" : "text-slate-300"}`}>{label}</p>
      <p
        className={`mt-1.5 font-bold tabular-nums tracking-tight text-white ${
          primary
            ? IS_NO1
              ? "text-[3.1rem] md:text-[4rem] lg:text-[4.5rem]"
              : "text-[2.7rem] md:text-[3.4rem] lg:text-[3.8rem]"
            : IS_NO1
              ? "text-[3rem] md:text-[3.7rem] lg:text-[4.2rem]"
              : "text-[2.6rem] md:text-[3.1rem] lg:text-[3.5rem]"
        }`}
      >
        {displayValue}
      </p>
      <p className={`${IS_NO1 ? "text-xl md:text-2xl" : "text-lg md:text-xl"} mt-auto leading-snug text-slate-400`}>
        計画 {plan}{" "}
        {neutral ? (
          <span className="font-medium text-cyan-300 [animation:dashRatePulse_2.2s_ease-in-out_infinite]">({diff})</span>
        ) : (
          <span className={positive ? "font-semibold text-emerald-400" : "font-semibold text-rose-400"}>({diff})</span>
        )}
      </p>
    </div>
  );
}

function DashChrome({ activeIndex, tabs = NO1_TABS, title = "テリトリー数値ダッシュボード", badge = "4月実績", rightPills = ["4月", "テリトリー1計"], children }) {
  const accentBarClass = IS_NO2
    ? "bg-emerald-600"
    : IS_NO3 || IS_NO4
      ? "bg-rose-600"
      : IS_NO5
        ? "bg-red-700"
        : IS_NO6
          ? "bg-red-700"
          : IS_NO7
            ? "bg-emerald-700"
            : "bg-slate-900/95";
  const frameClass = IS_NO4
    ? "border-2 border-pink-600 bg-gray-200 shadow-[0_12px_36px_rgba(0,0,0,.1)]"
    : IS_NO5
      ? "border border-red-500/20 bg-[linear-gradient(180deg,#160606_0%,#0c0405_42%,#080204_100%)] shadow-[0_0_48px_rgba(127,29,29,0.32),inset_0_1px_0_rgba(255,255,255,0.08)]"
      : IS_NO6
        ? "border-2 border-neutral-900/90 bg-white shadow-[0_18px_48px_rgba(0,0,0,0.1)]"
      : IS_NO7
        ? "border-2 border-emerald-800/85 bg-emerald-50 shadow-[0_18px_48px_rgba(5,150,105,0.14)]"
      : IS_NO2
        ? "border border-emerald-300/50 bg-slate-100 shadow-[0_0_24px_rgba(16,185,129,0.18)]"
        : IS_NO3
          ? "border border-rose-300/60 bg-slate-50 shadow-[0_0_24px_rgba(244,63,94,0.16)]"
          : "border border-cyan-500/20 bg-slate-900 shadow-[0_0_40px_rgba(14,165,233,0.14),inset_0_1px_0_rgba(255,255,255,0.04)]";
  const panelClass = IS_NO2
    ? "border-b border-slate-300 bg-white"
    : IS_NO3 || IS_NO4
      ? "border-b border-slate-300 bg-white"
      : IS_NO5
        ? "border-b border-red-950/40 bg-[#100404]/95"
        : IS_NO6
          ? "border-b border-neutral-200 bg-white"
        : IS_NO7
          ? "border-b border-emerald-200 bg-emerald-50"
        : "border-b border-slate-700/80 bg-slate-800/40";
  const pageBgClass = IS_NO4
    ? "bg-gray-200"
    : IS_NO5
      ? "bg-[linear-gradient(180deg,#0c0304_0%,#090305_38%,#080204_72%,#050308_100%)]"
      : IS_NO2
        ? "bg-slate-100"
        : IS_NO3
          ? "bg-slate-100"
          : IS_NO6
            ? "bg-neutral-100"
          : IS_NO7
            ? "bg-emerald-100/70"
          : "bg-slate-900/90";
  const hideNo3Header = IS_NO3 || IS_NO4 || IS_NO6 || IS_NO7;
  return (
    <div className="relative flex h-full min-h-0 w-full flex-col">
      <div
        className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-[18px] ${
          frameClass
        }`}
      >
        <No5FilmGrainOverlay className="rounded-[inherit]" />
        {!hideNo3Header && (
          <nav className={`relative z-[2] flex shrink-0 flex-wrap gap-0 px-2 md:px-4 ${accentBarClass}`}>
            {tabs.map((label, i) => (
              <div
                key={label}
                className={`relative whitespace-nowrap tracking-[0.02em] px-6 py-4 text-xl font-bold md:px-8 md:py-5 md:text-2xl lg:px-10 lg:py-5 lg:text-[1.72rem] ${
                  i === activeIndex
                    ? IS_NO2 || IS_NO3 || IS_NO4 || IS_NO5
                      ? "text-white"
                      : IS_NO6
                        ? "text-white"
                      : "text-cyan-200"
                    : IS_NO2
                      ? "text-emerald-100/80"
                      : IS_NO3 || IS_NO4
                        ? "text-rose-100/80"
                        : IS_NO5
                          ? "text-zinc-300/95"
                          : IS_NO6
                            ? "text-red-50/90"
                            : IS_NO7
                              ? "text-emerald-100/85"
                          : "text-slate-400"
                }`}
              >
                {label}
                {i === activeIndex && (
                  <span
                    className={`absolute bottom-0 left-2 right-2 rounded-full h-1 md:h-1.5 ${
                      IS_NO2 || IS_NO3 || IS_NO4 || IS_NO5 || IS_NO6
                        ? "bg-white"
                        : IS_NO7
                          ? "bg-emerald-200"
                          : "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.45)]"
                    }`}
                  />
                )}
              </div>
            ))}
          </nav>
        )}
        {!hideNo3Header && (
          <div
            className={`relative z-[2] flex shrink-0 flex-wrap items-center justify-between gap-3 px-4 md:px-7 ${
              IS_NO5 ? "gap-4 py-3.5 md:gap-5 md:py-4 lg:py-5" : IS_NO1 ? "gap-3 py-3.5 md:py-4" : "gap-3 py-2.5 md:py-3"
            } ${panelClass}`}
          >
            <div>
              <h2
                className={`whitespace-nowrap font-bold leading-[1.15] tracking-tight ${
                  IS_NO2 || IS_NO3 || IS_NO4
                    ? "text-3xl text-slate-800 md:text-4xl lg:text-5xl"
                    : IS_NO5
                      ? "text-3xl text-white md:text-4xl lg:text-5xl xl:text-[3.45rem]"
                      : IS_NO6
                        ? "text-3xl text-slate-900 md:text-4xl lg:text-5xl xl:text-[3.35rem]"
                      : "text-3xl text-white md:text-4xl lg:text-5xl xl:text-[3.25rem]"
                }`}
              >
                {title}
              </h2>
              {badge ? (
                <span
                  className={
                    IS_NO5
                      ? "mt-2.5 inline-block rounded-lg px-6 py-3 text-xl font-bold tracking-wide text-red-50 md:mt-3 md:px-7 md:py-3.5 md:text-2xl lg:text-[1.65rem] bg-red-950/50 ring-1 ring-red-500/25"
                      : IS_NO6
                        ? "mt-2 inline-block rounded-lg px-4 py-2 text-lg font-bold tracking-wide md:px-5 md:py-2.5 md:text-xl lg:text-2xl bg-red-500/12 text-red-800 ring-1 ring-red-400/35"
                      : `mt-2 inline-block rounded-lg px-4 py-2 text-lg font-bold tracking-wide md:px-5 md:py-2.5 md:text-xl lg:text-2xl ${
                          IS_NO2
                            ? "bg-emerald-500/15 text-emerald-800 ring-1 ring-emerald-600/20"
                            : IS_NO3 || IS_NO4
                              ? "bg-rose-500/15 text-rose-800 ring-1 ring-rose-500/25"
                              : "bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-400/25"
                        }`
                  }
                >
                  {badge}
                </span>
              ) : null}
            </div>
            {rightPills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {rightPills.map((pill) => (
                  <span
                    key={pill}
                    className={`rounded-lg px-5 py-2.5 text-lg font-semibold md:px-6 md:py-3 md:text-xl lg:text-2xl ${
                      IS_NO2 || IS_NO3 || IS_NO4
                        ? "border border-slate-300 bg-slate-50 text-slate-800 shadow-sm"
                        : IS_NO5
                          ? "border border-white/25 bg-zinc-900 text-white shadow-[0_8px_28px_rgba(0,0,0,0.35)]"
                          : IS_NO6
                            ? "border border-red-200/80 bg-white text-red-950 shadow-[0_8px_20px_rgba(185,28,28,0.1)]"
                          : "border border-slate-500/80 bg-slate-800/90 text-slate-50 shadow-sm"
                    }`}
                  >
                    {pill}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        )}
        <div
          className={`min-h-0 flex-1 overflow-hidden ${
            hideNo3Header
              ? IS_NO4 || IS_NO6 || IS_NO7
                ? "p-0"
                : "p-1 md:p-2"
              : IS_NO5
                ? "p-0"
                : IS_NO6
                  ? "px-3 pb-3 pt-4 md:px-4 md:pb-4 md:pt-5 lg:px-5 lg:pb-5 lg:pt-6"
                  : "px-3 pb-2 pt-6 md:px-4 md:pb-3 md:pt-7 lg:px-5 lg:pb-4 lg:pt-8"
          } ${pageBgClass} ${IS_NO5 ? "relative" : ""}`}
        >
          {IS_NO5 ? (
            <>
              <No5FilmGrainOverlay />
              <div className="relative z-[2] flex h-full min-h-0 flex-col overflow-hidden">{children}</div>
            </>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
}

function DualBars({ planHeights, actHeights, actColors, labels }) {
  return (
      <div className="relative flex w-full flex-1 flex-col gap-3 border-t border-slate-700/80 pt-4 md:pt-5">
      <div className="flex h-full min-h-0 items-end justify-around gap-2 px-0.5 pb-0.5">
      {labels.map((lab, i) => (
        <div key={lab} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <div className="flex h-[190px] w-full max-w-[116px] items-end justify-center gap-1.5 sm:h-[220px] sm:max-w-[122px] md:h-[280px] md:max-w-[136px]">
            <div
              className="w-[42%] max-w-[36px] rounded-t-sm bg-slate-600/90 md:max-w-[44px]"
              style={{
                height: `${planHeights[i]}%`,
                transformOrigin: "bottom",
                animation: "dashBarGrow 1s cubic-bezier(0.22, 1, 0.36, 1) forwards, dashBarGlow 2.4s ease-in-out infinite",
                animationDelay: `${0.08 + i * 0.1}s`,
                transform: "scaleY(0)",
              }}
            />
            <div
              className={`w-[42%] max-w-[36px] rounded-t-sm bg-gradient-to-t md:max-w-[44px] ${actColors[i]}`}
              style={{
                height: `${actHeights[i]}%`,
                transformOrigin: "bottom",
                animation: "dashBarGrow 1.05s cubic-bezier(0.22, 1, 0.36, 1) forwards, dashBarGlow 2s ease-in-out infinite",
                animationDelay: `${0.18 + i * 0.1}s`,
                transform: "scaleY(0)",
              }}
            />
          </div>
          <span className="text-center text-sm font-semibold leading-tight text-slate-300 md:text-lg">{lab}</span>
        </div>
      ))}
      </div>
      <div className="pointer-events-none absolute left-2 top-2 flex gap-5 text-xs text-slate-400 md:text-base">
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-sm bg-slate-500" />
          計画
        </span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-sm bg-cyan-400" />
          実績
        </span>
      </div>
    </div>
  );
}

function SlidePL() {
  return (
    <div className={`${SLIDE_FRAME_CLASS} no1-preset-slide`}>
      <div className="kpi-seq grid shrink-0 grid-cols-2 gap-2 md:grid-cols-4">
        <KpiCard borderClass="bg-blue-500" label="売上高（十万円）" value="¥27,132" plan="¥27,147" diff="-15" positive={false} primary countDuration={1100} />
        <KpiCard borderClass="bg-rose-500" label="販管費（十万円）" value="¥25,343" plan="¥27,234" diff="-1,891" positive />
        <KpiCard borderClass="bg-emerald-500" label="経常利益（十万円）" value="¥1,559" plan="-¥480" diff="+2,039" positive />
        <KpiCard borderClass="bg-violet-500" label="利益率" value="5.7%" plan="-1.8%" diff="+7.5pt" positive />
      </div>
      <div className="slide-lower grid h-full min-h-0 auto-rows-fr gap-3 md:grid-cols-2 md:gap-4">
        <div className="relative flex h-full min-h-0 flex-col rounded-xl border border-slate-600/70 bg-slate-800/85 p-3 shadow-sm md:p-4">
          <p className="mb-1 text-3xl font-semibold tracking-wide text-slate-100 md:text-4xl">単月PL予実 (4月)</p>
          <DualBars
            labels={["売上高", "販管費", "経常利益"]}
            planHeights={[88, 92, 22]}
            actHeights={[87, 86, 58]}
            actColors={["from-blue-500 to-sky-400", "from-rose-500 to-rose-400", "from-emerald-500 to-teal-400"]}
          />
        </div>
        <div className="relative flex h-full min-h-0 flex-col rounded-xl border border-slate-600/70 bg-slate-800/85 p-3 shadow-sm md:p-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <p className="text-3xl font-semibold tracking-wide text-slate-100 md:text-4xl">累計PL予実 (4月-4月)</p>
            <span className="shrink-0 rounded bg-slate-700 px-2.5 py-1 text-sm text-slate-300 md:text-base">累計</span>
          </div>
          <DualBars
            labels={["売上高", "販管費", "経常利益"]}
            planHeights={[86, 94, 24]}
            actHeights={[85, 88, 62]}
            actColors={["from-violet-600 to-indigo-400", "from-violet-600 to-indigo-400", "from-violet-600 to-indigo-400"]}
          />
        </div>
      </div>
    </div>
  );
}

function SlideMemberTrend() {
  const pts = "20,120 52,108 84,112 116,95 148,88 180,72 212,68 244,55 276,48 308,42 340,38";
  return (
    <div className={`${SLIDE_FRAME_CLASS} no1-preset-slide`}>
      <div className="kpi-seq grid shrink-0 grid-cols-2 gap-2 md:grid-cols-4">
        <KpiCard borderClass="bg-cyan-500" label="月初会員数" value="4,830名" plan="4,869" diff="-39" positive={false} primary countDuration={1100} />
        <KpiCard borderClass="bg-orange-400" label="入会数" value="258名" plan="244" diff="+14" positive />
        <KpiCard borderClass="bg-slate-500" label="退会数" value="200名" plan="174" diff="+26" positive />
        <KpiCard borderClass="bg-violet-500" label="純増数" value="58名" plan="70" diff="-12" positive={false} />
      </div>
      <div className="slide-lower grid h-full min-h-0 auto-rows-fr gap-3 md:grid-cols-5 md:gap-4">
        <div className="relative flex h-full min-h-0 flex-col rounded-xl border border-slate-600/70 bg-slate-800/85 p-3 shadow-sm md:col-span-3 md:p-4">
          <p className="mb-2 text-3xl font-semibold tracking-wide text-slate-100 md:text-4xl">会員数推移（月初会員数）</p>
          <svg viewBox="0 0 360 140" className="h-full min-h-[260px] w-full flex-1">
            <defs>
              <linearGradient id="mFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(34,211,238)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="rgb(34,211,238)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line x1="20" y1="20" x2="20" y2="125" stroke="#475569" strokeWidth="1" />
            <line x1="20" y1="125" x2="340" y2="125" stroke="#475569" strokeWidth="1" />
            <polyline points={`20,125 ${pts} 340,125`} fill="url(#mFill)" />
            <polyline
              points="20,118 52,114 84,116 116,108 148,104 180,98 212,96 244,92 276,88 308,86 340,82"
              fill="none"
              stroke="#64748b"
              strokeWidth="2.6"
              strokeDasharray="6 4"
              style={{ strokeDasharray: 400, animation: "dashLineDraw 1.8s ease-out forwards" }}
            />
            <polyline
              points={`20,125 ${pts}`}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="3.4"
              strokeLinecap="round"
              style={{ strokeDasharray: 420, animation: "dashLineDraw 2s ease-out 0.15s forwards, dashLinePulse 2.8s ease-in-out 1.2s infinite" }}
            />
          </svg>
        </div>
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-600/70 bg-slate-800/85 p-3 shadow-sm md:col-span-2 md:p-4">
          <p className="mb-2 text-3xl font-semibold tracking-wide text-slate-100 md:text-4xl">勝ち負け表（単月）</p>
          <table className="h-full w-full text-xl md:text-3xl">
            <thead>
              <tr className="border-b border-slate-600 text-left text-slate-400">
                <th className="py-1">項目</th>
                <th className="py-1">達成率</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {[
                ["月初会員数", "99.2%"],
                ["入会数", "105.7%"],
                ["退会数", "114.9%"],
                ["純増数", "82.9%"],
              ].map(([a, b]) => (
                <tr key={a} className="border-b border-slate-700">
                  <td className="py-2">{a}</td>
                  <td className="py-2 font-semibold text-cyan-400 [animation:dashRatePulse_2.4s_ease-in-out_infinite]">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SlideMemberDetail() {
  return (
    <div className={`${SLIDE_FRAME_CLASS} no1-preset-slide`}>
      <div className="kpi-seq grid shrink-0 grid-cols-2 gap-2 md:grid-cols-4">
        <KpiCard borderClass="bg-cyan-500" label="総会員数" value="4,830名" plan="前月 4,772" diff="+58" positive primary countDuration={1100} />
        <KpiCard borderClass="bg-blue-500" label="男性比率" value="69.4%" plan="目標 68.0%" diff="+1.4pt" positive />
        <KpiCard borderClass="bg-pink-500" label="女性比率" value="30.6%" plan="目標 32.0%" diff="-1.4pt" positive={false} />
        <KpiCard borderClass="bg-violet-500" label="最多年齢層" value="20代" plan="会員数" diff="1,280名" neutral />
      </div>
      <div className="slide-lower grid h-full min-h-0 auto-rows-fr grid-cols-2 gap-3 md:gap-4">
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-600/70 bg-slate-800/85 p-3 shadow-sm md:p-4">
          <p className="mb-2 text-3xl font-semibold tracking-wide text-slate-100 md:text-4xl">会員種別構成比</p>
          <div className="flex min-h-[140px] flex-1 items-center justify-center md:min-h-[180px]">
            <svg viewBox="0 0 100 100" className="h-56 w-56 md:h-72 md:w-72">
            <circle cx="50" cy="50" r="32" fill="none" stroke="#475569" strokeWidth="16" />
            <circle
              cx="50"
              cy="50"
              r="32"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="16"
              strokeDasharray="75 125"
              transform="rotate(-90 50 50)"
              style={{ opacity: 0, animation: "dashReveal 0.9s ease-out forwards, dashLinePulse 2.6s ease-in-out 1s infinite" }}
            />
            <circle
              cx="50"
              cy="50"
              r="32"
              fill="none"
              stroke="#818cf8"
              strokeWidth="16"
              strokeDasharray="50 150"
              strokeDashoffset="-75"
              transform="rotate(-90 50 50)"
              style={{ opacity: 0, animation: "dashReveal 0.9s ease-out 0.12s forwards, dashLinePulse 2.4s ease-in-out 1.1s infinite" }}
            />
          </svg>
          <div className="ml-6 text-xl text-slate-300 md:text-3xl">
            <p className="mb-2 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-sky-500" />
              正会員 60.0%
            </p>
            <p className="mb-2 flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-400" />
              一般会員 30.0%
            </p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-500" />
              そE仁E10.0%
            </p>
          </div>
        </div>
      </div>
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-600/70 bg-slate-800/85 p-3 shadow-sm md:p-4">
          <p className="mb-2 text-3xl font-semibold tracking-wide text-slate-100 md:text-4xl">性別構成比</p>
          <div className="flex min-h-[140px] flex-1 items-center justify-center gap-6 md:min-h-[180px]">
            <svg viewBox="0 0 100 100" className="h-56 w-56 md:h-72 md:w-72">
            <circle cx="50" cy="50" r="28" fill="none" stroke="#475569" strokeWidth="14" />
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="14"
              strokeDasharray="122 54"
              transform="rotate(-90 50 50)"
              style={{ opacity: 0, animation: "dashReveal 0.85s ease-out forwards" }}
            />
            <circle
              cx="50"
              cy="50"
              r="28"
              fill="none"
              stroke="#f472b6"
              strokeWidth="14"
              strokeDasharray="54 122"
              strokeDashoffset="-122"
              transform="rotate(-90 50 50)"
              style={{ opacity: 0, animation: "dashReveal 0.85s ease-out 0.1s forwards" }}
            />
          </svg>
            <div className="text-xl text-slate-300 md:text-3xl">
              <p className="mb-2 flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-blue-500" />
                男性 69.4%
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-pink-400" />
                女性 30.6%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideSales() {
  return (
    <div className={`${SLIDE_FRAME_CLASS} no1-preset-slide`}>
      <div className="kpi-seq grid shrink-0 grid-cols-2 gap-2 md:grid-cols-4">
        <KpiCard borderClass="bg-blue-500" label="売上高（十万円）" value="¥27,132" plan="¥27,147" diff="-15" positive={false} primary countDuration={1100} />
        <KpiCard borderClass="bg-orange-400" label="客単価（円）" value="¥5,617" plan="¥5,575" diff="+42" positive />
        <KpiCard borderClass="bg-teal-500" label="売上達成率" value="99.9%" plan="目標比" diff="達成" neutral />
        <KpiCard borderClass="bg-violet-500" label="客単価達成率" value="100.8%" plan="目標比" diff="達成" neutral />
      </div>
      <div className="slide-lower grid h-full min-h-0 auto-rows-fr gap-3 md:grid-cols-2 md:gap-4">
        <div className="flex h-full min-h-0 flex-col justify-between rounded-xl border border-slate-600/70 bg-slate-800/85 p-3 shadow-sm md:p-4">
          <p className="mb-1 text-3xl font-semibold tracking-wide text-slate-100 md:text-4xl">客単価・売上高推移</p>
          <svg viewBox="0 0 320 120" className="h-52 w-full shrink-0 sm:h-56 md:h-64">
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1="24" y1={24 + i * 22} x2="300" y2={24 + i * 22} stroke="#334155" strokeWidth="1" />
            ))}
            {[40, 72, 104, 136, 168, 200, 232, 264, 296].map((x, i) => (
              <rect
                key={x}
                x={x - 10}
                y={85 - (i % 5) * 8}
                width="16"
                height={(i % 5) * 8 + 25}
                fill={i % 2 ? "#38bdf8" : "#64748b"}
                rx="2"
                style={{
                  transformOrigin: "bottom",
                  animation: "dashBarGrow 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards, dashBarGlow 2.3s ease-in-out infinite",
                  animationDelay: `${0.06 * i}s`,
                  transform: "scaleY(0)",
                }}
              />
            ))}
            <polyline
              points="24,78 56,72 88,74 120,62 152,58 184,52 216,48 248,44 280,40 312,36"
              fill="none"
              stroke="#fb923c"
              strokeWidth="3"
              style={{ strokeDasharray: 300, animation: "dashLineDraw 1.6s ease-out 0.3s forwards, dashLinePulse 2.8s ease-in-out 1.2s infinite" }}
            />
          </svg>
        </div>
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-600/70 bg-slate-800/85 p-3 shadow-sm md:p-4">
          <p className="mb-2 text-3xl font-semibold tracking-wide text-slate-100 md:text-4xl">予実詳細（売上・客単価）</p>
          <table className="h-full w-full text-xl md:text-3xl">
            <thead>
              <tr className="border-b border-slate-600 text-left text-slate-400">
                <th className="py-1">項目</th>
                <th className="py-1">計画</th>
                <th className="py-1">実績</th>
                <th className="py-1">達成率</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-700">
                <td className="py-1">売上高</td>
                <td className="py-1 tabular-nums">27,147</td>
                <td className="py-1 tabular-nums">27,132</td>
                <td className="py-1 font-semibold text-cyan-400 [animation:dashRatePulse_2.4s_ease-in-out_infinite]">99.9%</td>
              </tr>
              <tr>
                <td className="py-1">客単価</td>
                <td className="py-1 tabular-nums">5,575</td>
                <td className="py-1 tabular-nums">5,617</td>
                <td className="py-1 font-semibold text-emerald-400 [animation:dashRatePulse_2.4s_ease-in-out_infinite]">100.8%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function No2Kpi({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <p className="text-lg font-semibold text-slate-600 md:text-xl">{label}</p>
      <p className="mt-2 text-4xl font-black text-slate-800 md:text-5xl">{value}</p>
      <p className="mt-1 text-base text-emerald-700 md:text-lg">{sub}</p>
    </div>
  );
}

function No3Kpi({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <p className="text-lg font-semibold text-slate-600 md:text-xl">{label}</p>
      <p className="mt-2 text-4xl font-black text-slate-800 md:text-5xl">{value}</p>
      <p className="mt-1 text-base text-red-700 md:text-lg">{sub}</p>
    </div>
  );
}

function No2BrandComparePanel({ compact = false }) {
  const brands = [
    { name: "ANYTIME", logo: "/logos/anytime-user.png", score: "A", diff: "+5.2%" },
    { name: "FIT PLACE24", logo: "/logos/fitplace-user.png", score: "S", diff: "+8.1%" },
    { name: "JOYFIT24", logo: "/logos/joyfit-user.png", score: "A", diff: "+4.7%" },
    { name: "FIT365", logo: "/logos/fit365-user.png", score: "B", diff: "+1.8%" },
  ];
  return (
    <div className={`rounded-xl border border-slate-300 bg-white p-4 shadow-sm ${compact ? "h-full min-h-0" : ""}`}>
      <p className="text-xl font-bold text-slate-800 md:text-2xl">4店舗比較</p>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {brands.map((b) => (
          <div key={b.name} className="brand-logo-card rounded-lg border border-slate-200 bg-slate-50 p-2 text-center">
            <img src={b.logo} alt={b.name} className="mx-auto h-9 w-auto object-contain" />
            <p className="mt-1 text-[11px] font-semibold text-slate-600">{b.name}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm md:text-base">
        {["店舗", "ランク", "差分"].map((h) => (
          <div key={h} className="rounded bg-slate-700/70 px-2 py-1 font-semibold text-slate-100">{h}</div>
        ))}
        {brands.flatMap((b) => [b.name, b.score, b.diff]).map((v, idx) => (
          <div key={`${v}-${idx}`} className="rounded bg-slate-100 px-2 py-1 text-slate-700">{v}</div>
        ))}
      </div>
    </div>
  );
}

function No2DynamicRadarPanel() {
  return (
    <div className="no2-radar-panel relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(59,130,246,.14),transparent_42%)]" />
      <p className="relative text-xl font-bold text-slate-800 md:text-2xl">レジスタンスマシン充実度比較</p>
      <p className="relative mt-1 text-sm font-semibold text-slate-500">4店舗ラインナップを6項目で比較（仮説データ）</p>
      <div className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-lg border border-slate-200 bg-slate-50/70 p-2">
        <div className="no2-radar-orbit pointer-events-none absolute inset-3 rounded-full border border-cyan-300/35" />
        <div className="no2-radar-orbit delay pointer-events-none absolute inset-7 rounded-full border border-emerald-300/25" />
        <div
          className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent opacity-60"
          style={{ animation: "dashShine 3.1s ease-in-out infinite" }}
        />
        <img
          src="/no2-machine-radar.png"
          alt="4店舗のレジスタンスマシン充実度比較グラフ"
          className="no2-radar-image h-full w-full object-contain"
          style={{ transformOrigin: "center bottom" }}
        />
        <div className="no2-radar-live absolute right-3 top-3 rounded-md border border-cyan-300/60 bg-cyan-500/10 px-2 py-1 text-xs font-black text-cyan-700">
          LIVE VIEW
        </div>
      </div>
    </div>
  );
}

function No2SlideStoreBank() {
  return (
    <div className={SLIDE_FRAME_CLASS}>
      <div className="kpi-seq grid grid-cols-2 gap-2 md:grid-cols-4">
        <No2Kpi label="競合登録店舗" value="126店" sub="ANYTIME / FIT PLACE / FASTGYM / FIT365" />
        <No2Kpi label="住所・HP・SNS連携" value="100%" sub="ワンクリック遷移" />
        <No2Kpi label="比較機能ページ" value="42ページ" sub="坪数 / OPEN日 / 月会費 ほか" />
        <No2Kpi label="更新頻度" value="週次" sub="APP SHEETで更新" />
      </div>
      <div className="slide-lower grid h-full min-h-0 gap-3 md:grid-cols-3 md:gap-4">
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-300 bg-white p-4 shadow-sm md:col-span-2">
          <p className="text-2xl font-bold text-slate-800 md:text-3xl">競合店舗データバンク</p>
          <div className="mt-3 grid grid-cols-4 gap-2 text-sm md:text-base">
            {["ブランド", "店舗名", "住所", "SNS/HP"].map((h) => (
              <div key={h} className="rounded bg-slate-700/70 px-2 py-1 font-semibold text-slate-200">{h}</div>
            ))}
            {[
              ["ANYTIME", "●●", "●●市", "HP / Insta"],
              ["FIT PLACE24", "●●", "●●市", "HP / X"],
              ["FIT365", "●●", "●●市", "HP / LINE"],
              ["FASTGYM24", "●●", "●●市", "HP / Insta"],
            ].flat().map((v, idx) => (
              <div key={`${v}-${idx}`} className="rounded bg-slate-900/80 px-2 py-1 text-slate-100">{v}</div>
            ))}
          </div>
          <div className="mt-4">
            <No2BrandComparePanel compact />
          </div>
        </div>
        <No2DynamicRadarPanel />
      </div>
    </div>
  );
}

function No2SlideMachineSpec() {
  const rows = ["チェストプレス", "ショルダープレス", "ラットプル", "レッグプレス", "アブドミナル"];
  return (
    <div className={SLIDE_FRAME_CLASS}>
      <div className="kpi-seq grid grid-cols-2 gap-2 md:grid-cols-4">
        <No2Kpi label="比較ブランド" value="4社" sub="ANYTIME/FIT PLACE/FIT365/JOYFIT" />
        <No2Kpi label="比較部位" value="肩・背中・腕・腹" sub="部位別に機種を比較" />
        <No2Kpi label="最大差分" value="+7台" sub="部位別の台数ギャップ" />
        <No2Kpi label="不足検知" value="即時" sub="弱点部位を可視化" />
      </div>
      <div className="slide-lower grid h-full min-h-0 auto-rows-fr gap-3 md:grid-cols-3 md:gap-4">
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-800 md:text-3xl">部位バランス</p>
          <svg viewBox="0 0 220 220" className="no2-spec-radar-stage mt-3 h-full min-h-0 w-full flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
            <polygon points="110,25 185,70 170,160 50,160 35,70" fill="rgba(16,185,129,0.08)" stroke="#94a3b8" />
            <polyline points="110,40 160,78 150,145 72,145 58,82 110,40" fill="rgba(34,197,94,0.2)" stroke="#16a34a" strokeWidth="2" className="no2-spec-poly-main" style={{ animation: "chart3dIn .9s ease-out .1s both" }} />
            <polyline points="110,52 138,84 132,126 88,126 80,88 110,52" fill="rgba(59,130,246,0.2)" stroke="#2563eb" strokeWidth="2" className="no2-spec-poly-sub" style={{ animation: "chart3dIn .9s ease-out .25s both" }} />
            <text x="105" y="16" fontSize="10" fill="#334155">肩</text>
            <text x="194" y="74" fontSize="10" fill="#334155">胸</text>
            <text x="174" y="176" fontSize="10" fill="#334155">腹</text>
            <text x="33" y="176" fontSize="10" fill="#334155">腕</text>
            <text x="14" y="74" fontSize="10" fill="#334155">背中</text>
          </svg>
        </div>
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-300 bg-white p-4 shadow-sm md:col-span-2">
          <p className="text-2xl font-bold text-slate-800 md:text-3xl">マシンスペック比較</p>
          <div className="mt-3 grid flex-1 auto-rows-fr grid-cols-4 gap-2 text-base md:text-lg">
            {["区分", "JOYFIT", "ANYTIME", "FIT PLACE"].map((h) => (
              <div key={h} className="no2-spec-head rounded bg-slate-700/70 px-2 py-1 font-semibold text-slate-200">{h}</div>
            ))}
            {rows.flatMap((r, i) => [r, String(3 + i), String(2 + i), String(1 + i)]).map((v, idx) => (
              <div key={`${v}-${idx}`} className="no2-spec-cell rounded bg-slate-900/80 px-2 py-1 text-slate-100">{v}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function No2SlideMemberTrend() {
  const months = ["2025年4月", "2025年5月", "2025年6月", "2025年7月", "2025年8月", "2025年9月", "2025年10月", "2025年11月", "2025年12月", "2026年1月", "2026年2月", "2026年3月"];
  const memberTrend = [1124, 1156, 1145, 1161, 1192, 1207, 1220, 1208, 1202, 1200, 1277, 1248];
  const joinVals = [88, 56, 73, 82, 80, 64, 43, 35, 54, 147, 30, 64];
  const leaveVals = [58, 67, 58, 52, 66, 50, 55, 42, 58, 72, 60, 66];
  const netTrend = [2.6, -1.2, 0.8, 1.7, 0.9, -0.4, -1.8, -2.3, -1.1, 4.7, -2.6, -0.3];
  return (
    <div className={SLIDE_FRAME_CLASS}>
      <div className="kpi-seq grid grid-cols-2 gap-2 md:grid-cols-4">
        <No2Kpi label="月初会員数" value="1,248" sub="前年同月比 +11.2%" />
        <No2Kpi label="入会数" value="64" sub="前年同月比 +12.3%" />
        <No2Kpi label="退会数" value="30" sub="前年同月比 -2.3%" />
        <No2Kpi label="純増率" value="5.1%" sub="比較機能データより" />
      </div>
      <div className="slide-lower grid h-full min-h-0 auto-rows-fr gap-3 md:grid-cols-3 md:gap-4">
        <div className="chart-stage flex h-full min-h-0 flex-col rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-800 md:text-3xl">会員推移</p>
          <svg viewBox="0 0 360 220" className="mt-3 h-full min-h-0 w-full flex-1 rounded-lg border border-slate-200 bg-gradient-to-t from-cyan-500/10 to-transparent p-2">
            {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1="24" y1={28 + i * 30} x2="342" y2={28 + i * 30} stroke="#cbd5e1" />)}
            {memberTrend.map((v, i) => {
              const x = 24 + i * 28;
              const y = 188 - (v - 1120) * 1.5;
              return (
                <g key={v + i}>
                  <circle cx={x} cy={y} r="3.5" fill="#0891b2" style={{ animation: `chartPointIn .35s ease-out ${0.07 * i}s both` }} />
                  {i > 0 && (
                    <line
                      x1={24 + (i - 1) * 28}
                      y1={188 - (memberTrend[i - 1] - 1120) * 1.5}
                      x2={x}
                      y2={y}
                      stroke="#06b6d4"
                      strokeWidth="3.6"
                      style={{ animation: `chartLineIn .35s ease-out ${0.07 * i}s both` }}
                    />
                  )}
                </g>
              );
            })}
            <text x="24" y="214" fontSize="10" fill="#475569">{months[0]}</text>
            <text x="276" y="214" fontSize="10" fill="#475569">{months[months.length - 1]}</text>
          </svg>
        </div>
        <div className="chart-stage flex h-full min-h-0 flex-col rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-800 md:text-3xl">入会・退会</p>
          <svg viewBox="0 0 360 220" className="mt-3 h-full min-h-0 w-full flex-1 rounded-lg border border-slate-200 bg-gradient-to-t from-pink-500/10 to-transparent p-2">
            {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1="24" y1={28 + i * 30} x2="342" y2={28 + i * 30} stroke="#e2e8f0" />)}
            {joinVals.map((val, i) => {
              const x = 28 + i * 26;
              return (
                <g key={`bars-${i}`}>
                  <rect
                    x={x}
                    y={190 - val}
                    width="9"
                    height={val}
                    fill="#ec4899"
                    rx="2"
                    style={{ animation: `chartBar3dIn .55s cubic-bezier(.22,1,.36,1) ${0.06 * i}s both` }}
                  />
                  <rect
                    x={x + 11}
                    y={190 - leaveVals[i]}
                    width="9"
                    height={leaveVals[i]}
                    fill="#8b5cf6"
                    rx="2"
                    style={{ animation: `chartBar3dIn .55s cubic-bezier(.22,1,.36,1) ${0.06 * i + 0.08}s both` }}
                  />
                </g>
              );
            })}
            {[24, 154, 284].map((x, idx) => <text key={x} x={x} y="214" fontSize="10" fill="#475569">{months[idx * 5]}</text>)}
          </svg>
        </div>
        <div className="chart-stage flex h-full min-h-0 flex-col rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-800 md:text-3xl">純増トレンド</p>
          <svg viewBox="0 0 360 220" className="mt-3 h-full min-h-0 w-full flex-1 rounded-lg border border-slate-200 bg-gradient-to-t from-amber-500/10 to-transparent p-2">
            <line x1="24" y1="108" x2="342" y2="108" stroke="#94a3b8" strokeWidth="1.5" />
            {netTrend.map((v, i) => {
              const x = 24 + i * 28;
              const y = 108 - v * 16;
              return (
                <g key={`net-${i}`}>
                  {i > 0 && (
                    <line
                      x1={24 + (i - 1) * 28}
                      y1={108 - netTrend[i - 1] * 16}
                      x2={x}
                      y2={y}
                      stroke="#f59e0b"
                      strokeWidth="3.2"
                      style={{ animation: `chartLineIn .35s ease-out ${0.07 * i}s both` }}
                    />
                  )}
                  <circle cx={x} cy={y} r="3.2" fill="#d97706" style={{ animation: `chartPointIn .35s ease-out ${0.07 * i}s both` }} />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

function No2SlideRank() {
  return (
    <div className={SLIDE_FRAME_CLASS}>
      <div className="kpi-seq grid grid-cols-2 gap-2 md:grid-cols-4">
        <No2Kpi label="総合評価" value="S" sub="比較指標を標準化" />
        <No2Kpi label="上位差分" value="+5.2%" sub="競合平均との差分" />
        <No2Kpi label="自店順位" value="3位" sub="JOYFIT武蔵浦和" />
        <No2Kpi label="可視化頻度" value="月次/週次" sub="ダッシュボードで共有可能" />
      </div>
      <div className="slide-lower grid h-full min-h-0 auto-rows-fr gap-3 md:grid-cols-2 md:gap-4">
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-800 md:text-3xl">競合ランク比較</p>
          <div className="mt-3 grid flex-1 auto-rows-fr grid-cols-3 gap-2 text-base md:text-lg">
            {["店舗", "総合ランク", "差分"].map((h) => (
              <div key={h} className="rounded bg-slate-700/70 px-2 py-1 font-semibold text-slate-200">{h}</div>
            ))}
            {[
              ["JOYFIT 武蔵浦和", "S", "+16.7%"],
              ["ANYTIME 浦和", "A", "+5.2%"],
              ["FIT PLACE24", "A", "+3.8%"],
              ["FIT365", "B", "-1.1%"],
            ].flat().map((v, idx) => (
              <div key={`${v}-${idx}`} className="rounded bg-slate-100 px-2 py-1 text-slate-700">{v}</div>
            ))}
          </div>
        </div>
        <div className="flex h-full min-h-0 flex-col rounded-xl border border-slate-300 bg-white p-4 shadow-sm">
          <p className="text-2xl font-bold text-slate-800 md:text-3xl">競合会員推移（比較）</p>
          <svg viewBox="0 0 520 240" className="mt-3 h-full min-h-0 w-full flex-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line key={i} x1="30" y1={30 + i * 34} x2="500" y2={30 + i * 34} stroke="#cbd5e1" strokeWidth="1" />
            ))}
            {[40, 85, 130, 175, 220, 265, 310, 355, 400, 445, 490].map((x) => (
              <line key={x} x1={x} y1="30" x2={x} y2="205" stroke="#e2e8f0" strokeWidth="1" />
            ))}
            <polyline points="40,184 85,166 130,170 175,152 220,138 265,126 310,132 355,146 400,118 445,96 490,108" fill="none" stroke="#0ea5e9" strokeWidth="4" />
            <polyline points="40,192 85,186 130,178 175,170 220,165 265,159 310,154 355,149 400,140 445,132 490,125" fill="none" stroke="#f97316" strokeWidth="4" />
            <polyline points="40,198 85,194 130,188 175,184 220,182 265,176 310,172 355,166 400,160 445,156 490,150" fill="none" stroke="#8b5cf6" strokeWidth="4" />
            <text x="34" y="222" fontSize="11" fill="#475569">2025年4月</text>
            <text x="438" y="222" fontSize="11" fill="#475569">2026年3月</text>
            <text x="360" y="44" fontSize="11" fill="#0ea5e9">JOYFIT</text>
            <text x="418" y="44" fontSize="11" fill="#f97316">ANYTIME</text>
            <text x="486" y="44" fontSize="11" fill="#8b5cf6">FIT365</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

function No3IosStatusIcons() {
  return (
    <div className="flex items-center gap-1.5 pr-0.5">
      <svg width="17" height="11" viewBox="0 0 17 11" className="shrink-0" aria-hidden>
        <rect x="0" y="7" width="3" height="4" rx="0.6" fill="currentColor" />
        <rect x="4.5" y="5" width="3" height="6" rx="0.6" fill="currentColor" />
        <rect x="9" y="3" width="3" height="8" rx="0.6" fill="currentColor" />
        <rect x="13.5" y="1" width="3" height="10" rx="0.6" fill="currentColor" />
      </svg>
      <svg width="15" height="11" viewBox="0 0 15 11" className="shrink-0" aria-hidden>
        <path d="M7.5 10.2 9.4 8.3" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M4.1 7.1a4.3 4.3 0 0 1 6.8 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M1.6 5.3a7.2 7.2 0 0 1 11.8 0" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <div className="flex h-[11px] w-[22px] items-center rounded-sm border border-black/35 bg-white px-[2px]">
        <div className="h-[7px] flex-1 rounded-[1px] bg-emerald-500" />
      </div>
    </div>
  );
}

/**
 * iOS風クローム＋縦長ビューポート（静止画）／または画面収録動画。
 * - 静止画: 偽Safari＋`fit`（contain / cover）。`cover` 時のみ画像に縦方向の軽いスクロール演出。
 * - `videoSrc`: 実機収録。**左＝説明コピー、右＝端末全体が収まるサイズ＋動画**（軽い上方向クリップで OS／ブラウザ帯のみ抑える。`contain` で画面全体が判読できるようにする）。
 */
function No3SlideIosLpView({ src, alt, title, url, fit = "contain", videoSrc }) {
  const useCover = fit === "cover";
  const isVideo = Boolean(videoSrc);
  const isSplitView = isVideo || IS_NO4;
  const no3CopyBlocks = IS_NO4
    ? [
        "新店オープンに向けた\n各工程の自動逆算・可視化",
        "進捗管理の標準化",
        "工程抜け・認識ズレの防止と\n関係部署間の連携強化",
      ]
    : [
        "ファーストビューで金額がすぐに分かる",
        "マシンラインナップを画像で訴求",
        "APP入会・追加特典の\nリンクバナーを設置",
        "店舗画像・住所を\nグーグルマップで確認",
      ];
  const [copyIndex, setCopyIndex] = useState(0);

  useEffect(() => {
    if (!isSplitView) return;
    setCopyIndex(0);
    const intervalMs = IS_NO4 ? 7500 : 8500;
    const id = setInterval(() => {
      setCopyIndex((prev) => {
        if (prev >= no3CopyBlocks.length - 1) {
          clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [isSplitView, no3CopyBlocks.length]);

  const activeCopy = no3CopyBlocks[copyIndex];
  return (
    <div className={isSplitView ? "flex h-full min-h-0 flex-col" : SLIDE_FRAME_CLASS}>
      {!isSplitView && (
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <p className="text-2xl font-black text-slate-800 md:text-4xl">{title}</p>
        <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 md:text-base">
          {isVideo ? "実機スクリーン収録（MP4）" : useCover ? "スマホ表示（Safari想定）" : "ページ全体を表示（余白付き）"}
        </span>
      </div>
      )}
      <div
        className={`slide-lower relative min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-300 bg-gradient-to-b from-slate-300 via-slate-100 to-slate-200 shadow-inner ${
          isSplitView ? "no3-lp-after grid grid-cols-2 gap-0 p-0" : "flex items-center justify-center p-3 md:p-5"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(244,63,94,0.14),transparent_42%),radial-gradient(ellipse_at_80%_100%,rgba(6,182,212,0.12),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-x-[12%] bottom-[6%] z-0 h-10 rounded-full bg-slate-900/10 blur-2xl" />
        {isSplitView ? (
          <>
            <p className="pointer-events-none absolute left-5 top-5 z-40 text-[clamp(2.5rem,4.8vw,5.25rem)] font-black leading-none tracking-wide text-slate-800 md:left-10 md:top-8">
              実際の画面<span className="text-rose-600">→</span>
            </p>
            <div className="pointer-events-none absolute bottom-6 left-1/2 top-[clamp(6.5rem,14vw,10rem)] z-30 w-0 -translate-x-1/2 border-l-2 border-dashed border-slate-500/80" />
            <div className="pointer-events-none absolute bottom-6 left-1/2 top-[clamp(6.5rem,14vw,10rem)] z-30 w-0 -translate-x-1/2 translate-x-px border-l border-white/70" />
            <div className="relative z-10 flex min-h-0 flex-col justify-center overflow-hidden border-r border-rose-300/60 bg-gradient-to-br from-rose-50 via-white to-rose-100 px-6 pb-8 pt-[clamp(7rem,15vw,11rem)] md:px-12 md:pb-12 md:pt-[clamp(8rem,16vw,12rem)]">
              <div className="pointer-events-none absolute left-6 top-[clamp(7.2rem,11.5vw,9.2rem)] z-20 flex gap-2 md:left-12 md:top-[clamp(8.2rem,9.8vw,10.1rem)] md:gap-3">
                {no3CopyBlocks.map((_, i) => (
                  <span key={i} className={`no3-step-pill ${i === copyIndex ? "is-active" : ""}`}>
                    {`0${i + 1}`}
                  </span>
                ))}
              </div>
              <div className="no3-copy-shell relative mx-auto w-full max-w-none">
                <div key={copyIndex} className="no3-copy-single">
                  <p className="whitespace-pre-line text-[clamp(1.45rem,2.45vw,2.5rem)] font-bold leading-snug text-slate-800 md:text-[clamp(1.65rem,2.8vw,2.9rem)] lg:text-[clamp(1.85rem,3.1vw,3.2rem)] lg:leading-tight">
                    {activeCopy}
                  </p>
                </div>
              </div>
            </div>
            <div className="relative z-10 min-h-0 overflow-hidden bg-gradient-to-bl from-slate-200 via-slate-100 to-slate-300">
              <div className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden px-3 py-4 md:px-5 md:py-6">
                <div className="relative aspect-[9/19.5] h-full min-h-0 max-h-[min(95dvh,960px)] w-auto max-w-[min(100%,520px)] shrink-0 md:max-w-[min(100%,560px)]">
                  <div className="pointer-events-none absolute -left-[3px] top-[20%] z-20 h-11 w-[3px] rounded-full bg-gradient-to-b from-slate-500 to-slate-900 shadow-sm" />
                  <div className="pointer-events-none absolute -left-[3px] top-[32%] z-20 h-16 w-[3px] rounded-full bg-gradient-to-b from-slate-500 to-slate-900 shadow-sm" />
                  <div className="pointer-events-none absolute -right-[3px] top-[26%] z-20 h-20 w-[3px] rounded-full bg-gradient-to-b from-slate-500 to-slate-900 shadow-sm" />
                  <div className="absolute inset-0 rounded-[2.65rem] border border-white/35 bg-gradient-to-b from-slate-400 via-slate-800 to-slate-950 p-[11px] shadow-[0_36px_90px_rgba(15,23,42,.5)] md:rounded-[2.75rem] md:p-[12px] md:shadow-[0_44px_100px_rgba(15,23,42,.55)]">
                    <div className="relative h-full w-full">
                      <div className="relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-[2.15rem] bg-black ring-1 ring-black/10 md:rounded-[2.25rem]">
                        <div className="relative h-full min-h-0 w-full overflow-hidden">
                          {isVideo ? (
                            <video
                              key={videoSrc}
                              className="absolute left-1/2 top-[-5.6%] h-[116%] w-[110%] max-w-none -translate-x-1/2 object-contain object-top"
                              src={videoSrc}
                              autoPlay
                              muted
                              loop
                              playsInline
                              controls={false}
                              aria-label={alt}
                            />
                          ) : (
                            <img
                              src={src}
                              alt={alt}
                              className="absolute left-1/2 top-[-2%] h-[104%] w-[100%] max-w-none -translate-x-1/2 object-contain object-top"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="relative z-10 flex h-full max-h-full w-full items-center justify-center py-1">
          <div className="relative h-[min(100%,930px)] w-[min(100%,480px)] shrink-0 md:h-[min(100%,960px)] md:w-[min(100%,500px)]">
            <div className="pointer-events-none absolute -left-[3px] top-[20%] z-20 h-11 w-[3px] rounded-full bg-gradient-to-b from-slate-500 to-slate-900 shadow-sm" />
            <div className="pointer-events-none absolute -left-[3px] top-[32%] z-20 h-16 w-[3px] rounded-full bg-gradient-to-b from-slate-500 to-slate-900 shadow-sm" />
            <div className="pointer-events-none absolute -right-[3px] top-[26%] z-20 h-20 w-[3px] rounded-full bg-gradient-to-b from-slate-500 to-slate-900 shadow-sm" />
            <div className="absolute inset-0 rounded-[2.65rem] border border-white/35 bg-gradient-to-b from-slate-400 via-slate-800 to-slate-950 p-[11px] shadow-[0_36px_90px_rgba(15,23,42,.5)] md:rounded-[2.75rem] md:p-[12px] md:shadow-[0_44px_100px_rgba(15,23,42,.55)]">
              <div className="relative h-full w-full">
                <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.15rem] bg-black ring-1 ring-black/10 md:rounded-[2.25rem]">
                  <>
                      <div className="relative z-30 shrink-0 bg-white/98 px-3 pb-1.5 pt-2.5 backdrop-blur-sm">
                        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 text-[13px] font-semibold leading-none tracking-tight text-black">
                          <span className="pl-0.5">9:41</span>
                          <div className="h-[30px] w-[108px] rounded-full bg-black shadow-[inset_0_1px_0_rgba(255,255,255,.12)]" />
                          <div className="flex justify-end text-black">
                            <No3IosStatusIcons />
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-100/95 px-2.5 py-1.5 shadow-sm">
                          <svg width="12" height="12" viewBox="0 0 12 12" className="shrink-0 text-emerald-600" aria-hidden>
                            <path
                              fill="currentColor"
                              d="M8.5 5.2V4.1C8.5 2.7 7.4 1.6 6 1.6S3.5 2.7 3.5 4.1v1.1c-.6 0-1 .5-1 1.1v3.6c0 .6.4 1.1 1 1.1h5c.6 0 1-.5 1-1.1V6.3c0-.6-.4-1.1-1-1.1Zm-1.2 0H4.7V4.1c0-.7.6-1.3 1.3-1.3s1.3.6 1.3 1.3v1.1Z"
                            />
                          </svg>
                          <p className="min-w-0 flex-1 truncate text-left text-[11px] font-medium text-slate-600 md:text-xs">{url}</p>
                          <span className="rounded-md bg-white/90 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-slate-500">Aa</span>
                        </div>
                      </div>
                      <div className={`relative min-h-0 flex-1 overflow-hidden ${useCover ? "bg-black" : "bg-slate-950"}`}>
                        <img
                          src={src}
                          alt={alt}
                          className={
                            useCover
                              ? "absolute inset-0 h-[118%] w-full object-cover object-top [animation:no3ScreenScroll_9.5s_ease-in-out_infinite]"
                              : "absolute inset-0 h-full w-full object-contain object-top"
                          }
                        />
                        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-black/25 to-transparent" />
                        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,.12),transparent_40%,transparent_58%,rgba(255,255,255,.08))]" />
                      </div>
                      <div className="relative z-30 flex shrink-0 justify-center bg-white pb-2 pt-1.5">
                        <div className="h-1 w-[118px] rounded-full bg-black/22" />
                      </div>
                    </>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

function No4SlideGanttView() {
  const videoRef = useRef(null);
  const halfSwitchRef = useRef(false);
  const [stepPairIndex, setStepPairIndex] = useState(0);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const apply = () => {
      el.playbackRate = NO4_PLAYBACK_RATE;
    };
    apply();
    el.addEventListener("loadedmetadata", apply);
    return () => el.removeEventListener("loadedmetadata", apply);
  }, []);

  const handleVideoTimeUpdate = () => {
    const el = videoRef.current;
    if (!el || halfSwitchRef.current) return;
    const d = el.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    if (el.currentTime >= d * 0.5) {
      halfSwitchRef.current = true;
      setStepPairIndex(1);
    }
  };

  const clipStyle =
    NO4_VISUAL_CLIP_INSET && NO4_VISUAL_CLIP_INSET !== "inset(0)"
      ? { clipPath: NO4_VISUAL_CLIP_INSET }
      : undefined;

  const steps = [
    <>
      マニュアル・DL管理フローが決まっておらず
      <br />
      対応が曖昧になっていた
    </>,
    <>
      新店・リブランディングで運用が分かれ
      <br />
      基準が統一されていなかった
    </>,
    <>
      進捗が見えずらく、他部署との連携で
      <br />
      ずれや遅れが生じやすかった
    </>,
    <>
      業者連絡先・
      <br />
      各担当者のメアドを確認する場所が無かった。
    </>,
  ];

  const stepPairs = [
    [0, 1],
    [2, 3],
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="slide-lower no4-clean flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border-2 border-pink-600 bg-gray-200 shadow-inner">
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b-4 border-pink-600 bg-pink-200 px-4 py-2 md:gap-4 md:px-5 md:py-2.5">
          <div className="rounded-md border border-pink-600 bg-gray-100 px-2 py-1">
            <img src="/no4/fit365-logo.png" alt="" className="h-9 w-auto object-contain md:h-11 lg:h-12" />
          </div>
          <p className="min-w-0 flex-1 text-[clamp(1.15rem,2.75vw,2.35rem)] font-black leading-[1.15] text-black">
            FIT365 工程表 自動生成ツール
          </p>
        </div>

        <div className="relative min-h-0 flex-1 overflow-hidden bg-gray-300 p-0.5 md:p-1">
          <div className="h-full w-full overflow-hidden rounded-sm" style={clipStyle}>
            <video
              ref={videoRef}
              key="no4-tool-screen-record"
              className="h-full w-full object-contain object-center"
              src={NO4_SCREEN_VIDEO_SRC}
              autoPlay
              muted
              playsInline
              controls={false}
              aria-label="工程表自動生成ツールの実機画面収録"
              onTimeUpdate={handleVideoTimeUpdate}
            />
          </div>
        </div>

        <div className="shrink-0 border-t-4 border-pink-600 bg-gradient-to-b from-gray-100 to-gray-200 px-1.5 py-0.5 md:px-2 md:py-0.5">
          <div className="relative mx-auto w-full max-w-[1920px] overflow-hidden rounded-xl border border-pink-200/80 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_8px_24px_rgba(190,24,93,0.1)]">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-2 bg-gradient-to-b from-white/90 to-transparent md:h-3"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2 bg-gradient-to-t from-gray-200/95 to-transparent md:h-3"
              aria-hidden
            />

            <div className="relative h-[clamp(7.25rem,15.5vh,10rem)] overflow-hidden md:h-[clamp(7.75rem,16.5vh,10.75rem)] lg:h-[clamp(8.25rem,17.5vh,11.25rem)]">
              <div
                className="no4-steps-rail flex h-[200%] flex-col will-change-transform transition-transform duration-[820ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ transform: stepPairIndex === 0 ? "translateY(0)" : "translateY(-50%)" }}
              >
                {stepPairs.map((indices) => (
                  <div
                    key={indices.join("-")}
                    className="flex h-1/2 min-h-0 flex-[0_0_50%] items-center justify-center px-1.5 py-0.5 md:px-2 md:py-1"
                  >
                    <div className="mx-auto grid w-full max-w-[min(100%,1720px)] grid-cols-2 gap-2 md:gap-3 lg:gap-4">
                      {indices.map((i) => (
                        <div
                          key={i}
                          className="flex min-h-0 min-w-0 flex-row items-center gap-2 rounded-xl border-2 border-pink-400 bg-white px-2 py-1.5 shadow-[0_4px_18px_rgba(15,23,42,0.06)] md:gap-2.5 md:px-2.5 md:py-2 lg:gap-3"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-pink-600 bg-pink-200 text-base font-black text-black md:h-11 md:w-11 md:text-lg lg:h-12 lg:w-12 lg:text-xl">
                            {i + 1}
                          </span>
                          <p className="min-h-0 min-w-0 flex-1 text-left text-[clamp(0.82rem,1.35vw,1.35rem)] font-bold leading-snug text-black [word-break:keep-all] md:text-[clamp(0.95rem,1.65vw,1.65rem)] lg:text-[clamp(1.05rem,1.85vw,1.85rem)]">
                            {steps[i]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 参考画像の青寄りを弱めつつ、黒×赤のLPトーンに寄せる */
const NO5_IMG_FILTER = "saturate-[0.78] contrast-[1.04]";

/** NO5 全スライド共通：料金スライドと同系の赤みグラデ＋下方向への暗幕（中間ストップで帯を緩和） */
const NO5_SCENE =
  "relative overflow-hidden bg-black before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(ellipse_100%_92%_at_18%_22%,rgba(90,20,24,0.38),transparent_52%),radial-gradient(ellipse_90%_88%_at_82%_78%,rgba(50,8,10,0.42),transparent_50%),linear-gradient(165deg,#050308_0%,#070305_28%,#0a0304_52%,#020101_100%)] after:pointer-events-none after:absolute after:inset-0 after:z-0 after:bg-[radial-gradient(ellipse_120%_100%_at_50%_100%,rgba(0,0,0,0.52),transparent_45%)]";

/** グラデの色段差（バンディング）を目立ちにくくする極薄フィルムグレイン（NO5 の大きな面用） */
function No5FilmGrainOverlay({ className = "" }) {
  if (!IS_NO5) return null;
  return (
    <div
      className={`no5-film-grain pointer-events-none absolute inset-0 z-[1] ${className}`.trim()}
      aria-hidden
    />
  );
}

function No5SlideLpHero() {
  return (
    <div className={`no5-slide flex h-full min-h-0 w-full rounded-lg ${NO5_SCENE}`}>
      <No5FilmGrainOverlay />
      <div className="relative z-10 grid h-full min-h-0 w-full grid-cols-1 items-center gap-8 px-4 py-6 md:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] md:gap-12 md:px-14 md:py-10">
        <div className="flex min-h-0 flex-col justify-center">
          <p className="no5-anim text-xs font-semibold tracking-[0.36em] text-red-500 md:text-sm" style={{ "--no5-d": "0.04s" }}>
            LP · RESERVE
          </p>
          <h1
            className="no5-anim mt-4 text-[clamp(2.25rem,5.2vw,4.35rem)] font-bold leading-[1.12] tracking-tight text-white md:mt-5 md:text-[clamp(2.55rem,4.9vw,4.85rem)]"
            style={{ "--no5-d": "0.1s" }}
          >
            パーソナル訴求力UP
          </h1>
          <p
            className="no5-anim mt-7 max-w-[min(100%,42rem)] text-[clamp(1.25rem,2.6vw,2.05rem)] font-semibold leading-[1.45] tracking-wide text-zinc-50 [text-shadow:0_2px_24px_rgba(0,0,0,0.55)] md:mt-8 md:leading-[1.5] md:tracking-[0.04em] lg:mt-9 lg:text-[clamp(1.45rem,2.35vw,2.35rem)]"
            style={{ "--no5-d": "0.16s" }}
          >
            LINEでの予約体制から
            <br />
            訴求から予約→カウンセリングまで
            <br />
            LP内で全て完結できるフローを実現
          </p>
          <div className="no5-anim mt-10 flex flex-wrap gap-3.5 md:mt-12 md:gap-4 lg:mt-14" style={{ "--no5-d": "0.22s" }}>
            <button
              type="button"
              className="rounded-full bg-red-600 px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-red-900/35 transition duration-300 hover:bg-red-500 hover:shadow-red-800/40 md:px-9 md:py-4 md:text-lg"
            >
              今すぐ予約
            </button>
            <button
              type="button"
              className="rounded-full border border-white/25 bg-white/5 px-8 py-3.5 text-base font-semibold text-white backdrop-blur transition duration-300 hover:bg-white/12 md:px-9 md:py-4 md:text-lg"
            >
              体験予約
            </button>
            <button
              type="button"
              className="rounded-full border border-zinc-600/90 bg-[#050a14]/80 px-7 py-3.5 text-base font-medium text-zinc-200 transition duration-300 hover:border-red-800/50 hover:text-white md:px-8 md:py-4 md:text-lg"
            >
              事前カウンセリング
            </button>
          </div>
        </div>
        <div className="no5-anim flex min-h-0 items-center justify-center" style={{ "--no5-d": "0.08s" }}>
          <div className="relative w-full max-w-[min(92vw,980px)] overflow-hidden rounded-2xl border border-white/[0.12] bg-[linear-gradient(145deg,#1a0808_0%,#120404_52%,#080808_100%)] shadow-[0_32px_100px_rgba(0,0,0,0.55)] ring-1 ring-red-500/15 lg:rounded-3xl">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_35%,rgba(0,0,0,0.25)_100%)]" />
            <img
              src="/no5/lp-hero.png"
              alt=""
              className={`relative z-[1] max-h-[min(78vh,880px)] w-full object-contain object-center ${NO5_IMG_FILTER}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/** 括弧風コーナー＋角のリング（料金スライド用） */
function No5PtBracketFrame() {
  return (
    <div className="pointer-events-none absolute inset-[-6px] z-0 md:inset-[-10px]" aria-hidden>
      <div className="no5-pt-btk no5-pt-btk-tl" />
      <div className="no5-pt-btk no5-pt-btk-tr" />
      <div className="no5-pt-btk no5-pt-btk-bl" />
      <div className="no5-pt-btk no5-pt-btk-br" />
      <div className="no5-pt-o no5-pt-o-tl" />
      <div className="no5-pt-o no5-pt-o-tr" />
      <div className="no5-pt-o no5-pt-o-bl" />
      <div className="no5-pt-o no5-pt-o-br" />
      <div className="no5-pt-frame-arc" />
    </div>
  );
}

/** 料金＋予約：石橋・新田（大きめカード。狭い画面は縦積み、md+ は横並びで余白を減らす） */
function No5SlidePriceAndReserve() {
  return (
    <div className={`no5-slide relative flex h-full min-h-0 w-full flex-col overflow-hidden ${NO5_SCENE}`}>
      <No5FilmGrainOverlay />
      <div className="relative z-[3] flex min-h-0 flex-1 flex-col justify-center gap-2 px-4 pt-[clamp(1.25rem,5vh,3.25rem)] md:gap-4 md:px-8 md:pt-[clamp(1.75rem,6.5vh,4.5rem)] lg:gap-5 lg:px-12 lg:pt-[clamp(2rem,7vh,5rem)]">
        <div className="relative z-[4] flex shrink-0 justify-center px-2 pb-0.5 md:px-4 md:pb-1">
          <p
            className="no5-anim max-w-[min(94vw,56rem)] text-center text-[clamp(1.35rem,3.1vw,2.15rem)] font-extrabold leading-[1.35] tracking-[0.03em] text-white [text-shadow:0_3px_32px_rgba(0,0,0,0.75),0_0_40px_rgba(220,38,38,0.18)] md:text-[clamp(1.5rem,3.4vw,2.45rem)] md:leading-[1.38] lg:text-[clamp(1.65rem,3vw,2.65rem)]"
            style={{ "--no5-d": "0.05s" }}
          >
            LINEでの予約体制から
            <br />
            グーグルカレンダー連携で即予約可能に。
          </p>
        </div>

      <div className="relative z-[3] flex min-h-0 flex-1 flex-col md:flex-row md:items-center md:justify-center md:gap-6 md:px-2 md:pb-4 md:pt-0 lg:gap-10 lg:px-4 lg:pb-6">
      <div className="no5-pt-card-top relative z-[3] flex min-h-0 flex-1 items-center justify-center px-4 py-3 md:min-w-0 md:flex-[1] md:justify-end md:px-3 md:py-2 lg:py-0">
        <div className="relative flex w-full max-w-[min(94vw,760px)] items-center justify-center md:max-h-[min(62vh,700px)] md:max-w-full lg:max-h-[min(68vh,780px)]">
          <No5PtBracketFrame />
          <img
            src="/no5/trainer-ishibashi.png"
            alt=""
            draggable={false}
            className={`no5-pt-enter-lr relative z-[2] max-h-[min(42vh,420px)] w-full max-w-full object-contain object-center drop-shadow-[0_22px_48px_rgba(0,0,0,0.55)] sm:max-h-[min(48vh,500px)] md:max-h-[min(62vh,700px)] lg:max-h-[min(68vh,780px)] ${NO5_IMG_FILTER}`}
          />
        </div>
      </div>

      <div className="no5-pt-card-bot relative z-[3] flex min-h-0 flex-1 items-center justify-center px-4 pb-8 pt-2 md:min-w-0 md:flex-[1] md:justify-start md:px-3 md:pb-2 md:pt-2 lg:py-0">
        <div className="relative flex w-full max-w-[min(94vw,760px)] items-center justify-center md:max-h-[min(62vh,700px)] md:max-w-full lg:max-h-[min(68vh,780px)]">
          <No5PtBracketFrame />
          <img
            src="/no5/trainer-nitta.png"
            alt=""
            draggable={false}
            className={`no5-pt-enter-rl relative z-[2] max-h-[min(42vh,420px)] w-full max-w-full object-contain object-center drop-shadow-[0_22px_48px_rgba(0,0,0,0.55)] sm:max-h-[min(48vh,500px)] md:max-h-[min(62vh,700px)] lg:max-h-[min(68vh,780px)] ${NO5_IMG_FILTER}`}
          />
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}

/** 事前カウンセリング / カレンダー予約の実機動画（同一スライド・2ペイン） */
function No5FormCalVideoPane({ src, kicker, title, videoHeadline, videoSubline, videoPlayDelayMs }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delayMs = reduced ? 0 : videoPlayDelayMs;
    const id = window.setTimeout(() => {
      el.currentTime = 0;
      const playAttempt = el.play();
      if (playAttempt !== undefined && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {});
      }
    }, delayMs);
    return () => {
      window.clearTimeout(id);
      el.pause();
    };
  }, [src, videoPlayDelayMs]);

  const showVideoHeading = Boolean(videoHeadline || videoSubline);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.18] bg-black shadow-[0_24px_64px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-red-500/12">
      {showVideoHeading ? (
        <div className="relative z-[2] shrink-0 border-b border-red-500/25 bg-gradient-to-b from-[#1a0808]/98 via-[#100404]/95 to-black/90 px-2.5 py-2.5 text-center shadow-[0_12px_36px_rgba(0,0,0,0.5)] md:px-4 md:py-3 lg:py-3.5">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent"
            aria-hidden
          />
          {videoHeadline ? (
            <p
              className="relative max-w-full px-0.5 text-center text-[clamp(1.35rem,3.1vw,2.15rem)] font-extrabold leading-[1.35] tracking-[0.03em] text-white [text-shadow:0_3px_32px_rgba(0,0,0,0.75),0_0_40px_rgba(220,38,38,0.18)] [word-break:keep-all] md:text-[clamp(1.5rem,3.4vw,2.45rem)] md:leading-[1.38] lg:text-[clamp(1.65rem,3vw,2.65rem)]"
            >
              {videoHeadline}
            </p>
          ) : null}
          {videoSubline ? (
            <p className="relative mt-1.5 text-center text-[clamp(1.05rem,2.35vw,1.72rem)] font-bold leading-[1.35] tracking-[0.06em] text-rose-200/95 [word-break:keep-all] md:mt-2 md:text-[clamp(1.15rem,2.6vw,1.95rem)] md:leading-[1.38] lg:text-[clamp(1.22rem,2.35vw,2.05rem)]">
              {videoSubline}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="relative z-[1] min-h-0 flex-1 bg-[#060606]">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full bg-[#060606] object-contain"
          src={src}
          muted
          playsInline
          preload="auto"
          aria-label={title}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] bg-gradient-to-t from-black via-black/65 to-transparent px-3 pb-3 pt-12 md:px-4 md:pb-4 md:pt-16"
          aria-hidden
        >
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.32em] text-red-300/95 md:text-xs md:tracking-[0.38em]">
            {kicker}
          </p>
          <p className="mt-1 text-base font-extrabold leading-snug tracking-tight text-white/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] md:mt-1.5 md:text-lg lg:text-xl">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

function No5SlideFormCalendar() {
  return (
    <div className={`no5-slide relative flex h-full min-h-0 w-full flex-col overflow-hidden p-3 md:p-5 lg:p-6 ${NO5_SCENE}`}>
      <No5FilmGrainOverlay />
      <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 grid-rows-2 gap-3 md:grid-cols-2 md:grid-rows-1 md:gap-4 lg:gap-5">
        <div className="no5-fc-pane-l flex min-h-0 min-w-0 flex-col">
          <div className="no5-fc-enter-slide flex min-h-0 min-w-0 flex-1 flex-col">
            <No5FormCalVideoPane
              src="/no5/form-consult.mp4"
              kicker="GOOGLE HOME"
              title="事前カウンセリング（相談）"
              videoPlayDelayMs={NO5_FORM_CAL_VIDEO_PLAY_DELAY_MS}
              videoHeadline="事前カウンセリングフォーム"
              videoSubline="〔最適なトレーナーを選出〕"
            />
          </div>
        </div>
        <div className="no5-fc-pane-r flex min-h-0 min-w-0 flex-col">
          <div className="no5-fc-enter-slide flex min-h-0 min-w-0 flex-1 flex-col">
            <No5FormCalVideoPane
              src="/no5/trainer-calendar.mp4"
              kicker="GOOGLE CALENDAR"
              title="トレーナー予約"
              videoPlayDelayMs={NO5_FORM_CAL_VIDEO_PLAY_DELAY_MS}
              videoHeadline="担当トレーナーのGoogleカレンダーで予約"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function No6VideoSlide({ title, url, src, kicker, summary }) {
  const videoRef = useRef(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    el.playbackRate = 1.2;
    const playAttempt = el.play();
    if (playAttempt !== undefined && typeof playAttempt.catch === "function") {
      playAttempt.catch(() => {});
    }
    const onTimeUpdate = () => {
      if (el.currentTime >= 40) {
        el.pause();
      }
    };
    el.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.pause();
    };
  }, [src]);

  return (
    <div className={SLIDE_FRAME_CLASS}>
      <div className="flex items-center justify-between rounded-xl border border-indigo-200 bg-white px-5 py-3 text-indigo-900 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
        <div>
          <p className="text-base font-semibold tracking-[0.22em] text-indigo-500 md:text-lg">UNIFIED FLOW / MOVIE</p>
          <p className="text-3xl font-bold md:text-4xl">{title}</p>
        </div>
        <div className="no6-chip rounded-full bg-indigo-600 px-5 py-2 text-base font-semibold text-white md:text-lg">1.2x</div>
      </div>
      <div className="grid min-h-0 grid-cols-[1.2fr_0.8fr] gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-black shadow-[0_18px_45px_rgba(15,23,42,0.18)]">
          <div className="border-b border-slate-700 bg-slate-900 px-4 py-2 text-xs text-slate-300">{url}</div>
          <video ref={videoRef} className="h-[calc(100%-2.2rem)] w-full object-contain" src={src} muted playsInline preload="auto" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_45px_rgba(15,23,42,0.1)]">
          <p className="text-base font-semibold tracking-[0.2em] text-slate-500 md:text-lg">CHECK POINT</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">{kicker}</p>
          <p className="mt-3 text-[1.2rem] leading-relaxed text-slate-700 md:text-[1.3rem]">{summary}</p>
        </div>
      </div>
    </div>
  );
}

function No6UnifiedLpVideoSlide() {
  const videoRef = useRef(null);
  const no6AppealBlocks = useMemo(() => NO6_APPEAL_CONTENT, []);
  const [copyIndex, setCopyIndex] = useState(0);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    el.playbackRate = 1;
    const playAttempt = el.play();
    if (playAttempt !== undefined && typeof playAttempt.catch === "function") playAttempt.catch(() => {});
    return () => {
      el.pause();
    };
  }, []);

  useEffect(() => {
    setCopyIndex(0);
    const id = setInterval(() => {
      setCopyIndex((prev) => {
        if (prev >= no6AppealBlocks.length - 1) {
          clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, 12000);
    return () => clearInterval(id);
  }, [no6AppealBlocks.length]);

  const activeBlock = no6AppealBlocks[copyIndex];

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="slide-lower relative h-full min-h-0 flex-1 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200 shadow-inner no6-lp-after grid min-h-0 grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] gap-0 p-0">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,0,0,0.04),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-x-[12%] bottom-[6%] z-0 h-10 rounded-full bg-black/8 blur-2xl" />
        <div className="pointer-events-none absolute bottom-4 left-[43%] top-4 z-30 w-0 -translate-x-1/2 border-l-2 border-dashed border-neutral-400" />
        <div className="pointer-events-none absolute bottom-4 left-[43%] top-4 z-30 w-0 -translate-x-1/2 translate-x-px border-l border-white/80" />

        <div className="relative z-10 flex min-h-0 flex-col overflow-hidden border-r border-neutral-300 bg-neutral-200 p-0">
          <div className="flex h-full min-h-0 w-full items-center justify-center p-0">
            <div
              className="relative h-full min-h-0 w-auto max-w-full shrink-0"
              style={{
                // 端末を少し横長（タブレット寄り）にして、画面を大きく見せる
                aspectRatio: "9 / 16",
                height: "100%",
                maxHeight: "100%",
                width: "auto",
                maxWidth: "100%",
              }}
            >
              {/* タブレット寄りの筐体なので、側面ボタンは省略 */}
              <div className="absolute inset-0 rounded-[2.1rem] border border-white/35 bg-gradient-to-b from-neutral-500 via-neutral-800 to-neutral-950 p-[7px] shadow-[0_32px_80px_rgba(0,0,0,.42)] md:rounded-[2.25rem] md:p-[8px]">
                <div className="relative h-full w-full">
                  <div className="relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-[1.7rem] bg-black ring-1 ring-black/20 md:rounded-[1.8rem]">
                    <div className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-black p-[4.5%] md:p-[5.5%]">
                      <video
                        ref={videoRef}
                        className="max-h-full max-w-full object-contain object-center"
                        src="/no6-reference-screen.mp4"
                        muted
                        playsInline
                        preload="auto"
                        aria-label="LP実機操作の画面収録"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex min-h-0 flex-col overflow-hidden border-l border-neutral-300 bg-white">
          <header className="grid shrink-0 grid-cols-1 gap-3 border-b border-neutral-200 px-4 py-4 md:gap-4 md:px-6 md:py-5">
            <div className="no6-header-banner relative mt-2 flex w-fit items-center gap-3 rounded-full border-2 border-neutral-900 bg-white px-6 py-3 md:mt-3 md:px-8 md:py-3.5">
              <span className="no6-header-banner-mark inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-700 bg-red-600 text-[0.86rem] font-black tracking-wide text-white md:h-11 md:w-11 md:text-[0.98rem]">
                LP
              </span>
              <p className="text-[1.3rem] font-black tracking-[0.03em] text-black md:text-[1.65rem]">HP・外部販促の強化</p>
            </div>
            <div className="no6-headline-panel relative overflow-hidden rounded-xl border border-neutral-300 bg-white/95 px-4 py-4 md:px-5 md:py-5">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(239,68,68,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,245,245,0.94)_100%)]" />
              <h2 className="no6-header-title relative text-balance break-keep text-xl font-bold leading-tight tracking-tight text-black md:text-2xl lg:text-[clamp(1.5rem,2.2vw,2.45rem)] xl:text-[clamp(1.65rem,2.35vw,2.75rem)]">
                <span className="block">GoogleForm・画像での販促を×</span>
                <span className="mt-2 block">LPでの運用へ切り替え</span>
              </h2>
            </div>
          </header>

          <div className="flex shrink-0 items-center justify-end gap-2 border-b border-neutral-100 px-4 py-2 md:-mt-1 md:px-6">
            <span className="text-[1.75rem] font-black leading-none text-red-600 md:text-[2rem]">←</span>
            <span className="text-[1.25rem] font-extrabold tracking-wide text-black md:text-[1.45rem]">実際の画面</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-5 pt-3 md:gap-4 md:px-6 md:pb-6 md:pt-4">
            <div className="grid shrink-0 grid-cols-3 gap-2.5 md:gap-3.5">
              {no6AppealBlocks.map((_, i) => (
                <span key={i} className={`no6-step-pill no6-step-3d flex flex-col justify-center gap-2 py-4 ${i === copyIndex ? "is-active" : ""}`}>
                  <span className="text-[2.25rem] leading-none tracking-[0.08em] md:text-[2.7rem]">{`0${i + 1}`}</span>
                  <span className="no6-step-pill-label max-w-full text-center text-[1.35rem] font-bold leading-tight tracking-normal text-inherit md:text-[1.55rem]">
                    {NO6_TABS[i]}
                  </span>
                </span>
              ))}
            </div>
            <div className="no6-copy-shell no6-copy-shell--compact relative flex min-h-0 flex-1 flex-col">
              <div key={copyIndex} className="no6-copy-single flex min-h-0 flex-1 flex-col justify-start py-2">
                <p className="no6-copy-title font-black leading-[1.12] tracking-tight text-black">
                  {activeBlock.title}
                </p>
                <ul className="no6-copy-bullets mt-4 space-y-3 md:mt-5 md:space-y-3.5">
                  {activeBlock.bullets.map((line) => (
                    <li key={line} className="flex gap-3 text-[clamp(1.35rem,2.7vw,2.3rem)] font-semibold leading-snug text-black md:gap-3.5">
                      <span className="no6-copy-bullet shrink-0 font-black text-red-600" aria-hidden>
                        ・
                      </span>
                      <span className="min-w-0 whitespace-pre-line break-keep text-pretty">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function No6CampaignLpVideoSlide() {
  const videoRef = useRef(null);
  const campaignBlocks = useMemo(() => NO6_CAMPAIGN_APPEAL_CONTENT, []);
  const [copyIndex, setCopyIndex] = useState(0);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    el.playbackRate = 1;
    const playAttempt = el.play();
    if (playAttempt !== undefined && typeof playAttempt.catch === "function") playAttempt.catch(() => {});
    return () => {
      el.pause();
    };
  }, []);

  useEffect(() => {
    setCopyIndex(0);
    const id = setInterval(() => {
      setCopyIndex((prev) => {
        if (prev >= campaignBlocks.length - 1) {
          clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, 4600);
    return () => clearInterval(id);
  }, [campaignBlocks.length]);

  const activeBlock = campaignBlocks[copyIndex];

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col">
      <div className="slide-lower relative h-full min-h-0 flex-1 overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200 shadow-inner no6-lp-after grid min-h-0 grid-cols-[minmax(0,0.43fr)_minmax(0,0.57fr)] gap-0 p-0">
        <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(0,0,0,0.04),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-x-[12%] bottom-[6%] z-0 h-10 rounded-full bg-black/8 blur-2xl" />
        <div className="pointer-events-none absolute bottom-4 left-[43%] top-4 z-30 w-0 -translate-x-1/2 border-l-2 border-dashed border-neutral-400" />
        <div className="pointer-events-none absolute bottom-4 left-[43%] top-4 z-30 w-0 -translate-x-1/2 translate-x-px border-l border-white/80" />

        <div className="relative z-10 flex min-h-0 flex-col overflow-hidden border-r border-neutral-300 bg-neutral-200 p-0">
          <div className="flex h-full min-h-0 w-full items-center justify-center p-0">
            <div
              className="relative h-full min-h-0 w-auto max-w-full shrink-0"
              style={{
                aspectRatio: "9 / 16",
                height: "100%",
                maxHeight: "100%",
                width: "auto",
                maxWidth: "100%",
              }}
            >
              <div className="absolute inset-0 rounded-[2.1rem] border border-white/35 bg-gradient-to-b from-neutral-500 via-neutral-800 to-neutral-950 p-[7px] shadow-[0_32px_80px_rgba(0,0,0,.42)] md:rounded-[2.25rem] md:p-[8px]">
                <div className="relative h-full w-full">
                  <div className="relative flex h-full w-full min-h-0 flex-col overflow-hidden rounded-[1.7rem] bg-black ring-1 ring-black/20 md:rounded-[1.8rem]">
                    <div className="relative flex h-full min-h-0 w-full items-center justify-center overflow-hidden bg-black p-[4.5%] md:p-[5.5%]">
                      <video
                        ref={videoRef}
                        className="max-h-full max-w-full object-contain object-center"
                        src="/no6-campaign-screen.mp4"
                        muted
                        playsInline
                        preload="auto"
                        aria-label="キャンペーンLP実機操作の画面収録"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex min-h-0 flex-col overflow-hidden border-l border-neutral-300 bg-white">
          <header className="grid shrink-0 grid-cols-1 gap-3 border-b border-neutral-200 px-4 py-4 md:gap-4 md:px-6 md:py-5">
            <div className="no6-header-banner relative mt-2 flex w-fit items-center gap-3 rounded-full border-2 border-neutral-900 bg-white px-6 py-3 md:mt-3 md:px-8 md:py-3.5">
              <span className="no6-header-banner-mark inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-700 bg-red-600 text-[0.86rem] font-black tracking-wide text-white md:h-11 md:w-11 md:text-[0.98rem]">
                LP
              </span>
              <p className="text-[1.3rem] font-black tracking-[0.03em] text-black md:text-[1.65rem]">キャンペーンLP訴求</p>
            </div>
            <div className="no6-headline-panel relative overflow-hidden rounded-xl border border-neutral-300 bg-white/95 px-4 py-4 md:px-5 md:py-5">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_12%,rgba(239,68,68,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,245,245,0.94)_100%)]" />
              <h2 className="no6-header-title relative text-balance break-keep text-xl font-bold leading-tight tracking-tight text-black md:text-2xl lg:text-[clamp(1.5rem,2.2vw,2.45rem)] xl:text-[clamp(1.65rem,2.35vw,2.75rem)]">
                <span className="block">金額訴求を軸にキャンペーン導線を最適化</span>
                <span className="mt-2 block">申込前の不安を画面上で解消</span>
              </h2>
            </div>
          </header>

          <div className="flex shrink-0 items-center justify-end gap-2 border-b border-neutral-100 px-4 py-2 md:-mt-1 md:px-6">
            <span className="text-[1.75rem] font-black leading-none text-red-600 md:text-[2rem]">←</span>
            <span className="text-[1.25rem] font-extrabold tracking-wide text-black md:text-[1.45rem]">実際の画面</span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-3 px-4 pb-5 pt-3 md:gap-4 md:px-6 md:pb-6 md:pt-4">
            <div className="grid shrink-0 grid-cols-3 gap-2.5 md:gap-3.5">
              {campaignBlocks.map((_, i) => (
                <span key={i} className={`no6-step-pill no6-step-3d flex flex-col justify-center gap-2 py-4 ${i === copyIndex ? "is-active" : ""}`}>
                  <span className="text-[2.25rem] leading-none tracking-[0.08em] md:text-[2.7rem]">{`0${i + 1}`}</span>
                  <span className="no6-step-pill-label max-w-full text-center text-[1.35rem] font-bold leading-tight tracking-normal text-inherit md:text-[1.55rem]">
                    {NO6_CAMPAIGN_TABS[i]}
                  </span>
                </span>
              ))}
            </div>
            <div className="no6-copy-shell no6-copy-shell--compact relative flex min-h-0 flex-1 flex-col">
              <div key={copyIndex} className="no6-copy-single flex min-h-0 flex-1 flex-col justify-start py-2">
                <p className="no6-copy-title font-black leading-[1.12] tracking-tight text-black">{activeBlock.title}</p>
                <ul className="no6-copy-bullets mt-4 space-y-3 md:mt-5 md:space-y-3.5">
                  {activeBlock.bullets.map((line) => (
                    <li key={line} className="flex gap-3 text-[clamp(1.35rem,2.7vw,2.3rem)] font-semibold leading-snug text-black md:gap-3.5">
                      <span className="no6-copy-bullet shrink-0 font-black text-red-600" aria-hidden>
                        ・
                      </span>
                      <span className="min-w-0 break-keep text-pretty">{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function No7SimpleVideoSlide() {
  const videoRef = useRef(null);
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const play = () => {
      el.play().catch(() => {});
    };
    const syncVisible = () => {
      const step = Math.max(0, Math.min(2, Math.floor(el.currentTime / 10)));
      setActiveStep(step);
    };
    play();
    el.addEventListener("loadedmetadata", play);
    el.addEventListener("timeupdate", syncVisible);
    syncVisible();
    return () => {
      el.removeEventListener("loadedmetadata", play);
      el.removeEventListener("timeupdate", syncVisible);
    };
  }, []);

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-100/80 px-4 py-3 shadow-[0_10px_24px_rgba(15,23,42,0.1)] md:px-6 md:py-4">
        <div className="inline-flex h-[4.15rem] items-center rounded-xl border border-emerald-900/35 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-6 shadow-[0_10px_24px_rgba(6,95,70,0.32),inset_0_1px_0_rgba(255,255,255,0.22)] md:px-7">
          <span className="text-[1.9rem] font-black tracking-[0.09em] text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] md:text-[2.25rem]">TODOリスト</span>
        </div>
        <div className="relative flex h-[4.15rem] min-w-[30rem] flex-1 items-center overflow-hidden rounded-xl border border-emerald-300 bg-white px-4 text-[1.32rem] leading-tight shadow-[0_8px_18px_rgba(6,95,70,0.12)] md:text-[1.46rem]">
          {[
            "グーグルフォームでタスクフォースチームとして依頼が可能に",
            "DL期日を設ける事で全員に実施、回答してもらえる仕組みを構築",
            "実施後は各店ごとにチェクボックスで進捗状況を管理",
          ].map((point, idx) => (
            <p
              key={point}
              className={`grid grid-cols-[9rem_2.35rem_1fr] items-center gap-2.5 transition-all duration-400 ${
                idx === activeStep ? "relative translate-y-0 opacity-100" : "pointer-events-none absolute inset-x-4 translate-y-2 opacity-0"
              }`}
            >
              <span className="inline-flex h-[2.45rem] items-center rounded-lg border border-emerald-800/30 bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-3 text-[1.06rem] font-black tracking-[0.04em] text-white md:text-[1.12rem]">
                運用概要
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded bg-emerald-700 text-[1.08rem] font-black text-white">
                {idx === 0 ? "①" : idx === 1 ? "②" : "③"}
              </span>
              <span className="truncate font-semibold text-emerald-900">{point}</span>
            </p>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_12px_34px_rgba(15,23,42,0.1)]">
        <video ref={videoRef} src="/no7/no7-screen.mp4" className="h-full w-full object-contain bg-slate-50" autoPlay muted loop playsInline />
      </div>
    </div>
  );
}

function No6SummarySlide() {
  return (
    <div className={SLIDE_FRAME_CLASS}>
      <div className="flex items-center justify-between rounded-xl border border-neutral-300 bg-white px-5 py-3 text-neutral-900 shadow-[0_10px_28px_rgba(0,0,0,0.08)]">
        <div>
          <p className="text-base font-semibold tracking-[0.2em] text-red-600 md:text-lg">LP化のまとめ</p>
          <p className="text-3xl font-bold md:text-4xl">入会～特典申請までを1本の導線に</p>
        </div>
        <div className="no6-chip rounded-full border border-neutral-900 bg-red-600 px-5 py-2 text-base font-semibold text-white md:text-lg">訴求3本柱</div>
      </div>
      <div className="grid min-h-0 grid-cols-[1.15fr_0.85fr] gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-neutral-300 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.1)]">
          <div className="no6-scanline pointer-events-none absolute inset-0 z-[1]" aria-hidden />
          <div className="border-b border-neutral-200 bg-neutral-100 px-4 py-2 text-xs font-medium text-neutral-800">
            Before: テキスト・静止画中心 / After: 体験と行動が分かるLP
          </div>
          <div className="relative z-[2] p-5">
            <div className="no6-hero mb-4 rounded-xl border-l-4 border-red-600 bg-neutral-950 px-5 py-6 text-white">
              <p className="text-base font-semibold tracking-[0.2em] text-red-500 md:text-lg">HP · 外部販促</p>
              <p className="mt-2 text-3xl font-bold leading-tight md:text-4xl">必要な情報を迷わせず、次のアクションへ</p>
            </div>
            <div className="relative grid grid-cols-3 gap-2 text-center text-base font-semibold text-neutral-900 md:text-lg">
              <div className="no6-node rounded-lg border border-neutral-300 bg-white px-2 py-2">ジム見学体験</div>
              <div className="no6-node rounded-lg border border-neutral-300 bg-white px-2 py-2">追加特典申請</div>
              <div className="no6-node rounded-lg border-2 border-red-600 bg-white px-2 py-2 text-red-700">マシンラインナップ</div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                { label: "訴求の明確化", val: "LP統一" },
                { label: "離脱の低減", val: "導線1本化" },
                { label: "運用負荷", val: "更新集約" },
              ].map((item, idx) => (
                <div key={item.label} className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-2">
                  <p className="text-[0.85rem] font-semibold tracking-[0.12em] text-neutral-500 md:text-sm">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-neutral-900 md:text-3xl" style={{ animation: `dashCaptionIn .6s ease ${0.12 + idx * 0.08}s both` }}>
                    {item.val}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-neutral-300 bg-white p-4 shadow-[0_18px_45px_rgba(0,0,0,0.08)]">
          <p className="text-base font-semibold tracking-[0.2em] text-neutral-500 md:text-lg">変更のポイント</p>
          <ul className="mt-3 space-y-2 text-[1.2rem] leading-relaxed text-neutral-800 md:text-[1.35rem]">
            {[
              "チラシ・バナー等のテキスト訴求から、LPでストーリー訴求へ",
              "画像データの載せ替えだけでなく、体験・比較が伝わる画面構成へ",
              "見学・設備・特典の3訴求をHP上で一貫して見せる",
            ].map((point, idx) => (
              <li
                key={point}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2"
                style={{ animation: `dashPanelIn .55s cubic-bezier(0.22, 1, 0.36, 1) ${0.08 + idx * 0.1}s both` }}
              >
                {point}
              </li>
            ))}
          </ul>
          <div className="mt-3 rounded-lg border border-red-600/40 bg-white px-3 py-2 text-base font-semibold text-red-700 md:text-lg">
            キャンペーン・共通・店舗別も同じ思想で繋ぎ、申込体験を分断させない
          </div>
        </div>
      </div>
    </div>
  );
}

/** プロファイル別のダッシュボード（HTML/CSSのみ） */
export function DashboardPresentation({ slideIndex }) {
  const slides = IS_NO2
    ? [<No2SlideStoreBank />, <No2SlideMachineSpec />, <No2SlideMemberTrend />, <No2SlideRank />]
    : IS_NO3
      ? [
          <No3SlideIosLpView
            key="no3-screen-record"
            videoSrc="/no3/lp-screen-record.mp4"
            alt="LPをスマホで操作した画面収録"
            title="LP（スマホ画面収録）"
            url=""
          />,
        ]
      : IS_NO4
        ? [
            <No4SlideGanttView key="no4-gantt-tool" />,
          ]
        : IS_NO5
          ? [
              <No5SlideLpHero key="no5-lp-hero" />,
              <No5SlidePriceAndReserve key="no5-lp-price-reserve" />,
              <No5SlideFormCalendar key="no5-lp-flow" />,
            ]
          : IS_NO6
            ? [
                <No6UnifiedLpVideoSlide key="no6-unified-lp" />,
                <No6CampaignLpVideoSlide key="no6-campaign-lp" />,
              ]
          : IS_NO7
            ? [
                <No7SimpleVideoSlide key="no7-simple-video" />,
              ]
          : [<SlidePL />, <SlideMemberTrend />, <SlideMemberDetail />, <SlideSales />];

  const dashSlideCycleSec = IS_NO1
    ? Number(NO1_DASH_SLIDE_CYCLE_SEC[slideIndex] ?? NO1_DASH_SLIDE_CYCLE_SEC[0] ?? 5)
    : IS_NO2
      ? Number(NO2_DASH_SLIDE_CYCLE_SEC[slideIndex] ?? NO2_DASH_SLIDE_CYCLE_SEC[0] ?? 5)
      : DASH_SLIDE_CYCLE_SEC_DEFAULT;

  return (
    <div
      className={`mx-auto flex h-full min-h-0 w-full max-w-[1920px] flex-col ${
        IS_NO5 ? "relative overflow-hidden bg-black" : IS_NO6 ? "bg-slate-50" : ""
      }`}
    >
      <style>{`
        @keyframes no3ScreenScroll {
          0%, 14% { transform: translateY(0); }
          48%, 62% { transform: translateY(-8%); }
          90%, 100% { transform: translateY(0); }
        }
        .no3-copy-shell {
          min-height: min(54vh, 560px);
          padding: clamp(1.15rem, 1.9vw, 1.7rem);
          border: 2px solid rgba(190, 24, 93, 0.42);
          border-radius: 1.3rem;
          background:
            linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(255, 241, 244, 0.92)),
            linear-gradient(120deg, rgba(244, 63, 94, 0.16), transparent 50%);
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86), 0 20px 48px rgba(190, 24, 93, 0.15);
          display: flex;
          align-items: center;
        }
        .no3-copy-single {
          width: 100%;
          animation: no3CopySwitch 0.56s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .no3-step-pill {
          display: inline-flex;
          min-width: 3.6rem;
          justify-content: center;
          align-items: center;
          padding: 0.52rem 0.9rem;
          border-radius: 0.9rem;
          border: 1px solid rgba(225, 29, 72, 0.45);
          background: linear-gradient(160deg, rgba(255, 255, 255, 0.92), rgba(255, 237, 242, 0.86));
          color: rgba(136, 19, 55, 0.9);
          font-size: 1.04rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          transition: all 280ms ease;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9), 0 6px 14px rgba(225, 29, 72, 0.16);
        }
        .no3-step-pill.is-active {
          background: linear-gradient(140deg, rgba(225, 29, 72, 0.98), rgba(244, 63, 94, 0.9));
          color: #fff;
          border-color: rgba(190, 24, 93, 0.9);
          transform: translateY(-1px) scale(1.06);
          box-shadow: 0 10px 22px rgba(225, 29, 72, 0.34);
        }
        @keyframes no3CopySwitch {
          from { opacity: 0; transform: translateX(-26px) scale(0.985); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes dashBarGrow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        @keyframes dashBarGlow {
          0%, 100% { filter: drop-shadow(0 0 0px rgba(56,189,248,0)); }
          45% { filter: drop-shadow(0 0 8px rgba(56,189,248,0.35)); }
        }
        @keyframes dashLineDraw {
          from { stroke-dashoffset: 400; opacity: 0.4; }
          to { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes dashLinePulse {
          0%, 100% { opacity: 0.85; }
          50% { opacity: 1; }
        }
        @keyframes dashReveal {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dashCaptionIn {
          0% { opacity: 0; transform: translateY(8px); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes dashSlideCycle {
          0% { opacity: 0; transform: translateX(72px) scale(0.982); filter: blur(6px); }
          12% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
          88% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
          100% { opacity: 0.9; transform: translateX(-20px) scale(0.995); filter: blur(1px); }
        }
        @keyframes dashRatePulse {
          0%, 100% { opacity: 0.9; text-shadow: 0 0 0 rgba(34,211,238,0); }
          50% { opacity: 1; text-shadow: 0 0 12px rgba(34,211,238,0.45); }
        }
        @keyframes dashPanelIn {
          0% { opacity: 0; transform: translateX(26px) scale(0.98); filter: blur(5px); }
          100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
        }
        @keyframes dashGraphFloatIn {
          0% { opacity: 0; transform: translate(-38px, 30px) scale(0.97); filter: blur(5px); }
          100% { opacity: 1; transform: translate(0, 0) scale(1); filter: blur(0); }
        }
        @keyframes chartBar3dIn {
          0% { transform: translate3d(-12px, 16px, 0) scaleY(0.05); transform-origin: bottom; opacity: 0; filter: brightness(1.2); }
          100% { transform: translate3d(0, 0, 0) scaleY(1); transform-origin: bottom; opacity: 1; filter: brightness(1); }
        }
        @keyframes chart3dIn {
          0% { opacity: 0; transform: translate3d(-10px, 8px, 0) scale(0.9); filter: blur(2px); }
          100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
        }
        @keyframes chartLineIn {
          0% { opacity: 0; filter: blur(2px); }
          100% { opacity: 1; filter: blur(0); }
        }
        @keyframes chartPointIn {
          0% { opacity: 0; transform: translateY(6px) scale(0.6); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .kpi-seq > * {
          opacity: 0;
          animation: dashPanelIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .kpi-seq > :nth-child(1) { animation-delay: 0s; }
        .kpi-seq > :nth-child(2) { animation-delay: 0.18s; }
        .kpi-seq > :nth-child(3) { animation-delay: 0.36s; }
        .kpi-seq > :nth-child(4) { animation-delay: 0.54s; }
        .slide-lower > * {
          opacity: 0;
          animation: dashGraphFloatIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .slide-lower > :nth-child(1) { animation-delay: 0s; }
        .slide-lower > :nth-child(2) { animation-delay: 0.12s; }
        .slide-lower > :nth-child(3) { animation-delay: 0.24s; }
        .slide-lower.no3-lp-after > * {
          opacity: 1;
          animation: none;
        }
        .slide-lower.no6-lp-after > * {
          opacity: 1;
          animation: none;
        }
        @keyframes no6HeaderBannerPulse {
          0%, 100% { box-shadow: 0 0 0 rgba(220, 38, 38, 0.08); transform: translateY(0); }
          50% { box-shadow: 0 10px 22px rgba(220, 38, 38, 0.2); transform: translateY(-1px); }
        }
        @keyframes no6HeaderMarkSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes no6HeaderTitleIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .no6-header-banner {
          animation: no6HeaderBannerPulse 3.6s ease-in-out infinite;
          box-shadow: 0 14px 26px rgba(15, 23, 42, 0.18), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .no6-header-banner::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 45%);
          pointer-events: none;
        }
        .no6-header-banner-mark {
          position: relative;
          overflow: hidden;
        }
        .no6-header-banner-mark::after {
          content: "";
          position: absolute;
          inset: -35%;
          border: 1px solid rgba(255, 255, 255, 0.82);
          border-radius: 999px;
          animation: no6HeaderMarkSpin 5.6s linear infinite;
        }
        .no6-header-title {
          animation: no6HeaderTitleIn 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .no6-headline-panel {
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.12), inset 0 1px 0 rgba(255,255,255,0.9);
        }
        .no6-copy-shell {
          min-height: min(48vh, 480px);
          padding: clamp(1.15rem, 1.9vw, 1.7rem);
          border: 2px solid rgba(23, 23, 23, 0.88);
          border-radius: 0.75rem;
          background: #fff;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 1), 0 12px 28px rgba(0, 0, 0, 0.06);
          display: flex;
          align-items: center;
        }
        .no6-copy-shell.no6-copy-shell--compact {
          min-height: 0;
          flex: 1 1 auto;
          padding: clamp(1.35rem, 2.4vw, 2.1rem);
          align-items: stretch;
        }
        .no6-copy-single {
          width: 100%;
          animation: no6CopySwitch 0.58s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .no6-copy-title {
          font-size: clamp(2rem, 4.8vw, 3.85rem);
          min-height: 1.22em;
          margin-bottom: 0.3rem;
        }
        .no6-copy-bullet {
          font-size: 1em;
          line-height: 1.3;
          color: #dc2626;
        }
        @media (min-width: 1280px) {
          .no6-copy-title {
            font-size: clamp(2.35rem, 5.1vw, 4.1rem);
          }
        }
        @keyframes no6CopySwitch {
          from { opacity: 0; transform: translateX(20px) scale(0.985); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        .no6-step-pill {
          display: inline-flex;
          min-width: 0;
          justify-content: center;
          align-items: center;
          padding: 0.95rem 0.58rem;
          border-radius: 0.7rem;
          border: 2px solid rgba(23, 23, 23, 0.55);
          background: linear-gradient(180deg, #f5f5f5 0%, #e5e5e5 100%);
          color: rgba(0, 0, 0, 0.55);
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 0.06em;
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9);
          filter: saturate(0.1);
          opacity: 0.88;
          transition: transform 180ms ease, background 200ms ease, color 200ms ease, border-color 200ms ease, box-shadow 220ms ease, filter 220ms ease, opacity 220ms ease;
        }
        .no6-step-pill.no6-step-3d {
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #fafafa 0%, #e7e7e7 70%, #e2e2e2 100%);
          box-shadow: 0 14px 22px rgba(0, 0, 0, 0.10), inset 0 1px 0 rgba(255,255,255,0.95), inset 0 -4px 10px rgba(0,0,0,0.06);
        }
        .no6-step-pill.no6-step-3d::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.08) 52%, rgba(0,0,0,0.05) 100%);
          pointer-events: none;
        }
        .no6-step-pill.no6-step-3d::after {
          content: "";
          position: absolute;
          left: 14%;
          right: 14%;
          top: 8px;
          height: 5px;
          border-radius: 999px;
          background: rgba(255,255,255,0.95);
          opacity: 0.55;
          pointer-events: none;
        }
        .no6-step-pill-label {
          text-decoration: none;
        }
        .no6-step-pill.is-active {
          background: linear-gradient(180deg, #1a1a1a 0%, #050505 70%, #000000 100%);
          color: #fff;
          border-color: rgba(0, 0, 0, 0.95);
          box-shadow: 0 22px 44px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255,255,255,0.14);
          transform: translateY(-1px);
          filter: none;
          opacity: 1;
        }
        .no6-step-pill.is-active .no6-step-pill-label {
          text-decoration: none;
        }
        .no6-step-pill.no6-step-3d.is-active::after {
          opacity: 0.85;
        }
        .slide-lower.no4-clean > * {
          opacity: 1;
          animation: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .no4-steps-rail {
            transition: none !important;
          }
        }
        .chart-stage {
          opacity: 0;
          animation: dashGraphFloatIn .7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .slide-lower > .chart-stage:nth-child(1) { animation-delay: 0s; }
        .slide-lower > .chart-stage:nth-child(2) { animation-delay: 0.12s; }
        .slide-lower > .chart-stage:nth-child(3) { animation-delay: 0.24s; }
        .brand-logo-card {
          opacity: 0;
          transform: translateX(-16px);
          animation: dashPanelIn .55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .brand-logo-card:nth-child(1) { animation-delay: .12s; }
        .brand-logo-card:nth-child(2) { animation-delay: .24s; }
        .brand-logo-card:nth-child(3) { animation-delay: .36s; }
        .brand-logo-card:nth-child(4) { animation-delay: .48s; }
        .no1-preset-slide {
          filter: saturate(1.06) contrast(1.04);
        }
        @keyframes no2RadarFloat {
          0%, 100% { transform: perspective(1300px) rotateX(5deg) rotateZ(-0.7deg) scale(1.02); }
          50% { transform: perspective(1300px) rotateX(7deg) rotateZ(0.7deg) scale(1.045); }
        }
        @keyframes no2RadarPulse {
          0%, 100% { opacity: 0.28; transform: scale(0.97); }
          50% { opacity: 0.62; transform: scale(1.03); }
        }
        @keyframes no2SpecPulse {
          0%, 100% { opacity: 0.8; filter: saturate(1); }
          50% { opacity: 1; filter: saturate(1.22); }
        }
        @keyframes no2SpecCellShine {
          0%, 100% { background-color: rgba(15, 23, 42, 0.82); }
          50% { background-color: rgba(30, 41, 59, 0.95); }
        }
        .no2-radar-image {
          animation: no2RadarFloat 4.6s ease-in-out infinite;
        }
        .no2-radar-orbit {
          animation: no2RadarPulse 3.6s ease-in-out infinite;
        }
        .no2-radar-orbit.delay {
          animation-delay: 0.7s;
        }
        .no2-radar-live {
          animation: issuePulse 2.6s ease-in-out infinite;
        }
        .no2-spec-radar-stage {
          animation: panelFloat 5.2s ease-in-out infinite;
        }
        .no2-spec-poly-main,
        .no2-spec-poly-sub {
          animation: chart3dIn .9s ease-out both, no2SpecPulse 2.8s ease-in-out 1.05s infinite;
        }
        .no2-spec-poly-sub {
          animation-delay: .25s, 1.4s;
        }
        .no2-spec-cell {
          animation: no2SpecCellShine 2.8s ease-in-out infinite;
        }
        .no2-spec-cell:nth-child(4n+1) { animation-delay: 0s; }
        .no2-spec-cell:nth-child(4n+2) { animation-delay: .25s; }
        .no2-spec-cell:nth-child(4n+3) { animation-delay: .5s; }
        .no2-spec-cell:nth-child(4n+4) { animation-delay: .75s; }
        @keyframes no5In {
          from {
            opacity: 0;
            transform: translateY(20px);
            filter: blur(3px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
        /* 暗い赤グラデのバンディング緩和（ディザー）。録画後のエンコードでもわずかに効く */
        .no5-film-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px 160px;
          mix-blend-mode: overlay;
          opacity: 0.055;
        }
        @keyframes no5PtEnterLr {
          from {
            transform: translateX(-7%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes no5PtEnterRl {
          from {
            transform: translateX(7%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .no5-pt-card-top .no5-pt-enter-lr {
          animation: no5PtEnterLr 1.2s cubic-bezier(0.16, 1, 0.3, 1) 2.5s both;
        }
        .no5-pt-card-bot .no5-pt-enter-rl {
          animation: no5PtEnterRl 1.2s cubic-bezier(0.16, 1, 0.3, 1) 5.5s both;
        }
        /* 申込スライド: 料金スライドのトレーナー画像と同じ左右スライドイン */
        .no5-fc-pane-l .no5-fc-enter-slide {
          animation: no5PtEnterLr 1.2s cubic-bezier(0.16, 1, 0.3, 1) 2.5s both;
        }
        .no5-fc-pane-r .no5-fc-enter-slide {
          animation: no5PtEnterRl 1.2s cubic-bezier(0.16, 1, 0.3, 1) 5.5s both;
        }
        @keyframes no5PtBtkDraw {
          from {
            opacity: 0;
            transform: scale(0.88);
            filter: blur(1px);
          }
          to {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }
        @keyframes no5PtFrameArcPulse {
          0% {
            opacity: 0;
            transform: scale(0.94);
          }
          55% {
            opacity: 0.55;
          }
          100% {
            opacity: 0.35;
            transform: scale(1);
          }
        }
        .no5-pt-frame-arc {
          position: absolute;
          inset: -2px;
          border-radius: 1.15rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow:
            inset 0 0 0 1px rgba(248, 113, 113, 0.12),
            0 0 40px rgba(127, 29, 29, 0.18);
          opacity: 0;
          pointer-events: none;
        }
        .no5-pt-card-top .no5-pt-frame-arc {
          animation: no5PtFrameArcPulse 1.1s cubic-bezier(0.16, 1, 0.3, 1) 2.45s both;
        }
        .no5-pt-card-bot .no5-pt-frame-arc {
          animation: no5PtFrameArcPulse 1.1s cubic-bezier(0.16, 1, 0.3, 1) 5.45s both;
        }
        .no5-pt-btk {
          position: absolute;
          width: 38px;
          height: 38px;
          opacity: 0;
          animation: no5PtBtkDraw 0.75s cubic-bezier(0.16, 1, 0.35, 1) both;
        }
        .no5-pt-card-top .no5-pt-btk {
          animation-delay: 2.55s;
        }
        .no5-pt-card-bot .no5-pt-btk {
          animation-delay: 5.55s;
        }
        .no5-pt-btk-tl {
          left: 0;
          top: 0;
          border-left: 2.5px solid rgba(252, 211, 211, 0.72);
          border-top: 2.5px solid rgba(252, 211, 211, 0.72);
          border-radius: 12px 0 0 0;
          box-shadow: -2px -2px 22px rgba(220, 38, 38, 0.22);
        }
        .no5-pt-btk-tr {
          right: 0;
          top: 0;
          border-right: 2.5px solid rgba(252, 211, 211, 0.72);
          border-top: 2.5px solid rgba(252, 211, 211, 0.72);
          border-radius: 0 12px 0 0;
          box-shadow: 2px -2px 22px rgba(220, 38, 38, 0.22);
        }
        .no5-pt-btk-bl {
          left: 0;
          bottom: 0;
          border-left: 2.5px solid rgba(165, 243, 252, 0.45);
          border-bottom: 2.5px solid rgba(165, 243, 252, 0.45);
          border-radius: 0 0 0 12px;
          box-shadow: -2px 2px 22px rgba(34, 211, 238, 0.14);
        }
        .no5-pt-btk-br {
          right: 0;
          bottom: 0;
          border-right: 2.5px solid rgba(165, 243, 252, 0.45);
          border-bottom: 2.5px solid rgba(165, 243, 252, 0.45);
          border-radius: 0 0 12px 0;
          box-shadow: 2px 2px 22px rgba(34, 211, 238, 0.14);
        }
        .no5-pt-o {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 9999px;
          border: 2px solid rgba(34, 211, 238, 0.55);
          box-shadow: 0 0 18px rgba(34, 211, 238, 0.35);
          opacity: 0;
          animation: no5PtBtkDraw 0.65s cubic-bezier(0.16, 1, 0.35, 1) both;
        }
        .no5-pt-card-top .no5-pt-o {
          animation-delay: 2.62s;
        }
        .no5-pt-card-bot .no5-pt-o {
          animation-delay: 5.62s;
        }
        .no5-pt-o-tl {
          left: -5px;
          top: -5px;
        }
        .no5-pt-o-tr {
          right: -5px;
          top: -5px;
        }
        .no5-pt-o-bl {
          left: -5px;
          bottom: -5px;
        }
        .no5-pt-o-br {
          right: -5px;
          bottom: -5px;
        }
        .no5-anim {
          opacity: 0;
          animation: no5In 0.78s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: var(--no5-d, 0s);
        }
        @keyframes no6ChipPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.2); }
          50% { transform: scale(1.04); box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
        }
        @keyframes no6Scanline {
          0% { transform: translateX(-110%); opacity: 0; }
          20% { opacity: 0.32; }
          100% { transform: translateX(110%); opacity: 0; }
        }
        @keyframes no6NodeIn {
          from { opacity: 0; transform: translateY(10px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .no6-chip {
          animation: no6ChipPulse 2.2s ease-in-out infinite;
        }
        .no6-scanline {
          background: linear-gradient(110deg, transparent 28%, rgba(99, 102, 241, 0.25) 50%, transparent 72%);
          animation: no6Scanline 2.7s linear infinite;
        }
        .no6-hero {
          animation: dashPanelIn 0.75s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .no6-node {
          opacity: 0;
          animation: no6NodeIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .no6-node:nth-child(1) { animation-delay: 0.06s; }
        .no6-node:nth-child(2) { animation-delay: 0.18s; }
        .no6-node:nth-child(3) { animation-delay: 0.3s; }
        @keyframes no6DualPaneIn {
          0% { opacity: 0; transform: translateY(18px) scale(0.985); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes no6DualShine {
          0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
          18% { opacity: 0.42; }
          100% { transform: translateX(130%) skewX(-18deg); opacity: 0; }
        }
        .no6-dual-pane {
          opacity: 0;
          animation: no6DualPaneIn 0.62s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .no6-dual-pane:nth-child(1) { animation-delay: 0.05s; }
        .no6-dual-pane:nth-child(2) { animation-delay: 0.2s; }
        .no6-dual-shine {
          background: linear-gradient(115deg, transparent 24%, rgba(255,255,255,0.26) 50%, transparent 76%);
          animation: no6DualShine 2.8s linear infinite;
        }
        .no6-dual-label {
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.34);
        }
        @media (prefers-reduced-motion: reduce) {
          .no5-anim {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
          .no6-header-banner-mark::after {
            animation: none !important;
          }
          .no5-pt-card-top .no5-pt-enter-lr,
          .no5-pt-card-bot .no5-pt-enter-rl,
          .no5-fc-pane-l .no5-fc-enter-slide,
          .no5-fc-pane-r .no5-fc-enter-slide {
            animation: none !important;
            transform: none !important;
            opacity: 1 !important;
          }
          .no5-pt-btk,
          .no5-pt-o,
          .no5-pt-frame-arc,
          .no6-chip,
          .no6-header-banner,
          .no6-header-title,
          .no6-scanline,
          .no6-hero,
          .no6-node,
          .no6-dual-pane,
          .no6-dual-shine {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            filter: none !important;
          }
          .no6-copy-single {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
      <DashChrome
        activeIndex={slideIndex}
        tabs={IS_NO2 ? NO2_TABS : IS_NO3 ? NO3_TABS : IS_NO4 ? NO4_TABS : IS_NO5 ? NO5_TABS : IS_NO6 ? NO6_TABS : IS_NO7 ? NO7_TABS : NO1_TABS}
        title={
          IS_NO2
            ? "競合BMデータバンク / 分析ダッシュボード"
            : IS_NO3
              ? "LPアップデート / 内製化ダッシュボード"
              : IS_NO4
                ? "FIT365 工程表 自動生成ツール"
                : IS_NO5
                  ? "Googleカレンダー連携 / パーソナル販促"
                  : IS_NO6
                    ? "HP・外部販促の強化"
                    : IS_NO7
                      ? "ToDoリスト / タスク依頼一元管理"
                  : "テリトリー数値ダッシュボード"
        }
        badge={IS_NO2 ? "APP SHEET連携" : IS_NO3 ? "UPDATE" : IS_NO4 ? "工程DX" : IS_NO5 ? "LP · 予約導線" : IS_NO6 ? "LP一元化" : IS_NO7 ? "申請フォーム" : ""}
        rightPills={
          IS_NO2
            ? []
            : IS_NO3
              ? ["外部販促費 0", "CV導線最適化"]
              : IS_NO4
                ? ["実機収録", "進捗標準化"]
                : IS_NO5
                  ? []
                  : IS_NO6
                    ? ["マシンLP", "設備訴求"]
                    : IS_NO7
                      ? ["店舗別管理", "DL通知"]
                  : ["4月", "テリトリー1計"]
        }
      >
        <div
          key={slideIndex}
          className={`flex h-full min-h-0 flex-1 flex-col ${IS_NO6 ? "min-h-0" : "justify-end"}`}
          style={
            IS_NO3 || IS_NO4 || IS_NO5 || IS_NO6 || IS_NO7
              ? undefined
              : { animation: `dashSlideCycle ${dashSlideCycleSec}s linear both` }
          }
        >
          {slides[slideIndex]}
        </div>
      </DashChrome>
    </div>
  );
}

