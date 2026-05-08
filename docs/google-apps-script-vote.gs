/**
 * 表彰投票Webから受信してスプレッドシートに追記するApps Script
 * デプロイ: ウェブアプリ（全員）
 */
const SPREADSHEET_ID = "1mhNVsV1LFkHFRLMi9CfzfuvJaz9kXANAZEjnZ82KtRY";
const SHEET_GID = 2065830956;
const RESULT_SHEET_NAME = "投票結果";
const SUMMARY_SHEET_NAME = "集計結果";
const CANDIDATES = [
  { no: "NO1", name: "NO.1 鈴木 貴秀" },
  { no: "NO2", name: "NO.2 福與 翔大" },
  { no: "NO3", name: "NO.3 小島 紳哉" },
  { no: "NO4", name: "NO.4 秩父瀧" },
  { no: "NO5", name: "NO.5 森保 建吾" },
  { no: "NO6", name: "NO.6 日下 竜太" },
  { no: "NO7", name: "NO.7 渡邊 将樹" },
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const resultSheet = getOrCreateResultSheet_(ss);
    const deviceId = String(body.deviceId || "").trim();

    if (deviceId && existsDeviceVote_(resultSheet, deviceId)) {
      return jsonOutput_({ ok: false, reason: "ALREADY_VOTED" });
    }

    resultSheet.appendRow([
      body.timestamp || new Date().toISOString(),
      body.voterName || "",
      body.dxAwardNo || "",
      body.dxAwardName || "",
      body.innovatorAwardNo || body.ideaAwardNo || "",
      body.innovatorAwardName || body.ideaAwardName || "",
      body.userAgent || "",
      deviceId,
    ]);

    updateSummarySheet_(ss, resultSheet);

    return jsonOutput_({ ok: true });
  } catch (error) {
    return jsonOutput_({ ok: false, error: String(error) });
  }
}

function doGet() {
  return jsonOutput_({ ok: true, message: "vote webhook ready" });
}

function getOrCreateResultSheet_(ss) {
  let sheet = ss.getSheetByName(RESULT_SHEET_NAME);
  if (!sheet) {
    sheet = getSheetByGid_(ss, SHEET_GID) || ss.insertSheet(RESULT_SHEET_NAME);
    sheet.setName(RESULT_SHEET_NAME);
  }
  ensureResultHeader_(sheet);
  return sheet;
}

function ensureResultHeader_(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "timestamp",
      "voterName",
      "dxAwardNo",
      "dxAwardName",
      "innovatorAwardNo",
      "innovatorAwardName",
      "userAgent",
      "deviceId",
    ]);
    return;
  }
  const header = sheet.getRange(1, 1, 1, 8).getValues()[0];
  const needsHeader =
    header[0] !== "timestamp" ||
    header[2] !== "dxAwardNo" ||
    (header[4] !== "innovatorAwardNo" && header[4] !== "ideaAwardNo") ||
    header[7] !== "deviceId";
  if (needsHeader) {
    sheet.insertRowBefore(1);
    sheet.getRange(1, 1, 1, 8).setValues([
      [
        "timestamp",
        "voterName",
        "dxAwardNo",
        "dxAwardName",
        "innovatorAwardNo",
        "innovatorAwardName",
        "userAgent",
        "deviceId",
      ],
    ]);
  }
}

function existsDeviceVote_(sheet, deviceId) {
  const rows = sheet.getLastRow();
  if (rows <= 1) return false;
  const values = sheet.getRange(2, 8, rows - 1, 1).getValues();
  for (let i = 0; i < values.length; i += 1) {
    if (String(values[i][0] || "").trim() === deviceId) return true;
  }
  return false;
}

function updateSummarySheet_(ss, resultSheet) {
  const rows = resultSheet.getLastRow();
  const summary = ss.getSheetByName(SUMMARY_SHEET_NAME) || ss.insertSheet(SUMMARY_SHEET_NAME);

  summary.clearContents();
  summary.getRange(1, 1, 1, 6).setValues([["更新日時", new Date(), "", "", "", ""]]);

  const dxCounts = {};
  const innovatorCounts = {};
  for (let i = 0; i < CANDIDATES.length; i += 1) {
    dxCounts[CANDIDATES[i].no] = 0;
    innovatorCounts[CANDIDATES[i].no] = 0;
  }

  if (rows > 1) {
    const values = resultSheet.getRange(2, 1, rows - 1, 8).getValues();
    for (let i = 0; i < values.length; i += 1) {
      const dxNo = normalizeNo_(values[i][2]);
      const innovatorNo = normalizeNo_(values[i][4]);
      if (dxNo && Object.prototype.hasOwnProperty.call(dxCounts, dxNo)) {
        dxCounts[dxNo] += 1;
      }
      if (innovatorNo && Object.prototype.hasOwnProperty.call(innovatorCounts, innovatorNo)) {
        innovatorCounts[innovatorNo] += 1;
      }
    }
  }

  const out = [];
  out.push(["賞", "順位", "候補者No", "候補者名", "票数", "全体に占める割合"]);
  pushRankingRows_(out, "DX大賞", dxCounts);
  out.push(["", "", "", "", "", ""]);
  pushRankingRows_(out, "イノベーター賞", innovatorCounts);

  summary.getRange(3, 1, out.length, 6).setValues(out);
  summary.getRange(3, 1, 1, 6).setFontWeight("bold");
  summary.autoResizeColumns(1, 6);
}

function pushRankingRows_(out, awardName, countsMap) {
  const totalVotes = Object.values(countsMap).reduce((sum, n) => sum + n, 0);
  const ranking = CANDIDATES.map((c) => ({
    no: c.no,
    name: c.name,
    count: countsMap[c.no] || 0,
  })).sort((a, b) => (b.count - a.count) || a.no.localeCompare(b.no));

  for (let i = 0; i < ranking.length; i += 1) {
    const ratio = totalVotes > 0 ? `${Math.round((ranking[i].count / totalVotes) * 1000) / 10}%` : "0%";
    out.push([awardName, i + 1, ranking[i].no, ranking[i].name, ranking[i].count, ratio]);
  }
}

function normalizeNo_(value) {
  const raw = String(value || "").trim().toUpperCase();
  if (!raw) return "";
  if (/^NO[1-7]$/.test(raw)) return raw;
  if (/^NO\.[1-7]$/.test(raw)) return raw.replace("NO.", "NO");
  if (/^[1-7]$/.test(raw)) return `NO${raw}`;
  return "";
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

