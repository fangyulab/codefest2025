from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import math
import firebase_admin
from firebase_admin import credentials, firestore
import os

app = Flask(__name__)
CORS(app)

cred = credentials.Certificate("key.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Firestore 集合名稱
USERS_COL = db.collection("users")
POSTS_COL = db.collection("posts")
RESPONSES_COL = db.collection("responses")

# ==================== 固定選項資料 ====================
TAIPEI_DISTRICTS = [
    "中正區", "大同區", "中山區", "松山區", "大安區", "萬華區",
    "信義區", "士林區", "北投區", "內湖區", "南港區", "文山區"
]

LOCATION_TYPES = ["捷運", "廁所", "小巷", "公園", "停車場", "電梯", "樓梯間", "其他"]
INCIDENT_TYPES = ["性騷擾", "跟蹤", "偷拍", "言語騷擾", "肢體騷擾", "其他"]

# ==================== 工具函式 ====================
def calculate_distance(lat1, lon1, lat2, lon2):
    """Haversine 公式計算兩點距離（公里）"""
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def format_distance(distance_km):
    return f"{int(distance_km * 1000)}公尺內" if distance_km < 1 else f"{distance_km:.1f}公里內"

def get_next_id(collection):
    docs = collection.order_by("id", direction=firestore.Query.DESCENDING).limit(1).stream()
    for d in docs:
        return d.to_dict().get("id", 0) + 1
    return 1

# ==================== API ====================

# 1. 登入或建立使用者
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username")
    if not username:
        return jsonify({"success": False, "message": "請輸入帳號"}), 400

    user_query = USERS_COL.where("username", "==", username).stream()
    user_doc = next(user_query, None)

    if not user_doc:
        new_id = get_next_id(USERS_COL)
        user = {
            "id": new_id,
            "username": username,
            "created_at": datetime.now().isoformat(),
        }
        USERS_COL.document(str(new_id)).set(user)
    else:
        user = user_doc.to_dict()

    return jsonify({"success": True, "user": user})

# 2. 建立求助貼文
@app.route("/api/posts", methods=["POST"])
def create_post():
    data = request.json
    required_fields = ["user_id", "title", "content", "location", "urgency", "contact"]
    for f in required_fields:
        if f not in data:
            return jsonify({"success": False, "message": f"缺少必要欄位: {f}"}), 400

    try:
        lat, lon = map(float, data["location"].split(","))
    except:
        return jsonify({"success": False, "message": "位置格式錯誤，請使用: 緯度,經度"}), 400

    new_id = get_next_id(POSTS_COL)
    post = {
        "id": new_id,
        "user_id": data["user_id"],
        "title": data["title"],
        "content": data["content"],
        "labels": data.get("labels", []),
        "location": data["location"],
        "latitude": lat,
        "longitude": lon,
        "urgency": data["urgency"],
        "contact": data["contact"],
        "resolved": False,
        "created_at": datetime.now().isoformat(),
        "helper_count": 0,
    }
    POSTS_COL.document(str(new_id)).set(post)
    return jsonify({"success": True, "post": post})

# 3. 取得所有貼文
@app.route("/api/posts", methods=["GET"])
def get_posts():
    user_id = request.args.get("user_id", type=int)
    user_location = request.args.get("location")
    distance_filter = request.args.get("distance", type=float)
    label_filter = request.args.get("label")

    posts = [doc.to_dict() for doc in POSTS_COL.where("resolved", "==", False).stream()]

    # 幫助人數
    for p in posts:
        helpers = [r for r in RESPONSES_COL.where("post_id", "==", p["id"]).stream()]
        p["helper_count"] = len(helpers)

    # 距離計算
    if user_location:
        try:
            user_lat, user_lon = map(float, user_location.split(","))
            for p in posts:
                distance = calculate_distance(user_lat, user_lon, p["latitude"], p["longitude"])
                p["distance"] = distance
                p["distance_text"] = format_distance(distance)
        except:
            pass

    # 篩選
    if distance_filter and user_location:
        posts = [p for p in posts if p.get("distance", float("inf")) <= distance_filter]
    if label_filter:
        posts = [p for p in posts if label_filter in p.get("labels", [])]

    # 排序
    def sort_key(p):
        is_own = 0 if p["user_id"] == user_id else 1
        return (is_own, p["urgency"], p["created_at"])

    posts.sort(key=sort_key)
    return jsonify({"success": True, "posts": posts})

# 4. 取得單一貼文詳情
@app.route("/api/posts/<int:post_id>", methods=["GET"])
def get_post(post_id):
    user_location = request.args.get("location")
    doc = POSTS_COL.document(str(post_id)).get()
    if not doc.exists:
        return jsonify({"success": False, "message": "貼文不存在"}), 404
    post = doc.to_dict()

    helpers = [r for r in RESPONSES_COL.where("post_id", "==", post_id).stream()]
    post["helper_count"] = len(helpers)

    if user_location:
        try:
            user_lat, user_lon = map(float, user_location.split(","))
            distance = calculate_distance(user_lat, user_lon, post["latitude"], post["longitude"])
            post["distance"] = distance
            post["distance_text"] = format_distance(distance)
        except:
            pass

    return jsonify({"success": True, "post": post})

# 5. 標記貼文為已解決
@app.route("/api/posts/<int:post_id>/resolve", methods=["POST"])
def resolve_post(post_id):
    data = request.json
    user_id = data.get("user_id")
    ref = POSTS_COL.document(str(post_id))
    doc = ref.get()
    if not doc.exists:
        return jsonify({"success": False, "message": "貼文不存在"}), 404
    post = doc.to_dict()
    if post["user_id"] != user_id:
        return jsonify({"success": False, "message": "只有發文者可以標記為已解決"}), 403

    ref.update({"resolved": True, "resolved_at": datetime.now().isoformat()})
    post["resolved"] = True
    post["resolved_at"] = datetime.now().isoformat()
    return jsonify({"success": True, "post": post})

# 6. 回應求助
@app.route("/api/posts/<int:post_id>/respond", methods=["POST"])
def respond_to_post(post_id):
    data = request.json
    user_id = data.get("user_id")
    post_doc = POSTS_COL.document(str(post_id)).get()
    if not post_doc.exists:
        return jsonify({"success": False, "message": "貼文不存在"}), 404

    existing = RESPONSES_COL.where("post_id", "==", post_id).where("user_id", "==", user_id).stream()
    if next(existing, None):
        return jsonify({"success": False, "message": "您已經回應過此求助"}), 400

    new_id = get_next_id(RESPONSES_COL)
    response = {
        "id": new_id,
        "post_id": post_id,
        "user_id": user_id,
        "created_at": datetime.now().isoformat(),
    }
    RESPONSES_COL.document(str(new_id)).set(response)

    helpers = [r for r in RESPONSES_COL.where("post_id", "==", post_id).stream()]
    return jsonify({"success": True, "helper_count": len(helpers)})

# 7. 取得標籤選項
@app.route("/api/labels", methods=["GET"])
def get_labels():
    return jsonify({
        "success": True,
        "labels": {
            "districts": TAIPEI_DISTRICTS,
            "location_types": LOCATION_TYPES,
            "incident_types": INCIDENT_TYPES
        }
    })

# 8. 取得地圖資料
@app.route("/api/map", methods=["GET"])
def get_map_data():
    posts = [p.to_dict() for p in POSTS_COL.where("resolved", "==", False).stream()]
    color_map = {1: "red", 2: "orange", 3: "yellow"}
    points = [
        {
            "id": p["id"],
            "title": p["title"],
            "latitude": p["latitude"],
            "longitude": p["longitude"],
            "urgency": p["urgency"],
            "color": color_map.get(p["urgency"], "yellow"),
            "created_at": p["created_at"]
        }
        for p in posts
    ]
    return jsonify({"success": True, "points": points})

# ==================== 啟動伺服器 ====================
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    print(f"後端伺服器啟動於 http://0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port)
