<!-- App.vue -->
<template>
  <div class="w-full h-screen text-slate-900 flex justify-center">
    <div class="max-w-2xl w-full bg-gray-50 h-full flex flex-col">
      <!-- main + nav -->
      <!-- 主內容 -->
      <main class="w-full flex-1 overflow-y-auto">
        <div class="mx-auto px-4 pt-4 pb-28">
          <!-- 內容卡片 -->

          <!-- Tab 1: 發布求助表單 -->
          <section v-if="activeTab === 0" class="flex flex-col gap-3 space-y-5">
            <div class="flex flex-wrap items-center justify-between gap-3 m-8">
              <h2 class="text-xs font-semibold text-slate-900 flex items-center gap-2">
                <Icon icon="iconamoon:edit-fill" class="size-3 text-[#468D9B]" />
                求助訊息填寫
              </h2>
            </div>
            <div class="flex h-px bg-slate-100 m-4"></div>

            <div class="grid gap-4 px-4">
              <div class="text-xs font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <Icon icon="tabler:sos" class="size-5" />
                  求助標題 *
                </div>
                <input type="text" v-model="formData.title" class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200
                          focus:outline-none focus:ring-2 focus:ring-[#93D4DF]
                          placeholder:text-slate-300 transition-all" placeholder="有人跟蹤我" />
              </div>
              <div class="grid sm:grid-cols-[2fr,1fr] gap-4">
                <div class="text-xs font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <Icon icon="solar:chat-dots-bold" class="size-5" />
                    求助內容
                  </div>
                  <textarea v-model="formData.content" :rows="4" class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                            focus:outline-none focus:ring-2 focus:ring-[#93D4DF]
                            placeholder:text-slate-300 transition-all resize-none"
                    placeholder="請清楚說明狀況、時間地點與需要的協助，例如：搬運時間、樓層、有無電梯等" />
                </div>
              </div>

              <div class="grid sm:grid-cols-[2fr,1fr] gap-4">
                <div class="text-xs font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <Icon icon="fluent:location-20-filled" class="size-5" />
                    定位 *
                  </div>
                  <input type="text" v-model="formData.locationText" class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                            focus:outline-none focus:ring-2 focus:ring-[#93D4DF]
                            placeholder:text-slate-300 transition-all" placeholder="例：台北市大安區信義路三段、學校側門附近" />
                  <button @click="catchLocation" class="flex-shrink-0 mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#93D4DF] text-[10px] font-medium text-[#356C77] text-center">
                    套用現在位置
                  </button>
                </div>
                <div class="text-xs font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <Icon icon="gridicons:phone" class="size-5" />
                    聯絡方式
                  </div>
                  <input type="text" v-model="formData.contact" class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                            focus:outline-none focus:ring-2 focus:ring-[#93D4DF]
                            placeholder:text-slate-300 transition-all" placeholder="手機、LINE ID 或其他安全聯絡方式" />
                </div>
              </div>

              <div class=" text-xs font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <Icon icon="si:alert-fill" class="size-5" />
                  緊急程度
                </div>

                <div class="flex flex-row mt-2 text-sm space-y-1.5 justify-around">
                  <div v-for="option in urgencyOptions" :key="option.value"
                    class="flex items-center gap-2 p-2 rounded-xl transition-colors cursor-pointer" :class="[
                      formData.urgency === option.value
                        ? 'font-medium'
                        : 'text-slate-600 hover:bg-slate-50',
                      option.value === 1 && formData.urgency === 1 ? 'text-[#D45251]' : '',
                      option.value === 2 && formData.urgency === 2 ? 'text-[#FD853A]' : '',
                      option.value === 3 && formData.urgency === 3 ? 'text-[#F5BA4B]' : '',
                    ]" @click="formData.urgency = option.value">
                    <input type="radio" class="hidden" name="urgency" :value="option.value"
                      v-model="formData.urgency" />
                    <span class="inline-block w-2.5 h-2.5 rounded-full border"
                      :class="formData.urgency === option.value ? 'bg-[#93D4DF] border-[#93D4DF]' : 'border-slate-300'">
                    </span>
                    <span class="text-xs">{{ option.label }}</span>
                  </div>
                </div>
              </div>

              <div class=" text-xs font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <Icon icon="material-symbols:tag-rounded" class="size-5" />
                  事件類別
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="opt in incidentTags.slice(1)"
                    :key="opt.key"
                    type="button"
                    @click="toggleIncidentLabel(opt.key)"
                    :class="[
                      'px-2.5 py-1 rounded-full border text-[10px] transition-all',
                      formData.incidentLabels.includes(opt.key)
                        ? 'bg-[#71C5D5] text-white border-[#71C5D5]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    ]"
                  >
                    {{ opt.label }}
                  </button>
                </div>
              </div>
            </div>

            <div class="h-1"></div>

            <button @click="handleSubmit" :disabled="isSubmitting"
              class="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#71C5D5] text-white py-2 px-8
                      text-xs font-semibold shadow-sm active:scale-[0.99] transition-all">
              <Icon icon="streamline:send-email-solid" />
              {{ isSubmitting ? '發布中...' : '發布' }}
            </button>
            <p class="text-[10px] text-slate-400 leading-relaxed">
              *本平台之所有貼文雖以匿名方式公開顯示，但系統內部仍保留使用者之實名制註冊資料，以確保必要時可追溯來源。
              若經查證有違規行為，本平台有權依規定採取相應措施，並配合相關單位進行調查。
            </p>
          </section>

          <!-- Tab 2: 求助資訊列表 -->
          <section v-else-if="activeTab === 1" class="flex flex-col space-y-4 gap-3 w-full">
            <!-- 標題列 -->
            <div class="flex flex-wrap items-center justify-between gap-3 m-8">
              <h2 class="text-xs font-semibold text-slate-900 flex items-center gap-2">
                <Icon icon="fa:users" class="size-3 text-[#468D9B]" />
                求助資訊列表
              </h2>
              <div class="flex items-center gap-2">
                <button @click="toggleNearby" :class="[
                  'px-3 py-1 rounded-full text-xs font-medium  transition-all flex items-center gap-1',
                  showNearby
                    ? 'bg-slate-50 text-slate-600  hover:bg-slate-100'
                    : 'bg-[#71C5D5] text-white'
                ]">
                  <Icon icon="fluent:location-20-filled" class="size-3" />
                  {{ showNearby ? '顯示附近 1 公里' : '顯示所有求助' }}
                </button>
              </div>
            </div>

            <div class="flex h-px bg-slate-100 m-4"></div>

            <!-- 篩選 icon -->
            <button @click="toggleFilter" class="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <Icon icon="mi:filter" class="w-5 h-5" />
            </button>

            <!-- 篩選區塊（可收合） -->
            <transition name="fade-slide">
              <div v-if="showFilterBar" class="px-4 flex flex-col gap-1.5 mt-1 overflow-hidden">
                <!-- 行政區 -->
                <div class="flex items-center gap-1.5 text-[10px] text-slate-500 overflow-x-auto no-scrollbar py-0.5">
                  <span class="font-medium text-slate-700 flex-shrink-0 mr-1">行政區</span>
                  <div class="flex flex-nowrap gap-1.5">
                    <button v-for="tag in districtTags" :key="tag.key" @click="selectedDistrict = tag.key" :class="[
                      'px-2.5 py-1 rounded-full border text-[10px] flex-shrink-0 transition-all whitespace-nowrap',
                      selectedDistrict === tag.key
                        ? 'bg-[#71C5D5] text-white border-[#71C5D5]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    ]">
                      {{ tag.label }}
                    </button>
                  </div>
                </div>

                <!-- 事件 -->
                <div class="flex items-center gap-1.5 text-[10px] text-slate-500 overflow-x-auto no-scrollbar py-0.5">
                  <span class="font-medium text-slate-700 flex-shrink-0 mr-1">事件</span>
                  <div class="flex flex-nowrap gap-1.5">
                    <button v-for="tag in incidentTags" :key="tag.key" @click="selectedIncident = tag.key" :class="[
                      'px-2.5 py-1 rounded-full border text-[10px] flex-shrink-0 transition-all whitespace-nowrap',
                      selectedIncident === tag.key
                        ? 'bg-[#71C5D5] text-white border-[#71C5D5]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    ]">
                      {{ tag.label }}
                    </button>
                  </div>
                </div>
              </div>
            </transition>

            <!-- 載入中 -->
            <div v-if="isLoading" class="flex flex-col text-center items-center justify-center py-10 px-6 text-slate-400 gap-2">
              <Icon icon="svg-spinners:ring-resize" class="mx-auto mb-4 size-4" />
              <p class="text-xs">載入中...</p>
            </div>

            <!-- 無資料時 -->
            <div v-else-if="filteredRequests.length === 0" class="text-center py-10 px-6 text-slate-400">
              <p class="text-xs">目前尚無求助資訊</p>
            </div>

            <!-- 列表 -->
            <div v-else class="flex flex-col gap-3 px-4">
              <article v-for="req in filteredRequests" :key="req.id" :class="[
                'rounded-xl px-4 py-2 transition-all cursor-pointer leading-relaxed flex flex-col gap-1',
                req.isMine
                  ? 'bg-white border-[#71C5D5] border-1'
                  : 'bg-[#DBF1F5] border-none'
              ]" @click="openRequest(req)" @keydown.enter.prevent="openRequest(req)" role="button" tabindex="0">
                <!-- 標題 -->
                <div class="flex flex-row justify-between items-center">
                  <h3 class="font-semibold text-sm text-slate-900 mb-3">
                    {{ req.title }}
                  </h3>
                  <div class="flex flex-row gap-1">
                    <div v-for="tag in req.labels" class="px-2 py-0.5 rounded-full border text-[10px] flex-shrink-0 transition-all whitespace-nowrap border-[#71C5D5] text-[#71C5D5] ">
                      {{ tag }}
                    </div>
                  </div>
                </div>
                <!-- 地點與發佈時間 -->
                <div class="flex flex-col text-[10px] text-slate-500">
                  <div class="flex items-center gap-1">
                    <Icon icon="fluent:location-20-filled" class="size-4" :class="[req.urgency === 1 ? 'text-[#D45251]' : '',
                    req.urgency === 2 ? 'text-[#FD853A]' : '',
                    req.urgency === 3 ? 'text-[#F5BA4B]' : '']" />
                    <span>{{ req.locationText }}</span>
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
            <MapPage
              :help-requests="helpRequests"
              :user-location="userLocation"
              @open-request="openRequest"  
            />
          </section>


        </div>
      </main>


      <!-- 求助詳細內容彈窗 -->
      <transition name="fade-up">
        <div
          v-if="isModalOpen"
          class="fixed inset-0 z-2000 flex items-center justify-center bg-slate-900/40"
          @click.self="closeRequest"
        >
          <div
            :class="[
              ' mx-4 rounded-3xl relative border transition-all max-w-[80vw]',
              selectedRequest && selectedRequest.isMine
                ? 'bg-white border-[#B4E2EA]'
                : 'bg-[#DBF1F5] border-none'
            ]"
          >
            <!-- 關閉按鈕 -->
            <button
              class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              @click="closeRequest"
              aria-label="close"
            >
              <Icon icon="mdi:close" class="w-5 h-5" />
            </button>

            <!-- 有選取貼文時 -->
            <div v-if="selectedRequest" class="flex flex-col ">
              <!-- 標題 + 時間 -->
              <div class="p-6 flex flex-col gap-5 text-sm text-slate-800">
                <header class="space-y-1 pr-6">
                  <h3 class="text-base font-semibold text-slate-900 leading-snug">
                    {{ selectedRequest.title }}
                  </h3>
                  <p class="text-[11px] text-slate-400">
                    發布時間：{{ selectedRequest.timestamp }}
                  </p>
                </header>

                <!-- 地點 / 距離 -->
                <section
                  class="rounded-xl bg-slate-50 border border-slate-100 px-3.5 py-3 space-y-2 text-[12px] flex flex-col gap-1"
                >
                  <div class="flex items-start gap-2">
                    <Icon
                      icon="fluent:location-20-filled"
                      class="size-4"
                      :class="[
                        selectedRequest.urgency === 1 ? 'text-[#D45251]' : '',
                        selectedRequest.urgency === 2 ? 'text-[#FD853A]' : '',
                        selectedRequest.urgency === 3 ? 'text-[#F5BA4B]' : ''
                      ]"
                    />
                    <div class="leading-relaxed">
                      <span class="text-slate-700">
                        {{ selectedRequest.locationText }}
                      </span>
                    </div>
                  </div>

                  <div
                    v-if="selectedRequest.distance_text"
                    class="flex items-center gap-2 pl-6 text-[11px]"
                  >
                    <span
                      class="inline-flex items-center px-2 py-0.5 rounded-full bg-[#71C5D5] text-white font-medium"
                    >
                      {{ selectedRequest.distance_text }}
                    </span>
                  </div>
                </section>

                <!-- 求助內容 -->
                <div class="gap-1">
                  <section class="space-y-1">
                    <p
                      class="text-[13px] leading-relaxed whitespace-pre-line text-slate-700"
                    >
                      {{ selectedRequest.content }}
                    </p>
                  </section>

                  <!-- 聯絡方式 -->
                  <div
                    v-if="selectedRequest.contact"
                    class="flex flex-wrap items-center gap-2 text-[13px] text-slate-700"
                  >
                    <p class="font-medium text-slate-800 m-0">聯絡方式：</p>
                    <p class="break-words">
                      {{ selectedRequest.contact }}
                    </p>
                  </div>
                  <p class="text-[10px] text-slate-400 mt-1">
                    *請自行斟酌聯絡與資訊安全，注意自身安全！
                  </p>
                </div>

                <!-- 願意幫助人數 -->
                <div
                  v-if="selectedRequest.helper_count && selectedRequest.helper_count > 0"
                  class="flex items-center gap-2 text-[12px] text-slate-600"
                >
                  <Icon icon="mdi:account-multiple" class="size-4" />
                  <span>{{ selectedRequest.helper_count }} 人表示願意提供協助</span>
                </div>
              </div>

              <!-- ✅ 自己的貼文：標記為已解決 -->
              <div
                v-if="selectedRequest.isMine"
                class="mt-8 -mb-6 -mx-6 border-2 border-slate-300/40 bg-white/30 rounded-b-3xl"
              >
                <button
                  @click="markAsResolved(selectedRequest.id)"
                  :disabled="isResolving"
                  class="w-full py-4 text-sm font-medium text-slate-700 tracking-tight active:scale-[0.99] transition-all rounded-b-3xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ isResolving ? '處理中...' : '標記為已解決' }}
                </button>
              </div>

              <!-- 別人的貼文：我要幫助他 + Google Map -->
              <div
                v-else
                class="mt-8 -mb-6 -mx-6 border-2 border-slate-300/40 bg-[#DBF1F5]/50 rounded-b-3xl"
              >
                <div class="flex w-full">
                  <button
                    @click="helpRequest(selectedRequest.id)"
                    :disabled="isHelping"
                    class="flex-1 py-4 text-sm font-medium text-[#356C77] border-r border-slate-300/30 
                          tracking-tight active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isHelping ? '通知中...' : '我要幫助他' }}
                  </button>

                  <button
                    v-if="selectedRequest.lat && selectedRequest.lng"
                    @click="openGoogleMap(selectedRequest.lat, selectedRequest.lng)"
                    class="flex-1 py-4 text-sm font-medium text-[#356C77] tracking-tight 
                          active:scale-[0.99] transition-all rounded-br-3xl"
                  >
                    進入 Google Map
                  </button>
                </div>
              </div>
            </div>

            <!-- 沒有選取任何貼文時 -->
            <div
              v-else
              class="h-32 flex items-center justify-center text-xs text-slate-400"
            >
              尚未選取任何求助貼文
            </div>
          </div>
        </div>
      </transition>



      <!-- 底部 Tab 導航 -->
      <nav class="fixed bottom-0 left-0 right-0 z-20 flex justify-center">
        <div class="relative w-full max-w-md p-4">
          <div class="relative m-2 mt-0 mb-1 flex items-center justify-center gap-2 rounded-full
                  bg-[#DBF1F5] px-3 py-2 h-14">
            <div class="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-1/3
                    rounded-full bg-[#71C5D5] shadow-md transition-transform duration-300" :class="translateClass" />

            <button v-for="(tab, index) in tabs" :key="tab.name" @click="activeTab = index"
              class="relative z-10 flex-1 flex flex-col items-center gap-0.5 py-1">
              <Icon :icon="tab.icon" :class="activeTab === index ? 'text-white size-6' : 'text-[#356C77] size-5'" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { MapPin, Users, Map, Send } from 'lucide-vue-next';
import { Icon } from '@iconify/vue';
import MapPage from './pages/MapPage.vue';

// ==================== API 配置 ====================
const API_BASE_URL = 'https://flask-demo-188795468423.asia-east1.run.app/api';

const getUserIdFromUrl = (): number => {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get('user_id');
  return userId ? parseInt(userId, 10) : 1;
};

const CURRENT_USER_ID = getUserIdFromUrl();

// ==================== 型別定義 ====================
interface HelpRequest {
  id: number;
  title: string;
  content: string;
  location: string; // 後端是 "緯度,經度" 格式
  locationText?: string; // 前端顯示用的地址文字
  contact: string;
  urgency: number; // 後端是 number (1/2/3)
  timestamp: string;
  latitude: number;
  longitude: number;
  lat: number; // 給地圖用
  lng: number; // 給地圖用
  isMine: boolean;
  resolved: boolean;
  distance?: number;
  distance_text?: string;
  helper_count?: number;
  labels?: string[];
}

interface UserLocation {
  lat: number;
  lng: number;
}



// ==================== API 函式 ====================
const fetchPosts = async () => {
  try {
    isLoading.value = true;

    const params = new URLSearchParams({
      user_id: String(CURRENT_USER_ID)
    });


    if (userLocation.value) {
      params.append('location', `${userLocation.value.lat},${userLocation.value.lng}`);
    }


    if (showNearby.value) {
      params.append('distance', '1');
    }

    const response = await fetch(`${API_BASE_URL}/posts?${params}`);
    const data = await response.json();


    if (data.success) {
      const results: HelpRequest[] = [];

      for (const post of data.posts) {
        let lat = post.latitude;
        let lng = post.longitude;

        // 保險：如果後端只存了 "lat,lng" 在 location，就自己拆
        if ((lat == null || lng == null) && typeof post.location === 'string') {
          const [la, lo] = post.location.split(',').map((s: string) => Number(s.trim()));
          if (Number.isFinite(la) && Number.isFinite(lo)) {
            lat = la;
            lng = lo;
          }
        }

        if(!post.locationText){
          // 預設顯示的地點文字（先用後端給的）
          let addressText: string = post.location;

          // 有經緯度就反查一次（失敗就維持原本 location）
          if (lat != null && lng != null) {
            try {
              addressText = await fetchAddress(lat, lng);
            } catch (err) {
              console.warn('貼文地址轉換失敗，使用原始 location：', err);
            }
          }
          results.push({
            id: post.id,
            title: post.title,
            content: post.content,
            location: post.location,
            locationText: addressText,
            contact: post.contact,
            urgency: post.urgency,
            timestamp: new Date(post.created_at).toLocaleString('zh-TW'),
            latitude: lat,
            longitude: lng,
            lat,
            lng,
            isMine: post.user_id === CURRENT_USER_ID,
            resolved: post.resolved,
            distance: post.distance,
            distance_text: post.distance_text,
            helper_count: post.helper_count || 0,
            labels: post.labels || []
          });
        }else{
          results.push({
            id: post.id,
            title: post.title,
            content: post.content,
            location: post.location,
            locationText: post.locationText,
            contact: post.contact,
            urgency: post.urgency,
            timestamp: new Date(post.created_at).toLocaleString('zh-TW'),
            latitude: lat,
            longitude: lng,
            lat,
            lng,
            isMine: post.user_id === CURRENT_USER_ID,
            resolved: post.resolved,
            distance: post.distance,
            distance_text: post.distance_text,
            helper_count: post.helper_count || 0,
            labels: post.labels || []
          });
        }
      }

      helpRequests.value = results;
    }
  } catch (error) {
    console.error('載入貼文失敗:', error);
    showToast('載入貼文失敗，請稍後再試');
  } finally {
    isLoading.value = false;
  }
};

const createPost = async () => {
  try {
    isSubmitting.value = true;

    if (!userLocation.value) {
      showToast('無法取得您的位置，請確認已允許定位');
      isSubmitting.value = false;
      return;
    }

    if(!formData.content){
      formData.content= ' ';
    }

    if(!formData.urgency){
      formData.urgency= 1;
    }

    // 如果使用者沒有手動選擇標籤，就呼叫分類器
    if (!formData.incidentLabels || formData.incidentLabels.length === 0) {
      try {
        const res = await fetch(`${API_BASE_URL}/classify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: formData.title,
            content: formData.content
          })
        });

        const data = await res.json();
        console.log('分類器回應:', data);

        if (res.ok && data.success) {
          if (data.category) {
            formData.incidentLabels = [data.category];
            console.log('自動標籤已設定:', formData.incidentLabels);
          } else {
            console.warn('分類器沒有返回 category');
          }
        } else {
          console.warn('分類失敗:', data);
        }
      } catch (err) {
        console.error('分類 API 錯誤：', err);
      }
    }

    console.log('準備發送的標籤:', formData.incidentLabels);

    // 發送建立貼文 API
    const response = await fetch(`${API_BASE_URL}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: CURRENT_USER_ID,
        title: formData.title.trim(),
        content: formData.content.trim(),
        location: `${userLocation.value.lat},${userLocation.value.lng}`,
        locationText: formData.locationText,
        urgency: formData.urgency,
        contact: formData.contact.trim(),
        labels: formData.incidentLabels || []
      })
    });

    const data = await response.json();

    if (data.success) {
      showToast('求助資訊已發布');

      // 清空表單
      formData.title = '';
      formData.content = '';
      formData.location = '';
      formData.locationText = '';
      formData.contact = '';
      formData.urgency = 0;
      formData.incidentLabels = [];

      await fetchPosts();
      activeTab.value = 1;
    } else {
      showToast(data.message || '發布失敗，請稍後再試');
    }
  } catch (error) {
    console.error('發布貼文失敗:', error);
    showToast('發布失敗，請稍後再試');
  } finally {
    isSubmitting.value = false;
  }
};

const resolvePost = async (postId: number) => {
  try {
    isResolving.value = true;

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: CURRENT_USER_ID
      })
    });

    const data = await response.json();

    if (data.success) {
      showToast('貼文已標記為已解決');
      closeRequest();
      await fetchPosts();
    } else {
      showToast(data.message || '標記失敗，請稍後再試');
    }
  } catch (error) {
    console.error('標記失敗:', error);
    showToast('標記失敗，請稍後再試');
  } finally {
    isResolving.value = false;
  }
};


// 篩選用 tags
const districtTags = [
  { key: 'all', label: '全部' },
  { key: '大安區', label: '大安區' },
  { key: '信義區', label: '信義區' },
  { key: '中山區', label: '中山區' },
  { key: '內湖區', label: '內湖區' },
  { key: '文山區', label: '文山區' },
  // 想再加就繼續放
];

const incidentTags = [
  { key: 'all', label: '全部' },
  { key: '跟蹤', label: '跟蹤' },
  { key: '性騷擾', label: '性騷擾' },
  { key: '騷擾', label: '騷擾' },
  { key: '偷拍', label: '偷拍' },
  { key: '可疑人物', label: '可疑人物' },
];

const selectedDistrict = ref<string>('all');
const selectedIncident = ref<string>('all');

const helpRequest = async (postId: number) => {
  try {
    isHelping.value = true;

    const response = await fetch(`${API_BASE_URL}/posts/${postId}/respond`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: CURRENT_USER_ID
      })
    });

    const data = await response.json();

    if (data.success) {
      showToast('已通知求助者，感謝您的幫助！');
      
      // 更新當前顯示的 helper_count
      if (selectedRequest.value) {
        selectedRequest.value.helper_count = data.helper_count;
      }
      
      // 重新載入貼文列表
      await fetchPosts();
    } else {
      showToast(data.message || '操作失敗，請稍後再試');
    }
  } catch (error) {
    console.error('回應失敗:', error);
    showToast('操作失敗，請稍後再試');
  } finally {
    isHelping.value = false;
  }
};

const openGoogleMap = (lat: number, lng: number) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, "_blank");
};

// ==================== 狀態管理 ====================
const selectedRequest = ref<HelpRequest | null>(null);

const activeTab = ref(1);
const formData = reactive({
  title: '',
  content: '',
  location: '',
  locationText:'',
  contact: '',
  urgency: 0,
  incidentLabels: [] as string[] 
});

const helpRequests = ref<HelpRequest[]>([]);
const showNearby = ref(true);
const showFilterBar = ref(false);
const toggleFilter = () => {
  showFilterBar.value = !showFilterBar.value;
};

const userLocation = ref<UserLocation | null>(null);
const toastMessage = ref<string | null>(null);
const isModalOpen = ref(false);
const isLoading = ref(false);
const isSubmitting = ref(false);
const isResolving = ref(false);
const isHelping = ref(false);

let toastTimer: number | null = null;

const urgencyOptions = [
  {
    value: 1,
    label: '極度緊急',
    activeClass: 'bg-red-50 text-red-600 border-red-200 shadow-sm',
    dotClass: 'bg-[#D45251]'
  },
  {
    value: 2,
    label: '高度緊急',
    activeClass: 'bg-orange-50 text-orange-600 border-orange-200 shadow-sm',
    dotClass: 'bg-[#FD853A]'
  },
  {
    value: 3,
    label: '中度緊急',
    activeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm',
    dotClass: 'bg-yellow-500'
  }
];

const urgencyRank = (value: number): number => {
  return value || 4; // 沒填或其他 → 排最後
};

const openRequest = async (req: HelpRequest) => {
  try {
    selectedRequest.value = { ...req };
    isModalOpen.value = true;
  } catch (error) {
    console.error('載入貼文詳情失敗:', error);
    showToast('載入失敗，請稍後再試');
  }
};


const closeRequest = () => {
  selectedRequest.value = null;
  isModalOpen.value = false;
};

// 取得使用者位置
onMounted(() => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        // 再載入貼文列表
        fetchPosts();
      },
      async () => {
        console.log('無法獲取位置');
        await fetchPosts();
      }
    );
  } else {
    fetchPosts();
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
  { name: '發布求助', icon: 'iconamoon:edit-fill' },
  { name: '求助資訊', icon: 'fa:users' },
  { name: '地圖定位', icon: 'mingcute:map-fill' }
];

const translateClass = computed(() => {
  if (activeTab.value === 0) return 'translate-x-0';
  if (activeTab.value === 1) return 'translate-x-[92%]';
  return 'translate-x-[185%]';
});

async function fetchAddress(lat: number, lon: number): Promise<string> {
  try {
    const res = await fetch(`${API_BASE_URL}/geo/reverse-geocode?lat=${lat}&lon=${lon}`);

    let data: any = {};
    try {
      data = await res.json();
    } catch {
      // 後端如果沒給 JSON，就退回座標字串
      return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    }

    if (!res.ok) {
      console.warn("reverse-geocode error:", data.error || res.statusText);
      return data.address || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    }

    return data.address || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  } catch (err) {
    console.warn("reverse-geocode fetch failed:", err);
    return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  }
}



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
const handleSubmit = async () => {
  if (!formData.title || (!formData.locationText) ) {
    showToast('請填寫所有必填欄位');
    return;
  }

  await createPost();
  fetchPosts();
};

// 切換附近 5 公里
const toggleNearby = () => {
  showNearby.value = !showNearby.value;
};

// // 監聽 showNearby 變化，重新載入貼文
// watch(showNearby, () => {
//   fetchPosts();
// });

// // 監聽 activeTab 變化，切換到列表頁時重新載入
// watch(activeTab, (newTab) => {
//   if (newTab === 1) {
//     fetchPosts();
//   }
// });

const getDistanceScore = (req: HelpRequest): number => {
  // 沒有使用者位置或沒有座標 → 排到最後
  if (!userLocation.value || req.lat == null || req.lng == null) {
    return Number.POSITIVE_INFINITY;
  }

  return calculateDistance(
    userLocation.value.lat,
    userLocation.value.lng,
    req.lat,
    req.lng
  );
};


const filteredRequests = computed(() => {
  let list = helpRequests.value;

  // 行政區篩選
  if (selectedDistrict.value !== 'all') {
    list = list.filter(req =>
      req.locationText?.includes(selectedDistrict.value)
    );
  }

  // 事件篩選
  if (selectedIncident.value !== 'all') {
    list = list.filter(req =>
      (req.labels && req.labels.includes(selectedIncident.value)) ||
      req.title?.includes(selectedIncident.value) ||
      req.content?.includes(selectedIncident.value)
    );
  }

  // 排序：距離 → urgency(1 最優先) → 時間(新到舊)
  return [...list].sort((a, b) => {
    // 距離（用 calculateDistance 算；缺少資訊的排最後）
    const distA = getDistanceScore(a);
    const distB = getDistanceScore(b);
    if (distA !== distB) return distA - distB;

    // 緊急程度（數字小優先：1 → 2 → 3）
    const urgA = a.urgency ?? Number.POSITIVE_INFINITY;
    const urgB = b.urgency ?? Number.POSITIVE_INFINITY;
    if (urgA !== urgB) return urgA - urgB;

    // 時間（新到舊；timestamp 是 toLocaleString 後的字串，所以這邊用 Date parse）
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeB - timeA;
  });
});




const markAsResolved = async (id: number) => {
  await resolvePost(id);
};

const catchLocation = async () => {
  if (!navigator.geolocation) {
    showToast('此裝置不支援定位，請手動輸入地址');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        // 更新全域 userLocation，讓 createPost / fetchPosts 都能用
        userLocation.value = { lat, lng };

        // 反查地址顯示在輸入框
        const address = await fetchAddress(lat, lng);
        formData.locationText = address;

        showToast('已套用目前位置');
      } catch (error) {
        console.error('定位轉地址失敗:', error);
        showToast('定位失敗，請稍後再試');
      }
    },
    (error) => {
      console.error('定位失敗:', error);
      showToast('定位失敗，請確認已允許定位權限');
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
};


const toggleIncidentLabel = (key: string) => {
  const idx = formData.incidentLabels.indexOf(key);
  if (idx === -1) {
    formData.incidentLabels.push(key);
  } else {
    formData.incidentLabels.splice(idx, 1);
  }
};

</script>

<style scoped>
/* Toast 動畫 */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.3s ease;
}
.fade-up-enter-from,
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.fade-up-enter-to,
.fade-up-leave-from {
  opacity: 1;
  transform: translateY(0);
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

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
