# Flask 專案部署與更新教學（Cloud Run + Artifact Registry）

本指南說明如何在修改程式碼後，快速重新部署更新版本到 Google Cloud Run。

---

## 🧩 環境需求

* 已安裝 **gcloud CLI**
* 已設定專案：

  ```bash
  gcloud config set project cred-id
  gcloud config set run/region asia-east1
  ```
* 已存在：

  * Artifact Registry 倉庫：`my-repo`
  * Cloud Run 服務：`flask-demo`

---

## 🪜 更新部署步驟

### **1️⃣ 修改程式碼**

在本機修改 Flask 專案，例如：

```bash
vim app.py
```

完成後可先本地測試：

```bash
python app.py
```

確認正常後繼續。

---

### **2️⃣ 提交新的映像到 Artifact Registry**

執行以下指令（會自動打包最新程式）：

```bash
gcloud builds submit \
  --tag asia-east1-docker.pkg.dev/cred-id/my-repo/flask-demo
```

> 💡 這會：
>
> * 用 `Dockerfile` 打包最新的 Flask 程式
> * 推送到你的 Artifact Registry
> * Cloud Build 全自動完成

---

### **3️⃣ 部署到 Cloud Run**

將新映像套用到 Cloud Run 服務：

```bash
gcloud run deploy flask-demo \
  --image asia-east1-docker.pkg.dev/cred-id/my-repo/flask-demo \
  --platform managed \
  --region asia-east1 \
  --allow-unauthenticated
```

> 🟢 Cloud Run 會：
>
> * 自動更新版本（Revision）
> * 保留舊版回滾備份
> * 自動開 HTTPS 網址（同一個 URL 不變）

---

### **4️⃣ 驗證部署結果**

查看服務網址（執行完上一步會顯示）：

```
Service URL: https://flask-demo-xxxx-uc.a.run.app
```

測試：

```bash
curl https://flask-demo-xxxx-uc.a.run.app/api/labels
```

或直接在瀏覽器開啟。

---

## 🧹 可選：查看部署狀態與日誌

### 查看目前部署版本

```bash
gcloud run revisions list --service flask-demo --region asia-east1
```

### 查看服務狀態

```bash
gcloud run services describe flask-demo --region asia-east1
```

### 查看執行日誌

```bash
gcloud logs read --project=cred-id --limit=50
```

---

## ⚡ 一鍵更新腳本（可放在根目錄 `deploy.ps1`）

```powershell
Write-Host "🚀 Building Docker image..."
gcloud builds submit --tag asia-east1-docker.pkg.dev/cred-id/my-repo/flask-demo

Write-Host "🚀 Deploying to Cloud Run..."
gcloud run deploy flask-demo `
  --image asia-east1-docker.pkg.dev/cred-id/my-repo/flask-demo `
  --platform managed `
  --region asia-east1 `
  --allow-unauthenticated

Write-Host "✅ Done! Check your service at:"
gcloud run services describe flask-demo --region asia-east1 --format="value(status.url)"
```

---

## 🧭 小抄總覽

| 動作               | 指令                                                                                                                                                         |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 🔧 初次設定          | `gcloud config set project cred-id`                                                                                                                        |
| 🏗️ 打包新版本        | `gcloud builds submit --tag asia-east1-docker.pkg.dev/cred-id/my-repo/flask-demo`                                                                          |
| 🚀 部署到 Cloud Run | `gcloud run deploy flask-demo --image asia-east1-docker.pkg.dev/cred-id/my-repo/flask-demo --platform managed --region asia-east1 --allow-unauthenticated` |
| 🔍 檢查網址          | `gcloud run services describe flask-demo --region asia-east1 --format="value(status.url)"`                                                                 |
| 🧾 看日誌           | `gcloud logs read --project=cred-id --limit=50`                                                                                                            |
