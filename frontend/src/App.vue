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
              <h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Icon icon="iconamoon:edit-fill" class="size-6 text-[#468D9B]" />
                求助訊息填寫
              </h2>
            </div>
            <div class="flex h-px bg-slate-100 m-4"></div>

            <div class="grid gap-4">
              <div class="text-base font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <Icon icon="tabler:sos" class="size-5" />
                  求助標題 *
                </div>
                <input type="text" v-model="formData.title" class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200
                          focus:outline-none focus:ring-2 focus:ring-[#93D4DF]
                          placeholder:text-slate-300 transition-all" placeholder="有人跟蹤我" />
              </div>
              <div class="grid sm:grid-cols-[2fr,1fr] gap-4">
                <div class="text-base font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
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
                <div class="text-base font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <Icon icon="fluent:location-20-filled" class="size-5" />
                    定位 *
                  </div>
                  <input type="text" v-model="formData.location" class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                            focus:outline-none focus:ring-2 focus:ring-[#93D4DF]
                            placeholder:text-slate-300 transition-all" placeholder="例：台北市大安區信義路三段、學校側門附近" />
                </div>
                <div class="text-base font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <Icon icon="gridicons:phone" class="size-5" />
                    聯絡方式
                  </div>
                  <input type="text" v-model="formData.contact" class="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50/80
                            focus:outline-none focus:ring-2 focus:ring-[#93D4DF]
                            placeholder:text-slate-300 transition-all" placeholder="手機、LINE ID 或其他安全聯絡方式" />
                </div>
              </div>

              <div class=" text-base font-semibold text-slate-700 mb-1.5 flex flex-col gap-1">
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
                    <span class="inline-block w-2.5 h-2.5 rounded-full border "
                      :class="formData.urgency === option.value ? 'bg-[#93D4DF] border-[#93D4DF]' : 'border-slate-300'">
                    </span>
                    <span>{{ option.label }}</span>
                  </div>
                </div>
              </div>
            </div>


            <button @click="handleSubmit" :disabled="isSubmitting"
              class="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#71C5D5] text-white py-3
                      text-sm font-semibold shadow-sm active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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
              <h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Icon icon="fa:users" class="size-6 text-[#468D9B]" />
                求助資訊列表
              </h2>
              <div class="flex items-center gap-2">
                <button @click="toggleNearby" :class="[
                  'px-3 py-1.5 rounded-full text-xs font-medium  transition-all flex items-center gap-1',
                  showNearby
                    ? 'bg-slate-50 text-slate-600  hover:bg-slate-100'
                    : 'bg-[#71C5D5] text-white'
                ]">
                  <Icon icon="fluent:location-20-filled" class="size-5" />
                  {{ showNearby ? '顯示附近 5 公里' : '顯示所有求助' }}
                </button>
              </div>
            </div>

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


            <!-- 頁首分隔線，讓標題與列表之間有更明顯的區隔 -->
            <div class="flex h-px bg-slate-100 m-4"></div>

            <!-- 載入中 -->
            <div v-if="isLoading" class="text-center py-10 px-6 text-slate-400">
              <Icon icon="svg-spinners:ring-resize" class="mx-auto mb-4 w-12 h-12" />
              <p class="text-base">載入中...</p>
            </div>

            <!-- 無資料時 -->
            <div v-else-if="filteredRequests.length === 0" class="text-center py-10 px-6 text-slate-400">
              <Users class="mx-auto mb-4 w-12 h-12 opacity-40" />
              <p class="text-base">目前尚無求助資訊</p>
              <p class="text-[10px] mt-1">前往「發布求助」頁籤建立第一筆需求 🌱</p>
            </div>

            <!-- 列表 -->
            <div v-else class="flex flex-col gap-3 px-4 py-6">
              <article v-for="req in filteredRequests" :key="req.id" :class="[
                'rounded-3xl px-5 py-4 border transition-all cursor-pointer leading-relaxed flex flex-col gap-1',
                req.isMine
                  ? 'bg-white border-[#B4E2EA] border-[1.5px]'
                  : 'bg-[#DBF1F5] border-none'
              ]" @click="openRequest(req)" @keydown.enter.prevent="openRequest(req)" role="button" tabindex="0">
                <!-- 標題 -->
                <h3 class="font-semibold text-sm text-slate-900 mb-3">
                  {{ req.title }}
                </h3>

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
            <MapPage :help-requests="helpRequests" :user-location="userLocation" />
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
              ? 'bg-white border-[#B4E2EA]'
              : 'bg-[#DBF1F5] border-[#F8E3BC]'
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
                  <Icon icon="fluent:location-20-filled" class="size-4" :class="[selectedRequest.urgency === 1 ? 'text-[#D45251]' : '',
                  selectedRequest.urgency === 2 ? 'text-[#FD853A]' : '',
                  selectedRequest.urgency === 3 ? 'text-[#F5BA4B]' : '']" />
                  <div class="leading-relaxed">
                    <span class="font-medium text-slate-800">地點：</span>
                    <span class="text-slate-700">
                      {{ selectedRequest.locationText }}
                    </span>
                  </div>
                </div>

                <div v-if="selectedRequest.distance_text" class="flex items-center gap-2 pl-6 text-[11px]">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-medium">
                    {{ selectedRequest.distance_text }}
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

            <!-- 在聯絡方式區塊後面添加 -->
            <div v-if="selectedRequest.helper_count && selectedRequest.helper_count > 0" 
                class="flex items-center gap-2 text-[12px] text-slate-600">
              <Icon icon="mdi:account-multiple" class="size-4" />
              <span>{{ selectedRequest.helper_count }} 人表示願意提供協助</span>
            </div>

            <!-- ✅ 只有自己的貼文才顯示 -->
            <div v-if="selectedRequest?.isMine"
              class="mt-8 -mb-6 -mx-6 border-t border-slate-300/40 bg-white/30 backdrop-blur-sm rounded-b-3xl">
              <button @click="markAsResolved(selectedRequest.id)" :disabled="isResolving"
                class="w-full py-4 text-sm font-medium text-slate-700 tracking-tight active:scale-[0.99] transition-all rounded-b-3xl disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isResolving ? '處理中...' : '標記為已解決' }}
              </button>
            </div>

            <!-- 別人的貼文 -->
            <div v-else
              class="mt-8 -mb-6 -mx-6 border-t border-slate-300/40 bg-[#DBF1F5]/50 backdrop-blur-sm rounded-b-3xl">
              <button @click="helpRequest(selectedRequest.id)" :disabled="isHelping"
                class="w-full py-4 text-sm font-medium text-[#356C77] tracking-tight active:scale-[0.99] transition-all rounded-b-3xl disabled:opacity-50 disabled:cursor-not-allowed">
                {{ isHelping ? '通知中...' : '我要幫助他' }}
              </button>
            </div>
          </div>
        </div>
      </transition>


      <!-- 底部 Tab 導航 -->
      <nav class="fixed bottom-0 left-0 right-0 z-20 flex justify-center pb-4">
        <div class="relative w-full max-w-md px-4">
          <div class="relative m-2 mt-0 mb-1 flex items-center gap-2 rounded-full
                  bg-[#DBF1F5] px-3 py-2 h-14">
            <div class="absolute left-2 top-1/2 -translate-y-1/2 h-12 w-1/3
                    rounded-full bg-[#71C5D5] shadow-md transition-transform duration-300" :class="translateClass" />

            <button v-for="(tab, index) in tabs" :key="tab.name" @click="activeTab.value = index"
              class="relative z-10 flex-1 flex flex-col items-center gap-0.5 py-1">
              <Icon :icon="tab.icon" :class="activeTab.value === index ? 'text-white size-8' : 'text-[#356C77] size-7'" />
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
const CURRENT_USER_ID = 1; // 寫死的使用者 ID，之後再實作登入功能

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
      params.append('distance', '5');
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
          helper_count: post.helper_count || 0
        });
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
      return;
    }

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
        urgency: formData.urgency,
        contact: formData.contact.trim(),
        labels: [] // 如果之後需要標籤功能可以加
      })
    });

    const data = await response.json();

    if (data.success) {
      showToast('求助資訊已發布');

      // 清空表單
      formData.title = '';
      formData.content = '';
      formData.location = '';
      formData.contact = '';
      formData.urgency = 0;

      // 重新載入貼文列表
      await fetchPosts();

      // 切換到列表頁
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

// ==================== 狀態管理 ====================
const selectedRequest = ref<HelpRequest | null>(null);
const activeTab = ref(1);
const formData = reactive({
  title: '',
  content: '',
  location: '',
  contact: '',
  urgency: 0
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

        // ✅ 這裡將經緯度轉成「可讀地址」填進輸入框
        try {
          const address = await fetchAddress(
            position.coords.latitude,
            position.coords.longitude
          );
          formData.location = address;
          console.log("使用者位置地址:", address);
        } catch (err) {
          console.warn("地址轉換失敗:", err);
          formData.location = `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`;
        }

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
  if (activeTab.value === 1) return 'translate-x-[95%]';
  return 'translate-x-[190%]';
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
  if (!formData.title || !formData.content || !formData.contact) {
    showToast('請填寫所有必填欄位');
    return;
  }

  if (!formData.urgency) {
    showToast('請選擇緊急程度');
    return;
  }

  await createPost();
};

// 切換附近 5 公里
const toggleNearby = () => {
  showNearby.value = !showNearby.value;
};

// 監聽 showNearby 變化，重新載入貼文
watch(showNearby, () => {
  fetchPosts();
});

// 監聽 activeTab 變化，切換到列表頁時重新載入
watch(activeTab, (newTab) => {
  if (newTab === 1) {
    fetchPosts();
  }
});

const filteredRequests = computed(() => {
  let list = helpRequests.value;

  // 行政區篩選：看 locationText 有沒有包含選取的字
  if (selectedDistrict.value !== 'all') {
    list = list.filter(req =>
      req.locationText?.includes(selectedDistrict.value)
    );
  }

  // 事件篩選：從標題 / 內容裡面找關鍵字
  if (selectedIncident.value !== 'all') {
    list = list.filter(req =>
      req.title?.includes(selectedIncident.value) ||
      req.content?.includes(selectedIncident.value)
    );
  }

  return list;
});

const markAsResolved = async (id: number) => {
  await resolvePost(id);
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
