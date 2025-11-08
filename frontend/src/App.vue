<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <div class="max-w-4xl mx-auto p-4 pb-24">
      <!-- 標題 -->
      <div class="text-center py-8">
        <h1 class="text-4xl font-bold text-indigo-900 mb-2">互助平台</h1>
        <p class="text-indigo-600">鄰里互助，溫暖社區</p>
      </div>

      <!-- 主要內容區 -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden">
        <!-- Tab 1: 發布求助表單 -->
        <div v-if="activeTab === 0" class="p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Send class="text-indigo-600" />
            發布求助資訊
          </h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                求助標題 *
              </label>
              <input
                type="text"
                v-model="formData.title"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="例：需要幫忙搬運家具"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                求助內容 *
              </label>
              <textarea
                v-model="formData.content"
                :rows="4"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="詳細描述您需要的協助..."
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                定位地點 *
              </label>
              <input
                type="text"
                v-model="formData.location"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="例：台北市大安區信義路三段"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                聯絡方式
              </label>
              <input
                type="text"
                v-model="formData.contact"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="電話或其他聯絡方式"
              />
            </div>

            <button
              @click="handleSubmit"
              class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              發布求助
            </button>
          </div>
        </div>

        <!-- Tab 2: 求助資訊列表 -->
        <div v-else-if="activeTab === 1" class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users class="text-indigo-600" />
              求助資訊
            </h2>
            <div class="flex items-center gap-2">
              <button
                @click="toggleNearby"
                :class="[
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  showNearby
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                ]"
              >
                {{ showNearby ? '附近 5 公里' : '所有資訊' }}
              </button>
            </div>
          </div>

          <div v-if="filteredRequests.length === 0" class="text-center py-12 text-gray-500">
            <Users class="mx-auto mb-4 w-16 h-16 opacity-50" />
            <p>目前沒有求助資訊</p>
          </div>
          <div v-else class="space-y-4">
            <div
              v-for="req in filteredRequests"
              :key="req.id"
              class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 class="font-bold text-lg text-gray-800 mb-2">
                {{ req.title }}
              </h3>
              <p class="text-gray-600 mb-3">{{ req.content }}</p>
              <div class="flex items-start gap-2 text-sm text-gray-500 mb-2">
                <MapPin class="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{{ req.location }}</span>
              </div>
              <p v-if="req.contact" class="text-sm text-gray-500 mb-2">
                聯絡方式：{{ req.contact }}
              </p>
              <p class="text-xs text-gray-400">{{ req.timestamp }}</p>
            </div>
          </div>
        </div>

        <!-- Tab 3: 地圖定位 -->
        <div v-else-if="activeTab === 2" class="p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Map class="text-indigo-600" />
            地圖定位
          </h2>
          <div class="bg-gray-100 rounded-lg p-8 text-center">
            <div v-if="userLocation">
              <MapPin class="mx-auto mb-4 w-16 h-16 text-indigo-600" />
              <p class="text-lg font-medium text-gray-800 mb-2">您的位置</p>
              <p class="text-gray-600">
                緯度: {{ userLocation.lat.toFixed(6) }}
              </p>
              <p class="text-gray-600">
                經度: {{ userLocation.lng.toFixed(6) }}
              </p>

              <div v-if="helpRequests.length > 0" class="mt-6 space-y-2">
                <h3 class="font-medium text-gray-700 mb-3">求助地點與距離</h3>
                <div
                  v-for="req in helpRequests"
                  :key="req.id"
                  class="bg-white rounded-lg p-3 text-left"
                >
                  <p class="font-medium text-gray-800">{{ req.title }}</p>
                  <p class="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin class="w-3 h-3" />
                    {{ req.location }}
                  </p>
                  <p class="text-xs text-gray-500">
                    距離約
                    {{
                      calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        req.lat,
                        req.lng
                      ).toFixed(2)
                    }}
                    公里
                  </p>
                </div>
              </div>
            </div>
            <div v-else>
              <MapPin class="mx-auto mb-4 w-16 h-16 text-gray-400" />
              <p class="text-gray-600">正在獲取您的位置...</p>
              <p class="text-sm text-gray-500 mt-2">
                請允許瀏覽器存取您的位置資訊
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部 Tab 導航 -->
    <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div class="max-w-4xl mx-auto flex">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="activeTab = index"
          :class="[
            'flex-1 py-4 flex flex-col items-center gap-1 transition-colors',
            activeTab === index
              ? 'text-indigo-600 bg-indigo-50'
              : 'text-gray-600 hover:bg-gray-50'
          ]"
        >
          <component :is="tab.icon" class="w-6 h-6" />
          <span class="text-sm font-medium">{{ tab.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { MapPin, Users, Map, Send } from 'lucide-vue-next';

interface HelpRequest {
  id: number;
  title: string;
  content: string;
  location: string;
  contact?: string;
  timestamp: string;
  lat: number;
  lng: number;
}

interface UserLocation {
  lat: number;
  lng: number;
}

const activeTab = ref(0);
const formData = reactive({
  title: '',
  content: '',
  location: '',
  contact: ''
});
const helpRequests = ref<HelpRequest[]>([]);
const showNearby = ref(false);
const userLocation = ref<UserLocation | null>(null);

// 取得使用者位置
onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      },
      (error) => {
        console.log('無法獲取位置', error);
      }
    );
  }
});

// 計算兩點之間的距離（公里）
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // 地球半徑（公里）
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 發布求助
const handleSubmit = () => {
  if (formData.title && formData.content && formData.location) {
    const lat =
      userLocation.value?.lat ?? 25.033 + (Math.random() - 0.5) * 0.1;
    const lng =
      userLocation.value?.lng ?? 121.5654 + (Math.random() - 0.5) * 0.1;

    const newRequest: HelpRequest = {
      id: Date.now(),
      title: formData.title,
      content: formData.content,
      location: formData.location,
      contact: formData.contact,
      timestamp: new Date().toLocaleString('zh-TW'),
      lat,
      lng
    };

    helpRequests.value = [newRequest, ...helpRequests.value];

    formData.title = '';
    formData.content = '';
    formData.location = '';
    formData.contact = '';

    window.alert('求助資訊已發布！');
  } else {
    window.alert('請填寫所有必填欄位');
  }
};

// 是否顯示附近 5 公里
const toggleNearby = () => {
  showNearby.value = !showNearby.value;
};

// 過濾顯示的求助資訊
const filteredRequests = computed(() => {
  if (showNearby.value && userLocation.value) {
    return helpRequests.value.filter((req) => {
      const distance = calculateDistance(
        userLocation.value!.lat,
        userLocation.value!.lng,
        req.lat,
        req.lng
      );
      return distance <= 5;
    });
  }
  return helpRequests.value;
});

// Tabs
const tabs = [
  { name: '發布求助', icon: Send },
  { name: '求助資訊', icon: Users },
  { name: '地圖定位', icon: Map }
];
</script>
