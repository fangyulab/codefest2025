import React, { useState, useEffect } from 'react';
import { Home, List, MapPin, LogOut, Send, AlertCircle, Clock, Phone } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:5000/api';

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

// Tab 3: 地圖 (預留)
function MapTab() {
  return (
    <div className="h-full flex items-center justify-center p-4 pb-24">
      <div className="text-center">
        <MapPin size={64} className="text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">地圖功能</h2>
        <p className="text-gray-600">此功能將在串接地圖 API 後啟用</p>
        <p className="text-sm text-gray-500 mt-2">
          將顯示所有求助點位<br />
          紅色 = 緊急 | 橘色 = 重要 | 黃色 = 一般
        </p>
      </div>
    </div>
  );
}

// 主應用程式
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('list');

  if (!user) {
    return <LoginPage onLogin={setUser} />;
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
                setUser(null);
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
        {activeTab === 'map' && <MapTab />}
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
