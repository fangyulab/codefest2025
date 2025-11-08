# 使用 Python 官方映像
FROM python:3.11-slim

# 設定工作目錄
WORKDIR /app

# 複製所有檔案
COPY . .

# 安裝套件
RUN pip install --no-cache-dir -r requirements.txt

# Flask 預設監聽 8080 port
ENV PORT 8080

# 啟動伺服器
CMD ["python", "app.py"]
