# 汽車交易平台（React 前端 + 簡易後端）

本專案為一個用於展示與管理車輛刊登的前端 MVP，另附簡易 Express 後端（`server.js`）與 SQLite 資料庫供本地開發使用。

主要功能

- 搜尋與篩選：關鍵字、城市、品牌、價格、年份
- 排序：價格、年份、里程等
- 列表卡片顯示車輛重點資訊與賣家聯絡切換
- 發佈車輛表單（Post Your Car）可立即在頁面新增刊登
- 用戶功能：登入、受保護路由、我的車源、編輯與刪除車源
- 收藏功能：我的最愛列表（Favorites）
- 訊息系統：留言/私訊頁面
- 新/中古車分頁展示（NewCarsPage / UsedCarsPage）
- 多語系支援（i18n）與語言切換
- 全域通知（Toast）與簡易日誌（`utils/logger.js`）
- 響應式設計，支援桌面與行動裝置
- 本地後端：Express + SQLite（`server.js`），啟動時會與前端一併執行

快速上手

1. 安裝相依套件

```bash
npm install
```

2. 啟動開發環境（同時啟動前後端）

```bash
npm start
```

3. 開啟瀏覽器

```
http://localhost:3000
```

註：`npm start` 會使用 `concurrently` 同時啟動 `react-scripts start` 與 `node server.js`。

Scripts（取自 package.json）

- `start`：前端開發伺服器 + 本地後端（concurrently）
- `build`：建立生產版本（react-scripts build）
- `test`：執行測試（react-scripts test）

技術棧

- 前端：React, react-router-dom, antd, react-i18next
- 後端：Express, sqlite3

專案結構（重點）

- `src/components/`：React 組件（例如 `HomePage`, `LoginPage`, `MyListingsPage`, `PostPage` 等）
- `src/contexts/`：全域狀態（`CarContext`, `ToastContext`）
- `src/styles/`：各頁面樣式
- `server.js`：本地 Express 後端入口
- `data/`：預設資料或範例資料

開發與佈署建議

- 若要轉為可供多人使用的產品，請整合真正的後端 API 與資料庫、加入使用者認證、圖片上傳與存放機制，以及受控的部署流程。


