import React, { useState, useEffect } from 'react';
import { Home, List, MapPin, LogOut, Send, AlertCircle, Clock, Phone } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8080/api';

// 登入頁面
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username.trim()) {
      alert('請輸入帳號');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() })
      });

      const data = await response.json();
      if (data.success) {
        onLogin(data.user);
      } else {
        alert(data.message || '登入失敗');
      }
    } catch (error) {
      alert('連線錯誤，請確認後端已啟動');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-purple-500 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">安全求助平台</h1>
          <p className="text-gray-600">讓我們一起守護彼此</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">帳號</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="請輸入您的帳號"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:bg-gray-400"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-6">
          本系統為原型測試版本
        </p>
      </div>
    </div>
  );
}

// Tab 1: 發布求助
function CreatePostTab({ user, onPostCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState(2);
  const [contact, setContact] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [labels, setLabels] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const response = await fetch(`${API_BASE}/labels`);
      const data = await response.json();
      if (data.success) {
        setLabels(data.labels);
      }
    } catch (error) {
      console.error('獲取標籤失敗:', error);
    }
  };

  const toggleLabel = (label) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !location.trim() || !contact.trim()) {
      alert('請填寫所有必填欄位');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          location: location.trim(),
          urgency,
          contact: contact.trim(),
          labels: selectedLabels
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('求助發布成功！');
        setTitle('');
        setContent('');
        setLocation('');
        setUrgency(2);
        setContact('');
        setSelectedLabels([]);
        if (onPostCreated) onPostCreated();
      } else {
        alert(data.message || '發布失敗');
      }
    } catch (error) {
      alert('連線錯誤');
    } finally {
      setLoading(false);
    }
  };

  const urgencyOptions = [
    { value: 1, label: '緊急 (5分鐘內)', color: 'bg-red-500' },
    { value: 2, label: '重要 (15分鐘內)', color: 'bg-orange-500' },
    { value: 3, label: '一般 (30分鐘內)', color: 'bg-yellow-500' }
  ];

  return (
    <div className="p-4 space-y-4 pb-24">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">發布求助</h2>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">求助標題 *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="簡短描述您需要的協助"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">求助內容 *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="詳細描述您的情況..."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">定位 (緯度,經度) *</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="例如: 25.0330,121.5654"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">未來將自動定位，目前請手動輸入</p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">緊急程度 *</label>
        <div className="space-y-2">
          {urgencyOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setUrgency(option.value)}
              className={`w-full p-3 rounded-lg text-white font-semibold transition-all ${
                urgency === option.value ? option.color : 'bg-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">選擇標籤</label>
        {labels && (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">事發類型</p>
              <div className="flex flex-wrap gap-2">
                {labels.incident_types.map(label => (
                  <button
                    key={label}
                    onClick={() => toggleLabel(label)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedLabels.includes(label)
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-600 mb-1">地點類型</p>
              <div className="flex flex-wrap gap-2">
                {labels.location_types.map(label => (
                  <button
                    key={label}
                    onClick={() => toggleLabel(label)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedLabels.includes(label)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">聯絡方式 *</label>
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="電話或其他聯絡方式"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2"
      >
        <Send size={20} />
        {loading ? '發布中...' : '發布求助'}
      </button>
    </div>
  );
}

// Tab 2: 求助列表
function PostListTab({ user }) {
  const [posts, setPosts] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' or 'nearby'
  const [selectedLabel, setSelectedLabel] = useState('');
  const [labels, setLabels] = useState(null);
  const [userLocation, setUserLocation] = useState('25.0330,121.5654'); // 預設台北車站
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLabels();
    fetchPosts();
  }, [filter, selectedLabel, userLocation]);

  const fetchLabels = async () => {
    try {
      const response = await fetch(`${API_BASE}/labels`);
      const data = await response.json();
      if (data.success) {
        setLabels(data.labels);
      }
    } catch (error) {
      console.error('獲取標籤失敗:', error);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        user_id: user.id,
        location: userLocation
      });

      if (filter === 'nearby') {
        params.append('distance', '5');
      }

      if (selectedLabel) {
        params.append('label', selectedLabel);
      }

      const response = await fetch(`${API_BASE}/posts?${params}`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('獲取貼文失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewPostDetail = async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}?location=${userLocation}`);
      const data = await response.json();
      if (data.success) {
        setSelectedPost(data.post);
      }
    } catch (error) {
      console.error('獲取貼文詳情失敗:', error);
    }
  };

  const handleRespond = async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      const data = await response.json();
      if (data.success) {
        alert('已通知求助者您正在前往！');
        viewPostDetail(postId);
      } else {
        alert(data.message || '操作失敗');
      }
    } catch (error) {
      alert('連線錯誤');
    }
  };

  const handleResolve = async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      const data = await response.json();
      if (data.success) {
        alert('已標記為解決！');
        setSelectedPost(null);
        fetchPosts();
      } else {
        alert(data.message || '操作失敗');
      }
    } catch (error) {
      alert('連線錯誤');
    }
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      1: { text: '緊急', color: 'bg-red-500' },
      2: { text: '重要', color: 'bg-orange-500' },
      3: { text: '一般', color: 'bg-yellow-500' }
    };
    const badge = badges[urgency] || badges[3];
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (selectedPost) {
    return (
      <div className="p-4 pb-24">
        <button
          onClick={() => setSelectedPost(null)}
          className="text-purple-500 mb-4 flex items-center gap-1"
        >
          ← 返回列表
        </button>

        <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
          <div className="flex items-start justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex-1">{selectedPost.title}</h2>
            {getUrgencyBadge(selectedPost.urgency)}
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} />
              <span>{selectedPost.distance_text || '位置資訊'}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={16} />
              <span>{new Date(selectedPost.created_at).toLocaleString('zh-TW')}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Phone size={16} />
              <span>{selectedPost.contact}</span>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
          </div>

          {selectedPost.labels && selectedPost.labels.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedPost.labels.map(label => (
                <span key={label} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                  {label}
                </span>
              ))}
            </div>
          )}

          <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
            <span className="text-sm text-gray-700">
              {selectedPost.helper_count} 人正在前往協助
            </span>
            <AlertCircle className="text-blue-500" size={20} />
          </div>

          <div className="space-y-2">
            {selectedPost.user_id !== user.id && (
              <button
                onClick={() => handleRespond(selectedPost.id)}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
              >
                我正在前往協助
              </button>
            )}

            {selectedPost.user_id === user.id && (
              <button
                onClick={() => handleResolve(selectedPost.id)}
                className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
              >
                標記為已解決
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <div className="sticky top-0 bg-white border-b shadow-sm z-10">
        <div className="p-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              所有資訊
            </button>
            <button
              onClick={() => setFilter('nearby')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'nearby'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              五公里內
            </button>
          </div>

          {labels && (
            <div className="overflow-x-auto">
              <div className="flex gap-2 pb-2">
                <button
                  onClick={() => setSelectedLabel('')}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    selectedLabel === ''
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  全部
                </button>
                {[...labels.incident_types, ...labels.location_types, ...labels.districts].map(label => (
                  <button
                    key={label}
                    onClick={() => setSelectedLabel(label)}
                    className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                      selectedLabel === label
                        ? 'bg-purple-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500">載入中...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">目前沒有求助資訊</div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              onClick={() => viewPostDetail(post.id)}
              className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow ${
                post.user_id === user.id ? 'border-2 border-purple-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-800 flex-1">{post.title}</h3>
                {getUrgencyBadge(post.urgency)}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <MapPin size={14} />
                <span>{post.distance_text || '位置資訊'}</span>
              </div>

              {post.user_id === user.id && (
                <div className="text-xs text-purple-600 font-semibold">您的求助</div>
              )}

              {post.helper_count > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  {post.helper_count} 人正在前往
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Tab 3: 地圖
function MapTab({ user }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(false);

  // 初始化地圖
  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // 建立地圖，中心點設在台北市中心
      const map = L.map(mapRef.current).setView([25.0330, 121.5654], 13);

      // 加入 OpenStreetMap 圖層
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // 清理地圖實例
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 載入貼文資料
  useEffect(() => {
    fetchMapData();
    // 每 10 秒自動更新一次
    const interval = setInterval(fetchMapData, 10000);
    return () => clearInterval(interval);
  }, []);

  // 當貼文更新時，更新地圖標記
  useEffect(() => {
    if (mapInstanceRef.current && posts.length > 0) {
      updateMarkers();
    }
  }, [posts]);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/map`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.points);
      }
    } catch (error) {
      console.error('獲取地圖資料失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 移除舊的標記
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // 為每個貼文建立標記
    posts.forEach(post => {
      // 根據緊急程度決定顏色
      const colorMap = {
        1: '#ef4444', // 紅色
        2: '#f97316', // 橘色
        3: '#eab308'  // 黃色
      };
      const color = colorMap[post.urgency] || '#eab308';

      // 建立自訂圖標
      const icon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background-color: ${color};
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // 建立標記
      const marker = L.marker([post.latitude, post.longitude], { icon })
        .addTo(map);

      // 建立彈出視窗
      const urgencyText = {
        1: '🔴 緊急',
        2: '🟠 重要',
        3: '🟡 一般'
      };

      const popupContent = `
        <div style="min-width: 200px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">
            ${post.title}
          </div>
          <div style="color: #666; font-size: 14px; margin-bottom: 8px;">
            ${urgencyText[post.urgency] || '🟡 一般'}
          </div>
          <div style="color: #999; font-size: 12px; margin-bottom: 12px;">
            ${new Date(post.created_at).toLocaleString('zh-TW')}
          </div>
          <button 
            onclick="window.viewPostFromMap(${post.id})"
            style="
              width: 100%;
              background-color: #8b5cf6;
              color: white;
              padding: 8px;
              border-radius: 6px;
              border: none;
              cursor: pointer;
              font-weight: 600;
            "
          >
            查看詳情
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      // 點擊標記時居中並放大
      marker.on('click', () => {
        map.setView([post.latitude, post.longitude], 16);
      });

      markersRef.current.push(marker);
    });

    // 如果有貼文，調整地圖視野以顯示所有標記
    if (posts.length > 0) {
      const bounds = L.latLngBounds(posts.map(p => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  // 查看貼文詳情
  const viewPostDetail = async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}?location=25.0330,121.5654`);
      const data = await response.json();
      if (data.success) {
        setSelectedPost(data.post);
      }
    } catch (error) {
      console.error('獲取貼文詳情失敗:', error);
    }
  };

  // 全域函數供 popup 使用
  useEffect(() => {
    window.viewPostFromMap = viewPostDetail;
    return () => {
      delete window.viewPostFromMap;
    };
  }, []);

  const handleRespond = async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      const data = await response.json();
      if (data.success) {
        alert('已通知求助者您正在前往！');
        viewPostDetail(postId);
      } else {
        alert(data.message || '操作失敗');
      }
    } catch (error) {
      alert('連線錯誤');
    }
  };

  const handleResolve = async (postId) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${postId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id })
      });

      const data = await response.json();
      if (data.success) {
        alert('已標記為解決！');
        setSelectedPost(null);
        fetchMapData();
      } else {
        alert(data.message || '操作失敗');
      }
    } catch (error) {
      alert('連線錯誤');
    }
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      1: { text: '緊急', color: 'bg-red-500' },
      2: { text: '重要', color: 'bg-orange-500' },
      3: { text: '一般', color: 'bg-yellow-500' }
    };
    const badge = badges[urgency] || badges[3];
    return (
      <span className={`px-2 py-1 rounded-full text-xs text-white ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  // 如果選中了貼文，顯示詳情面板
  if (selectedPost) {
    return (
      <div className="h-full relative">
        {/* 地圖背景 */}
        <div ref={mapRef} className="w-full h-full" />
        
        {/* 貼文詳情面板 */}
        <div className="absolute top-4 left-4 right-4 bg-white rounded-lg shadow-2xl p-4 max-w-md z-[1000] max-h-[80vh] overflow-y-auto">
          <button
            onClick={() => setSelectedPost(null)}
            className="text-purple-500 mb-4 flex items-center gap-1 hover:underline"
          >
            ← 返回地圖
          </button>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold text-gray-800 flex-1">{selectedPost.title}</h2>
              {getUrgencyBadge(selectedPost.urgency)}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                <span>{selectedPost.distance_text || '位置資訊'}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Clock size={16} />
                <span>{new Date(selectedPost.created_at).toLocaleString('zh-TW')}</span>
              </div>

              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span>{selectedPost.contact}</span>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-gray-700 whitespace-pre-wrap">{selectedPost.content}</p>
            </div>

            {selectedPost.labels && selectedPost.labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedPost.labels.map(label => (
                  <span key={label} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {label}
                  </span>
                ))}
              </div>
            )}

            <div className="bg-blue-50 p-3 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {selectedPost.helper_count} 人正在前往協助
              </span>
              <AlertCircle size={20} className="text-blue-500" />
            </div>

            <div className="space-y-2">
              {selectedPost.user_id !== user.id && (
                <button
                  onClick={() => handleRespond(selectedPost.id)}
                  className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  我正在前往協助
                </button>
              )}

              {selectedPost.user_id === user.id && (
                <button
                  onClick={() => handleResolve(selectedPost.id)}
                  className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 transition-colors"
                >
                  標記為已解決
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* 地圖容器 */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* 圖例面板 */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <h3 className="font-bold text-gray-800 mb-3">緊急程度</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow"></div>
            <span className="text-sm text-gray-700">緊急 (5分鐘內)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow"></div>
            <span className="text-sm text-gray-700">重要 (15分鐘內)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500 border-2 border-white shadow"></div>
            <span className="text-sm text-gray-700">一般 (30分鐘內)</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t text-xs text-gray-500">
          共 {posts.length} 個求助點
        </div>
      </div>

      {/* 重新整理按鈕 */}
      <button
        onClick={fetchMapData}
        disabled={loading}
        className="absolute bottom-24 right-4 bg-purple-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-600 transition-colors disabled:bg-gray-400 z-[1000] flex items-center gap-2"
      >
        <svg className={loading ? 'animate-spin' : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
        </svg>
        {loading ? '更新中...' : '重新整理'}
      </button>

      {/* 無資料提示 */}
      {!loading && posts.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-6 text-center z-[1000]">
          <MapPin size={48} className="text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">目前沒有求助資訊</p>
        </div>
      )}
    </div>
  );
}

// 主應用程式
export default function App() {
  const [user, setUser] = useState(() => {
    // 從 localStorage 讀取登入狀態
    const savedUser = localStorage.getItem('safety_help_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [activeTab, setActiveTab] = useState('list');

  // 處理登入
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('safety_help_user', JSON.stringify(userData));
  };

  // 處理登出
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('safety_help_user');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const tabs = [
    { id: 'create', icon: Home, label: '發布' },
    { id: 'list', icon: List, label: '列表' },
    { id: 'map', icon: MapPin, label: '地圖' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頂部導航 */}
      <div className="bg-purple-500 text-white p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">安全求助平台</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm">{user.username}</span>
          <button
            onClick={() => {
              if (confirm('確定要登出嗎?')) {
                handleLogout();
              }
            }}
            className="p-2 hover:bg-purple-600 rounded"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* 內容區域 */}
      <div className="h-[calc(100vh-128px)] overflow-y-auto">
        {activeTab === 'create' && <CreatePostTab user={user} onPostCreated={() => setActiveTab('list')} />}
        {activeTab === 'list' && <PostListTab user={user} />}
        {activeTab === 'map' && <MapTab user={user} />}
      </div>

      {/* 底部導航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-500 bg-purple-50'
                  : 'text-gray-600'
              }`}
            >
              <tab.icon size={24} />
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}