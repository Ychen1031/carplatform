# Google Apps Script 與 Google 試算表整合說明

目標：當使用者在平台上送出「聯絡經銷商 / 預約試駕」表單時，將資料寫入指定的 Google 試算表（ID: `1nNyEMaCaf3QqiyU5fVFmZg5cDJsihqt-hPZq-_Q1lgg`）。

此專案已在 `server.js` 中實作將表單送到一個 Apps Script Web App 的邏輯：
- `POST /api/messages` 會把資料以 JSON 形式轉發到 `GOOGLE_SHEETS_APPS_SCRIPT_URL`。
- 你可以把部署後的 Apps Script Web App URL 放到環境變數 `GOOGLE_SHEETS_APPS_SCRIPT_URL`，或直接修改 `server.js` 的預設值（較不建議）。

---

## Apps Script 範例程式碼（貼到 Google Apps Script 編輯器）

```javascript
// 將以下程式碼貼到新的 Apps Script 專案的 Code.gs
function doPost(e) {
  try {
    var spreadsheetId = '1nNyEMaCaf3QqiyU5fVFmZg5cDJsihqt-hPZq-_Q1lgg'; // 目標試算表 ID
    var sheetName = 'Sheet1'; // 目標工作表名稱，請確認存在

    var data = {};
    if (e.postData && e.postData.type === 'application/json') {
      data = JSON.parse(e.postData.contents || '{}');
    } else if (e.parameter) {
      // fallback for form-encoded
      data = e.parameter;
    }

    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sheet = ss.getSheetByName(sheetName) || ss.getSheets()[0];

    // 欄位順序：可依需求調整
    var headers = ['received_at','name','email','phone','subject','message','userId'];

    // 如果第一列不是標頭，寫入標頭
    var firstRow = sheet.getRange(1,1,1,headers.length).getValues()[0];
    var isHeaderPresent = headers.every(function(h, idx){
      return firstRow[idx] && String(firstRow[idx]).toLowerCase() === h.toLowerCase();
    });
    if (!isHeaderPresent) {
      sheet.getRange(1,1,1,headers.length).setValues([headers]);
    }

    var row = [];
    var now = new Date();
    row.push(now.toISOString());
    row.push(data.name || '');
    row.push(data.email || '');
    row.push(data.phone || '');
    row.push(data.subject || '');
    row.push(data.message || '');
    row.push(data.userId || '');

    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: '已寫入試算表' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## 部署步驟（快速）
1. 開啟 https://script.google.com 並新增一個專案。
2. 將上面的程式碼貼到 `Code.gs`，修改 `spreadsheetId`（預設已為你提供的試算表 ID）與 `sheetName`（若需要）。
3. 儲存專案名稱，例如 `CarPlatform-SheetWriter`。
4. 點選右上角 `Deploy` → `New deployment`。
   - 選擇 `Web app`。
   - `Description` 隨意填。
   - `Execute as`：選 `Me`（代表以你的帳號權限寫入試算表）。
   - `Who has access`：選 `Anyone` 或 `Anyone with link`（如果你想讓 server 或前端直接呼叫，不想做 OAuth 授權流程）。
5. 儲存並部署後，會取得 Web App 的 URL（以 `https://script.google.com/macros/s/.../exec` 開頭）。
6. 把該 URL 設到你的伺服器環境變數 `GOOGLE_SHEETS_APPS_SCRIPT_URL`，或直接替換 `server.js` 裡的預設值。

## 注意事項與建議
- 權限：若選擇 `Anyone`，任何人都能呼叫該 Web App（但只有你有寫入試算表的權限，Apps Script 會以你的帳號寫入）。若擔心濫用，可選擇限制呼叫來源或在 Apps Script 中加上簡單的秘密金鑰檢查（例如要求 header 或 request body 含特定 token）。
- 欄位一致性：如果你未來要新增欄位，記得同步更新 Apps Script 的 `headers` 與後端送出的 payload。
- CORS：若前端直接呼叫 Apps Script，可能會遇到 CORS 限制。建議維持目前架構：前端提交給本機 `server.js`，再由後端轉發到 Apps Script，可避免瀏覽器 CORS 問題。
- 除錯：部署後可在 Apps Script 的 `Executions` 頁面查看日誌與錯誤。如果寫入失敗，伺服器會回傳 502 並包含 Apps Script 回應內容。

## 範例：如何在前端測試（使用目前專案架構）
目前 `src/components/ContactPage.js` 已經把表單 POST 到 `http://localhost:3001/api/messages`，因此完成 Apps Script 部署並把 URL 設定到伺服器後，提交表單即會同步寫入試算表。

如果想在本地直接測試 Apps Script（不經 server）：

```bash
curl -X POST '<YOUR_APPS_SCRIPT_URL>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"測試","email":"test@example.com","phone":"0912345678","subject":"purchase","message":"我要試駕","userId":123}'
```

替換 `<YOUR_APPS_SCRIPT_URL>` 為你部署後的 Web App URL。

---

需要我直接替你建立 Apps Script 專案嗎？如果要，我可以產生完整的程式碼與步驟，並示範如何在 `server.js` 設定環境變數與重啟伺服器。