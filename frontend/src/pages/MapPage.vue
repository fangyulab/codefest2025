<template>
<div>
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

    <!-- 右上：圖例 -->
    <div
      class="absolute top-3 right-3 bg-white/90 backdrop-blur rounded-xl shadow-sm border border-slate-100 px-3 py-2 text-[11px] text-slate-600"
      style="z-index: 1001;"
    >
      <!-- 標題列 -->
      <div class="flex items-center justify-between mb-1">
      <p class="font-medium text-slate-800 text-xs">圖例</p>
      <button
      class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-indigo-100 transition"
      @click="showLegend = !showLegend"
      >
          <img
              v-if="!showLegend"
              :src="addIcon"
              alt="展開"
              class="w-3.5 h-3.5"
          />
          <img
              v-else
              :src="removeIcon"
              alt="收起"
              class="w-3.5 h-3.5"
          />
      </button>
  </div>


  <!-- 圖例內容（可收合） -->
  <transition name="fade">
      <div v-if="showLegend" class="space-y-1">
      <div class="flex items-center gap-2">
          <span class="inline-flex w-3 h-3 rounded-full bg-emerald-500 border border-white shadow"></span>
          <span>我的位置</span>
      </div>
      <div class="flex items-center gap-2">
          <span class="inline-flex w-3 h-3 rounded-full border border-white shadow" style="background-color: #D45251;"></span>
          <span>極度緊急</span>
      </div>
      <div class="flex items-center gap-2">
          <span class="inline-flex w-3 h-3 rounded-full border border-white shadow" style="background-color: #FD853A;"></span>
          <span>高度緊急</span>
      </div>
      <div class="flex items-center gap-2">
          <span class="inline-flex w-3 h-3 rounded-full border border-white shadow" style="background-color: #F5BA4B;"></span>
          <span>中度緊急</span>
      </div>
      <div class="flex items-center gap-2">
          <span class="inline-flex w-3 h-3 rounded-full border border-white shadow" style="background-color: #738995;"></span>
          <span>未標記</span>
      </div>

      <!-- 警局 -->
      <div class="flex items-center gap-2">
          <span class="inline-flex w-3 h-3 rounded-full border border-white shadow bg-[#71C5D5]"></span>
          <span>警局</span>
      </div>

      <!-- 顯示警局 checkbox -->
      <label
          class="mt-1 flex items-center gap-1.5 pt-1 border-t border-slate-100 text-[10px] text-slate-500 cursor-pointer"
      >
          <input
          type="checkbox"
          v-model="showPolice"
          class="h-3 w-3 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>顯示警局位置</span>
      </label>

      <p class="pt-1 border-t border-slate-100 text-[10px] text-slate-400">
          共 {{ helpRequests.length }} 筆求助
      </p>
      </div>
  </transition>
  </div>

    <!-- 無資料時提示 -->
    <div
      v-if="!helpRequests.length"
    
    >
      <MapPin class="w-8 h-8 mb-2 text-slate-300" />
      目前沒有求助標記可以顯示
    </div>
  </div>

  <!-- 下方距離列表 -->
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
          <MapPin
            class="w-3 h-3"
            :style="{ color: getUrgencyColor(req.urgency) }"
        />
          {{ req.locationText || req.location || '位置資訊' }}
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
import * as L from 'leaflet';
import myLocationIconUrl from '../assets/map_icon_findmylocation.svg';
import 'leaflet/dist/leaflet.css';
import addIcon from '../assets/add_grey.svg';
import removeIcon from '../assets/remove_grey.svg';

interface HelpRequest {
id: number;
title: string;
content: string;
location: string;
locationText?: string;
contact?: string;
timestamp: string;
lat: number;
lng: number;
urgency?: string | number;
isMine?: boolean;
distance?: number;
distance_text?: string;
}


interface UserLocation {
lat: number;
lng: number;
}

interface PoliceStation {
name: string;
address: string;
lat: number;
lng: number;
}

interface SelectedHelpRequest extends HelpRequest {
distanceKm?: number;
}

// 依照緊急程度代碼回傳顏色
const getUrgencyColor = (urgency?: string | number) => {
const u = String(urgency ?? '');
switch (u) {
  case '1':
    return '#D45251';
  case '2':
    return '#FD853A';
  case '3':
    return '#F5BA4B';
  default:
    return '#738995';
}
};

const props = defineProps<{
helpRequests: HelpRequest[];
userLocation: UserLocation | null;
}>();
const emit = defineEmits<{
(e: 'open-request', req: HelpRequest): void;
}>();


const mapContainer = ref<HTMLDivElement | null>(null);
let mapInstance: L.Map | null = null;
let markersLayer: L.LayerGroup | null = null;
let policeLayer: L.LayerGroup | null = null;
let userMarker: L.Marker | null = null;
let lastBounds: L.LatLngBounds | null = null;

const showPolice = ref(false);
const policeStations = ref<PoliceStation[]>([]);

// marker 點擊後用的詳情
const selectedRequest = ref<SelectedHelpRequest | null>(null);

const showLegend = ref(false);

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
  minZoom: 5
}).addTo(mapInstance);

markersLayer = L.layerGroup().addTo(mapInstance);
policeLayer = L.layerGroup().addTo(mapInstance);

updateUserMarker();
updateHelpMarkers();
};

// 更新「我的位置」 marker
const updateUserMarker = () => {
if (!mapInstance || !props.userLocation) return;

const latlng = L.latLng(props.userLocation.lat, props.userLocation.lng);

const icon = L.icon({
  iconUrl: myLocationIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

if (!userMarker) {
  userMarker = L.marker(latlng, { icon }).addTo(mapInstance);
} else {
  userMarker.setIcon(icon);
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

// 更新所有求助 marker
const updateHelpMarkers = () => {
if (!mapInstance || !markersLayer) return;

markersLayer.clearLayers();
if (!props.helpRequests.length) {
  lastBounds = null;
  return;
}
const bounds = L.latLngBounds([]);

props.helpRequests.forEach((req) => {
  const color = getUrgencyColor(req.urgency);

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
        ${req.locationText || req.location || '位置資訊'}
      </div>
      <div style="font-size:11px;color:#94a3b8;">
        ${req.timestamp}
      </div>
    </div>
  `;
  marker.bindPopup(popupHtml, { maxWidth: 220 });

  // ✅ 點 marker / popup 時，通知 App.vue 開同一個詳細彈窗
  marker.on('click', () => {
    emit('open-request', req);
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

// 重新整理視圖
const refitBounds = () => {
if (mapInstance && lastBounds && lastBounds.isValid()) {
  mapInstance.fitBounds(lastBounds, { padding: [24, 24], maxZoom: 15 });
}
};

// 距離計算
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

// 用 OpenStreetMap Nominatim 把地址轉成座標
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
try {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    address
  )}&limit=1`;

  const res = await fetch(url);
  const data = await res.json();

  if (!Array.isArray(data) || data.length === 0) return null;

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
} catch (err) {
  console.error('geocode 失敗', err);
  return null;
}
};


// 從台北市資料平台抓警局清單
const fetchPoliceStations = async () => {
try {
  // 方案 1：嘗試使用 CORS 代理
  try {
    const originalUrl = 'https://data.taipei/api/v1/dataset/a90ae184-c39e-4242-b2d6-d7a0403c0632?scope=resourceAquire&limit=200';
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`;
  
    const res = await fetch(proxyUrl);
    const json = await res.json();
  
    console.log('=== 警局 API 原始回應 ===');
    console.log('json keys:', Object.keys(json));
  
    const rows: any[] = json.data ?? json.result?.results ?? json.result ?? [];
    console.log('rows 數量:', rows.length);
  
    if (rows.length > 0) {
      console.log('第一筆資料的欄位:', Object.keys(rows[0]));
      console.log('第一筆完整資料:', rows[0]);
    }




    const list: PoliceStation[] = [];




    for (const row of rows) {
      const name =
        row['分局名稱'] ||
        row['POI_NAME'] ||
        row['name'] ||
        row['機關名稱'] ||
        row['Name'] ||
        row['單位名稱'] ||
        '警局';

      const address =
        row['地址'] ||
        row['ADDRESS'] ||
        row['addr'] ||
        row['location'] ||
        row['Address'] ||
        row['單位地址'] ||
        '';

      if (!address) continue;

      let lat = parseFloat(
        row['緯度'] ||
          row['LAT'] ||
          row['lat'] ||
          row['y'] ||
          row['Y'] ||
          row['Lat'] ||
          ''
      );
      let lng = parseFloat(
        row['經度'] ||
          row['LNG'] ||
          row['lng'] ||
          row['lon'] ||
          row['LONG'] ||
          row['x'] ||
          row['X'] ||
          row['Lng'] ||
          row['Lon'] ||
          ''
      );




      if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
        const geo = await geocodeAddress(address);
        if (!geo) continue;
        lat = geo.lat;
        lng = geo.lng;
      }

      list.push({ name, address, lat, lng });
    }

    if (list.length > 0) {
      policeStations.value = list;
      console.log('✓ 從 API 成功載入警局數量:', policeStations.value.length);
      renderPoliceMarkers();
      return;
    }
  } catch (apiError) {
    console.warn('API 載入失敗，使用備用資料:', apiError);
  }

  // 方案 2：使用靜態備用資料（台北市主要警局）
  console.log('使用靜態警局資料');
  policeStations.value = [
    { name: '臺北市政府警察局中正第一分局', address: '臺北市中正區延平南路80號', lat: 25.0434, lng: 121.5089 },
    { name: '臺北市政府警察局中正第二分局', address: '臺北市中正區愛國東路60號', lat: 25.0351, lng: 121.5247 },
    { name: '臺北市政府警察局大同分局', address: '臺北市大同區錦西街90號', lat: 25.0644, lng: 121.5191 },
    { name: '臺北市政府警察局中山分局', address: '臺北市中山區松江路366號', lat: 25.0627, lng: 121.5332 },
    { name: '臺北市政府警察局松山分局', address: '臺北市松山區八德路4段692號', lat: 25.0489, lng: 121.5776 },
    { name: '臺北市政府警察局大安分局', address: '臺北市大安區新生南路2段86號', lat: 25.0267, lng: 121.5333 },
    { name: '臺北市政府警察局萬華分局', address: '臺北市萬華區中華路1段274號', lat: 25.0385, lng: 121.5006 },
    { name: '臺北市政府警察局信義分局', address: '臺北市信義區信義路5段15號', lat: 25.0326, lng: 121.5654 },
    { name: '臺北市政府警察局士林分局', address: '臺北市士林區文林路156號', lat: 25.0876, lng: 121.5245 },
    { name: '臺北市政府警察局北投分局', address: '臺北市北投區中央北路1段1號', lat: 25.1319, lng: 121.5009 },
    { name: '臺北市政府警察局內湖分局', address: '臺北市內湖區內湖路1段360號', lat: 25.0829, lng: 121.5669 },
    { name: '臺北市政府警察局南港分局', address: '臺北市南港區南港路1段360號', lat: 25.0525, lng: 121.6071 },
    { name: '臺北市政府警察局文山第一分局', address: '臺北市文山區興隆路3段303號', lat: 24.9930, lng: 121.5436 },
    { name: '臺北市政府警察局文山第二分局', address: '臺北市文山區木新路3段236號', lat: 24.9892, lng: 121.5698 },
  ];
   console.log('✓ 使用靜態資料，警局數量:', policeStations.value.length);
  renderPoliceMarkers();
 } catch (err) {
  console.error('=== 載入警局資料完全失敗 ===');
  console.error('錯誤訊息:', err);
   // 最後的備用方案：最少的警局資料
  policeStations.value = [
    { name: '臺北市政府警察局', address: '臺北市信義區松仁路100號', lat: 25.0333, lng: 121.5654 },
  ];
  renderPoliceMarkers();
}
};

// 在地圖上畫 / 清除警局 marker
const renderPoliceMarkers = () => {
if (!mapInstance) return;

if (!policeLayer) {
  policeLayer = L.layerGroup().addTo(mapInstance);
}

policeLayer.clearLayers();

if (!showPolice.value) {
  return;
}

policeStations.value.forEach((s) => {
  const marker = L.circleMarker([s.lat, s.lng], {
    radius: 6,
    color: '#FFFFFF',
    weight: 2,
    fillColor: '#71C5D5',
    fillOpacity: 0.9
  }).addTo(policeLayer!);

  marker.bindPopup(
    `<div style="font-size:12px; line-height:1.4;">
       <strong>${s.name}</strong><br/>
       ${s.address}
     </div>`
  );
});
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

// 監聽「顯示警局位置」
watch(
showPolice,
async (val) => {
  if (!mapInstance) return;

  if (val) {
    if (!policeStations.value.length) {
      await fetchPoliceStations();
    } else {
      renderPoliceMarkers();
    }
  } else {
    renderPoliceMarkers();
  }
}
);

onBeforeUnmount(() => {
if (mapInstance) {
  mapInstance.remove();
  mapInstance = null;
  markersLayer = null;
  policeLayer = null;
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

.fade-enter-active,
.fade-leave-active {
transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
opacity: 0;
}

</style>

