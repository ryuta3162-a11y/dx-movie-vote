import React, { useEffect, useMemo, useState } from "react";
import fukuyoFace from "./福與.png";
import kojimaFace from "./小島.png";
import chichibuFace from "./秩父.png";
import moriyasuFace from "./moriyasu-kengo.png";

const VOTE_ENDPOINT = (import.meta.env.VITE_VOTE_WEBHOOK_URL ?? "").trim();
const VOTED_FLAG_KEY = "dx_award_voted_2026";
const DEVICE_ID_KEY = "dx_award_device_id_2026";

const CANDIDATES = [
  { id: "no1", no: "NO.1", name: "鈴木 貴秀", work: "テリトリー数値ダッシュボード化", image: "/suzuki-face.png" },
  { id: "no2", no: "NO.2", name: "福與 翔大", work: "ベンチマークアプリ作成", image: fukuyoFace },
  { id: "no3", no: "NO.3", name: "小島 紳哉", work: "自作LP作成", image: kojimaFace },
  { id: "no4", no: "NO.4", name: "秩父瀧", work: "新店ガントチャート生成ツール", image: chichibuFace },
  { id: "no5", no: "NO.5", name: "森保 建吾", work: "パーソナル訴求力UP", image: moriyasuFace },
  { id: "no6", no: "NO.6", name: "日下 竜太", work: "HP・外部販促強化", image: "/no6/kusaka-face.png" },
  { id: "no7", no: "NO.7", name: "渡邊 将樹", work: "ToDoリスト作成", image: "/no7/no7-face.png" },
];

function CandidateRadioGrid({ title, selectedId, onChange }) {
  return (
    <section className="rounded-2xl border border-emerald-300 bg-white p-4 shadow-[0_10px_28px_rgba(0,0,0,0.08)] md:p-6">
      <h2 className="text-[1.35rem] font-black tracking-[0.02em] text-emerald-900 md:text-[1.6rem]">{title}</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CANDIDATES.map((candidate) => (
          <label
            key={`${title}-${candidate.id}`}
            className={`group cursor-pointer rounded-xl border p-3 transition-all ${
              selectedId === candidate.id
                ? "border-emerald-700 bg-emerald-50 shadow-[0_8px_20px_rgba(5,150,105,0.18)]"
                : "border-slate-300 bg-white hover:border-emerald-400"
            }`}
          >
            <input
              type="radio"
              name={title}
              value={candidate.id}
              checked={selectedId === candidate.id}
              onChange={() => onChange(candidate.id)}
              className="sr-only"
            />
            <div className="flex items-center gap-3">
              <img
                src={candidate.image}
                alt={`${candidate.no} ${candidate.name}`}
                className="h-16 w-16 rounded-full border border-slate-200 object-cover"
                loading="lazy"
              />
              <span className="leading-snug">
                <span className="block text-[1rem] font-bold text-slate-800 md:text-[1.08rem]">{`${candidate.no} ${candidate.name}`}</span>
                <span className="mt-0.5 block text-[0.86rem] font-semibold text-emerald-800 md:text-[0.94rem]">{candidate.work}</span>
              </span>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}

export function VoteWebPage() {
  const [dxWinner, setDxWinner] = useState("");
  const [innovatorWinner, setInnovatorWinner] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [deviceId, setDeviceId] = useState("");

  const candidatesById = useMemo(() => Object.fromEntries(CANDIDATES.map((c) => [c.id, c])), []);

  useEffect(() => {
    try {
      const voted = localStorage.getItem(VOTED_FLAG_KEY) === "1";
      setHasVoted(voted);
      let id = localStorage.getItem(DEVICE_ID_KEY) || "";
      if (!id) {
        id = `dv-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(DEVICE_ID_KEY, id);
      }
      setDeviceId(id);
    } catch {
      // ignore storage errors
    }
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (hasVoted) {
      setMessage("この端末からの投票は完了しています。ありがとうございました。");
      return;
    }
    if (!dxWinner || !innovatorWinner) {
      setMessage("2つの賞を選んでから送信してください。");
      return;
    }
    if (!VOTE_ENDPOINT) {
      setMessage("投票先の連携URLが未設定です（VITE_VOTE_WEBHOOK_URL）。");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const payload = {
        timestamp: new Date().toISOString(),
        dxAwardNo: dxWinner.toUpperCase(),
        dxAwardName: candidatesById[dxWinner]?.name ?? dxWinner,
        innovatorAwardNo: innovatorWinner.toUpperCase(),
        innovatorAwardName: candidatesById[innovatorWinner]?.name ?? innovatorWinner,
        // GAS側が旧キー（ideaAwardNo/ideaAwardName）でも受けられるよう互換を残す
        ideaAwardNo: innovatorWinner.toUpperCase(),
        ideaAwardName: candidatesById[innovatorWinner]?.name ?? innovatorWinner,
        deviceId,
        userAgent: navigator.userAgent,
      };
      const res = await fetch(VOTE_ENDPOINT, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const json = await res.json().catch(() => ({}));
      if (json && json.ok === false && json.reason === "ALREADY_VOTED") {
        setHasVoted(true);
        setMessage("この端末はすでに投票済みです。ありがとうございました。");
        try {
          localStorage.setItem(VOTED_FLAG_KEY, "1");
        } catch {
          // ignore
        }
        return;
      }
      setMessage("投票を受け付けました。ありがとうございます。");
      setDxWinner("");
      setInnovatorWinner("");
      setHasVoted(true);
      try {
        localStorage.setItem(VOTED_FLAG_KEY, "1");
      } catch {
        // ignore
      }
    } catch (err) {
      console.error(err);
      setMessage("送信に失敗しました。通信状況を確認してもう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_0%,rgba(16,185,129,0.25),transparent_35%),radial-gradient(circle_at_80%_100%,rgba(6,95,70,0.22),transparent_42%),linear-gradient(180deg,#ecfdf5_0%,#f8fafc_100%)] px-4 py-6 text-slate-900 md:px-8 md:py-10">
      <main className="mx-auto w-full max-w-6xl">
        <header className="rounded-3xl border border-emerald-300/80 bg-white/85 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.12)] backdrop-blur md:p-7">
          <p className="text-[0.95rem] font-semibold tracking-[0.14em] text-emerald-700 md:text-[1rem]">第1回 EAST DX Excellence Award</p>
          <h1 className="mt-2 text-[1.9rem] font-black leading-tight text-emerald-900 md:text-[2.35rem]">表彰投票ページ</h1>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <article className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
              <p className="text-[1.02rem] font-black text-emerald-800 md:text-[1.1rem]">DX大賞とは</p>
              <p className="mt-1 text-[0.98rem] font-semibold leading-snug text-emerald-900 md:text-[1.05rem]">
                全体を通して、最も社内DXに貢献した人に贈る賞
              </p>
            </article>
            <article className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
              <p className="text-[1.02rem] font-black text-emerald-800 md:text-[1.1rem]">イノベーター賞とは</p>
              <p className="mt-1 text-[0.98rem] font-semibold leading-snug text-emerald-900 md:text-[1.05rem]">
                業務改善の種を見つけ、これまでにない発想で挑戦した人に贈る賞
              </p>
            </article>
          </div>
        </header>

        {hasVoted ? (
          <section className="mt-5 rounded-3xl border border-emerald-300 bg-white p-6 text-center shadow-[0_14px_34px_rgba(15,23,42,0.12)] md:p-8">
            <p className="text-[1.35rem] font-black text-emerald-800 md:text-[1.7rem]">投票ありがとうございました</p>
            <p className="mt-2 text-[1rem] font-semibold text-emerald-900 md:text-[1.1rem]">
              ご協力ありがとうございます。投票は完了しています。
            </p>
          </section>
        ) : (
          <form className="mt-5 space-y-4" onSubmit={onSubmit}>
            <CandidateRadioGrid title="DX大賞" selectedId={dxWinner} onChange={setDxWinner} />
            <CandidateRadioGrid title="イノベーター賞" selectedId={innovatorWinner} onChange={setInnovatorWinner} />

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 px-4 py-3 text-[1.08rem] font-black tracking-[0.04em] text-white shadow-[0_14px_30px_rgba(5,150,105,0.32)] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 md:text-[1.18rem]"
            >
              {submitting ? "送信中..." : "この内容で投票する"}
            </button>

            {message ? (
              <p className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-[0.98rem] font-semibold text-emerald-900 md:text-[1.05rem]">
                {message}
              </p>
            ) : null}
          </form>
        )}
      </main>
    </div>
  );
}

