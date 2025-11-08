<template>
  <div
  >
    <h2 class="text-xl font-semibold text-slate-900 flex items-center gap-2 space-y-4 pb-4">
      <Map class="w-5 h-5 text-indigo-500" />
      地圖定位與距離
    </h2>

    <!-- 地圖區 -->
    <div
      class="relative w-full h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100"
    >
      <!-- Leaflet 掛載點 -->
      <div ref="mapContainer" class="w-full h-full"></div>

      <!-- 左上：目前座標資訊 -->
      <div
        class="absolute z-20 top-3 left-3 max-w-xs bg-white/90 backdrop-blur rounded-xl shadow-sm border border-slate-100 px-3 py-2 text-[11px] text-slate-600 space-y-1"
      >
        <div class="flex items-center gap-1.5 font-medium text-slate-800 text-xs">
          <MapPin class="w-3 h-3 text-indigo-500" />
          <span>目前座標</span>
        </div>
        <div v-if="userLocation">
          緯度 {{ userLocation.lat.toFixed(6) }}・經度 {{ userLocation.lng.toFixed(6) }}
        </div>
        <div v-else class="text-[10px] text-slate-500">
          正在嘗試取得您的位置，請允許瀏覽器存取定位。
        </div>
      </div>

      <!-- 右上：圖例（含紅橘黃紫） -->
      <div
        class="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-xl shadow-sm border border-slate-100 px-3 py-2 text-[11px] text-slate-600 space-y-1"
        style="z-index: 1001;"
      >
        <p class="font-medium text-slate-800 text-xs mb-1">圖例</p>
        <div class="flex items-center gap-2">
          <span class="inline-flex w-3 h-3 rounded-full bg-emerald-500 border border-white shadow"></span>
          <span>我的位置</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex w-3 h-3 rounded-full bg-red-500 border border-white shadow"></span>
          <span>極度緊急</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex w-3 h-3 rounded-full bg-orange-500 border border-white shadow"></span>
          <span>高度緊急</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex w-3 h-3 rounded-full bg-yellow-400 border border-white shadow"></span>
          <span>中度緊急</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="inline-flex w-3 h-3 rounded-full bg-indigo-500 border border-white shadow"></span>
          <span>未標記</span>
        </div>
        <p class="pt-1 border-t border-slate-100 text-[10px] text-slate-400">
          共 {{ helpRequests.length }} 筆求助
        </p>
      </div>

      <!-- 右下：重新整理視圖 -->
      <button
        class="absolute bottom-4 right-4 bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-lg shadow hover:bg-indigo-700 active:scale-[0.98] transition"
        @click="refitBounds"
      >
        重新整理視圖
      </button>

      <!-- 無資料時提示 -->
      <div
        v-if="!helpRequests.length"
        class="absolute inset-0 flex flex-col items-center justify-center bg-white/70 text-slate-500 text-xs"
      >
        <MapPin class="w-8 h-8 mb-2 text-slate-300" />
        目前沒有求助標記可以顯示
      </div>
    </div>

    <!-- 下方距離列表（沿用原本邏輯） -->
    <div class="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
      <div v-if="userLocation && helpRequests.length > 0" class="space-y-2">
        <p class="text-xs font-medium text-slate-700">
          求助地點與距離（依照發布順序顯示）
        </p>
        <div
          v-for="req in helpRequests"
          :key="req.id"
          class="bg-white rounded-xl px-3 py-2 border border-slate-100 text-[10px]"
        >
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

      <div v-else-if="helpRequests.length === 0" class="text-[10px] text-slate-500 text-center py-2">
        尚無求助資料可顯示距離，請先於「發布求助」新增一筆資訊。
      </div>

      <div v-else class="text-[10px] text-slate-500 text-center py-2">
        正在嘗試取得您的位置…
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { MapPin, Map } from 'lucide-vue-next';
import L from 'leaflet';
// 若還沒在 main.ts 引入，也可以這裡暫時加：
// import 'leaflet/dist/leaflet.css';

interface HelpRequest {
  id: number;
  title: string;
  content: string;
  location: string;
  contact?: string;
  timestamp: string;
  lat: number;
  lng: number;
  // 可選的緊急程度（高 / 中 / 低）
  urgency?: string;
}

interface UserLocation {
  lat: number;
  lng: number;
}

interface SelectedHelpRequest extends HelpRequest {
  distanceKm?: number;
}

const props = defineProps<{
  helpRequests: HelpRequest[];
  userLocation: UserLocation | null;
}>();

const mapContainer = ref<HTMLDivElement | null>(null);
let mapInstance: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
let userMarker: L.Marker | null = null;
let lastBounds: L.LatLngBounds | null = null;

// marker 點擊後用的詳情
const selectedRequest = ref<SelectedHelpRequest | null>(null);

// 建立 / 初始化地圖
const initMap = () => {
  if (mapInstance || !mapContainer.value) return;

  const centerLat = props.userLocation?.lat ?? 25.033;
  const centerLng = props.userLocation?.lng ?? 121.5654;

  mapInstance = L.map(mapContainer.value, {
    preferCanvas: true,
    attributionControl: true,
    zoomControl: true
  }).setView([centerLat, centerLng], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
    minZoom: 10
  }).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);

  updateUserMarker();
  updateHelpMarkers();
};

// 更新「我的位置」 marker
const updateUserMarker = () => {
  if (!mapInstance || !props.userLocation) return;

  const latlng = L.latLng(props.userLocation.lat, props.userLocation.lng);

  const icon = L.divIcon({
    className: 'custom-user-icon',
    html: `
      <div style="
        width:20px;
        height:20px;
        border-radius:50%;
        background-color:#10b981;
        border:2px solid white;
        box-shadow:0 1px 4px rgba(15,23,42,0.5);
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  if (!userMarker) {
    userMarker = L.marker(latlng, { icon }).addTo(mapInstance);
  } else {
    userMarker.setLatLng(latlng);
  }
};

// 開啟詳情（marker 點擊時）
const openRequestFromMap = (req: HelpRequest) => {
  let distanceKm: number | undefined;

  if (props.userLocation) {
    distanceKm = calculateDistance(
      props.userLocation.lat,
      props.userLocation.lng,
      req.lat,
      req.lng
    );
  }

  selectedRequest.value = {
    ...req,
    distanceKm
  };
};

const closeSelectedRequest = () => {
  selectedRequest.value = null;
};

// 更新所有求助 marker（含紅橘黃點）
const updateHelpMarkers = () => {
  if (!mapInstance || !markersLayer) return;

  markersLayer.clearLayers();

  if (!props.helpRequests.length) {
    lastBounds = null;
    return;
  }

  const bounds = L.latLngBounds([]);

  props.helpRequests.forEach((req) => {
    // 根據 urgency 決定顏色
    let color = '#6366f1'; // default 紫色（未標記）
    if (req.urgency === '高') color = '#ef4444';       // 紅
    else if (req.urgency === '中') color = '#f97316';  // 橘
    else if (req.urgency === '低') color = '#facc15';  // 黃

    const icon = L.divIcon({
      className: 'custom-help-icon',
      html: `
        <div style="
          width:20px;
          height:20px;
          border-radius:50%;
          background-color:${color};
          border:2px solid white;
          box-shadow:0 1px 4px rgba(15,23,42,0.5);
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const latlng = L.latLng(req.lat, req.lng);

    const marker = L.marker(latlng, { icon }).addTo(markersLayer!);

    const popupHtml = `
      <div style="min-width:180px;padding:4px;">
        <div style="font-weight:600;font-size:14px;margin-bottom:4px;color:#0f172a;">
          ${req.title}
        </div>
        <div style="font-size:12px;color:#64748b;margin-bottom:4px;">
          ${req.location}
        </div>
        <div style="font-size:11px;color:#94a3b8;">
          ${req.timestamp}
        </div>
      </div>
    `;
    marker.bindPopup(popupHtml, { maxWidth: 220 });

    // 點 marker 時打開 Vue 的詳情 panel
    marker.on('click', () => {
      openRequestFromMap(req);
    });

    bounds.extend(latlng);
  });

  if (props.userLocation) {
    bounds.extend([props.userLocation.lat, props.userLocation.lng]);
  }

  if (bounds.isValid()) {
    lastBounds = bounds;
    mapInstance!.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
  }
};

// 重新整理視圖（fit 到目前所有 marker）
const refitBounds = () => {
  if (mapInstance && lastBounds && lastBounds.isValid()) {
    mapInstance.fitBounds(lastBounds, { padding: [24, 24], maxZoom: 15 });
  }
};

// 距離計算（跟 app.vue 一致）
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

// 掛載時建立地圖
onMounted(async () => {
  await nextTick();
  initMap();
});

// props 改變時更新地圖
watch(
  () => props.helpRequests,
  () => {
    if (mapInstance) updateHelpMarkers();
  },
  { deep: true }
);

watch(
  () => props.userLocation,
  () => {
    if (mapInstance) {
      updateUserMarker();
      updateHelpMarkers();
    }
  },
  { deep: true }
);

// 組件被銷毀時清理地圖
onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    markersLayer = null;
    userMarker = null;
    lastBounds = null;
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
