<template>
  <div class="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900 flex flex-col">
    <!-- 頂部導覽列 -->
    <header class="w-full border-b border-slate-200 bg-white/70 backdrop-blur-md">
      <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <img src="./assets/logo.PNG" alt="SafeCity" class="w-9 h-9 rounded-xl shadow-sm object-cover" />
          <div>
            <h1 class="text-base font-semibold text-slate-900 tracking-tight">
              SafeCity 求助平台
            </h1>
            <p class="text-[11px] text-slate-500 leading-tight">
              快速發布 & 即時查看附近求助資訊
            </p>
          </div>
        </div>
        <div class="hidden sm:flex items-center gap-2 text-[10px] text-slate-400">
          <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>位置服務</span>
          <span v-if="userLocation">已啟用</span>
          <span v-else>等待授權</span>
        </div>
      </div>
    </header>

    <!-- 主內容 -->
    <main class="flex-1 w-full">
      <div class="max-w-4xl mx-auto px-4 pt-4 pb-24">
        <!-- 內容卡片 -->

        <!-- Tab 1: 發布求助表單 -->
        <section v-if="activeTab === 0" class="space-y-5">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Send class="w-5 h-5 text-indigo-500" />
              發布求助資訊
            </h2>
          </div>

          <div class="grid gap-4">
            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1.5">求助標題 *</label>
              <input type="text" v-model="formData.title" class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                        focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400
                        placeholder:text-slate-300 transition-all" placeholder="例：需要幫忙搬運家具、找人協助修電腦" />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-700 mb-1.5">求助內容 *</label>
              <textarea v-model="formData.content" :rows="4" class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                        focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400
                        placeholder:text-slate-300 transition-all resize-none"
                placeholder="請清楚說明狀況、時間地點與需要的協助，例如：搬運時間、樓層、有無電梯等" />
            </div>

            <div class="grid sm:grid-cols-[2fr,1fr] gap-4">
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                  <MapPin class="w-3 h-3 text-indigo-500" />
                  定位地點 *
                </label>
                <input type="text" v-model="formData.location" class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                          focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400
                          placeholder:text-slate-300 transition-all" placeholder="例：台北市大安區信義路三段、學校側門附近" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-700 mb-1.5">聯絡方式（選填）</label>
                <input type="text" v-model="formData.contact" class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                          focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400
                          placeholder:text-slate-300 transition-all" placeholder="手機、LINE ID 或其他安全聯絡方式" />
              </div>
            </div>
          </div>

          <button @click="handleSubmit" class="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 text-white py-3
                    text-sm font-semibold shadow-sm hover:bg-indigo-700 active:scale-[0.99] transition-all">
            <Send class="w-4 h-4" />
            立即發布求助資訊
          </button>

          <p class="text-[10px] text-slate-400 leading-relaxed">
            請避免張貼身分證號、完整家庭地址等敏感資料。此介面為示意版，資料僅暫存於本機。
          </p>
        </section>

        <!-- Tab 2: 求助資訊列表 -->
        <section v-else-if="activeTab === 1" class="flex flex-col space-y-4 gap-3">
          <!-- 標題列 -->
          <div class="flex flex-wrap items-center justify-between gap-3 m-8">
            <h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Users class="w-5 h-5 text-indigo-500" />
              求助資訊列表
            </h2>
            <div class="flex items-center gap-2">
              <button @click="toggleNearby" :class="[
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all flex items-center gap-1',
                showNearby
                  ? 'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-[0_0_0_1px_rgba(79,70,229,0.08)]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              ]">
                <MapPin class="w-3 h-3" />
                {{ showNearby ? '僅顯示附近 5 公里' : '顯示所有求助' }}
              </button>
            </div>
          </div>

          <!-- 頁首分隔線，讓標題與列表之間有更明顯的區隔 -->
          <div class="flex h-px bg-slate-100 m-4"></div>

          <!-- 無資料時 -->
          <div v-if="filteredRequests.length === 0" class="text-center py-10 px-6 text-slate-400">
            <Users class="mx-auto mb-4 w-12 h-12 opacity-40" />
            <p class="text-sm">目前尚無求助資訊</p>
            <p class="text-[10px] mt-1">前往「發布求助」頁籤建立第一筆需求 🌱</p>
          </div>

          <!-- 列表 -->
          <div v-else class="space-y-4">
            <article v-for="req in filteredRequests" :key="req.id" class="rounded-2xl border border-slate-100 bg-slate-50/60 px-4 py-4 hover:bg-white hover:shadow-sm
         transition-all cursor-pointer leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500"
              @click="openRequest(req)" @keydown.enter.prevent="openRequest(req)" role="button" tabindex="0">
              <!-- 事件標題 -->
              <h3 class="font-semibold text-sm text-slate-900 mb-2">
                {{ req.title }}
              </h3>

              <!-- 地點與發佈時間 -->
              <div class="flex flex-col text-[10px] text-slate-500">
                <div class="flex items-center gap-1">
                  <MapPin class="w-3 h-3" />
                  <span>{{ req.location }}</span>
                </div>
                <div class="text-[9px] text-slate-400 mt-0.5">
                  {{ req.timestamp }}
                </div>
              </div>
            </article>
          </div>
          <!-- 詳細內容彈窗 -->
          <transition name="fade">
            <div v-if="selectedRequest" class="fixed inset-0 z-50" role="dialog" aria-modal="true"
              aria-labelledby="req-title">
              <!-- 背景遮罩 -->
              <div class="absolute inset-0 bg-black/40" @click="closeRequest"></div>

              <!-- 內容面板：手機底部抽屜、桌機置中卡片 -->
              <div class="absolute inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2
             md:-translate-x-1/2 md:-translate-y-1/2 md:w-[680px]
             bg-white rounded-t-2xl md:rounded-2xl shadow-xl
             p-6 max-h-[85vh] overflow-y-auto">
                <!-- 標題列 -->
                <div class="flex items-start justify-between gap-4 mb-4">
                  <h3 id="req-title" class="text-lg sm:text-xl font-semibold text-slate-900">
                    {{ selectedRequest.title }}
                  </h3>
                  <button @click="closeRequest" class="rounded-lg px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200">
                    關閉
                  </button>
                </div>

                <!-- 重要資訊列 -->
                <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600 mb-3">
                  <div class="flex items-center gap-1">
                    <MapPin class="w-4 h-4" />
                    <span>{{ selectedRequest.location }}</span>
                  </div>
                  <span class="text-slate-300">•</span>
                  <span class="text-slate-500">{{ selectedRequest.timestamp }}</span>

                  <template v-if="selectedRequest.distanceKm !== undefined">
                    <span class="text-slate-300">•</span>
                    <span>距離約 {{ selectedRequest.distanceKm.toFixed(1) }} 公里</span>
                  </template>

                  <template v-if="selectedRequest.urgency">
                    <span class="text-slate-300">•</span>
                    <span class="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-red-600">
                      緊急：{{ selectedRequest.urgency }}
                    </span>
                  </template>

                  <template v-if="selectedRequest.label">
                    <span class="text-slate-300">•</span>
                    <span class="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-indigo-600">
                      {{ selectedRequest.label }}
                    </span>
                  </template>
                </div>

                <!-- 內文 -->
                <div v-if="selectedRequest.content" class="prose prose-sm max-w-none text-slate-800">
                  <p class="whitespace-pre-line">{{ selectedRequest.content }}</p>
                </div>

                <!-- 聯絡方式 -->
                <div v-if="selectedRequest.contact" class="mt-6">
                  <div class="text-xs text-slate-500 mb-1">聯絡方式</div>
                  <div class="rounded-lg border border-slate-200 p-3 break-words text-slate-800 bg-slate-50">
                    {{ selectedRequest.contact }}
                  </div>
                </div>

                <!-- 行動按鈕 -->
                <div class="mt-6 flex items-center justify-end gap-3">
                  <button @click="closeRequest" class="rounded-lg px-4 py-2 bg-slate-100 hover:bg-slate-200">
                    先看看
                  </button>
                  <a v-if="selectedRequest.contact && selectedRequest.contact.startsWith('tel:')"
                    :href="selectedRequest.contact"
                    class="rounded-lg px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700">
                    直接撥打
                  </a>
                  <button v-else class="rounded-lg px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700">
                    我可以幫忙
                  </button>
                </div>
              </div>
            </div>
          </transition>

          <!-- 淡入淡出動畫 -->
          <style>
            .fade-enter-active,
            .fade-leave-active {
              transition: opacity .15s ease
            }

            .fade-enter-from,
            .fade-leave-to {
              opacity: 0
            }
          </style>
        </section>

        <!-- Tab 3: 地圖定位 -->
        <section v-else-if="activeTab === 2" class="space-y-4">
          <div
            class="bg-white/90 backdrop-blur shadow-sm rounded-2xl border border-slate-100 p-5 sm:p-6 transition-all">
            <h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Map class="w-5 h-5 text-indigo-500" />
              地圖定位與距離
            </h2>

            <div class="bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center space-y-3">
              <div v-if="userLocation" class="space-y-1">
                <MapPin class="mx-auto mb-2 w-10 h-10 text-indigo-500" />
                <p class="text-sm font-medium text-slate-800">目前座標（僅用於距離計算）</p>
                <p class="text-[10px] text-slate-500">
                  緯度 {{ userLocation.lat.toFixed(6) }}・經度 {{ userLocation.lng.toFixed(6) }}
                </p>
              </div>
              <div v-else class="space-y-2">
                <MapPin class="mx-auto mb-2 w-10 h-10 text-slate-300" />
                <p class="text-sm text-slate-600">正在嘗試取得您的位置...</p>
                <p class="text-[10px] text-slate-500">
                  請於瀏覽器允許「位置存取」，以顯示與求助資訊的距離。
                </p>
              </div>

              <div v-if="userLocation && helpRequests.length > 0" class="mt-4 text-left space-y-2">
                <p class="text-xs font-medium text-slate-700">
                  求助地點與距離（依照發布順序顯示）
                </p>
                <div v-for="req in helpRequests" :key="req.id"
                  class="bg-white rounded-xl px-3 py-2 border border-slate-100 text-[10px]">
                  <p class="font-semibold text-slate-900 text-xs mb-0.5">
                    {{ req.title }}
                  </p>
                  <p class="flex items-center gap-1 text-slate-600 mb-0.5">
                    <MapPin class="w-3 h-3 text-indigo-500" />
                    {{ req.location }}
                  </p>
                  <p class="text-slate-500">
                    約
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

              <div v-else-if="helpRequests.length === 0" class="pt-1">
                <p class="text-[10px] text-slate-500">
                  尚無求助資料可顯示距離，請先於「發布求助」新增一筆資訊。
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- 底部 Tab 導航 -->
    <nav
      class="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-4px_12px_rgba(15,23,42,0.04)]">
      <div class="max-w-4xl mx-auto flex">
        <button v-for="(tab, index) in tabs" :key="index" @click="activeTab = index" :class="[
          'flex-1 py-2.5 sm:py-3 flex flex-col items-center gap-1 text-[10px] sm:text-xs transition-all',
          activeTab === index
            ? 'text-indigo-600'
            : 'text-slate-500 hover:text-slate-800'
        ]">
          <div :class="[
            'w-8 h-8 flex items-center justify-center rounded-2xl border text-xs mb-0.5 transition-all',
            activeTab === index
              ? 'bg-indigo-50 border-indigo-200 shadow-sm'
              : 'bg-slate-50 border-slate-200'
          ]">
            <component :is="tab.icon" class="w-4 h-4" />
          </div>
          <span class="font-medium tracking-tight">{{ tab.name }}</span>
        </button>
      </div>
    </nav>

    <!-- Toast -->
    <transition name="fade-up">
      <div v-if="toastMessage"
        class="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-slate-900/90 text-white text-xs rounded-full shadow-lg z-50">
        {{ toastMessage }}
      </div>
    </transition>
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

const activeTab = ref (0);
const formData = reactive({
  title: '',
  content: '',
  location: '',
  contact: ''
});
const helpRequests = ref<HelpRequest[]>([]);
const showNearby = ref(false);
const userLocation = ref<UserLocation | null>(null);
const toastMessage = ref<string | null>(null);
let toastTimer: number | null = null;

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
      () => {
        console.log('無法獲取位置');
      }
    );
  }
});

// Toast
const showToast = (msg: string) => {
  toastMessage.value = msg;
  if (toastTimer) window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastMessage.value = null;
  }, 1800);
};

// 計算兩點之間的距離（公里）
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 發布求助
const handleSubmit = () => {
  if (!formData.title || !formData.content || !formData.location) {
    showToast('請填寫所有必填欄位');
    return;
  }

  const lat =
    userLocation.value?.lat ?? 25.033 + (Math.random() - 0.5) * 0.1;
  const lng =
    userLocation.value?.lng ?? 121.5654 + (Math.random() - 0.5) * 0.1;

  const newRequest: HelpRequest = {
    id: Date.now(),
    title: formData.title.trim(),
    content: formData.content.trim(),
    location: formData.location.trim(),
    contact: formData.contact.trim() || undefined,
    timestamp: new Date().toLocaleString('zh-TW'),
    lat,
    lng
  };

  helpRequests.value = [newRequest, ...helpRequests.value];

  formData.title = '';
  formData.content = '';
  formData.location = '';
  formData.contact = '';

  showToast('求助資訊已發布');
  activeTab.value = 1;
};

// 切換附近 5 公里
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

<style scoped>
/* Toast 動畫 */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.2s ease-out;
}

.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translate(-50%, 8px);
}
</style>
