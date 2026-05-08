import React, { useEffect, useRef, useState } from "react";

const DEFAULT_VOTE_URL = "https://dx-movie-vote.vercel.app/?profile=vote";
const WIDTH = 1920;
const HEIGHT = 1080;

function roundedRectPath(x, y, w, h, r) {
  return `M${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} H${x + r} Q${x},${y + h} ${x},${y + h - r} V${y + r} Q${x},${y} ${x + r},${y} Z`;
}

export function VotePosterPage() {
  const canvasRef = useRef(null);
  const [voteUrl, setVoteUrl] = useState(DEFAULT_VOTE_URL);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const drawPoster = async (forDownload = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setBusy(true);
    setError("");

    try {
      canvas.width = WIDTH;
      canvas.height = HEIGHT;

      const bgGrad = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
      bgGrad.addColorStop(0, "#e8fff5");
      bgGrad.addColorStop(0.45, "#f8fffc");
      bgGrad.addColorStop(1, "#e7f5ef");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const glow1 = ctx.createRadialGradient(340, 100, 30, 340, 100, 430);
      glow1.addColorStop(0, "rgba(16,185,129,0.26)");
      glow1.addColorStop(1, "rgba(16,185,129,0)");
      ctx.fillStyle = glow1;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const glow2 = ctx.createRadialGradient(1600, 900, 50, 1600, 900, 450);
      glow2.addColorStop(0, "rgba(5,150,105,0.22)");
      glow2.addColorStop(1, "rgba(5,150,105,0)");
      ctx.fillStyle = glow2;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Main glass card
      const cardX = 150;
      const cardY = 70;
      const cardW = WIDTH - 300;
      const cardH = HEIGHT - 140;
      const cardPath = new Path2D(roundedRectPath(cardX, cardY, cardW, cardH, 36));
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.fill(cardPath);
      ctx.strokeStyle = "rgba(16,185,129,0.42)";
      ctx.lineWidth = 3;
      ctx.stroke(cardPath);

      // Header
      ctx.fillStyle = "#047857";
      ctx.font = "700 44px 'Segoe UI', 'Yu Gothic UI', sans-serif";
      ctx.fillText("第1回 EAST DX Excellence Award", 235, 190);

      ctx.fillStyle = "#064e3b";
      ctx.font = "900 88px 'Segoe UI', 'Yu Gothic UI', sans-serif";
      ctx.fillText("表彰投票はこちら", 235, 300);

      ctx.fillStyle = "#065f46";
      ctx.font = "700 40px 'Segoe UI', 'Yu Gothic UI', sans-serif";
      ctx.fillText("スマホでQRを読み取り、DX大賞・イノベーター賞に投票してください", 235, 375);

      // QR frame
      const qrSize = 470;
      const qrX = (WIDTH - qrSize) / 2;
      const qrY = 440;
      const qrCardPath = new Path2D(roundedRectPath(qrX - 34, qrY - 34, qrSize + 68, qrSize + 68, 28));
      const qrGrad = ctx.createLinearGradient(qrX, qrY, qrX + qrSize, qrY + qrSize);
      qrGrad.addColorStop(0, "#059669");
      qrGrad.addColorStop(1, "#0f766e");
      ctx.fillStyle = qrGrad;
      ctx.fill(qrCardPath);

      const whitePath = new Path2D(roundedRectPath(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 22));
      ctx.fillStyle = "#ffffff";
      ctx.fill(whitePath);

      // QR image from URL
      const qrApi = `https://quickchart.io/qr?size=900&margin=1&text=${encodeURIComponent(voteUrl)}`;
      const qrImg = new Image();
      qrImg.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        qrImg.onload = resolve;
        qrImg.onerror = reject;
        qrImg.src = qrApi;
      });
      ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

      ctx.fillStyle = "#065f46";
      ctx.font = "700 34px 'Segoe UI', 'Yu Gothic UI', sans-serif";
      ctx.fillText("※ お一人1回の投票にご協力ください", 565, 990);

      if (forDownload) {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = "dx-award-vote-qr-screen.png";
        a.click();
      }
    } catch (e) {
      console.error(e);
      setError("画像生成に失敗しました。URLを確認して再実行してください。");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    drawPoster(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-5 text-white md:px-8 md:py-8">
      <div className="mx-auto w-full max-w-[1200px]">
        <h1 className="text-2xl font-black md:text-3xl">投票QRポスター生成</h1>
        <p className="mt-2 text-sm text-slate-300 md:text-base">スクリーン掲示向け（1920x1080）PNGをワンクリックでダウンロードできます。</p>

        <div className="mt-4 rounded-xl border border-slate-700 bg-slate-800 p-4">
          <label className="mb-2 block text-sm font-semibold text-slate-200">投票ページURL</label>
          <input
            value={voteUrl}
            onChange={(e) => setVoteUrl(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none ring-emerald-400 focus:ring md:text-base"
          />
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => drawPoster(false)}
              disabled={busy}
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              プレビュー更新
            </button>
            <button
              onClick={() => drawPoster(true)}
              disabled={busy}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-black text-white disabled:opacity-60"
            >
              {busy ? "生成中..." : "PNGをダウンロード"}
            </button>
          </div>
          {error ? <p className="mt-2 text-sm font-semibold text-rose-300">{error}</p> : null}
        </div>

        <div className="mt-4 overflow-auto rounded-xl border border-slate-700 bg-slate-950 p-3">
          <canvas ref={canvasRef} className="h-auto w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

