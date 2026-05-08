/**
 * 表彰投票Webから受信してスプレッドシートに追記するApps Script
 * デプロイ: ウェブアプリ（全員）
 */
const SPREADSHEET_ID = "1mhNVsV1LFkHFRLMi9CfzfuvJaz9kXANAZEjnZ82KtRY";
const SHEET_GID = 2065830956;

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = getSheetByGid_(ss, SHEET_GID);

    if (!sheet) throw new Error("対象シートが見つかりません。");

    // ヘッダーが空なら作成
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "timestamp",
        "voterName",
        "dxAwardNo",
        "dxAwardName",
        "ideaAwardNo",
        "ideaAwardName",
        "userAgent",
      ]);
    }

    sheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.voterName || "",
      body.dxAwardNo || "",
      body.dxAwardName || "",
      body.ideaAwardNo || "",
      body.ideaAwardName || "",
      body.userAgent || "",
    ]);

    return jsonOutput_({ ok: true });
  } catch (error) {
    return jsonOutput_({ ok: false, error: String(error) });
  }
}

function doGet() {
  return jsonOutput_({ ok: true, message: "vote webhook ready" });
}

function getSheetByGid_(ss, gid) {
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i += 1) {
    if (sheets[i].getSheetId() === gid) return sheets[i];
  }
  return null;
}

function jsonOutput_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

