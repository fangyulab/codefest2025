import requests

url = "https://flask-demo-188795468423.asia-east1.run.app/api/classify"
# url = "http://localhost:8080/api/classify"
data = {
    "title": "救命",
    "content": "有個男的一直尾隨著我走"
}

response = requests.post(url, json=data)
print(response.json())
