/**
 * プロフィール ID（no1〜no7 / vote / vote-poster）。
 * 開発時に環境変数を付け忘れても、URL `?profile=no7` や `?profile=vote` で表示を切り替えできる。
 * 本番ビルドでは import.meta.env が優先（収録スクリプトは従来どおり VITE_PROFILE_ID を設定）。
 */
export function getProfileId() {
  if (typeof window !== "undefined") {
    try {
      const raw = new URLSearchParams(window.location.search).get("profile");
      if (raw) {
        const id = String(raw).trim().toLowerCase();
        if (/^no[1-7]$/.test(id) || id === "vote" || id === "vote-poster") return id;
      }
    } catch {
      // ignore
    }
  }
  return (import.meta.env.VITE_PROFILE_ID ?? "no1").toLowerCase();
}

export const PROFILE_ID = getProfileId();
