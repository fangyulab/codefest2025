# 安全求助平台 - 專案結構

## 📁 檔案結構

```
安全求助平台/
│
├── app.py                  # Flask 後端主程式
├── frontend.html           # 前端 HTML (包含完整 React 應用)
├── frontend.jsx            # React 原始碼 (供參考)
│
├── requirements.txt        # Python 套件依賴
├── start.sh               # 啟動腳本
├── test_api.py            # API 測試腳本
│
├── README.md              # 完整文件
├── QUICKSTART.md          # 快速開始指南
│
└── [自動生成的資料檔案]
    ├── users.txt          # 使用者資料
    ├── posts.txt          # 求助貼文資料
    └── responses.txt      # 回應記錄
```

## 🎯 主要檔案說明

### app.py (後端)
Flask REST API 伺服器，提供以下功能：
- 使用者登入
- 求助貼文 CRUD
- 距離計算
- 標籤管理
- 回應記錄
- 地圖資料

**啟動方式:**
```bash
python app.py
```

### frontend.html (前端)
完整的 React 單頁應用，包含：
- 登入介面
- 三個主要 Tab (發布/列表/地圖)
- 即時互動功能
- 響應式設計

**使用方式:**
直接用瀏覽器開啟此檔案即可

### 資料檔案 (.txt)
使用 JSON 格式儲存資料，易於查看和除錯。
正式環境建議改用資料庫 (PostgreSQL/MongoDB)。

## 🔌 API 端點總覽

| 方法 | 端點 | 功能 |
|------|------|------|
| POST | /api/login | 使用者登入 |
| POST | /api/posts | 建立求助貼文 |
| GET | /api/posts | 取得貼文列表 (支援篩選) |
| GET | /api/posts/{id} | 取得單一貼文詳情 |
| POST | /api/posts/{id}/resolve | 標記貼文為已解決 |
| POST | /api/posts/{id}/respond | 回應求助 (正在前往) |
| GET | /api/labels | 取得所有標籤選項 |
| GET | /api/map | 取得地圖資料 |

## 🎨 UI 設計

### 配色方案
- 主色調: 紫色 (#8B5CF6)
- 緊急: 紅色
- 重要: 橘色
- 一般: 黃色
- 成功: 綠色

### Tab 功能
1. **發布 Tab**: 填寫求助表單
2. **列表 Tab**: 查看和篩選求助資訊
3. **地圖 Tab**: 地圖視覺化 (預留)

## 🔄 資料流程

```
使用者操作
    ↓
前端 (React)
    ↓
HTTP Request
    ↓
Flask API
    ↓
資料處理 + 計算距離
    ↓
JSON 檔案 (users.txt, posts.txt, responses.txt)
    ↓
HTTP Response
    ↓
前端更新 UI
```

## 🧩 核心邏輯

### 距離計算
使用 Haversine 公式計算兩點間的球面距離：
- 輸入：兩個座標 (緯度, 經度)
- 輸出：公里數
- 顯示：< 1km 顯示公尺，>= 1km 顯示公里

### 貼文排序
1. 使用者自己的貼文置頂
2. 按緊急程度排序 (1 > 2 > 3)
3. 按發布時間排序 (最新優先)

### 篩選邏輯
- **距離篩選**: 五公里內 / 全部
- **標籤篩選**: 可選擇行政區、地點類型、事發類型
- **狀態篩選**: 只顯示未解決的貼文

## 🚀 部署建議

### 開發環境 (當前)
- 後端: Flask Development Server
- 前端: 靜態 HTML 檔案
- 資料: JSON 文字檔

### 正式環境 (建議)
- 後端: Gunicorn + Nginx
- 前端: 編譯後的 React (build)
- 資料: PostgreSQL / MongoDB
- 部署: Docker + Cloud (AWS/GCP/Azure)
- HTTPS: Let's Encrypt SSL
- 監控: Sentry / DataDog

## 📈 擴展功能建議

### 短期 (1-2 週)
- [ ] 整合 Google Maps API
- [ ] 瀏覽器自動定位
- [ ] 推播通知
- [ ] 圖片上傳功能

### 中期 (1-2 月)
- [ ] 台北通帳號整合
- [ ] 即時聊天功能
- [ ] 回報機制 (防止濫用)
- [ ] 統計儀表板

### 長期 (3+ 月)
- [ ] 行動 APP (React Native)
- [ ] AI 風險評估
- [ ] 社群功能
- [ ] 多語言支援

## 🔐 安全性考量

目前為原型版本，正式環境需要加強：
- ✅ CORS 設定
- ⚠️ 身份驗證 (需加強)
- ⚠️ 資料加密
- ⚠️ 防 SQL 注入 (改用 ORM)
- ⚠️ Rate Limiting
- ⚠️ Input Validation (需加強)

## 📝 授權
此專案為原型測試版本，供學習和開發使用。
