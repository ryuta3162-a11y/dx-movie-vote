# 表彰投票WEB（Vercel）セットアップ

## 1) ローカル確認

- 投票LP表示: `http://localhost:5173/?profile=vote`
- 既存NO7表示: `http://localhost:5173/?profile=no7`

## 2) Vercelにデプロイ

- このリポジトリをそのままVercelへ接続
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

## 3) Googleスプレッドシート連携

この投票LPは、`VITE_VOTE_WEBHOOK_URL` に POST します。  
Google Apps Script を Web アプリ公開して URL を設定してください。

### 送信するJSON

```json
{
  "timestamp": "2026-05-08T15:00:00.000Z",
  "voterName": "東日本エリア参加者",
  "dxAwardNo": "NO1",
  "dxAwardName": "NO.1 鈴木 貴秀",
  "ideaAwardNo": "NO4",
  "ideaAwardName": "NO.4 秩父瀧",
  "userAgent": "..."
}
```

### Vercel環境変数

- Key: `VITE_VOTE_WEBHOOK_URL`
- Value: Apps Script のデプロイURL

## 4) 連携先シート

指定URLのスプレッドシート（`gid=2065830956`）を連携先にしてください。

