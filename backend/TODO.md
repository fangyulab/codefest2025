## TODO (for 後端 only)

- [ ] txt db 改為 real db 方案
    - Cloud Firestore（最簡單，JSON 結構化，適合你這種資料）
    - Google Cloud SQL (MySQL / PostgreSQL)（若將來有複雜查詢）
    - SQLite + Cloud Storage（過渡方案，用 GCS 當儲存層）
- [ ] calculate_distance() 改為更精準的計算方式
- [ ] /api/login 串到正確的 townpass flutter 方案 (前後端協作)
- [ ] 用戶訂閱通知與否，跟後端溝通 (Optional; 前端可以直接寫死 "所有用戶都預設開通知")
- [ ] 發想 "創意" 新功能 (便條紙) + 前後端開發
