import requests
import json

API_BASE = 'http://127.0.0.1:5000/api'

def test_api():
    print("=" * 50)
    print("API 測試開始")
    print("=" * 50)
    
    # 測試 1: 登入
    print("\n測試 1: 登入功能")
    response = requests.post(f'{API_BASE}/login', json={'username': 'test_user'})
    if response.status_code == 200:
        user = response.json()['user']
        print(f"✓ 登入成功! 使用者 ID: {user['id']}, 帳號: {user['username']}")
    else:
        print(f"✗ 登入失敗: {response.text}")
        return
    
    user_id = user['id']
    
    # 測試 2: 取得標籤
    print("\n測試 2: 取得標籤")
    response = requests.get(f'{API_BASE}/labels')
    if response.status_code == 200:
        labels = response.json()['labels']
        print(f"✓ 標籤取得成功!")
        print(f"  - 行政區數量: {len(labels['districts'])}")
        print(f"  - 地點類型數量: {len(labels['location_types'])}")
        print(f"  - 事發類型數量: {len(labels['incident_types'])}")
    else:
        print(f"✗ 取得標籤失敗: {response.text}")
    
    # 測試 3: 建立求助貼文
    print("\n測試 3: 建立求助貼文")
    post_data = {
        'user_id': user_id,
        'title': '測試求助 - 請協助',
        'content': '這是一個測試求助貼文，用於驗證系統功能。',
        'location': '25.0330,121.5654',  # 台北車站
        'urgency': 1,
        'contact': '0912345678',
        'labels': ['性騷擾', '捷運']
    }
    response = requests.post(f'{API_BASE}/posts', json=post_data)
    if response.status_code == 200:
        post = response.json()['post']
        print(f"✓ 貼文建立成功! ID: {post['id']}, 標題: {post['title']}")
    else:
        print(f"✗ 建立貼文失敗: {response.text}")
        return
    
    post_id = post['id']
    
    # 測試 4: 取得所有貼文
    print("\n測試 4: 取得所有貼文")
    response = requests.get(f'{API_BASE}/posts', params={
        'user_id': user_id,
        'location': '25.0330,121.5654'
    })
    if response.status_code == 200:
        posts = response.json()['posts']
        print(f"✓ 貼文列表取得成功! 共 {len(posts)} 則貼文")
    else:
        print(f"✗ 取得貼文列表失敗: {response.text}")
    
    # 測試 5: 取得單一貼文詳情
    print("\n測試 5: 取得貼文詳情")
    response = requests.get(f'{API_BASE}/posts/{post_id}', params={
        'location': '25.0330,121.5654'
    })
    if response.status_code == 200:
        post = response.json()['post']
        print(f"✓ 貼文詳情取得成功!")
        print(f"  - 標題: {post['title']}")
        print(f"  - 距離: {post.get('distance_text', 'N/A')}")
        print(f"  - 協助人數: {post['helper_count']}")
    else:
        print(f"✗ 取得貼文詳情失敗: {response.text}")
    
    # 測試 6: 建立第二個使用者並回應求助
    print("\n測試 6: 第二個使用者回應求助")
    response = requests.post(f'{API_BASE}/login', json={'username': 'test_helper'})
    helper = response.json()['user']
    
    response = requests.post(f'{API_BASE}/posts/{post_id}/respond', json={
        'user_id': helper['id']
    })
    if response.status_code == 200:
        helper_count = response.json()['helper_count']
        print(f"✓ 回應求助成功! 目前有 {helper_count} 人正在前往")
    else:
        print(f"✗ 回應求助失敗: {response.text}")
    
    # 測試 7: 標記為已解決
    print("\n測試 7: 標記貼文為已解決")
    response = requests.post(f'{API_BASE}/posts/{post_id}/resolve', json={
        'user_id': user_id
    })
    if response.status_code == 200:
        print(f"✓ 貼文已標記為已解決!")
    else:
        print(f"✗ 標記失敗: {response.text}")
    
    # 測試 8: 取得地圖資料
    print("\n測試 8: 取得地圖資料")
    response = requests.get(f'{API_BASE}/map')
    if response.status_code == 200:
        points = response.json()['points']
        print(f"✓ 地圖資料取得成功! 共 {len(points)} 個點位")
    else:
        print(f"✗ 取得地圖資料失敗: {response.text}")
    
    print("\n" + "=" * 50)
    print("所有測試完成!")
    print("=" * 50)

if __name__ == '__main__':
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("\n錯誤: 無法連線到後端伺服器")
        print("請先執行: python app.py")
    except Exception as e:
        print(f"\n錯誤: {e}")
