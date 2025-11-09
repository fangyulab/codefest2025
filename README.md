<p align="center">
  <img src="https://github.com/user-attachments/assets/19c53e38-9b93-4d6e-9272-834e486160fb" width="60" height="72" alt="撿（減）紅點">
</p>

<h1 align="center">
  撿（減）紅點 
</h1>

<h3 align="center">以數位科技強化社會安全網，串聯政府與民間，建立即時通報與協作機制，打造全民參與的安全支持系統。</h3>


## 創新功能
- 結合地理定位＋即時求助發布＋鄰里互助
- 以「快速、匿名、安全」為原則的微型協作網路
- 讓鄰里社群能即時回應個人求助，透過定位、分類與社群協作，提升社區安全感

## 核心主軸
- **即時安全求助（Instant Local Safety Support）**：使用者可一鍵發布「求助訊息」，並自動取得定位，且在使用者危急求助時後端可透過模型替使用者即時分類事件性質（例如跟蹤、騷擾、可疑人物等），增加被幫助的可見性。
- **社區響應網（Community Help Network）**：可以迅速查看附近 1 公里內的求助訊息，增加了求助者盡快獲得幫助的可能性。此外，系統也統計了「願意幫助人數」，形成即時的社區支援指標。
- **地理資訊整合（Location Intelligence Integration）**：求助者位置可視覺化顯示於地圖中，方便使用者快速找到求助者提供幫助，也可透過系統簡單快速地打開google map導航。

## 開源技術使用

1. [Leaflet](https://leafletjs.com) (地圖)
2. Sentence Transformers MiniLM Embedding Model 作為分類器 (只要 33M 參數量、100+MB，非常小)
3. [geopy](https://github.com/geopy/geopy)（經緯度轉地址）

## 政府開放資料使用

1. [台北市警局地點](https://data.taipei/dataset/detail?id=6c41536a-3ce2-4102-bdfc-6b5f3d13ef91)


