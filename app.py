from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime
import math

app = Flask(__name__)
CORS(app)

# 資料檔案路徑
USERS_FILE = 'users.txt'
POSTS_FILE = 'posts.txt'
RESPONSES_FILE = 'responses.txt'

# 台北市行政區
TAIPEI_DISTRICTS = [
    '中正區', '大同區', '中山區', '松山區', '大安區', '萬華區',
    '信義區', '士林區', '北投區', '內湖區', '南港區', '文山區'
]

# 常見事發地點
LOCATION_TYPES = ['捷運', '廁所', '小巷', '公園', '停車場', '電梯', '樓梯間', '其他']

# 常見事發類型
INCIDENT_TYPES = ['性騷擾', '跟蹤', '偷拍', '言語騷擾', '肢體騷擾', '其他']

# 初始化檔案
def init_files():
    if not os.path.exists(USERS_FILE):
        with open(USERS_FILE, 'w', encoding='utf-8') as f:
            f.write('[]')
    if not os.path.exists(POSTS_FILE):
        with open(POSTS_FILE, 'w', encoding='utf-8') as f:
            f.write('[]')
    if not os.path.exists(RESPONSES_FILE):
        with open(RESPONSES_FILE, 'w', encoding='utf-8') as f:
            f.write('[]')

# 讀取資料
def read_data(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read().strip()
            return json.loads(content) if content else []
    except:
        return []

# 寫入資料
def write_data(filename, data):
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# 計算距離 (簡化版，使用經緯度)
def calculate_distance(lat1, lon1, lat2, lon2):
    # 使用 Haversine 公式
    R = 6371  # 地球半徑 (公里)
    
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 + 
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * 
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance

# 格式化距離顯示
def format_distance(distance_km):
    if distance_km < 1:
        return f"{int(distance_km * 1000)}公尺內"
    else:
        return f"{distance_km:.1f}公里內"

# ==================== API 端點 ====================

# 1. 登入
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    
    if not username:
        return jsonify({'success': False, 'message': '請輸入帳號'}), 400
    
    users = read_data(USERS_FILE)
    user = next((u for u in users if u['username'] == username), None)
    
    if not user:
        # 新增使用者
        user = {
            'id': len(users) + 1,
            'username': username,
            'created_at': datetime.now().isoformat()
        }
        users.append(user)
        write_data(USERS_FILE, users)
    
    return jsonify({
        'success': True,
        'user': user
    })

# 2. 建立求助貼文
@app.route('/api/posts', methods=['POST'])
def create_post():
    data = request.json
    
    required_fields = ['user_id', 'title', 'content', 'location', 'urgency', 'contact']
    for field in required_fields:
        if field not in data:
            return jsonify({'success': False, 'message': f'缺少必要欄位: {field}'}), 400
    
    posts = read_data(POSTS_FILE)
    
    # 解析位置 (格式: "緯度,經度")
    try:
        lat, lon = map(float, data['location'].split(','))
    except:
        return jsonify({'success': False, 'message': '位置格式錯誤，請使用: 緯度,經度'}), 400
    
    post = {
        'id': len(posts) + 1,
        'user_id': data['user_id'],
        'title': data['title'],
        'content': data['content'],
        'labels': data.get('labels', []),
        'location': data['location'],
        'latitude': lat,
        'longitude': lon,
        'urgency': data['urgency'],  # 1: <5分鐘, 2: <15分鐘, 3: <30分鐘
        'contact': data['contact'],
        'resolved': False,
        'created_at': datetime.now().isoformat(),
        'helper_count': 0
    }
    
    posts.append(post)
    write_data(POSTS_FILE, posts)
    
    return jsonify({
        'success': True,
        'post': post
    })

# 3. 取得所有貼文 (可篩選)
@app.route('/api/posts', methods=['GET'])
def get_posts():
    user_id = request.args.get('user_id', type=int)
    user_location = request.args.get('location')  # 格式: "緯度,經度"
    distance_filter = request.args.get('distance', type=float)  # 5 代表 5 公里內
    label_filter = request.args.get('label')
    
    posts = read_data(POSTS_FILE)
    responses = read_data(RESPONSES_FILE)
    
    # 未解決的貼文
    active_posts = [p for p in posts if not p['resolved']]
    
    # 計算每個貼文的幫助人數
    for post in active_posts:
        post['helper_count'] = len([r for r in responses if r['post_id'] == post['id']])
    
    # 如果有使用者位置，計算距離
    if user_location:
        try:
            user_lat, user_lon = map(float, user_location.split(','))
            for post in active_posts:
                distance = calculate_distance(user_lat, user_lon, post['latitude'], post['longitude'])
                post['distance'] = distance
                post['distance_text'] = format_distance(distance)
        except:
            pass
    
    # 距離篩選
    if distance_filter and user_location:
        active_posts = [p for p in active_posts if p.get('distance', float('inf')) <= distance_filter]
    
    # 標籤篩選
    if label_filter:
        active_posts = [p for p in active_posts if label_filter in p.get('labels', [])]
    
    # 排序：使用者自己的貼文在最前面，然後按緊急程度，最後按時間
    def sort_key(post):
        is_own = 0 if post['user_id'] == user_id else 1
        urgency = post['urgency']
        time = post['created_at']
        return (is_own, urgency, time)
    
    active_posts.sort(key=sort_key)
    
    return jsonify({
        'success': True,
        'posts': active_posts
    })

# 4. 取得單一貼文詳情
@app.route('/api/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    user_location = request.args.get('location')
    
    posts = read_data(POSTS_FILE)
    responses = read_data(RESPONSES_FILE)
    
    post = next((p for p in posts if p['id'] == post_id), None)
    
    if not post:
        return jsonify({'success': False, 'message': '貼文不存在'}), 404
    
    # 計算幫助人數
    post['helper_count'] = len([r for r in responses if r['post_id'] == post_id])
    
    # 計算距離
    if user_location:
        try:
            user_lat, user_lon = map(float, user_location.split(','))
            distance = calculate_distance(user_lat, user_lon, post['latitude'], post['longitude'])
            post['distance'] = distance
            post['distance_text'] = format_distance(distance)
        except:
            pass
    
    return jsonify({
        'success': True,
        'post': post
    })

# 5. 標記貼文為已解決
@app.route('/api/posts/<int:post_id>/resolve', methods=['POST'])
def resolve_post(post_id):
    data = request.json
    user_id = data.get('user_id')
    
    posts = read_data(POSTS_FILE)
    post = next((p for p in posts if p['id'] == post_id), None)
    
    if not post:
        return jsonify({'success': False, 'message': '貼文不存在'}), 404
    
    if post['user_id'] != user_id:
        return jsonify({'success': False, 'message': '只有發文者可以標記為已解決'}), 403
    
    post['resolved'] = True
    post['resolved_at'] = datetime.now().isoformat()
    
    write_data(POSTS_FILE, posts)
    
    return jsonify({
        'success': True,
        'post': post
    })

# 6. 回應求助 (表示正在前往)
@app.route('/api/posts/<int:post_id>/respond', methods=['POST'])
def respond_to_post(post_id):
    data = request.json
    user_id = data.get('user_id')
    
    posts = read_data(POSTS_FILE)
    post = next((p for p in posts if p['id'] == post_id), None)
    
    if not post:
        return jsonify({'success': False, 'message': '貼文不存在'}), 404
    
    responses = read_data(RESPONSES_FILE)
    
    # 檢查是否已經回應過
    existing = next((r for r in responses if r['post_id'] == post_id and r['user_id'] == user_id), None)
    
    if existing:
        return jsonify({'success': False, 'message': '您已經回應過此求助'}), 400
    
    response = {
        'id': len(responses) + 1,
        'post_id': post_id,
        'user_id': user_id,
        'created_at': datetime.now().isoformat()
    }
    
    responses.append(response)
    write_data(RESPONSES_FILE, responses)
    
    return jsonify({
        'success': True,
        'helper_count': len([r for r in responses if r['post_id'] == post_id])
    })

# 7. 取得標籤選項
@app.route('/api/labels', methods=['GET'])
def get_labels():
    return jsonify({
        'success': True,
        'labels': {
            'districts': TAIPEI_DISTRICTS,
            'location_types': LOCATION_TYPES,
            'incident_types': INCIDENT_TYPES
        }
    })

# 8. 取得地圖資料 (所有未解決的貼文位置)
@app.route('/api/map', methods=['GET'])
def get_map_data():
    posts = read_data(POSTS_FILE)
    active_posts = [p for p in posts if not p['resolved']]
    
    map_points = []
    for post in active_posts:
        # 根據緊急程度設定顏色
        color_map = {1: 'red', 2: 'orange', 3: 'yellow'}
        
        map_points.append({
            'id': post['id'],
            'title': post['title'],
            'latitude': post['latitude'],
            'longitude': post['longitude'],
            'urgency': post['urgency'],
            'color': color_map.get(post['urgency'], 'yellow'),
            'created_at': post['created_at']
        })
    
    return jsonify({
        'success': True,
        'points': map_points
    })

if __name__ == '__main__':
    init_files()
    print("🚀 後端伺服器啟動於 http://127.0.0.1:5000")
    print("=" * 50)
    app.run(host='127.0.0.1', port=5000, debug=True)
