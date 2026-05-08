import React, { useEffect, useMemo, useState } from "react";
import {
  NO1_AFTER_SCENE_MS,
  NO1_BEFORE_SCENE_MS,
  NO1_DASHBOARD_TICK_MS,
  NO1_OUTRO_SCENE_MS,
  NO1_PROFILE_SCENE_MS,
  NO1_TRANSITION_SCENE_MS,
} from "./no1-video.constants.mjs";
import {
  NO2_AFTER_SCENE_MS,
  NO2_BEFORE_SCENE_MS,
  NO2_DASHBOARD_TICK_MS,
  NO2_OUTRO_SCENE_MS,
  NO2_PROFILE_SCENE_MS,
  NO2_TRANSITION_SCENE_MS,
} from "./no2-video.constants.mjs";
import {
  NO3_AFTER_SCENE_MS,
  NO3_BEFORE_SCENE_MS,
  NO3_PROFILE_SCENE_MS,
  NO3_TRANSITION_SCENE_MS,
} from "./no3-video.constants.mjs";
import {
  NO4_AFTER_SCENE_MS,
  NO4_BEFORE_SCENE_MS,
  NO4_PROFILE_SCENE_MS,
} from "./no4-video.constants.mjs";
import { NO5_AFTER_SCENE_MS, NO5_PROFILE_SCENE_MS } from "./no5-video.constants.mjs";
import { NO6_AFTER_SCENE_MS, NO6_DASHBOARD_TICK_MS, NO6_PROFILE_SCENE_MS } from "./no6-video.constants.mjs";
import { NO7_AFTER_SCENE_MS, NO7_PROFILE_SCENE_MS } from "./no7-video.constants.mjs";
import { Database } from "lucide-react";
import { PROFILE_ID } from "./profile-id.js";
import { DashboardPresentation } from "./DashboardPresentation.jsx";
import { VoteWebPage } from "./VoteWebPage.jsx";
import fukuyoFace from "./福與.png";
import kojimaFace from "./小島.png";
import chichibuFace from "./秩父.png";
import moriyasuFace from "./moriyasu-kengo.png";

const SCENES = {
  idle: "idle",
  profile: "profile",
  before: "before",
  transition: "transition",
  after: "after",
  outro: "outro",
};

/** NO1 など「長尺」テンプレ。応募者紹介 OP はアプリ外の動画に任せ、ここはプロフィールから開始 */
const TIMELINE_DEFAULT = [
  { scene: SCENES.profile, duration: 5000 },
  { scene: SCENES.before, duration: 5000 },
  { scene: SCENES.transition, duration: 5000 },
  { scene: SCENES.after, duration: 20000 },
  { scene: SCENES.outro, duration: 5000 },
];

/** ナレーション実長に合わせた NO1 タイムライン（no1-video.constants.mjs）。アウトロなし */
const TIMELINE_NO1 = [
  { scene: SCENES.profile, duration: NO1_PROFILE_SCENE_MS },
  { scene: SCENES.before, duration: NO1_BEFORE_SCENE_MS },
  { scene: SCENES.transition, duration: NO1_TRANSITION_SCENE_MS },
  { scene: SCENES.after, duration: NO1_AFTER_SCENE_MS },
];

/** ナレーション実長に合わせた NO2 タイムライン（no2-video.constants.mjs）。アウトロなし */
const TIMELINE_NO2 = [
  { scene: SCENES.profile, duration: NO2_PROFILE_SCENE_MS },
  { scene: SCENES.before, duration: NO2_BEFORE_SCENE_MS },
  { scene: SCENES.transition, duration: NO2_TRANSITION_SCENE_MS },
  { scene: SCENES.after, duration: NO2_AFTER_SCENE_MS },
];

/** ナレーション実長に合わせた NO3 タイムライン（no3-video.constants.mjs）。アウトロなし */
const TIMELINE_NO3 = [
  { scene: SCENES.profile, duration: NO3_PROFILE_SCENE_MS },
  { scene: SCENES.before, duration: NO3_BEFORE_SCENE_MS },
  { scene: SCENES.transition, duration: NO3_TRANSITION_SCENE_MS },
  { scene: SCENES.after, duration: NO3_AFTER_SCENE_MS },
];

/** 発表者テンプレート（NO1/NO2切替） */
const PROFILE_MAP = {
  no1: {
    entry: "NO.1",
    name: "鈴木 貴秀",
    theme: "テリトリー数値ダッシュボード化",
    photo: "/suzuki-face.png",
    note: "複数のスプシデータを1つに集約させダッシュボード化",
    challenge: ["必要データの探索に時間がかかる。", "4グラフ比較に手間がかかり、即時判断しにくい。"],
    effect: ["個別のスプレッドシート管理から脱却し", "管轄店舗の情報を1元化", "ダッシュボードで閲覧～共有の新体制へ"],
  },
  no2: {
    entry: "NO.2",
    name: "福與 翔大",
    theme: "ベンチマークアプリ作成",
    photo: fukuyoFace,
    note: "初めてAPP SHEETを使ってベンチマークをデータ集約した取り組み",
    challenge: ["BM時のチェック項目のばらつき。", "BMデータを可視化するためのデータバンクが無い。"],
    effect: ["BM時のチェック項目の標準化とデータ蓄積", "評価基準のばらつき抑制と、比較可能なBMデータの可視化", "競合比較と強み・弱み分析を高速化"],
  },
  no3: {
    entry: "NO.3",
    name: "小島 紳哉",
    theme: "自作LP作成",
    photo: kojimaFace,
    note: "LPを内製アップデートし、金額訴求と入会導線の視認性を向上",
    challenge: ["既存LPは更新箇所が分散し、文言や画像差し替えに工数がかかる。", "重要情報への導線が弱く、閲覧者が迷いやすい。"],
    effect: ["チラシ中心の告知から、LP上で金額を伝える導線へ更新", "視認性の高いデザインで入会情報を分かりやすく提示", "内製化により外部販促費0で継続改善できる体制を実現"],
  },
  no4: {
    entry: "NO.4",
    name: "秩父瀧",
    theme: "新店ガントチャート生成ツール",
    photo: chichibuFace,
    note: "従来不足していたリニューアル時のマニュアル・DL管理をDX化し、新店・リブランディング両方に対応",
    challenge: ["従来は適切なリニューアル時のマニュアルやDL管理フローが無く、工程判断が担当者依存だった。", "期限・依頼先・連絡先が散在し、工程抜けや認識ズレが起きやすかった。"],
    effect: ["オープン日入力だけで工程を自動逆算し、ガントと進捗管理シートを同時生成", "チェックボックス運用により、新店・リブランディング双方で進捗基準を統一", "担当部署メール・業者連絡先込みの一覧で、迷わない実行フローを実現"],
  },
  no5: {
    entry: "NO.5",
    name: "森保 建吾",
    theme: "パーソナル訴求力UP",
    photo: moriyasuFace,
    note: "",
    challenge: [],
    effect: [],
  },
  no6: {
    entry: "NO.6",
    name: "日下 竜太",
    theme: "HP・外部販促強化",
    photo: "/no6/kusaka-face.png",
    note: "キャンペーン・共通導線・店舗別訴求を1つの導線思想に統一",
    challenge: ["LPごとに導線と訴求軸が分かれ、申し込み体験が分断される。", "特典申請や店舗別訴求が個別最適になり、運用負荷が上がる。"],
    effect: ["入会から特典申請までの導線設計を1元化", "キャンペーンLPと共通申込LPを接続し、離脱ポイントを削減", "店舗特化LPへ自然に遷移できる導線でCV最大化を狙う"],
  },
  no7: {
    entry: "NO.7",
    name: "渡邊 将樹",
    theme: "ToDoリスト 作成",
    photo: "/no7/no7-face.png",
    note: "タスク&DL管理フォームで申請を受け付け、入力者は店舗ごとにチェックボックスで管理するToDoリストを構築",
    challenge: ["申請者の依頼内容が分散し、氏名・宛先・担当情報の確認に手間がかかる。", "店舗ごとの入力状況が見えづらく、進捗管理と期限管理が属人的になりやすい。"],
    effect: [
      "氏名、宛先、タスクチーム/部署、依頼内容、参考URL、DL日をフォームで標準入力化",
      "申請者が必要情報を一度で登録でき、3日前と当日のリマインド通知で期限対応を安定化",
      "入力者を店舗ごとのチェックボックスで可視化し、ToDo進捗を一元管理",
    ],
  },
};

const ACTIVE_PROFILE = PROFILE_MAP[PROFILE_ID] ?? PROFILE_MAP.no1;

/** ダッシュボード自動切替の枚数（プロファイル別） */
const DASHBOARD_SLIDE_COUNT =
  PROFILE_ID === "no3" || PROFILE_ID === "no4"
    ? 1
    : PROFILE_ID === "no5"
      ? 3
      : PROFILE_ID === "no6"
        ? 2
        : PROFILE_ID === "no7"
          ? 1
      : 4;
const IS_SHORT_PROFILE =
  PROFILE_ID === "no2" ||
  PROFILE_ID === "no3" ||
  PROFILE_ID === "no4" ||
  PROFILE_ID === "no5" ||
  PROFILE_ID === "no6" ||
  PROFILE_ID === "no7";
const TIMELINE =
  PROFILE_ID === "no1"
    ? TIMELINE_NO1
    : PROFILE_ID === "no2"
      ? TIMELINE_NO2
      : PROFILE_ID === "no3"
        ? TIMELINE_NO3
        : IS_SHORT_PROFILE
          ? PROFILE_ID === "no4"
            ? [
                { scene: SCENES.profile, duration: NO4_PROFILE_SCENE_MS },
                { scene: SCENES.before, duration: NO4_BEFORE_SCENE_MS },
                { scene: SCENES.after, duration: NO4_AFTER_SCENE_MS },
              ]
            : PROFILE_ID === "no5"
              ? [
                  { scene: SCENES.profile, duration: NO5_PROFILE_SCENE_MS },
                  { scene: SCENES.after, duration: NO5_AFTER_SCENE_MS },
                ]
              : PROFILE_ID === "no6"
                ? [
                    { scene: SCENES.profile, duration: NO6_PROFILE_SCENE_MS },
                    { scene: SCENES.after, duration: NO6_AFTER_SCENE_MS },
                  ]
                : PROFILE_ID === "no7"
                  ? [
                      { scene: SCENES.profile, duration: NO7_PROFILE_SCENE_MS },
                      { scene: SCENES.after, duration: NO7_AFTER_SCENE_MS },
                    ]
              : [
                  { scene: SCENES.profile, duration: 4500 },
                  { scene: SCENES.before, duration: 5000 },
                  { scene: SCENES.transition, duration: 3000 },
                  { scene: SCENES.after, duration: 17500 },
                ]
          : TIMELINE_DEFAULT;

const DASHBOARD_TICK_MS =
  PROFILE_ID === "no3" || PROFILE_ID === "no4"
    ? 5600
    : PROFILE_ID === "no2"
      ? 5000
    : PROFILE_ID === "no5"
      ? 12_500
      : PROFILE_ID === "no6"
        ? 25_000
        : PROFILE_ID === "no7"
          ? 18_000
      : 5000;

/** NO4 課題カード 1→4 を何 ms 間隔で出すか（音声用に 5 秒刻み） */
const NO4_CHALLENGE_STEP_MS = 5000;
/** シーン入り直後に 1 枚目を出すまでの猶予 */
const NO4_CHALLENGE_FIRST_DELAY_MS = 700;

/** NO4「課題」カード本文（意図した改行位置） */
const NO4_CHALLENGE_CARD_LINES = [
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

function App() {
  if (PROFILE_ID === "vote") {
    return <VoteWebPage />;
  }

  const [isPlaying, setIsPlaying] = useState(true);
  const [scene, setScene] = useState(() => TIMELINE[0].scene);
  const [flash, setFlash] = useState(false);
  const [timelineIndex, setTimelineIndex] = useState(0);
  const [dashSlideIndex, setDashSlideIndex] = useState(0);
  /** NO4 課題スライドで何枚目まで表示したか（0〜4） */
  const [no4ChallengeVisible, setNo4ChallengeVisible] = useState(0);

  const isIdle = scene === SCENES.idle;
  const isProfile = scene === SCENES.profile;
  const isBefore = scene === SCENES.before;
  const isTransition = scene === SCENES.transition;
  const isAfter = scene === SCENES.after;
  const isOutro = scene === SCENES.outro;

  useEffect(() => {
    if (!isPlaying || timelineIndex < 0) return;
    const current = TIMELINE[timelineIndex];
    const timer = setTimeout(() => {
      if (timelineIndex >= TIMELINE.length - 1) {
        setIsPlaying(false);
        if (PROFILE_ID === "no1" || PROFILE_ID === "no3" || PROFILE_ID === "no4") {
          // NO1/NO3/NO4 は末尾スライドを維持し、暗転画面へ遷移させない。
          setTimelineIndex(TIMELINE.length - 1);
          return;
        }
        setTimelineIndex(-1);
        setScene(SCENES.idle);
        return;
      }
      setTimelineIndex((prev) => prev + 1);
    }, current.duration);
    return () => clearTimeout(timer);
  }, [isPlaying, timelineIndex]);

  useEffect(() => {
    if (!isPlaying || timelineIndex < 0) return;
    const target = TIMELINE[timelineIndex].scene;
    setScene(target);

    if (target === SCENES.transition) {
      setFlash(true);
      const flashTimer = setTimeout(() => setFlash(false), 420);
      return () => clearTimeout(flashTimer);
    }
    setFlash(false);
  }, [timelineIndex, isPlaying]);

  useEffect(() => {
    if (!isAfter) return;
    setDashSlideIndex(0);

    if (
      PROFILE_ID === "no1" &&
      Array.isArray(NO1_DASHBOARD_TICK_MS) &&
      NO1_DASHBOARD_TICK_MS.length === DASHBOARD_SLIDE_COUNT
    ) {
      const ticks = NO1_DASHBOARD_TICK_MS;
      const timeouts = [];
      let acc = 0;
      for (let i = 0; i < ticks.length - 1; i += 1) {
        acc += ticks[i];
        const next = i + 1;
        timeouts.push(
          window.setTimeout(() => {
            setDashSlideIndex(next);
          }, acc),
        );
      }
      return () => timeouts.forEach((tid) => window.clearTimeout(tid));
    }

    if (
      PROFILE_ID === "no6" &&
      Array.isArray(NO6_DASHBOARD_TICK_MS) &&
      NO6_DASHBOARD_TICK_MS.length === DASHBOARD_SLIDE_COUNT
    ) {
      const ticks = NO6_DASHBOARD_TICK_MS;
      const timeouts = [];
      let acc = 0;
      for (let i = 0; i < ticks.length - 1; i += 1) {
        acc += ticks[i];
        const next = i + 1;
        timeouts.push(
          window.setTimeout(() => {
            setDashSlideIndex(next);
          }, acc),
        );
      }
      return () => timeouts.forEach((tid) => window.clearTimeout(tid));
    }

    const id = setInterval(() => {
      setDashSlideIndex((prev) => {
        /** NO5/NO6 は終盤を最終スライドで止め、先頭へループさせない */
        if ((PROFILE_ID === "no5" || PROFILE_ID === "no6") && prev >= DASHBOARD_SLIDE_COUNT - 1) return prev;
        return (prev + 1) % DASHBOARD_SLIDE_COUNT;
      });
    }, DASHBOARD_TICK_MS);
    return () => clearInterval(id);
  }, [isAfter]);

  useEffect(() => {
    if (PROFILE_ID !== "no4" || scene !== SCENES.before) {
      setNo4ChallengeVisible(0);
      return undefined;
    }
    setNo4ChallengeVisible(0);
    const ids = [1, 2, 3, 4].map((n) =>
      window.setTimeout(
        () => setNo4ChallengeVisible(n),
        NO4_CHALLENGE_FIRST_DELAY_MS + (n - 1) * NO4_CHALLENGE_STEP_MS,
      ),
    );
    return () => ids.forEach((id) => window.clearTimeout(id));
  }, [scene]);

  const beforeRows = useMemo(
    () =>
      Array.from({ length: 23 }).map((_, row) =>
        Array.from({ length: 11 }).map((__, col) => {
          const base = Math.floor(120 + Math.sin((row + 1) * (col + 2)) * 70 + row * 8 + col * 4);
          if (col % 4 === 0) return `${base}%`;
          if (col % 4 === 1) return `${Math.floor(base * 1.35).toLocaleString("ja-JP")}`;
          if (col % 4 === 2) return `¥${Math.floor(base * 11).toLocaleString("ja-JP")}`;
          return `${(base / 10).toFixed(1)}h`;
        }),
      ),
    [],
  );

  /** 収録・上映用に1920x1080基準の安全枠へ統一 */
  const sceneShellClass = "mx-auto flex h-full min-h-0 w-full max-w-[1920px] flex-col";

  /** 応募者紹介カード（profile）：薄グレー＋黒白。OP 動画はアプリ外で接続 */
  const neutralApplicantSurface = isProfile;

  return (
    <div
      className={`relative flex h-[100dvh] min-h-0 flex-col overflow-hidden ${
        neutralApplicantSurface
          ? "bg-[#b4bac4] text-neutral-950"
          : PROFILE_ID === "no5"
            ? "bg-[radial-gradient(ellipse_100%_88%_at_18%_18%,rgba(90,20,24,0.32),transparent_50%),radial-gradient(ellipse_90%_80%_at_82%_78%,rgba(40,8,10,0.38),transparent_48%),linear-gradient(165deg,#050308_0%,#070305_36%,#020101_100%)] text-slate-100"
            : PROFILE_ID === "no6"
              ? "bg-[radial-gradient(circle_at_15%_18%,rgba(220,38,38,0.14),transparent_40%),radial-gradient(circle_at_82%_78%,rgba(0,0,0,0.45),transparent_48%),linear-gradient(160deg,#0a0a0a_0%,#171717_45%,#0a0a0a_100%)] text-neutral-100"
            : "bg-slate-950 text-slate-100"
      }`}
    >
      <style>{`
        :root {
          --ease-cinematic: cubic-bezier(0.22, 1, 0.36, 1);
          --ease-soft: cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes gridFlow {
          0% { transform: translateY(0px); opacity: .45; }
          100% { transform: translateY(28px); opacity: .2; }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: .45; filter: blur(48px); transform: scale(1); }
          50% { opacity: .78; filter: blur(64px); transform: scale(1.08); }
        }
        @keyframes titleReveal {
          0% { opacity: 0; transform: translateY(20px) scale(.98); letter-spacing: 0.2em; }
          100% { opacity: 1; transform: translateY(0) scale(1); letter-spacing: 0.05em; }
        }
        @keyframes glitch {
          0%, 100% { transform: translate(0); text-shadow: -1px 0 #22d3ee, 1px 0 #3b82f6; }
          20% { transform: translate(-2px, 1px); text-shadow: -2px 0 #22d3ee, 2px 0 #3b82f6; }
          40% { transform: translate(2px, -1px); text-shadow: 2px 0 #22d3ee, -2px 0 #3b82f6; }
          60% { transform: translate(-1px, -1px); text-shadow: 1px 0 #22d3ee, -1px 0 #3b82f6; }
          80% { transform: translate(1px, 1px); text-shadow: -1px 0 #22d3ee, 1px 0 #3b82f6; }
        }
        @keyframes spreadsheetFlatIn {
          0% { opacity: 0; transform: translateY(50px) scale(.96); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0px) scale(1); filter: blur(0); }
        }
        @keyframes hologramIn {
          0% { opacity: 0; transform: translateY(34px) scale(.95); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); opacity: .15; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes endingLine {
          0% { opacity: 0; transform: translateY(18px); letter-spacing: .18em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: .06em; }
        }
        @keyframes no2BeforeRevealLeft {
          0% { opacity: 0; transform: translateX(-52px) scale(0.97); filter: blur(12px); }
          100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
        }
        @keyframes no2BeforeRevealRight {
          0% { opacity: 0; transform: translateX(52px) scale(0.97); filter: blur(12px); }
          100% { opacity: 1; transform: translateX(0) scale(1); filter: blur(0); }
        }
        @keyframes no2OutroReveal {
          0% { opacity: 0; transform: translateY(28px) scale(0.97); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes no2ArrowFlow {
          0% { transform: translateX(-16px); opacity: 0; }
          20% { opacity: 0.95; }
          100% { transform: translateX(28px); opacity: 0; }
        }
        @keyframes dashboardBuild {
          0% { opacity: 0; transform: translateY(26px) scale(.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes avatarFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes neonSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes chartRise {
          0% { opacity: 0; transform: translateY(16px) scaleY(.25); transform-origin: bottom; }
          100% { opacity: 1; transform: translateY(0) scaleY(1); transform-origin: bottom; }
        }
        @keyframes lineDraw {
          0% { stroke-dashoffset: 180; opacity: .3; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes pieGrow {
          0% { opacity: 0; transform: scale(.65); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes barBreath {
          0%, 100% { transform: scaleY(1); transform-origin: bottom; filter: brightness(1); }
          50% { transform: scaleY(1.08); transform-origin: bottom; filter: brightness(1.15); }
        }
        @keyframes panelFloat {
          0%, 100% { transform: perspective(1200px) rotateX(0deg) translateY(0px); }
          50% { transform: perspective(1200px) rotateX(3deg) translateY(-4px); }
        }
        @keyframes dashShine {
          0% { opacity: 0; transform: translateX(-100%); }
          30%, 100% { opacity: 0.35; transform: translateX(100%); }
        }
        @keyframes reframeSweep {
          from { transform: scaleX(0); opacity: 0.5; }
          to { transform: scaleX(1); opacity: 1; }
        }
        @keyframes reframeOrbit {
          from { stroke-dashoffset: 420; opacity: 0.2; }
          to { stroke-dashoffset: 0; opacity: 0.85; }
        }
        @keyframes reframePulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.04); }
        }
        @keyframes awardRing {
          from { transform: rotate(0deg) scale(0.98); opacity: 0.5; }
          to { transform: rotate(360deg) scale(1.05); opacity: 0.95; }
        }
        @keyframes awardSweep {
          0% { transform: translateX(-120%) skewX(-16deg); opacity: 0; }
          18% { opacity: 0.65; }
          100% { transform: translateX(130%) skewX(-16deg); opacity: 0; }
        }
        @keyframes awardPop {
          0% { opacity: 0; transform: translateY(30px) scale(.95); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes awardTicker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes bootPulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.04); }
        }
        @keyframes glassShine {
          0% { transform: translateX(-130%) skewX(-18deg); opacity: 0; }
          20% { opacity: 0.6; }
          100% { transform: translateX(130%) skewX(-18deg); opacity: 0; }
        }
        @keyframes issuePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(225,29,72,0.35); }
          50% { transform: scale(1.03); box-shadow: 0 0 0 10px rgba(225,29,72,0); }
        }
        @keyframes no4OrbDrift {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.38; }
          33% { transform: translate(28px, -18px) scale(1.08); opacity: 0.55; }
          66% { transform: translate(-22px, 14px) scale(0.96); opacity: 0.42; }
        }
        @keyframes no4AvatarEntrance {
          0% { opacity: 0; transform: scale(0.72) rotate(-10deg); filter: blur(14px); }
          65% { opacity: 1; transform: scale(1.05) rotate(3deg); filter: blur(0); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0); }
        }
        @keyframes no4FloatPortrait {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes no4RingPulse {
          0%, 100% { transform: scale(1); opacity: 0.45; }
          50% { transform: scale(1.06); opacity: 0.85; }
        }
        @keyframes no4SlideUpFade {
          0% { opacity: 0; transform: translateY(26px) scale(0.97); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes no4CardFly {
          0% { opacity: 0; transform: translateY(32px) rotateX(-14deg); transform-origin: center bottom; }
          100% { opacity: 1; transform: translateY(0) rotateX(0); }
        }
        @keyframes no4ShineBar {
          0% { transform: translateX(-100%) skewX(-12deg); opacity: 0; }
          35% { opacity: 0.4; }
          100% { transform: translateX(180%) skewX(-12deg); opacity: 0; }
        }
        @keyframes no4ChallengeReveal {
          0% {
            opacity: 0;
            clip-path: inset(0 0 100% 0);
            transform: translateY(10px);
            filter: blur(5px);
          }
          100% {
            opacity: 1;
            clip-path: inset(0 0 0 0);
            transform: translateY(0);
            filter: blur(0);
          }
        }
        @keyframes no4ChallengeEdgeGlow {
          0%, 100% {
            box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(190, 24, 93, 0.22);
          }
          50% {
            box-shadow: 0 14px 36px rgba(15, 23, 42, 0.1), 0 0 0 1px rgba(225, 29, 72, 0.45),
              0 0 28px rgba(244, 63, 94, 0.12);
          }
        }
        @keyframes no4ChallengeAccent {
          0% { transform: scaleY(0); opacity: 0; }
          100% { transform: scaleY(1); opacity: 1; }
        }
        @keyframes no4ChallengeBadgeIn {
          0% { opacity: 0; transform: scale(0.94); letter-spacing: 0.12em; }
          100% { opacity: 1; transform: scale(1); letter-spacing: 0; }
        }
        @keyframes no4DotGlow {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.35), 0 0 8px rgba(251, 113, 133, 0.25);
          }
          50% {
            transform: scale(1.12);
            box-shadow: 0 0 0 3px rgba(225, 29, 72, 0.12), 0 0 14px rgba(244, 63, 94, 0.35);
          }
        }
        @keyframes no4PanelGlow {
          0%, 100% { box-shadow: 0 0 40px rgba(34, 211, 238, 0.12), inset 0 1px 0 rgba(255,255,255,0.07); }
          50% { box-shadow: 0 0 56px rgba(244, 63, 94, 0.14), inset 0 1px 0 rgba(255,255,255,0.09); }
        }
        @keyframes no6OrbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
          35% { transform: translate(24px, -18px) scale(1.06); opacity: 0.65; }
          70% { transform: translate(-18px, 14px) scale(0.95); opacity: 0.48; }
        }
        @keyframes no6PanelIn {
          0% { opacity: 0; transform: translateY(24px) scale(0.97); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes no6FlowLine {
          0% { background-position: 0% 0%; opacity: 0.35; }
          100% { background-position: 200% 0%; opacity: 1; }
        }
        @keyframes no6FaceIn {
          0% { opacity: 0; transform: scale(0.84) rotate(-6deg); filter: blur(10px); }
          100% { opacity: 1; transform: scale(1) rotate(0deg); filter: blur(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .no4-anim-orb,
          .no4-anim-shine,
          .no4-anim-pulse-ring,
          .no4-challenge-badge,
          .no4-challenge-edge,
          .no4-challenge-accent-bar,
          .no6-anim-orb,
          .no6-anim-panel,
          .no6-anim-flow,
          .no6-anim-face {
            animation: none !important;
          }
        }
        /* 応募者紹介など：暗部グラデのバンディングを目立ちにくくする（Dashboard の NO5 と同系） */
        .app-no5-film-grain,
        .app-profile-film-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 160px 160px;
          mix-blend-mode: overlay;
          opacity: 0.055;
        }
        .app-profile-film-grain--soft {
          opacity: 0.034;
        }
      `}</style>

      {PROFILE_ID === "no5" && !isProfile && (
        <div className="app-no5-film-grain pointer-events-none absolute inset-0 z-0" aria-hidden />
      )}

      {PROFILE_ID !== "no5" && !neutralApplicantSurface && (
        <>
          <div className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${isAfter ? "opacity-0" : "opacity-100"}`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.16),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(59,130,246,0.16),transparent_36%),radial-gradient(circle_at_50%_90%,rgba(14,165,233,0.12),transparent_44%)]" />
        <div
          className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:100%_24px]"
          style={{ animation: "gridFlow 6s linear infinite" }}
        />
      </div>

      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-500/30" style={{ animation: "pulseGlow 5.6s var(--ease-soft) infinite" }} />
      <div className="absolute -right-16 bottom-4 h-80 w-80 rounded-full bg-blue-600/20" style={{ animation: "pulseGlow 7s var(--ease-soft) infinite" }} />
        </>
      )}

      {flash && <div className="pointer-events-none absolute inset-0 z-40 bg-white/90" />}

      <main
        className={`relative z-10 flex min-h-0 w-full flex-1 flex-col overflow-hidden ${
          isAfter && PROFILE_ID === "no5"
            ? "box-border p-0"
            : isAfter
              ? "box-border px-3 py-3 sm:px-4 sm:py-4 md:px-5 md:py-5"
              : isBefore && PROFILE_ID === "no4"
                ? "box-border px-2 py-2 sm:px-3 sm:py-2 md:px-4 md:py-3"
                : isBefore && PROFILE_ID === "no2"
                  ? "box-border px-2 py-0 sm:px-3 md:px-4"
                : "box-border px-4 py-3 sm:px-5 sm:py-4 md:px-6 md:py-5"
        }`}
      >
        {isIdle && (
          <div className={`${sceneShellClass} items-center justify-center px-4`}>
            <p className="text-center text-lg font-light tracking-[0.2em] text-slate-600">第1回 EAST DX Excellence Award</p>
          </div>
        )}

        {isProfile && (
          <section
            className={`${sceneShellClass} relative items-center justify-center overflow-y-auto px-4 py-1 text-center md:px-8`}
          >
            <div className="app-profile-film-grain app-profile-film-grain--soft pointer-events-none absolute inset-0 z-[1]" aria-hidden />
            <div className="relative z-10 flex w-full flex-col items-center">
                <div
                  className="relative mx-auto mb-8 box-border h-60 w-60 rounded-full border-[5px] border-black bg-white p-2 shadow-[0_12px_28px_rgba(0,0,0,0.22)] md:mb-10 md:h-72 md:w-72"
                  style={{ animation: "titleReveal 1.05s var(--ease-cinematic) both" }}
                >
                  <img
                    src={ACTIVE_PROFILE.photo}
                    alt={`${ACTIVE_PROFILE.name}さんのプロフィール写真`}
                    className="relative h-full w-full rounded-full border-0 object-cover"
                  />
                </div>
                <h2
                  className="mb-7 text-7xl font-black text-black md:text-8xl"
                  style={{ animation: "titleReveal 1.2s var(--ease-cinematic) 0.08s both" }}
                >
                  {ACTIVE_PROFILE.name}
              </h2>
                <div
                  className="relative mx-auto mt-2 w-full max-w-[min(96vw,1620px)] overflow-hidden rounded-2xl border-[3px] border-black bg-[#cdd2da] p-7 text-left shadow-[0_10px_28px_rgba(0,0,0,0.18)] md:p-9"
                  style={{ animation: "titleReveal 1s var(--ease-cinematic) 0.16s both" }}
                >
                  <div className="relative z-[2] grid gap-5 md:grid-cols-3 md:gap-6">
                    {[
                      { k: "エントリー", v: ACTIVE_PROFILE.entry },
                      { k: "氏名", v: ACTIVE_PROFILE.name },
                      { k: "テーマ", v: ACTIVE_PROFILE.theme, sub: true },
                    ].map(({ k, v, sub }, idx) => (
                      <div
                        key={k}
                        className={`min-w-0 rounded-xl border-2 border-black bg-white px-5 py-5 shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] md:px-6 md:py-6 ${sub ? "md:col-span-1" : ""}`}
                        style={{
                          animation: `no4SlideUpFade 0.6s var(--ease-cinematic) ${0.24 + idx * 0.1}s both`,
                        }}
                      >
                        <p className="text-base font-semibold tracking-[0.14em] text-black md:text-lg">{k}</p>
                        <p
                          className={`mt-3 font-bold tracking-tight text-black ${sub ? "whitespace-nowrap text-xl md:text-2xl lg:text-[1.65rem]" : "text-3xl md:text-4xl"}`}
                        >
                          {v}
                        </p>
                      </div>
                    ))}
                  </div>
                  {ACTIVE_PROFILE.note ? (
                    <p
                      className="relative z-[2] mt-5 text-xl font-semibold tracking-[0.02em] text-black md:text-2xl"
                      style={{ animation: "no4SlideUpFade 0.65s var(--ease-cinematic) 0.55s both" }}
                    >
                      {ACTIVE_PROFILE.note}
                    </p>
                  ) : null}
                </div>
              </div>
          </section>
        )}

        {isBefore && (
          <section
            className={`${sceneShellClass} min-h-0 flex-1 ${
              PROFILE_ID === "no4" ? "overflow-hidden bg-gray-200" : ""
            }`}
          >
            {PROFILE_ID === "no2" ? (
              <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-emerald-400/35 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-[0_24px_72px_rgba(16,185,129,.14)]">
                <div className="grid min-h-0 flex-[0.8] grid-cols-1 items-stretch gap-2 px-2 pb-1 pt-4 min-[900px]:grid-cols-2 min-[900px]:gap-3 min-[900px]:px-3 min-[900px]:pb-1.5 min-[900px]:pt-5 lg:gap-3 lg:px-4 [&>*]:min-w-0">
                  <div
                    className="relative flex min-h-[220px] flex-1 flex-col overflow-hidden rounded-xl border border-emerald-500/45 bg-white shadow-[0_16px_48px_rgba(0,0,0,.35)] min-[900px]:min-h-0"
                    style={{ animation: "no2BeforeRevealLeft 1.05s var(--ease-cinematic) 0.15s both" }}
                  >
                    <div className="min-h-0 flex-1 p-2">
                      <img
                        src="/no2-before-sheet.png"
                        alt="競合情報を手入力で比較していたシート"
                        className="h-full w-full rounded-md object-contain object-top"
                      />
                    </div>
                  </div>
                  <div
                    className="relative flex min-h-[220px] flex-1 flex-col overflow-hidden rounded-xl border border-sky-500/45 bg-white shadow-[0_20px_56px_rgba(14,165,233,.22)] min-[900px]:min-h-0"
                    style={{ animation: "no2BeforeRevealRight 1.05s var(--ease-cinematic) 0.25s both" }}
                  >
                    <div className="min-h-0 flex-1 p-2">
                      <img
                        src="/no2-before-report.png"
                        alt="新規出店情報を資料として共有していた状態"
                        className="h-full w-full rounded-md object-contain object-top"
                      />
                    </div>
                  </div>
                </div>
                <div
                  className="flex-[0.2] border-t-2 border-emerald-400/50 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 px-4 py-2.5 md:px-6 md:py-3"
                  style={{ animation: "no2OutroReveal 0.85s var(--ease-cinematic) 0.3s both" }}
                >
                  <p className="text-[clamp(2rem,3.3vw,2.9rem)] font-black tracking-[0.08em] text-emerald-400">課題</p>
                  <div className="mt-1 grid gap-2 min-[900px]:grid-cols-2 min-[900px]:gap-3">
                    <div className="rounded-lg border border-emerald-300/45 bg-emerald-500/10 px-3 py-2">
                      <p className="text-[clamp(1.45rem,2.05vw,1.85rem)] font-black text-emerald-300">競合情報</p>
                      <p className="mt-1 text-[clamp(1.28rem,1.85vw,1.62rem)] font-bold leading-snug text-slate-100">
                        キャンペーン内容や販促の情報にばらつきがある。
                      </p>
                    </div>
                    <div className="rounded-lg border border-cyan-300/45 bg-cyan-500/10 px-3 py-2">
                      <p className="text-[clamp(1.45rem,2.05vw,1.85rem)] font-black text-cyan-300">共有運用</p>
                      <p className="mt-1 text-[clamp(1.28rem,1.85vw,1.62rem)] font-bold leading-snug text-slate-100">
                        新店やリニューアル時の共有場所が定まっていない。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : PROFILE_ID === "no4" ? (
              <div className="no4-cinematic relative flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden rounded-xl border-2 border-pink-600 bg-gray-200 shadow-inner">
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[10px]" aria-hidden>
                  <div
                    className="no4-anim-orb absolute -left-16 top-1/3 h-72 w-72 rounded-full bg-pink-400/20 blur-3xl"
                    style={{ animation: "no4OrbDrift 8s ease-in-out infinite" }}
                  />
                  <div
                    className="no4-anim-orb absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-fuchsia-500/15 blur-3xl"
                    style={{ animation: "no4OrbDrift 10s ease-in-out infinite reverse" }}
                  />
                </div>
                {/* 次スライド（No4SlideGanttView）と同一のヘッダー行 */}
                <div
                  className="relative z-[1] flex shrink-0 flex-wrap items-center gap-3 overflow-hidden border-b-4 border-pink-600 bg-pink-200 px-4 py-2 md:gap-5 md:px-6 md:py-2.5 lg:px-8"
                  style={{ animation: "no4SlideUpFade 0.72s var(--ease-cinematic) both" }}
                >
                  <div
                    className="no4-anim-shine pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent"
                    style={{ animation: "no4ShineBar 2.6s ease-in-out 0.2s infinite" }}
                  />
                  <div className="relative z-[2] rounded-md border border-pink-600 bg-gray-100 px-2 py-1">
                    <img src="/no4/fit365-logo.png" alt="" className="h-9 w-auto object-contain md:h-11 lg:h-12" />
                  </div>
                  <p className="relative z-[2] min-w-0 flex-1 text-[clamp(1.15rem,2.75vw,2.35rem)] font-black leading-[1.15] text-black">
                    FIT365 工程表 自動生成ツール
                  </p>
                </div>
                <div
                  className="relative z-[1] shrink-0 border-b-4 border-pink-600 bg-pink-200 px-4 py-2 text-center md:px-6 md:py-2.5"
                  style={{ animation: "no4SlideUpFade 0.7s var(--ease-cinematic) 0.08s both" }}
                >
                  <p className="text-[clamp(1.35rem,3.35vw,2.65rem)] font-bold leading-tight text-black">課題（DX前）</p>
                  <p className="mt-1 text-[clamp(1.05rem,2.1vw,1.9rem)] font-semibold leading-snug text-black md:leading-relaxed">
                    リニューアル時のマニュアル整備とDL管理フローがなく、工程が属人化していた。
                  </p>
                </div>
                <div className="relative z-[1] flex min-h-0 flex-1 flex-col bg-gray-200 px-3 py-1.5 md:px-5 md:py-2 lg:px-8">
                  <div className="mx-auto flex min-h-0 w-full max-w-[min(100%,1720px)] flex-1 flex-col justify-center py-1">
                    <div className="grid w-full grid-cols-2 gap-2.5 md:gap-3.5 lg:gap-4">
                      {NO4_CHALLENGE_CARD_LINES.map((line, i) => {
                        const isLive = no4ChallengeVisible > i;
                        return (
                          <div
                            key={`no4-ch-${i}`}
                            className={`relative flex min-h-0 flex-row items-center gap-2.5 rounded-xl border-2 py-2.5 pl-2.5 pr-3 md:gap-3 md:py-3 md:pl-3 md:pr-4 lg:gap-4 lg:py-3.5 lg:pl-4 lg:pr-5 ${
                              isLive
                                ? "no4-challenge-live no4-challenge-edge overflow-visible border-pink-600/90 bg-white"
                                : "overflow-hidden border-pink-200/60 border-dashed bg-white/40 shadow-sm"
                            }`}
                            style={
                              isLive
                                ? {
                                    animation:
                                      "no4ChallengeReveal 0.72s cubic-bezier(0.22, 1, 0.36, 1) both, no4ChallengeEdgeGlow 3.2s ease-in-out 0.72s infinite",
                                  }
                                : { transition: "opacity 0.35s ease, transform 0.35s ease" }
                            }
                          >
                            {isLive ? (
                              <div
                                className="no4-challenge-accent-bar pointer-events-none absolute left-0 top-1.5 bottom-1.5 z-[2] w-[3px] origin-top rounded-full bg-gradient-to-b from-pink-500 via-rose-500 to-fuchsia-600"
                                style={{
                                  animation: "no4ChallengeAccent 0.52s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both",
                                }}
                                aria-hidden
                              />
                            ) : null}
                            <span
                              className={`relative z-[3] flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-lg font-black md:h-12 md:w-12 md:text-xl lg:h-14 lg:w-14 lg:text-2xl ${
                                isLive
                                  ? "no4-challenge-badge border-pink-700 bg-gradient-to-b from-pink-100 to-pink-200 text-black shadow-sm"
                                  : "border-pink-300/70 bg-pink-100/50 text-pink-400/80"
                              }`}
                              style={
                                isLive
                                  ? {
                                      animation:
                                        "no4ChallengeBadgeIn 0.58s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both",
                                    }
                                  : undefined
                              }
                            >
                              {i + 1}
                            </span>
                            <p
                              className={`relative z-[3] min-w-0 flex-1 text-left text-[clamp(1.05rem,2.05vw,2.25rem)] font-bold leading-snug [word-break:keep-all] ${
                                isLive ? "text-black" : "text-black/35"
                              }`}
                            >
                              {line}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div
                    className="mx-auto flex w-full max-w-[min(100%,1720px)] shrink-0 items-center justify-center gap-2.5 pb-0.5 pt-1.5 md:gap-3"
                    aria-hidden
                  >
                    {[0, 1, 2, 3].map((i) => (
                      <span
                        key={i}
                        className={`h-2.5 w-2.5 rounded-full transition-all duration-500 md:h-3 md:w-3 ${
                          no4ChallengeVisible > i
                            ? "bg-pink-600 shadow-[0_0_12px_rgba(225,29,72,0.45)]"
                            : "bg-pink-200/70"
                        }`}
                        style={no4ChallengeVisible > i ? { animation: "no4DotGlow 1.8s ease-in-out infinite" } : undefined}
                      />
                    ))}
                  </div>
                </div>
                <div
                  className="relative z-[1] shrink-0 border-t-4 border-pink-600"
                  style={{ animation: "no4SlideUpFade 0.75s var(--ease-cinematic) 0.48s both" }}
                >
                  <div className="bg-pink-200 px-3 py-1.5 text-center md:px-5 md:py-2">
                    <p className="text-[clamp(0.95rem,1.85vw,1.45rem)] font-bold tracking-[0.12em] text-black">
                      目指す姿
                    </p>
                    <h3 className="mt-1 whitespace-nowrap text-[clamp(1.2rem,3.2vw,2.65rem)] font-black leading-[1.15] text-black">
                      工程の見える化と運用の標準化
                    </h3>
                  </div>
                  <div className="border-t border-pink-600/50 bg-gray-100 px-3 py-1.5 text-center md:px-6 md:py-2">
                    <p className="whitespace-nowrap text-center text-[clamp(0.95rem,1.25vw,1.45rem)] font-semibold leading-snug tracking-tight text-black">
                      {ACTIVE_PROFILE.note}
                    </p>
                  </div>
                </div>
              </div>
            ) : PROFILE_ID === "no3" ? (
              <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] overflow-hidden rounded-2xl border border-rose-200 bg-slate-100 shadow-[0_24px_60px_rgba(15,23,42,.2)]">
                <div className="grid min-h-0 gap-3 p-4 md:grid-cols-2 md:p-5">
                  <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-300 bg-white">
                    <div className="relative flex items-center justify-between overflow-hidden border-b border-rose-300 bg-gradient-to-r from-rose-700 via-rose-600 to-fuchsia-600 px-4 py-2 text-white">
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,.2)_50%,transparent_80%)] opacity-40" />
                      <p className="text-2xl font-bold md:text-3xl">課題① チラシ運用（外注）</p>
                      <p className="text-2xl font-bold md:text-3xl">販促費・制作費が発生</p>
                    </div>
                    <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] gap-2 p-3">
                      <div className="min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <img src="/no3/flyer-sample.png" alt="チラシ訴求サンプル" className="h-full w-full object-contain object-center" />
                      </div>
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                        <p className="text-2xl font-bold text-rose-700 md:text-3xl">課題: 外注前提でコスト増</p>
                        <p className="mt-1 text-2xl font-bold text-slate-700 md:text-3xl">都度依頼が必要で、販促費・制作費が発生してしまう。</p>
                        <p className="mt-2 inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-base font-bold text-white md:text-lg" style={{ animation: "issuePulse 1.6s ease-in-out infinite" }}>
                          指摘事項: コスト増
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-300 bg-white">
                    <div className="relative flex items-center justify-between overflow-hidden border-b border-rose-300 bg-gradient-to-r from-rose-700 via-rose-600 to-fuchsia-600 px-4 py-2 text-white">
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_20%,rgba(255,255,255,.2)_50%,transparent_80%)] opacity-40" />
                      <p className="text-2xl font-bold md:text-3xl">課題② HPテキスト中心</p>
                      <p className="text-2xl font-bold md:text-3xl">キャンペーン訴求が弱い</p>
                    </div>
                    <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto_auto] gap-2 p-3">
                      <div className="min-h-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4">
                        <div className="space-y-2 text-slate-700">
                          <p className="text-2xl font-bold text-slate-800 md:text-3xl">キャンペーン情報</p>
                          <p className="text-2xl leading-relaxed font-bold md:text-3xl">4月限定キャンペーン実施中!</p>
                          <p className="text-2xl leading-relaxed font-bold md:text-3xl">今なら入会金2200 と 4月会費無料</p>
                          <p className="text-2xl leading-relaxed font-bold md:text-3xl">先着20名様</p>
                          <p className="text-2xl leading-relaxed font-bold md:text-3xl">詳細は下記リンクからチラシをチェック!</p>
                          <p className="break-all text-base leading-relaxed text-slate-500 md:text-lg">
                            https://share.example.jp/campaign/2026-apr/spring-sale/joyfit24-kanagawashinmachi/detail/flyer-download?ref=line&utm_source=group&utm_medium=share&utm_campaign=apr_limited
                          </p>
                          <p className="text-2xl leading-relaxed font-bold md:text-3xl">入会はAPPから!</p>
                          <p className="text-base leading-relaxed text-slate-500 md:text-lg">
                            https://app.joyfit24.jp/entry
                          </p>
                          <div className="mt-2 rounded-lg border border-slate-300 bg-white p-3">
                            <p className="text-xl font-bold text-slate-800 md:text-2xl">オプションは下記でございます。</p>
                            <div className="mt-2 space-y-1 text-base leading-relaxed text-slate-600 md:text-lg">
                              <p>ボディプランナー会員(4月分)(消費税 10%) 0円(税込0円)</p>
                              <p>レンタルタオル(4月分)(消費税 10%) 0円(税込0円)</p>
                              <p>ホットスタジオ(4月分)(消費税 10%) 0円(税込0円)</p>
                              <p>オンラインレッスン(4月分)(消費税 10%) 0円(税込0円)</p>
                              <p>マットレンタル(4月分)(消費税 10%) 0円(税込0円)</p>
                              <p>セルフエステ(4月分)(消費税 10%) 0円(税込0円)</p>
                              <p>VIPあんしんサポート(4月分)(消費税 10%) 0円(税込0円)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                        <p className="text-xl font-bold text-rose-700 md:text-2xl">課題: 視認性が低い</p>
                        <p className="mt-1 text-lg text-slate-700 md:text-xl">テキスト中心では、金額訴求と入会導線が弱い。</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-rose-200 bg-white px-6 py-4 md:px-10 md:py-5">
                  <p className="text-2xl font-bold uppercase tracking-[0.08em] text-rose-700 md:text-3xl">課題</p>
                  <p className="mt-1 text-2xl font-bold leading-snug tracking-[0.01em] text-slate-800 md:text-3xl">
                    アップデート前は、外注チラシとHPテキスト中心で、コスト増と訴求不足が発生。
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid min-h-0 flex-1 grid-rows-[1fr_auto] overflow-hidden rounded-2xl border border-white/15 bg-slate-900/75 shadow-[0_30px_120px_rgba(15,23,42,.82)]">
                <div className="min-h-0 overflow-hidden p-3 md:p-4" style={{ animation: "spreadsheetFlatIn 1s var(--ease-cinematic) both" }}>
                  <div className="mb-2 flex shrink-0 flex-col gap-1.5 px-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                    <div className="flex items-center gap-2 text-base uppercase tracking-[0.14em] text-slate-200/90 md:text-lg">
                      <Database className="h-5 w-5 shrink-0 text-cyan-300/85 md:h-6 md:w-6" />
                      Legacy Tools
                    </div>
                    <p className="text-base font-semibold text-slate-300/95 md:text-lg">必要データ探索に時間がかかる状態</p>
                  </div>
                  <div className="grid h-full min-h-0 gap-3 md:grid-cols-[1.05fr_1.45fr]">
                    <div className="min-h-0 overflow-hidden rounded-xl border border-white/10 bg-slate-950/70 p-1.5">
                      <img
                        src="/no1-before-tools.png"
                        alt="分散しているデータソース一覧"
                        className="h-full w-full rounded-lg object-cover"
                        style={{ animation: "titleReveal 0.8s var(--ease-cinematic) both" }}
                      />
                    </div>
                    <div className="relative min-h-0 overflow-hidden rounded-xl border border-cyan-300/25 bg-slate-950/85 p-2">
                      <div className="pointer-events-none absolute left-0 top-0 h-full w-16 bg-gradient-to-r from-cyan-400/8 to-transparent" />
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div
                          key={`flow-${i}`}
                          className="pointer-events-none absolute left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-400/70 via-cyan-300/50 to-transparent"
                          style={{ top: `${18 + i * 16}%`, animation: `dashShine 2.2s ease-in-out ${i * 0.2}s infinite` }}
                        />
                      ))}
                      <div className="relative h-full overflow-hidden rounded-lg border border-white/10 bg-slate-900/95">
                        <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
                          <p className="text-sm font-black uppercase tracking-[0.08em] text-cyan-200 md:text-base">Integrated Spreadsheet</p>
                          <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-xs font-bold text-cyan-200">一元管理</span>
                        </div>
                        <div className="grid h-[calc(100%-40px)] grid-cols-6 gap-[1px] bg-white/5 p-[1px]">
                          {beforeRows.slice(0, 16).flatMap((row, rowIdx) =>
                            row.slice(0, 6).map((cell, colIdx) => (
                              <div
                                key={`compact-${rowIdx}-${colIdx}`}
                                className={`flex items-center px-2 text-[11px] font-semibold tabular-nums md:text-xs ${
                                  rowIdx % 2 ? "bg-slate-800/80 text-slate-100/95" : "bg-slate-900/90 text-slate-200/90"
                                }`}
                                style={{ color: rowIdx % 3 === 0 && colIdx % 2 === 0 ? "#86efac" : undefined }}
                              >
                                {cell}
                              </div>
                            )),
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-t border-amber-200/25 bg-slate-900/95 px-6 py-5 backdrop-blur-xl md:px-10 md:py-7">
                  <p className="text-2xl font-bold uppercase tracking-[0.12em] text-amber-200 md:text-3xl">課題</p>
                  <p className="mt-3 max-w-none text-[1.65rem] font-bold leading-snug tracking-[0.01em] text-slate-100 md:text-[2.35rem]">
                    {ACTIVE_PROFILE.challenge[0]}
                    <br />
                    {ACTIVE_PROFILE.challenge[1]}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {isTransition && (
          <section className={`${sceneShellClass} relative items-center justify-center px-6 py-6 md:px-12`}>
            <>
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
                  <svg viewBox="0 0 400 240" className="h-64 w-full max-w-3xl md:h-80" fill="none">
                    <rect x="40" y="40" width="320" height="160" rx="20" stroke="url(#rfGrad)" strokeWidth="1" className="opacity-40" />
                    <path
                      d="M60 200 C120 80 280 80 340 200"
                      stroke="#22d3ee"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeDasharray="8 12"
                      style={{ animation: "reframeOrbit 2.4s var(--ease-soft) infinite alternate" }}
                    />
                    <path
                      d="M200 30 L200 210 M80 120 L320 120"
                      stroke="#6366f1"
                      strokeWidth="0.8"
                      opacity="0.35"
                    />
                    <defs>
                      <linearGradient id="rfGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <p className={`relative z-10 text-xs font-medium uppercase tracking-[0.36em] md:text-sm ${PROFILE_ID === "no3" ? "text-rose-300/90" : "text-cyan-300/85"}`}>
                  {PROFILE_ID === "no3" ? "Refresh" : "Reframe"}
                </p>
                <h3
                  className={`relative z-10 mt-3 bg-clip-text text-5xl font-black tracking-tight text-transparent md:text-7xl lg:text-8xl ${
                    PROFILE_ID === "no3" ? "bg-gradient-to-r from-white via-rose-100 to-slate-300" : "bg-gradient-to-r from-white via-cyan-100 to-indigo-200"
                  }`}
                >
                  {PROFILE_ID === "no3" ? "UPDATE" : "INSIGHT"}
            </h3>
                <p className="relative z-10 mt-6 w-full max-w-4xl px-2 text-center text-lg font-normal leading-relaxed text-slate-200/95 md:text-2xl lg:text-3xl">
                  {PROFILE_ID === "no3"
                    ? "より視認性の高いLP作成に成功。金額訴求と入会導線を、更新しやすい構造で内製化。"
                    : ACTIVE_PROFILE.note}
                </p>
                <div className="relative z-10 mt-12 flex w-full max-w-3xl gap-3 px-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-1 flex-1 origin-left overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full rounded-full ${PROFILE_ID === "no3" ? "bg-gradient-to-r from-rose-500 to-slate-300" : "bg-gradient-to-r from-cyan-400 to-indigo-400"}`}
                        style={{
                          transformOrigin: "left",
                          animation: `reframeSweep 1.8s var(--ease-cinematic) ${i * 0.22}s forwards`,
                        }}
                      />
                    </div>
                  ))}
                </div>
                <div
                  className={`pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
                    PROFILE_ID === "no3" ? "bg-rose-500/10" : "bg-cyan-500/10"
                  }`}
                  style={{ animation: "reframePulse 3s ease-in-out infinite" }}
                />
            </>
          </section>
        )}

        {isAfter && (
          <section
            className={`${sceneShellClass} flex-1 items-center justify-center`}
            style={PROFILE_ID === "no5" ? undefined : { animation: "hologramIn 1s var(--ease-cinematic) both" }}
          >
            <div
              className={`relative isolate flex w-full min-h-0 flex-1 flex-col overflow-hidden ${
                PROFILE_ID === "no5"
                  ? "bg-[linear-gradient(165deg,#030712_0%,#0a1628_48%,#101018_100%)]"
                  : "bg-slate-950"
              }`}
            >
              {PROFILE_ID === "no5" && (
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_65%_at_14%_22%,rgba(34,211,238,0.065),transparent_52%),radial-gradient(ellipse_75%_60%_at_86%_76%,rgba(185,28,28,0.09),transparent_50%)]"
                  aria-hidden
                />
              )}
              {PROFILE_ID !== "no5" && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    style={{ animation: "dashShine 5s var(--ease-soft) infinite" }}
                  />
                </div>
              )}
              <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col">
                <DashboardPresentation slideIndex={dashSlideIndex} />
              </div>
            </div>
          </section>
        )}

        {PROFILE_ID === "no1" && isOutro && (
          <section className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-5 py-6">
            <div className="w-full max-w-[min(96vw,1680px)] text-center" style={{ animation: "endingLine 1.1s var(--ease-cinematic) both" }}>
              <h5 className="break-keep bg-gradient-to-r from-slate-100 via-cyan-100 to-blue-200 bg-clip-text text-3xl font-black leading-[1.35] text-transparent drop-shadow-[0_0_24px_rgba(56,189,248,.5)] md:text-5xl lg:text-6xl">
                {ACTIVE_PROFILE.effect[0]}
                <br />
                {ACTIVE_PROFILE.effect[1]}
                <br />
                {ACTIVE_PROFILE.effect[2]}
              </h5>
            </div>
          </section>
        )}

        {PROFILE_ID === "no2" && isOutro && (
          <section className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center px-5 py-6">
            <div className="w-full max-w-[min(96vw,1680px)] text-center" style={{ animation: "endingLine 1.1s var(--ease-cinematic) both" }}>
              <h5 className="break-keep bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 bg-clip-text text-3xl font-black leading-[1.35] text-transparent drop-shadow-[0_0_24px_rgba(16,185,129,.45)] md:text-5xl lg:text-6xl">
                {ACTIVE_PROFILE.effect[0]}
                <br />
                {ACTIVE_PROFILE.effect[1]}
                <br />
                {ACTIVE_PROFILE.effect[2]}
              </h5>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
