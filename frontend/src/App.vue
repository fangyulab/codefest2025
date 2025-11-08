<template>
  <div class="min-h-screen w-full bg-gray-50 text-slate-900 flex flex-col">
    <!-- 主內容 -->
    <main class="flex-1 w-full">
      <div class="max-w-4xl mx-auto px-4 pt-4 pb-24">
        <!-- 內容卡片 -->

        <!-- Tab 1: 發布求助表單 -->
        <section v-if="activeTab === 0" class="flex flex-col gap-3 space-y-5">
          <div class="flex flex-wrap items-center justify-between gap-3 m-8">
            <h2 class="text-xl font-semibold text-[#468D9B] flex items-center gap-2">
              <Icon icon="ant-design:notification-filled" class="size-6" />
              發出求助訊息
            </h2>
          </div>
          <div class="flex h-px bg-slate-100 m-4"></div>

          <div class="grid gap-4">
            <div class="text-base font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
              <div class = "flex items-center gap-2">
                <Icon icon="tabler:sos" class="size-5" />
                求助標題 *
              </div>    
              <input
                type="text"
                v-model="formData.title"
                class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200
                        focus:outline-none focus:ring-2 focus:ring-[#93D4DF]
                        placeholder:text-slate-300 transition-all"
                placeholder="有人跟蹤我"
              />
            </div>
            <div class="grid sm:grid-cols-[2fr,1fr] gap-4">
              <div class="text-base font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                <div class = "flex items-center gap-2">
                  <Icon icon="fluent:location-20-filled" class="size-5" />
                  求助內容
                </div>  
                <textarea
                  v-model="formData.content"
                  :rows="4"
                  class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                          focus:outline-none focus:ring-2 focus:ring-[#93D4DF]
                          placeholder:text-slate-300 transition-all resize-none"
                  placeholder="請清楚說明狀況、時間地點與需要的協助，例如：搬運時間、樓層、有無電梯等"
                />
              </div>
            </div>

            <div class="grid sm:grid-cols-[2fr,1fr] gap-4">
              <div class="text-base font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                <div class = "flex items-center gap-2">
                  <Icon icon="fluent:location-20-filled" class="size-5" />
                  定位 *
                </div>  
                <input
                  type="text"
                  v-model="formData.location"
                  class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                          focus:outline-none focus:ring-2 focus:ring-[#93D4DF]
                          placeholder:text-slate-300 transition-all" placeholder="例：台北市大安區信義路三段、學校側門附近" />
              </div>
              <div class="text-base font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                <div class = "flex items-center gap-2">
                  <Icon icon="gridicons:phone" class="size-5" />
                  聯絡方式
                </div> 
                <input
                  type="text"
                  v-model="formData.contact"
                  class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                          focus:outline-none focus:ring-2 focus:ring-[#93D4DF]
                          placeholder:text-slate-300 transition-all"
                  placeholder="手機、LINE ID 或其他安全聯絡方式"
                />
              </div>
            </div>

            <div class=" text-base font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <Icon icon="si:alert-fill" class="size-5" />
                緊急程度
              </div>

              <div class="flex flex-row mt-2 text-sm space-y-1.5 justify-around">
                <div
                  v-for="option in urgencyOptions"
                  :key="option.value"
                  class="flex items-center gap-2 p-2 rounded-xl transition-colors cursor-pointer"
                  :class="[
                    formData.urgency === option.value 
                      ? 'font-medium' 
                      : 'text-slate-600 hover:bg-slate-50',
                    option.value === '1' && formData.urgency === '1' ? 'text-[#D45251]' : '',
                    option.value === '2' && formData.urgency === '2' ? 'text-[#FD853A]' : '',
                    option.value === '3' && formData.urgency === '3' ? 'text-[#F5BA4B]' : '',
                  ]"
                  @click="formData.urgency = option.value"
                >
                  <input
                    type="radio"
                    class="hidden"
                    name="urgency"
                    :value="option.value"
                    v-model="formData.urgency"
                  />
                  <span class="inline-block w-2.5 h-2.5 rounded-full border "
                    :class="formData.urgency === option.value ? 'bg-[#93D4DF] border-[#93D4DF]' : 'border-slate-300'">
                  </span>
                  <span>{{ option.label }}</span>
                </div>
              </div>
            </div>
          </div>


          <button
            @click="handleSubmit"
            class="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#71C5D5] text-white py-3
                    text-sm font-semibold shadow-sm active:scale-[0.99] transition-all"
          >
            <Icon icon="streamline:send-email-solid"/>
            發布
          </button>
          <p class="text-[10px] text-slate-400 leading-relaxed">
            *本平台之所有貼文雖以匿名方式公開顯示，但系統內部仍保留使用者之實名制註冊資料，以確保必要時可追溯來源。
            若經查證有違規行為，本平台有權依規定採取相應措施，並配合相關單位進行調查。
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
                'px-3 py-1.5 rounded-full text-xs font-medium  transition-all flex items-center gap-1',
                showNearby
                  ? 'bg-indigo-50 text-indigo-600  shadow-[0_0_0_1px_rgba(79,70,229,0.08)]'
                  : 'bg-slate-50 text-slate-600  hover:bg-slate-100'
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
            <p class="text-base">目前尚無求助資訊</p>
            <p class="text-[10px] mt-1">前往「發布求助」頁籤建立第一筆需求 🌱</p>
          </div>

          <!-- 列表 -->
          <div v-else class="flex flex-col gap-3 px-4 py-6">
            <article v-for="req in filteredRequests" :key="req.id" :class="[
              'rounded-3xl px-5 py-4 border shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all cursor-pointer leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md',
              req.isMine
                ? 'bg-[#DBF1F5] border-[#B4E2EA]'
                : 'bg-[#FCF2DF] border-[#F8E3BC]'
            ]" @click="openRequest(req)" @keydown.enter.prevent="openRequest(req)" role="button" tabindex="0">
              <!-- 標題 -->
              <h3 class="font-semibold text-sm text-slate-900 mb-3">
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

    <!-- 求助詳細內容彈窗 -->
    <transition name="fade-up">
      <div v-if="isModalOpen"
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm"
        @click.self="closeRequest">
        <div :class="[
          'w-full max-w-md mx-4 rounded-3xl shadow-xl p-6 relative border transition-all',
          selectedRequest?.isMine
            ? 'bg-[#DBF1F5] border-[#B4E2EA]'
            : 'bg-[#FCF2DF] border-[#F8E3BC]'
        ]">
          <!-- 關閉按鈕 -->
          <button class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            @click="closeRequest" aria-label="close">
            <Icon icon="mdi:close" class="w-5 h-5" />
          </button>

          <!-- 內容區：顯示被點擊的求助 -->
          <div v-if="selectedRequest" class="flex flex-col gap-5 text-sm text-slate-800">
            <!-- 標題 + 時間 -->
            <header class="space-y-1 pr-6">
              <h3 class="text-base font-semibold text-slate-900 leading-snug">
                {{ selectedRequest.title }}
              </h3>
              <p class="text-[11px] text-slate-400">
                發布時間：{{ selectedRequest.timestamp }}
              </p>
            </header>

            <!-- 基本資訊：地點 / 距離 -->
            <section class="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3 space-y-2 text-[12px]">
              <div class="flex items-start gap-2">
                <MapPin class="w-4 h-4 mt-0.5 text-indigo-500 shrink-0" />
                <div class="leading-relaxed">
                  <span class="font-medium text-slate-800">地點：</span>
                  <span class="text-slate-700">
                    {{ selectedRequest.location }}
                  </span>
                </div>
              </div>

              <div v-if="userLocation" class="flex items-center gap-2 pl-6 text-[11px]">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                  約
                  {{
                    calculateDistance(
                      userLocation.lat,
                      userLocation.lng,
                      selectedRequest.lat,
                      selectedRequest.lng
                    ).toFixed(2)
                  }}
                  公里內
                </span>
              </div>
            </section>


            <!-- 求助內容 -->
            <section class="space-y-1">
              <p class="text-[13px] leading-relaxed whitespace-pre-line text-slate-700">
                {{ selectedRequest.content }}
              </p>
            </section>



            <!-- 聯絡方式（如果有填） -->
            <div v-if="selectedRequest.contact" class="flex flex-wrap items-center gap-2 text-[13px] text-slate-700">
              <p class="font-medium text-slate-800 m-0">聯絡方式：</p>
              <p class="break-words">
                {{ selectedRequest.contact }}
              </p>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">
              請自行斟酌聯絡與資訊安全，避免提供過多個資。
            </p>
          </div>

          <!-- 保險 fallback -->
          <div v-else class="h-32 flex items-center justify-center text-xs text-slate-400">
            尚未選取任何求助貼文
          </div>

          <!-- ✅ 只有自己的貼文才顯示 -->
          <div v-if="selectedRequest?.isMine"
            class="mt-8 -mb-6 -mx-6 border-t border-slate-300/40 bg-white/30 backdrop-blur-sm rounded-b-3xl">
            <button @click="markAsResolved(selectedRequest.id)"
              class="w-full py-4 text-sm font-medium text-slate-700 tracking-tight active:scale-[0.99] transition-all rounded-b-3xl">
              標記為已解決
            </button>
          </div>
        </div>
      </div>
    </transition>


    <!-- 底部 Tab 導航 -->
    <nav
      class="fixed bottom-0 left-0 right-0 z-20 flex justify-center pb-4"
    >
      <div class="relative w-full max-w-md px-4">
        <div
          class="relative m-2 mt-0 mb-1 flex items-center gap-2 rounded-full
                 bg-[#DBF1F5] px-3 py-2 h-14"
        >
          <div
            class="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-1/3
                   rounded-full bg-[#71C5D5] shadow-md transition-transform duration-300"
            :class="translateClass"
          />

          <button
            v-for="(tab, index) in tabs"
            :key="tab.name"
            @click="activeTab = index"
            class="relative z-10 flex-1 flex flex-col items-center gap-0.5 py-1"
          >
            <Icon
              :icon="tab.icon"
              :class="activeTab === index ? 'text-white size-8' : 'text-[#356C77] size-7'"
            />
          </button>
        </div>
      </div>
    </nav>

    <!-- Toast -->
    <transition name="fade-up">
      <div v-if="toastMessage"
        class="fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2.5 bg-[#356C77] text-white text-xs rounded-full shadow-lg z-50">
        {{ toastMessage }}
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { MapPin, Users, Map, Send } from 'lucide-vue-next';
import { Icon } from '@iconify/vue';

interface HelpRequest {
  id: number;
  title: string;
  content: string;
  location: string;
  contact?: string;
  urgency?: string;
  timestamp: string;
  distanceKm?: number;
  lat: number;
  lng: number;
  isMine: boolean; // ✅ 新增：是不是我自己發的
  isResolved: boolean; // ✅ 新增
}

interface UserLocation {
  lat: number;
  lng: number;
}

const selectedRequest = ref<HelpRequest | null>(null);


const activeTab = ref(0);
const formData = reactive({
  title: '',
  content: '',
  location: '',
  contact: ''
});
//const helpRequests = ref<HelpRequest[]>([]);

const helpRequests = ref<HelpRequest[]>([
  {
    id: 1,
    title: '（範例）鄰居需要幫忙搬東西',
    content: '幫忙把幾箱物資搬到一樓電梯口，預計 19:00 前完成即可，謝謝。',
    location: '台北市信義區光復南路附近',
    contact: 'line：neighbor-help',
    timestamp: new Date().toLocaleString('zh-TW'),
    lat: 25.033,
    lng: 121.5654,
    urgency:'2',
    isMine: false, // ✅ 這筆是「別人發的」，等等會變成黃底
    isResolved: false // ✅ 新增
  },


  {
    id: 2,
    title: '（範例）鄰居需要幫忙搬東西',
    content: '幫忙把幾箱物資搬到一樓電梯口，預計 19:00 前完成即可，謝謝。',
    location: '台北市信義區光復南路附近',
    contact: 'line：neighbor-help',
    timestamp: new Date().toLocaleString('zh-TW'),
    lat: 26.033,
    lng: 123.5654,
    urgency:'2',
    isMine: false, // ✅ 這筆是「別人發的」，等等會變成黃底
    isResolved: false // ✅ 新增
  }
]);

const showNearby = ref(false);
const userLocation = ref<UserLocation | null>(null);
const toastMessage = ref<string | null>(null);
let toastTimer: number | null = null;

const urgencyOptions = [
  {
    value: '1',
    label: '極度緊急',
    activeClass: 'bg-red-50 text-red-600 border-red-200 shadow-sm',
    dotClass: 'bg-red-500'
  },
  {
    value: '2',
    label: '高度緊急',
    activeClass: 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm',
    dotClass: 'bg-orange-500'
  },
  {
    value: '3',
    label: '中度緊急',
    activeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm',
    dotClass: 'bg-yellow-500'
  }
];

const openRequest = (req: HelpRequest) => {
  // 計算距離（如果有 userLocation）
  let distanceKm: number | undefined = undefined;
  if (userLocation.value) {
    distanceKm = calculateDistance(
      userLocation.value.lat,
      userLocation.value.lng,
      req.lat,
      req.lng
    );
  }

  selectedRequest.value = {
    ...req,
    distanceKm
  };
};

const closeRequest = () => {
  selectedRequest.value = null;
};

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

const tabs = [
  { name: '發布求助', icon: 'tabler:sos' },
  { name: '求助資訊', icon: 'tabler:users' },
  { name: '地圖定位', icon: 'tabler:map-pin' }
];

const translateClass = computed(() => {
  if (activeTab.value === 0) return 'translate-x-0';
  if (activeTab.value === 1) return 'translate-x-[95%]';
  return 'translate-x-[190%]';
});

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
    urgency: formData.urgency,
    contact: formData.contact.trim() || undefined,
    timestamp: new Date().toLocaleString('zh-TW'),
    lat,
    lng,
    isMine: true // ✅ 自己送出的永遠標記為「我發的」
  };

  helpRequests.value = [newRequest, ...helpRequests.value];

  formData.title = '';
  formData.content = '';
  formData.location = '';
  formData.contact = '';

  showToast('求助資訊已發布');
  activeTab.value = 1;

  // ✅ 標記為已解決 → 移除該筆貼文
  const markAsResolved = (id: number) => {
    helpRequests.value = helpRequests.value.filter(req => req.id !== id);
    closeRequest();
    showToast('貼文已標記為已解決');
  };
};

// 切換附近 5 公里
const toggleNearby = () => {
  showNearby.value = !showNearby.value;
};


// 過濾顯示的求助資訊
// const filteredRequests = computed(() => {
//   if (showNearby.value && userLocation.value) {
//     return helpRequests.value.filter((req) => {
//       const distance = calculateDistance(
//         userLocation.value!.lat,
//         userLocation.value!.lng,
//         req.lat,
//         req.lng
//       );
//       return distance <= 5;
//     });
//   }
//   return helpRequests.value;
// });

const filteredRequests = computed(() => {
  let list = helpRequests.value.filter(req => !req.isResolved);

  if (showNearby.value && userLocation.value) {
    list = list.filter((req) => {
      const distance = calculateDistance(
        userLocation.value!.lat,
        userLocation.value!.lng,
        req.lat,
        req.lng
      );
      return distance <= 5;
    });
  }

  // ✅ 自己發的先顯示在上面，其次再照 id（時間）排序
  return [...list].sort((a, b) => {
    if (a.isMine === b.isMine) {
      return b.id - a.id; // 新的在上面
    }
    return a.isMine ? -1 : 1; // true 在前面
  });
});



const markAsResolved = (id: number) => {
  const target = helpRequests.value.find(req => req.id === id);
  if (target) {
    target.isResolved = true; // ✅ 標記為已解決，會觸發 transition-group 的離場動畫
  }
  closeRequest();
  showToast('貼文已標記為已解決');
};
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

/* 卡片列表淡入淡出 */
.card-fade-enter-active,
.card-fade-leave-active {
  transition: all 0.25s ease;
}

.card-fade-enter-from,
.card-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}
</style>
