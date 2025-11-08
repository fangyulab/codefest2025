# geo.py
from flask import Blueprint, request, jsonify
from geopy.geocoders import Nominatim

# 一定要有 url_prefix="/geo"
geo_bp = Blueprint("geo", __name__)

geolocator = Nominatim(user_agent="safecity_app", timeout=5)

@geo_bp.route("/reverse-geocode", methods=["GET"])
def reverse_geocode():
    """
    最終實際路徑：
    GET /api/geo/reverse-geocode?lat=25.0330&lon=121.5654
    （app.py 會加上 /api）
    """
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    if lat is None or lon is None:
        return jsonify({"error": "缺少 lat 或 lon 參數"}), 400

    try:
        location = geolocator.reverse((lat, lon), language="zh-TW")
        if not location:
            # 找不到地址就給座標 fallback，但不丟 500，避免前端壞掉
            return jsonify({
                "lat": lat,
                "lon": lon,
                "address": f"{lat:.5f}, {lon:.5f}"
            }), 200

        return jsonify({
            "lat": lat,
            "lon": lon,
            "address": location.address
        }), 200

    except Exception as e:
        print("Reverse geocode error:", e, flush=True)

        return jsonify({
            "lat": lat,
            "lon": lon,
            "address": f"{lat:.5f}, {lon:.5f}"
        }), 200
