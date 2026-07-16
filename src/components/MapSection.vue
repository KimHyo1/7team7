<template>
  <section class="tab-content">
    <!-- Replace existing .ai-prompt-area block with this -->
  <div class="ai-prompt-area">
    <h3>여행 취향을 선택하세요</h3>
    <div class="theme-group">
      <button
        v-for="(t, key) in THEMES"
        :key="key"
        class="theme-btn"
        :class="{ active: activeTheme === key }"
        @click="chooseTheme(key)"
      >
        {{ t.label }}
      </button>
    </div>
  </div>
    <p v-if="loadError" class="status-text error">{{ loadError }}</p>

    <div class="sim-layout">
      <section class="driving-scene">
        <div
          class="drive-canvas"
          :class="{ playing: isPlaying }"
          :data-phase="scenePhase"
          :style="{ '--drive-speed': driveSpeed }"
        >
          <!-- 배경 레이어 -->
          <div class="sky"></div>
          <div class="sun"></div>
          <div class="mountains"></div>
          <div class="horizon-zone">
            <div class="ground-plane">
              <div class="road-strip">
                <div class="center-dash"></div>
              </div>
            </div>
          </div>

          <svg
            class="tree tree-l"
            style="animation-delay: -0.4s"
            viewBox="0 0 44 60"
            aria-hidden="true"
          >
            <rect x="19" y="42" width="6" height="16" fill="#6b4a32" />
            <polygon points="22,2 40,30 4,30" fill="#2f6b3d" />
            <polygon points="22,16 42,46 2,46" fill="#3a7d49" />
          </svg>
          <svg
            class="tree tree-l"
            style="animation-delay: -1.5s"
            viewBox="0 0 44 60"
            aria-hidden="true"
          >
            <rect x="19" y="42" width="6" height="16" fill="#6b4a32" />
            <polygon points="22,2 40,30 4,30" fill="#2f6b3d" />
            <polygon points="22,16 42,46 2,46" fill="#3a7d49" />
          </svg>
          <svg
            class="tree tree-l"
            style="animation-delay: -2.6s"
            viewBox="0 0 44 60"
            aria-hidden="true"
          >
            <rect x="19" y="42" width="6" height="16" fill="#6b4a32" />
            <polygon points="22,2 40,30 4,30" fill="#2f6b3d" />
            <polygon points="22,16 42,46 2,46" fill="#3a7d49" />
          </svg>
          <svg
            class="tree tree-r"
            style="animation-delay: -1s"
            viewBox="0 0 44 60"
            aria-hidden="true"
          >
            <rect x="19" y="42" width="6" height="16" fill="#6b4a32" />
            <polygon points="22,2 40,30 4,30" fill="#2f6b3d" />
            <polygon points="22,16 42,46 2,46" fill="#3a7d49" />
          </svg>
          <svg
            class="tree tree-r"
            style="animation-delay: -2.1s"
            viewBox="0 0 44 60"
            aria-hidden="true"
          >
            <rect x="19" y="42" width="6" height="16" fill="#6b4a32" />
            <polygon points="22,2 40,30 4,30" fill="#2f6b3d" />
            <polygon points="22,16 42,46 2,46" fill="#3a7d49" />
          </svg>
          <svg
            class="tree tree-r"
            style="animation-delay: -3.1s"
            viewBox="0 0 44 60"
            aria-hidden="true"
          >
            <rect x="19" y="42" width="6" height="16" fill="#6b4a32" />
            <polygon points="22,2 40,30 4,30" fill="#2f6b3d" />
            <polygon points="22,16 42,46 2,46" fill="#3a7d49" />
          </svg>
          <!-- 차량(뒤에서 보는 뒷모습, SVG로 구성) -->
          <div class="vehicle-static" aria-hidden="true">
            <svg
              class="car-svg"
              width="160"
              height="82"
              viewBox="0 0 170 86"
              aria-hidden="true"
            >
              <rect
                x="18"
                y="18"
                width="134"
                height="52"
                rx="16"
                fill="#26313f"
              />
              <rect
                x="24"
                y="6"
                width="122"
                height="34"
                rx="14"
                fill="#1c2530"
              />
              <rect
                x="34"
                y="11"
                width="102"
                height="20"
                rx="8"
                fill="#5d7ea0"
              />
              <rect
                x="34"
                y="11"
                width="102"
                height="8"
                rx="4"
                fill="#7fa2c4"
              />
              <rect
                x="24"
                y="52"
                width="26"
                height="11"
                rx="4"
                fill="#e24b4a"
              />
              <rect
                x="120"
                y="52"
                width="26"
                height="11"
                rx="4"
                fill="#e24b4a"
              />
              <rect
                x="62"
                y="54"
                width="46"
                height="14"
                rx="3"
                fill="#f5f2e8"
              />
              <text
                x="85"
                y="65"
                text-anchor="middle"
                font-size="10"
                font-family="sans-serif"
                fill="#26313f"
              >
                GUMI 7
              </text>
              <rect
                x="18"
                y="66"
                width="134"
                height="8"
                rx="4"
                fill="#141b24"
              />
              <rect
                x="26"
                y="70"
                width="24"
                height="14"
                rx="6"
                fill="#0c1117"
              />
              <rect
                x="120"
                y="70"
                width="24"
                height="14"
                rx="6"
                fill="#0c1117"
              />
            </svg>
            <div class="car-shadow"></div>
          </div>

          <!-- 상단 HUD -->
          <div class="drive-hud hud-top">
            <div class="hud-left">
              <span>다음 목적지</span>
              <strong>{{ currentPlace?.name || "목적지 없음" }}</strong>
            </div>
            <div class="hud-right">
              <span class="status-dot" :class="{ active: isPlaying }"></span>
              {{ drivingStatus }} · {{ playProgress }}
            </div>
            <div class="hud-stats">
            <span class="stat">
              ⚡ {{ state.energy }} / {{ state.energyMax }}
              <em
                v-if="statDelta.e"
                :class="statDelta.e > 0 ? 'up' : 'down'"
                >{{ statDelta.e > 0 ? "+" : "" }}{{ statDelta.e }}</em
              >
            </span>
            <span class="stat">
              💰 {{ state.coins.toLocaleString() }}
              <em
                v-if="statDelta.m"
                :class="statDelta.m > 0 ? 'up' : 'down'"
                >{{ statDelta.m > 0 ? "+" : "" }}{{ statDelta.m.toLocaleString() }}</em
              >
            </span>
          </div>
          </div>

          <!-- 하단 진행률 HUD -->
          <div class="drive-hud hud-bottom">
            <div class="progress-meta">
              <div class="start-name">{{ startName }}</div>
              <div class="dest-name">{{ destName }}</div>
            </div>
            <div class="drive-progress">
              <div
                class="progress-inner"
                :style="{ width: drivingProgressPercent + '%' }"
              ></div>
            </div>
          </div>

          <div v-if="eventOpen && activeEvent" class="event-overlay">
            <div class="event-card">
              <h3>{{ activeEvent.title }}</h3>
              <p>{{ activeEvent.desc }}</p>
              <div class="event-actions">
                <button
                  v-for="c in activeEvent.choices"
                  :key="c.label"
                  class="event-btn"
                  @click="chooseEvent(c)"
                >
                  {{ c.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="photo-spot" :class="{ on: photoOpen }">
            <h4>📸 포토 스팟 발견!</h4>
            <p>마커가 초록 구간일 때 촬영하세요</p>
            <div class="photo-bar">
              <div class="photo-zone"></div>
              <div
                class="photo-mark"
                :style="{ left: 'calc(' + photoMarkerX + '% - 3px)' }"
              ></div>
            </div>
            <div class="photo-foot">
              <span class="photo-res">{{ photoResult }}</span>
              <button class="event-btn" @click="shootPhoto">촬영</button>
            </div>
          </div>

          <div class="luna-bubble" :class="{ on: lunaVisible }">
            <div class="luna-avatar">루</div>
            <div class="luna-text">{{ lunaText }}</div>
          </div>
        </div>
      </section>

      <!-- 오른쪽: 미니맵 + 정보(컨트롤) 패널 -->
      <aside class="right-panel">
        <div class="mini-map-panel">
          <!-- 기존 mapElement, class="kakao-map"는 이름 변경 금지 — 여기로 이동 -->
          <div ref="mapElement" class="kakao-map"></div>
        </div>

        <!-- 기존 route-sidebar 내용을 최대한 보존 (버튼/정보 그대로) -->
        <div class="info-panel">
          <h3>🚗 AI 추천 경로 시뮬레이션</h3>

          <div class="route-summary">
            <p>선택 장소: {{ selectedPlaces.length }}곳</p>
            <p>예상 총 이동시간: {{ totalTravelTime }}분</p>
            <p>예상 총 비용: {{ totalCost.toLocaleString() }}원</p>
            <p>현재 시간대: {{ currentPhase }}</p>
            <p>보유 코인: {{ state.coins.toLocaleString() }}원</p>
            <p>진행: {{ playProgress }}</p>
          </div>

          <ul class="route-list">
            <li
              v-for="place in selectedPlaces"
              :key="place.id"
              :class="{ active: currentPlace && currentPlace.id === place.id }"
            >
              {{ place.order }}. {{ place.name }}
            </li>
          </ul>

          <div class="trip-cta">
            <button
              v-if="!isPlaying"
              class="start-trip-btn"
              :disabled="selectedPlaces.length === 0"
              @click="togglePlay"
            >
              여행 시작하기
            </button>
            <button v-else class="stop-trip-btn" @click="stopPlay">
              여행 중단
            </button>
          </div>

          <div class="simulation-box" v-if="simulationLog.length > 0">
            <h4>여행 로그</h4>
            <ul class="simulation-log">
              <li v-for="(entry, index) in simulationLog" :key="index">
                {{ entry }}
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>

    <div class="picker-block">
      <div class="picker-head">
        <h3>오늘 어디로 떠날까요?</h3>
      </div>
      <div class="picker-filter">
        <button
          v-for="cat in CATEGORIES"
          :key="cat"
          class="filter-chip"
          :class="{ on: activeCategory === cat }"
          @click="activeCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
      <div class="picker-grid">
        <article
          v-for="place in filteredCandidates"
          :key="place.id"
          class="pick-card"
          :class="{ sel: isSelected(place.id) }"
          @click="toggleCourse(place.id)"
        >
          <div v-if="isSelected(place.id)" class="pick-order">
            {{ selectionOrder(place.id) }}
          </div>
          <div class="pick-thumb">
            <img v-if="place.image" :src="place.image" alt="" loading="lazy" />
            <div v-else class="pick-noimg">이미지 없음</div>
          </div>
          <div class="pick-body">
            <p class="pick-name">{{ place.name }}</p>
            <p class="pick-addr">{{ place.address || "주소 없음" }}</p>
            <span class="pick-cat" :class="'cat-' + place.category">{{
              place.category
            }}</span>
          </div>
        </article>
      </div>
    </div>

    <!-- 도착 시 표시되는 간단한 정보 모달 -->
    <div v-if="arrivalShown" class="dogam-overlay">
      <div class="dogam-card-wrap">
        <h3 class="dogam-title">
          {{ arrivalInfo.isNew ? "새로운 장소 발견!" : "다시 방문했어요" }}
        </h3>
        <div class="dogam-flip" :class="{ revealed: cardRevealed }">
          <div class="dogam-inner">
            <div class="dogam-face dogam-back">?</div>
            <div
              class="dogam-face dogam-front"
              :class="'rarity-' + arrivalInfo.rarity"
            >
              <div class="dogam-img">
                <img v-if="arrivalInfo.image" :src="arrivalInfo.image" alt="" />
                <div v-else class="dogam-noimg">이미지 없음</div>
              </div>
              <span class="dogam-badge">{{ arrivalInfo.rarity }}</span>
              <strong>{{ arrivalInfo.name }}</strong>
              <p>{{ arrivalInfo.description }}</p>
              <em>도감 {{ arrivalInfo.count }} / {{ totalPlaces }} 등록</em>
            </div>
          </div>
        </div>
        <div class="dogam-actions">
          <button class="btn-primary" @click="closeArrivalAndContinue">
            계속 이동
          </button>
          <button class="btn-secondary" @click="closeArrivalSilently">
            닫기
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { useGameState } from "../game/useGameState.js";
import travelCourseJson from "../data/구미_경북권_여행코스.json";
import attractionJson from "../data/구미_경북권_관광지.json";
import festivalJson from "../data/구미_경북권_축제공연행사.json";
import foodJson from "../data/구미_경북권_음식점.json";
import cultureJson from "../data/구미_경북권_문화시설.json";
import lodgingJson from "../data/구미_경북권_숙박.json";
import shoppingJson from "../data/구미_경북권_쇼핑.json";

// 💡 1. 게임 상태 함수를 제일 위에서 선언해야 아래 함수들에서 안전하게 쓸 수 있습니다.
const { state, discover, addCoins, spendCoins, gainEnergy, useEnergy, gainExp } = useGameState();

const promptText = ref("");
const currentIndex = ref(0);
const selectedIds = ref([]);
const loadError = ref("");
const mapElement = ref(null);
const kakaoMap = ref(null);
const markers = ref([]);
const polyline = ref(null);
const mapReady = ref(false);

const isSimulating = ref(false);
const currentPhase = ref("오전");
const statDelta = ref({ e: 0, m: 0, key: 0 });
const simulationLog = ref([]);

// 💡 2. 괄호 { } 안에 모든 로직이 예쁘게 들어가야 합니다!
function applyStats({ e = 0, m = 0 }) {
  // 1. 에너지 증감 연동
  if (e > 0) gainEnergy(e);
  else if (e < 0) useEnergy(Math.abs(e));

  // 2. 코인 증감 연동
  let actualM = 0;
  if (m > 0) {
    addCoins(m);
    actualM = m;
  } else if (m < 0) {
    const success = spendCoins(Math.abs(m)); // 지출 시 코인이 충분한지 검증
    if (success) {
      actualM = m;
    } else {
      simulationLog.value.push("앗, 코인이 부족해요!");
      actualM = 0; // 지출에 실패했으므로 UI 델타값 0 처리
    }
  }

  // 3. 플로팅 UI 띄우기
  statDelta.value = { e, m: actualM, key: Date.now() };
  setTimeout(() => {
    if (statDelta.value.key && Date.now() - statDelta.value.key >= 1400) {
      statDelta.value = { e: 0, m: 0, key: 0 };
    }
  }, 1500);
}

// --- animation & route control refs ---
const movingMarker = ref(null);
const isPlaying = ref(false);
const speed = ref(1); // 0.5 | 1 | 2
const pauseResolveRef = { v: null }; // holder for pause resume
const kakaoRestKey = import.meta.env.VITE_KAKAO_REST_KEY || "";
const routeCache = new Map();
let lastRenderToken = 0;
let playbackToken = 0;

// scale: how many milliseconds per simulated minute (adjust for demo speed)
const SIM_MS_PER_MIN = 800;
const DRIVE_ZOOM_LEVEL = 5; // 이동 중 확대 레벨(약 150m 반경)

// --- start + arrival UI ---
const startPlaceId = ref(null);
const tempStartPlace = ref(null); // if user uses map-center start
const DOGAM_KEY = "localhub-dogam";
const dogamIds = ref(JSON.parse(localStorage.getItem(DOGAM_KEY) || "[]"));
const cardRevealed = ref(false);
const arrivalInfo = ref({ name: "", description: "", image: "" });
const arrivalShown = ref(false);
const arrivalResolveRef = { v: null };

const lunaText = ref("");
const lunaVisible = ref(false);
let lunaTimer = null;

function showLuna(text) {
  lunaText.value = text;
  lunaVisible.value = true;
  if (lunaTimer) clearTimeout(lunaTimer);
  lunaTimer = setTimeout(() => {
    lunaVisible.value = false;
  }, 3200);
}

const photoOpen = ref(false);
const photoResult = ref("");
const photoMarkerX = ref(0);
let photoTimer = null;
let photoRaf = null;
let photoStart = 0;

function openPhotoSpot() {
  photoOpen.value = true;
  photoResult.value = "";
  photoStart = performance.now();
  const move = (now) => {
    if (!photoOpen.value) return;
    photoMarkerX.value = ((Math.sin((now - photoStart) / 300) + 1) / 2) * 100;
    photoRaf = requestAnimationFrame(move);
  };
  photoRaf = requestAnimationFrame(move);
  photoTimer = setTimeout(() => {
    if (photoOpen.value && !photoResult.value) endPhoto("놓쳤어요...", 0);
  }, 5000);
}

function endPhoto(msg, gain) {
  photoResult.value = msg;
  if (photoRaf) cancelAnimationFrame(photoRaf);
  if (photoTimer) clearTimeout(photoTimer);
  if (gain > 0) applyStats({ e: gain, m: 0 }); // 사진을 잘 찍으면 에너지가 오름!
  setTimeout(() => { photoOpen.value = false; }, 1300);
}

function shootPhoto() {
  if (!photoOpen.value || photoResult.value) return;
  const d = Math.abs(photoMarkerX.value - 50);
  if (d < 8) endPhoto("인생샷! 에너지 +10", 10);
  else if (d < 16) endPhoto("잘 나왔어요! 에너지 +5", 5);
  else endPhoto("흔들렸어요...", 0);
}

function getRarity(place) {
  if (place.image && place.typeId === "12") return "SSR";
  if (place.image) return "SR";
  return "R";
}

function registerDogam(place) {
  const isNew = !dogamIds.value.includes(place.id);
  if (isNew) {
    dogamIds.value = [...dogamIds.value, place.id];
    localStorage.setItem(DOGAM_KEY, JSON.stringify(dogamIds.value));
  }
  return isNew;
}

function categoryOf(typeId) {
  const map = {
    12: "관광지",
    39: "음식점",
    14: "문화시설",
    32: "숙박",
    38: "쇼핑",
    15: "축제",
  };
  return map[String(typeId)] || "기타";
}

function normalizePlace(item) {
  const lat = Number(item.mapy);
  const lng = Number(item.mapx);

  return {
    id: item.contentid,
    name: item.title,
    address: item.addr1 || "",
    lat,
    lng,
    image: item.firstimage || "",
    typeId: item.contenttypeid,
    category: categoryOf(item.contenttypeid),
  };
}

function isValidPlace(item) {
  const lat = Number(item.mapy);
  const lng = Number(item.mapx);
  return Number.isFinite(lat) && Number.isFinite(lng) && lat !== 0 && lng !== 0;
}

function isGumiArea(item) {
  return (
    String(item.addr1 || "").includes("구미") ||
    String(item.title || "").includes("구미")
  );
}

const travelCourseItems = (travelCourseJson.items || [])
  .filter(isValidPlace)
  .filter((item) => isGumiArea(item) || item.contenttypeid === "25")
  .map(normalizePlace);

const attractionItems = (attractionJson.items || [])
  .filter(isValidPlace)
  .filter(isGumiArea)
  .map(normalizePlace);

const foodItems = (foodJson.items || [])
  .filter(isValidPlace)
  .filter(isGumiArea)
  .map(normalizePlace);
const cultureItems = (cultureJson.items || [])
  .filter(isValidPlace)
  .filter(isGumiArea)
  .map(normalizePlace);
const lodgingItems = (lodgingJson.items || [])
  .filter(isValidPlace)
  .filter(isGumiArea)
  .map(normalizePlace);
const shoppingItems = (shoppingJson.items || [])
  .filter(isValidPlace)
  .filter(isGumiArea)
  .map(normalizePlace);
const candidatePool = [
  ...attractionItems,
  ...foodItems,
  ...cultureItems,
  ...lodgingItems,
  ...shoppingItems,
];

const festivalItems = (festivalJson.items || [])
  .filter(isValidPlace)
  .filter(isGumiArea)
  .map(normalizePlace);

  const RANDOM_EVENTS = [
  {
    title: "우연한 만남",
    desc: "길가에서 지역 음악가가 버스킹 중이에요. 잠시 감상해볼까요?",
    choices: [
      { label: "잠시 감상한다", e: 5, m: -3000, log: "버스킹 감상 (에너지 +5)" },
      { label: "지나친다", e: 0, m: 0, log: "버스킹을 지나쳤다" },
    ],
  },
  {
    title: "길거리 간식 발견",
    desc: "고소한 냄새가 나는 간식 트럭이 보여요.",
    choices: [
      { label: "사 먹는다", e: 10, m: -5000, log: "간식 타임 (에너지 +10)" },
      { label: "참는다", e: 0, m: 0, log: "간식을 참았다" },
    ],
  },
];

const festivalEvents = festivalItems.slice(0, 5).map((f) => ({
  title: "축제 발견!",
  desc: `근처에서 "${f.name}"이(가) 열리고 있어요! 잠시 들러볼까요?`,
  choices: [
    { label: "구경한다", e: -5, m: -5000, log: `${f.name} 구경 (에너지 -5)` },
    { label: "지나친다", e: 0, m: 0, log: "축제를 지나쳤다" },
  ],
}));

const eventOpen = ref(false);
const activeEvent = ref(null);
let eventTimer = null;

function chooseEvent(choice) {
  applyStats({ e: choice.e, m: choice.m }); 
  simulationLog.value.push(choice.log);
  eventOpen.value = false;
  activeEvent.value = null;
  isPlaying.value = true;
  if (pauseResolveRef.v) {
    const resume = pauseResolveRef.v;
    pauseResolveRef.v = null;
    resume();
  }
  showLuna(choice.e > 0 ? "좋은 선택이야! 에너지가 올랐어." : "아쉽지만 갈 길이 머니까!");
}

// --- THEMES: theme buttons & selection logic ---
const THEMES = {
  mukbang: {
    label: "먹방 (맛집 우선)",
    weights: { 음식점: 0.6, 관광지: 0.2, 문화시설: 0.1, 숙박: 0.05, 쇼핑: 0.05 },
    size: 6,
  },
  nature: {
    label: "자연인 (등산/풍경)",
    weights: { 관광지: 0.6, 숙박: 0.15, 음식점: 0.15, 문화시설: 0.05, 쇼핑: 0.05 },
    size: 6,
  },
  culture: {
    label: "문화탐방 (전시/체험)",
    weights: { 문화시설: 0.6, 관광지: 0.25, 음식점: 0.15 },
    size: 5,
  },
  family: {
    label: "가족나들이 (놀이/편의)",
    weights: { 관광지: 0.4, 쇼핑: 0.25, 숙박: 0.15, 음식점: 0.2 },
    size: 6,
  },
  healing: {
    label: "힐링 (카페/휴식)",
    weights: { 숙박: 0.35, 음식점: 0.35, 관광지: 0.2, 문화시설: 0.1 },
    size: 5,
  },
};
const activeTheme = ref(null);

function chooseTheme(key) {
  if (!THEMES[key]) return;
  activeTheme.value = key;
  sampleByTheme(key);
}

function weightedPickCategory(weights) {
  const entries = Object.entries(weights);
  let sum = 0;
  for (const [, w] of entries) sum += w;
  const r = Math.random() * sum;
  let acc = 0;
  for (const [cat, w] of entries) {
    acc += w;
    if (r <= acc) return cat;
  }
  return entries[0][0];
}

function sampleByTheme(themeKey) {
  const theme = THEMES[themeKey];
  if (!theme) return;
  const desired = theme.size || 5;

  // build pool by category
  const byCat = {};
  candidatePool.forEach((p) => {
    byCat[p.category] = byCat[p.category] || [];
    byCat[p.category].push(p);
  });

  const chosen = [];
  const chosenIdsSet = new Set();

  let attempts = 0;
  while (chosen.length < desired && attempts < 600) {
    attempts++;
    const cat = weightedPickCategory(theme.weights || {});
    const pool = byCat[cat] || [];
    const available = pool.filter((p) => !chosenIdsSet.has(p.id));
    if (available.length === 0) {
      const fallback = candidatePool.filter((p) => !chosenIdsSet.has(p.id));
      if (fallback.length === 0) break;
      const pick = fallback[Math.floor(Math.random() * fallback.length)];
      chosen.push(pick);
      chosenIdsSet.add(pick.id);
      continue;
    }
    const pick = available[Math.floor(Math.random() * available.length)];
    chosen.push(pick);
    chosenIdsSet.add(pick.id);
  }

  if (chosen.length < desired) {
    const remaining = candidatePool.filter((p) => !chosenIdsSet.has(p.id));
    for (const r of remaining) {
      if (chosen.length >= desired) break;
      chosen.push(r);
      chosenIdsSet.add(r.id);
    }
  }

  selectedIds.value = chosen.map((p) => p.id);
  currentIndex.value = 0;
  renderMap();
  showLuna(`${THEMES[themeKey].label} 코스를 불러왔어요!`);
}

const totalPlaces = new Set(
  [...travelCourseItems, ...attractionItems, ...festivalItems].map((p) => p.id),
).size;

const CATEGORIES = ["전체", "관광지", "음식점", "문화시설", "숙박", "쇼핑"];
const activeCategory = ref("전체");
const filteredCandidates = computed(() => {
  const selIndex = new Map(selectedIds.value.map((id, idx) => [id, idx]));

  // interleave arrays so "전체" shows mixed categories instead of one-block
  function interleave(arrays) {
    const result = [];
    const idxs = arrays.map(() => 0);
    let added = true;
    while (added) {
      added = false;
      for (let i = 0; i < arrays.length; i++) {
        const arr = arrays[i] || [];
        const j = idxs[i];
        if (j < arr.length) {
          result.push(arr[j]);
          idxs[i] = j + 1;
          added = true;
        }
      }
    }
    return result;
  }

  let base;
  if (activeCategory.value === "전체") {
    base = interleave([
      attractionItems,
      foodItems,
      cultureItems,
      lodgingItems,
      shoppingItems,
    ]).map((p) => ({ ...p }));
  } else {
    base = candidatePool.filter((p) => p.category === activeCategory.value);
  }

  // promote selected items to top (in selection order), keep others' relative order
  const origIndex = new Map(base.map((p, i) => [p.id, i]));
  base.sort((a, b) => {
    const aSel = selIndex.has(a.id);
    const bSel = selIndex.has(b.id);
    if (aSel && bSel) return selIndex.get(a.id) - selIndex.get(b.id);
    if (aSel) return -1;
    if (bSel) return 1;
    return (origIndex.get(a.id) || 0) - (origIndex.get(b.id) || 0);
  });

  return base;
});
selectedIds.value = [];

function selectionOrder(id) {
  const idx = selectedIds.value.indexOf(id);
  return idx === -1 ? "" : idx + 1;
}

const selectedPlaces = computed(() => {
  return selectedIds.value
    .map((id) => candidatePool.find((p) => p.id === id))
    .filter(Boolean)
    .map((place, index) => ({
      ...place,
      order: index + 1,
      time: index === 0 ? "오전" : index === 1 ? "점심" : "저녁",
      travelTime: 20 + index * 5,
      cost:
        place.category === "음식점"
          ? 12000
          : place.category === "쇼핑"
            ? 20000
            : 0,
    }));
});

const currentPlace = computed(
  () => selectedPlaces.value[currentIndex.value] ?? null,
);

const totalTravelTime = computed(() =>
  selectedPlaces.value.reduce((sum, place) => sum + place.travelTime, 0),
);

const totalCost = computed(() =>
  selectedPlaces.value.reduce((sum, place) => sum + place.cost, 0),
);

const playProgress = computed(() => {
  const total = selectedPlaces.value.length;
  const current = total === 0 ? 0 : Math.min(total, currentIndex.value + 1);
  return `${current}/${total}`;
});

const drivingProgressPercent = computed(() => {
  const total = selectedPlaces.value.length;
  return total === 0 ? 0 : Math.round(((currentIndex.value + 1) / total) * 100);
});

const driveSpeed = computed(() => `${1 / speed.value}s`);
const startName = computed(() => selectedPlaces.value[0]?.name || "출발지");
const destName = computed(() => selectedPlaces.value.at(-1)?.name || "목적지");
const scenePhase = computed(() => {
  if (currentPhase.value === "오전") return "morning";
  if (currentPhase.value === "점심" || currentPhase.value === "오후")
    return "noon";
  return "evening";
});
const drivingStatus = computed(() => {
  if (isPlaying.value) return "이동 중";
  if (isSimulating.value) return "일시정지";
  return "출발 대기";
});

function applySampleRoute() {
  const sampleIds = travelCourseItems.slice(0, 3).map((place) => place.id);
  selectedIds.value = sampleIds;
  currentIndex.value = 0;
  currentPhase.value = "오전";
  isSimulating.value = false;
  simulationLog.value = [];
  renderMap();
}

function recommendCourse() {
  const pickFrom = (cat, n) =>
    candidatePool.filter((p) => p.category === cat).slice(0, n);
  const picks = [
    ...pickFrom("관광지", 1),
    ...pickFrom("음식점", 1),
    ...pickFrom("문화시설", 1),
  ].filter(Boolean);

  selectedIds.value = picks.map((p) => p.id);
  activeTheme.value = null;
  renderMap();

  if (typeof showLuna === "function") {
    showLuna("내가 관광지랑 맛집으로 코스 짜봤어!");
  }
}

function startSimulation(cost, energy, exp) {
  if (selectedPlaces.value.length === 0) return;
  isSimulating.value = true;
  currentIndex.value = 0;
  currentPhase.value = "오전";
  simulationLog.value = [
    `여행 시작! 💰${cost.toLocaleString()}원, ⚡${energy} 소모`,
    `🎉 여행 보상으로 EXP +${exp} 획득!`,
    `첫 번째 목적지: ${selectedPlaces.value[0].name}`
  ];
}

// manual step forward (existing)
function advanceSimulation() {
  if (!isSimulating.value || selectedPlaces.value.length === 0) {
    return;
  }

  const currentPlaceItem = selectedPlaces.value[currentIndex.value];
  if (!currentPlaceItem) {
    return;
  }

  // [수정됨] 스킵 시에도 이중 결제 안 되게 차감(applyStats) 로직 삭제
  simulationLog.value.push(`${currentPhase.value}: ${currentPlaceItem.name} 일정 완료`);

  const nextPhaseMap = {
    오전: "점심",
    점심: "오후",
    오후: "저녁",
    저녁: "완료",
  };

  if (
    currentPhase.value === "저녁" ||
    currentIndex.value >= selectedPlaces.value.length - 1
  ) {
    currentPhase.value = "완료";
    simulationLog.value.push("오늘의 여행이 종료되었습니다.");
    return;
  }

  currentPhase.value = nextPhaseMap[currentPhase.value];
  currentIndex.value += 1;
}

// 3. resetSimulation 함수 내부
function resetSimulation() {
  isSimulating.value = false;
  currentPhase.value = "오전";
  // 삭제됨: remainingBudget, happiness, fatigue 초기화 로직
  simulationLog.value = [];
  currentIndex.value = 0;
  stopPlay();
}

function nextStep() {
  if (currentIndex.value < selectedPlaces.value.length - 1) {
    currentIndex.value += 1;
  }
}

function prevStep() {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1;
  }
}

function toggleCourse(placeId) {
  if (selectedIds.value.includes(placeId)) {
    selectedIds.value = selectedIds.value.filter((id) => id !== placeId);
    if (currentIndex.value >= selectedIds.value.length) {
      currentIndex.value = Math.max(0, selectedIds.value.length - 1);
    }
    renderMap();
    return;
  }

  selectedIds.value = [...selectedIds.value, placeId];
  renderMap();
}

function isSelected(placeId) {
  return selectedIds.value.includes(placeId);
}

function clearMap() {
  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];

  if (polyline.value) {
    polyline.value.setMap(null);
    polyline.value = null;
  }

  // movingMarker는 시뮬레이션 중이면 유지, 완전 리셋 시에만 제거
  if (movingMarker.value && !isPlaying.value) {
    movingMarker.value.setMap(null);
    movingMarker.value = null;
  }
}

async function renderMap() {
  const myToken = ++lastRenderToken;

  if (!mapReady.value || !window.kakao?.maps?.LatLng) {
    return;
  }

  // 선택 장소가 없으면 종료
  if (selectedPlaces.value.length === 0) {
    // clear and center on first travelCourse if exists
    clearMap();
    if (travelCourseItems[0]) {
      kakaoMap.value.setCenter(
        new window.kakao.maps.LatLng(
          travelCourseItems[0].lat,
          travelCourseItems[0].lng,
        ),
      );
    }
    return;
  }

  // 클리어 기존 마커/폴리라인
  markers.value.forEach((marker) => marker.setMap(null));
  markers.value = [];
  if (polyline.value) {
    polyline.value.setMap(null);
    polyline.value = null;
  }

  // 기본 bounds (마커 그리기도 함께)
  const bounds = new window.kakao.maps.LatLngBounds();
  // 먼저 정적 마커들 배치
  selectedPlaces.value.forEach((place) => {
    const position = new window.kakao.maps.LatLng(place.lat, place.lng);
    bounds.extend(position);

    const marker = new window.kakao.maps.Marker({
      map: kakaoMap.value,
      position,
      title: place.name,
    });

    const infoWindow = new window.kakao.maps.InfoWindow({
      content: `<div style="padding:6px 8px;font-size:12px;">${place.name}</div>`,
    });

    window.kakao.maps.event.addListener(marker, "mouseover", () =>
      infoWindow.open(kakaoMap.value, marker),
    );
    window.kakao.maps.event.addListener(marker, "mouseout", () =>
      infoWindow.close(),
    );

    markers.value.push(marker);
  });

  // optional start marker (사용자 선택 혹은 tempStartPlace)
  const startPlace = findPlaceById(startPlaceId.value);
  if (startPlace) {
    const pos = new window.kakao.maps.LatLng(startPlace.lat, startPlace.lng);
    bounds.extend(pos);
    const startMarker = new window.kakao.maps.Marker({
      map: kakaoMap.value,
      position: pos,
      title: startPlace.name || "출발지",
      clickable: false,
    });
    markers.value.push(startMarker);
  }

  // 각 구간에 대해 Kakao route 호출 (캐시 사용)하여 전체 경로 좌표 합치기
  const combinedPoints = [];

  // 만약 startPlace가 존재하고 선택된 첫 장소와 다르면 start->first segment 필요
  const placesForSegments = [];
  if (
    startPlace &&
    selectedPlaces.value.length > 0 &&
    startPlace.id !== selectedPlaces.value[0].id
  ) {
    placesForSegments.push(startPlace, ...selectedPlaces.value);
  } else {
    placesForSegments.push(...selectedPlaces.value);
  }

  for (let i = 0; i < placesForSegments.length - 1; i++) {
    // 중간에 렌더 요청이 새로 들어오면 중단
    if (myToken !== lastRenderToken) return;

    const origin = placesForSegments[i];
    const dest = placesForSegments[i + 1];
    const cacheKey = `${origin.id}_${dest.id}`;

    let segmentPoints = routeCache.get(cacheKey) || null;
    if (!segmentPoints) {
      // fetchKakaoRoute가 null을 반환하면 직선 폴백
      const fetched = await fetchKakaoRoute(origin, dest);
      // 렌더 토큰이 바뀌었으면 중단
      if (myToken !== lastRenderToken) return;
      if (fetched && fetched.length) {
        segmentPoints = fetched;
        routeCache.set(cacheKey, segmentPoints);
      } else {
        segmentPoints = [
          { lat: origin.lat, lng: origin.lng },
          { lat: dest.lat, lng: dest.lng },
        ];
        routeCache.set(cacheKey, segmentPoints); // 캐시 직선으로라도 저장해서 반복 호출 방지
      }
    }

    // 이어 붙이되, 이전 끝점과 중복되는 좌표는 제거
    for (let j = 0; j < segmentPoints.length; j++) {
      const p = segmentPoints[j];
      const last = combinedPoints[combinedPoints.length - 1];
      if (!last || last.lat !== p.lat || last.lng !== p.lng) {
        combinedPoints.push(p);
        bounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng));
      }
    }
  }

  // 만약 선택 장소가 1개면 combinedPoints 비어있을 수 있음 -> 마커만 표시하고 bounds로 맞춤
  if (combinedPoints.length > 0) {
    // Kakao LatLng 배열로 변환
    const path = combinedPoints.map(
      (p) => new window.kakao.maps.LatLng(p.lat, p.lng),
    );

    polyline.value = new window.kakao.maps.Polyline({
      map: kakaoMap.value,
      path,
      strokeWeight: 4,
      strokeColor: "#0056b3",
      strokeOpacity: 0.85,
      strokeStyle: "solid",
    });
  }

  // 지도의 범위를 설정
  kakaoMap.value.setBounds(bounds);
}

// --- Kakao REST route fetch (client-side) ---
async function fetchKakaoRoute(origin, destination) {
  if (!kakaoRestKey) {
    console.warn("VITE_KAKAO_REST_KEY not set — fallback to straight-line");
    return null;
  }

  const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin.lng},${origin.lat}&destination=${destination.lng},${destination.lat}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `KakaoAK ${kakaoRestKey}`,
        "Content-Type": "application/json",
      },
    });
    const text = await res.text();
    console.debug(
      "Kakao directions response status:",
      res.status,
      "body:",
      text,
    );

    if (!res.ok) {
      console.warn("Kakao directions fetch failed", res.status);
      return null;
    }
    const json = JSON.parse(text);

    // Parse vertexes from routes -> sections -> roads -> vertexes
    const coords = [];
    const route = json.routes && json.routes[0];
    if (route && Array.isArray(route.sections)) {
      for (const section of route.sections) {
        if (!Array.isArray(section.roads)) continue;
        for (const road of section.roads) {
          const v = road.vertexes || [];
          for (let i = 0; i + 1 < v.length; i += 2) {
            const lng = Number(v[i]);
            const lat = Number(v[i + 1]);
            if (Number.isFinite(lat) && Number.isFinite(lng)) {
              coords.push({ lat, lng });
            }
          }
        }
      }
    }

    // remove consecutive duplicates
    const filtered = coords.filter((p, idx, arr) => {
      if (idx === 0) return true;
      const prev = arr[idx - 1];
      return prev.lat !== p.lat || prev.lng !== p.lng;
    });

    if (filtered.length) return filtered;

    return null;
  } catch (e) {
    console.warn("fetchKakaoRoute error", e);
    return null;
  }
}

// --- animation helpers ---
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function distanceBetween(a, b) {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const h =
    sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

// bearing 계산 (deg)
function bearingBetween(a, b) {
  const toRad = (v) => (v * Math.PI) / 180;
  const toDeg = (v) => (v * 180) / Math.PI;
  const φ1 = toRad(a.lat),
    φ2 = toRad(b.lat);
  const Δλ = toRad(b.lng - a.lng);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// compute offset position behind marker for 3rd-person center
function computeOffsetPosition(pos, bearingDeg, backMeters = 90) {
  const R = 6378137;
  const latRad = (pos.lat * Math.PI) / 180;
  const bearingRad = ((bearingDeg + 180) * Math.PI) / 180; // behind
  const dDivR = backMeters / R;
  const newLat = Math.asin(
    Math.sin(latRad) * Math.cos(dDivR) +
      Math.cos(latRad) * Math.sin(dDivR) * Math.cos(bearingRad),
  );
  const newLng =
    (pos.lng * Math.PI) / 180 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(dDivR) * Math.cos(latRad),
      Math.cos(dDivR) - Math.sin(latRad) * Math.sin(newLat),
    );
  return { lat: (newLat * 180) / Math.PI, lng: (newLng * 180) / Math.PI };
}

// points: [{lat,lng},...], totalDurationMs: 전체 구간 소요(밀리초)
async function animateAlongPoints(points, totalDurationMs, runToken) {
  if (!points || points.length < 2) return;

  if (!movingMarker.value) {
    const markerElement = document.createElement("div");

    markerElement.setAttribute("aria-label", "현재 이동 위치");
    markerElement.style.width = "20px";
    markerElement.style.height = "20px";
    markerElement.style.boxSizing = "border-box";
    markerElement.style.border = "4px solid #ffffff";
    markerElement.style.borderRadius = "50%";
    markerElement.style.background = "#ef4444";
    markerElement.style.boxShadow =
      "0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 6px rgba(239, 68, 68, 0.22)";
    markerElement.style.pointerEvents = "none";

    const overlay = new window.kakao.maps.CustomOverlay({
      content: markerElement,
      position: new window.kakao.maps.LatLng(points[0].lat, points[0].lng),
      xAnchor: 0.5,
      yAnchor: 0.5,
      zIndex: 20,
    });

    overlay.setMap(kakaoMap.value);
    movingMarker.value = overlay;
  }

  try {
    if (kakaoMap.value.getLevel() !== DRIVE_ZOOM_LEVEL) {
      kakaoMap.value.setLevel(DRIVE_ZOOM_LEVEL, {
        anchor: new window.kakao.maps.LatLng(points[0].lat, points[0].lng),
      });
    }
  } catch (e) {
    /* ignore */
  }
  // 거리 계산
  const segLens = [];
  let totalLen = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const l = distanceBetween(points[i], points[i + 1]);
    segLens.push(l);
    totalLen += l;
  }
  if (totalLen === 0) {
    movingMarker.value.setPosition(
      new window.kakao.maps.LatLng(points[0].lat, points[0].lng),
    );
    return;
  }

  const cumLens = [0];
  for (let i = 0; i < segLens.length; i++)
    cumLens.push(cumLens[i] + segLens[i]);

  function positionAtDistance(d) {
    if (d <= 0) return points[0];
    if (d >= totalLen) return points[points.length - 1];
    let idx = 0;
    while (idx < segLens.length && cumLens[idx + 1] < d) idx++;
    const s = points[idx],
      e = points[idx + 1];
    const segStartDist = cumLens[idx];
    const segLen = segLens[idx];
    const t = segLen === 0 ? 0 : (d - segStartDist) / segLen;
    return { lat: lerp(s.lat, e.lat, t), lng: lerp(s.lng, e.lng, t) };
  }

  // 부드러운 중앙 보간(lerp)
  function smoothCenterTo(targetLat, targetLng, factor = 0.12) {
    try {
      const cur = kakaoMap.value.getCenter();
      const curLat = cur.getLat(),
        curLng = cur.getLng();
      const nl = curLat + (targetLat - curLat) * factor;
      const nlng = curLng + (targetLng - curLng) * factor;
      kakaoMap.value.setCenter(new window.kakao.maps.LatLng(nl, nlng));
    } catch (e) {
      /* ignore */
    }
  }

  // 애니메이션 루프
  return new Promise((resolve) => {
    let startTime = null;
    let pausedTime = 0;
    let rafId = null;

    function frame(now) {
      if (runToken !== playbackToken) {
        resolve();
        return;
      }

      if (!startTime) startTime = now;
      if (!isPlaying.value) {
        pausedTime = now;
        pauseResolveRef.v = () => {
          const resumeTime = performance.now();
          startTime += resumeTime - pausedTime;
          pausedTime = 0;
          pauseResolveRef.v = null;
          rafId = requestAnimationFrame(frame);
        };
        return;
      }

      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / Math.max(1, totalDurationMs));
      const distAlong = t * totalLen;
      const pos = positionAtDistance(distAlong);

      // 차량 위치 업데이트
      movingMarker.value.setPosition(
        new window.kakao.maps.LatLng(pos.lat, pos.lng),
      );

      // look-ahead로 bearing 계산 (부드러운 회전)
      const aheadDist = Math.min(
        distAlong + Math.max(totalLen * 0.01, 5),
        totalLen,
      );
      const aheadPos = positionAtDistance(aheadDist);
      const bearing = bearingBetween(pos, aheadPos);

      // 3인칭 카메라: 차량 뒤쪽으로 오프셋한 좌표를 계산해서 부드럽게 센터로 이동
      const offset = computeOffsetPosition(pos, bearing, 90); // 뒤로 90m (필요시 조절)
      smoothCenterTo(offset.lat, offset.lng, 0.14);

      if (t < 1) {
        rafId = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(rafId);
        resolve();
      }
    }

    rafId = requestAnimationFrame(frame);
  });
}

// Orchestrator: sequentially move between selected places (start 포함)
async function playRouteSequence() {
  if (selectedPlaces.value.length <= 0) return;
  const runToken = ++playbackToken;
  isPlaying.value = true;
  isSimulating.value = true;
  showLuna("출발! 오늘 여행도 내가 함께할게.");

  // Build sequence of waypoints including optional startPlace
  const fullWaypoints = [];
  const start = findPlaceById(startPlaceId.value) || selectedPlaces.value[0];
  if (start) fullWaypoints.push(start);
  for (const p of selectedPlaces.value) {
    const last = fullWaypoints[fullWaypoints.length - 1];
    if (!last || last.id !== p.id) fullWaypoints.push(p);
  }

  for (let i = 0; i < fullWaypoints.length - 1; i++) {
    if (runToken !== playbackToken) return;

    const a = fullWaypoints[i];
    const b = fullWaypoints[i + 1];
    const key = `${a.id}_${b.id}`;
    let seg = routeCache.get(key);
    if (!seg) {
      const fetched = await fetchKakaoRoute(a, b);
      seg =
        fetched && fetched.length
          ? fetched
          : [
              { lat: a.lat, lng: a.lng },
              { lat: b.lat, lng: b.lng },
            ];
      routeCache.set(key, seg);
    }

    // estimate duration for this segment from distance (demo heuristic)
    const dist = seg.reduce((s, _p, idx) => {
      if (idx === 0) return 0;
      return s + distanceBetween(seg[idx - 1], seg[idx]);
    }, 0);
    const segMinutes = Math.max(1, Math.round((dist / 1000) * 2)); // ~2 min per km
    let segMs = segMinutes * SIM_MS_PER_MIN;
    if (speed.value > 0) segMs = segMs / speed.value;

    // animate this segment

    if (false) {
      eventTimer = setTimeout(() => {
        if (
          isPlaying.value &&
          runToken === playbackToken &&
          !arrivalShown.value
        ) {
          const pool = festivalEvents.length
            ? [...RANDOM_EVENTS, ...festivalEvents]
            : RANDOM_EVENTS;
          activeEvent.value = pool[Math.floor(Math.random() * pool.length)];
          eventOpen.value = true;
          isPlaying.value = false;
        }
      }, segMs * 0.5);
    } else if (true) {
      photoTimer = setTimeout(() => {
        if (
          isPlaying.value &&
          runToken === playbackToken &&
          !arrivalShown.value &&
          !eventOpen.value
        )
          openPhotoSpot();
      }, segMs * 0.35);
    }

    await animateAlongPoints(seg, segMs, runToken);
    if (eventTimer) {
      clearTimeout(eventTimer);
      eventTimer = null;
    }
    if (runToken !== playbackToken) return;

    // arrival: show info and wait for either auto timeout or user continue
    const isNew = registerDogam(b);
    discover(b)   // 게임 상태(도감)에도 등록 — DexScreen이 이 값을 읽음

    arrivalInfo.value = {
      name: b.name || "도착지",
      description: b.address || "주소 정보 없음",
      image: b.image || "",
      rarity: getRarity(b),
      isNew,
      count: dogamIds.value.length,
    };
    cardRevealed.value = false;
    arrivalShown.value = true;
    setTimeout(() => {
      cardRevealed.value = true;
    }, 450);

    // wait for 2s OR user click continue
    await new Promise((resolve) => {
      arrivalResolveRef.v = resolve;
      setTimeout(() => {
        if (arrivalResolveRef.v) {
          arrivalResolveRef.v();
          arrivalResolveRef.v = null;
        }
      }, 4200);
    });
    arrivalShown.value = false;
    arrivalResolveRef.v = null;

    const next = fullWaypoints[i + 2];
    if (next) showLuna("다음은 " + next.name + "(으)로 가보자!");

    // bookkeeping
    currentIndex.value = selectedPlaces.value.findIndex((p) => p.id === b.id);
    simulationLog.value.push(`${b.name} 도착! 구경을 시작합니다.`);
  }

  isPlaying.value = false;
  currentPhase.value = "완료";
  simulationLog.value.push("여행 종료");
  try {
    const allBounds = new window.kakao.maps.LatLngBounds();
    selectedPlaces.value.forEach((p) =>
      allBounds.extend(new window.kakao.maps.LatLng(p.lat, p.lng)),
    );
    if (!allBounds.isEmpty()) kakaoMap.value.setBounds(allBounds);
  } catch (e) {
    /* ignore */
  }
}

// UI control functions
function togglePlay() {
  if (!isSimulating.value) {
    // --- [신규] 여행 시작 전 비용/에너지 검사 및 일괄 차감 ---
    const cost = totalCost.value; // 전체 예상 코인
    const requiredEnergy = selectedPlaces.value.length * 10; // 장소당 10 에너지 소모
    const earnedExp = selectedPlaces.value.length * 50;      // 장소당 50 경험치 획득

    // 1. 재화 검증 (부족하면 출발 불가)
    if (state.coins < cost) {
      alert(`코인이 부족합니다! (필요: ${cost.toLocaleString()}원, 보유: ${state.coins.toLocaleString()}원)`);
      return;
    }
    if (state.energy < requiredEnergy) {
      alert(`에너지가 부족합니다! (필요: ⚡${requiredEnergy}, 보유: ⚡${state.energy})`);
      return;
    }

    // 2. 비용 차감 및 보상 지급
    spendCoins(cost);
    useEnergy(requiredEnergy);
    gainExp(earnedExp);

    // 3. UI 델타 애니메이션 (빨간 글씨, 파란 글씨 올라가는 효과)
    statDelta.value = { e: -requiredEnergy, m: -cost, key: Date.now() };

    // 4. 시뮬레이션 시작 함수에 로그 기록용 데이터 전달
    startSimulation(cost, requiredEnergy, earnedExp);
  }

  // 기존 재생/일시정지 로직
  if (!isPlaying.value) {
    if (pauseResolveRef.v) {
      isPlaying.value = true;
      const resume = pauseResolveRef.v;
      pauseResolveRef.v = null;
      resume();
    } else {
      playRouteSequence();
    }
  } else {
    isPlaying.value = false;
  }
}

function stopPlay() {
  if (eventTimer) {
    clearTimeout(eventTimer);
    eventTimer = null;
  }
  eventOpen.value = false;
  photoOpen.value = false;
  if (photoRaf) cancelAnimationFrame(photoRaf);
  if (photoTimer) {
    clearTimeout(photoTimer);
    photoTimer = null;
  }

  isPlaying.value = false;
  playbackToken += 1;
  if (pauseResolveRef.v) {
    pauseResolveRef.v();
    pauseResolveRef.v = null;
  }
  currentIndex.value = 0;
  try {
    if (kakaoMap.value && selectedPlaces.value.length) {
      const b = new window.kakao.maps.LatLngBounds();
      selectedPlaces.value.forEach((p) =>
        b.extend(new window.kakao.maps.LatLng(p.lat, p.lng)),
      );
      if (!b.isEmpty()) kakaoMap.value.setBounds(b);
    }
  } catch (e) {
    /* ignore */
  }
}

// --- start/place helpers ---
function findPlaceById(id) {
  if (!id) return null;
  if (tempStartPlace.value && tempStartPlace.value.id === id)
    return tempStartPlace.value;
  return travelCourseItems.find((p) => p.id === id) || null;
}

function applyStartFromSelection() {
  // simply trigger a map re-render; findPlaceById will resolve
  renderMap();
}

function useMapCenterAsStart() {
  if (!kakaoMap.value) return;
  const center = kakaoMap.value.getCenter();
  const lat = center.getLat(),
    lng = center.getLng();
  const temp = {
    id: `start_${Date.now()}`,
    name: "사용자 지정 출발지",
    lat,
    lng,
    address: "",
    image: "",
    typeId: "start",
  };
  tempStartPlace.value = temp;
  startPlaceId.value = temp.id;
  renderMap();
}

// arrival controls
function closeArrivalAndContinue() {
  if (arrivalResolveRef.v) {
    arrivalResolveRef.v();
    arrivalResolveRef.v = null;
  }
  arrivalShown.value = false;
}

function closeArrivalSilently() {
  if (arrivalResolveRef.v) {
    arrivalResolveRef.v();
    arrivalResolveRef.v = null;
  }
  arrivalShown.value = false;
}

// --- Kakao map init & lifecycle ---
async function loadKakaoMapSdk() {
  const kakaoAppKey = import.meta.env.VITE_KAKAO_APP_KEY;

  if (!kakaoAppKey) {
    loadError.value = "VITE_KAKAO_APP_KEY가 설정되지 않았습니다.";
    return false;
  }

  if (window.kakao?.maps?.LatLng) {
    return true;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoAppKey}&libraries=services`;
    script.async = false;
    script.defer = false;
    script.onload = () => {
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(() => resolve(true));
        return;
      }
      resolve(true);
    };
    script.onerror = () => reject(new Error("카카오맵 SDK 로드 실패"));
    document.head.appendChild(script);
  });
}

function initKakaoMap() {
  if (!mapElement.value || !window.kakao?.maps?.LatLng) {
    return;
  }

  const centerPlace = selectedPlaces.value[0] || travelCourseItems[0];
  if (!centerPlace) {
    return;
  }

  kakaoMap.value = new window.kakao.maps.Map(mapElement.value, {
    center: new window.kakao.maps.LatLng(centerPlace.lat, centerPlace.lng),
    level: 7,
  });

  mapReady.value = true;
  renderMap();
}

onMounted(async () => {
  try {
    await loadKakaoMapSdk();
    await nextTick();

    if (window.kakao?.maps?.load) {
      window.kakao.maps.load(() => {
        initKakaoMap();
      });
      return;
    }

    initKakaoMap();
  } catch (error) {
    loadError.value =
      error instanceof Error ? error.message : "카카오맵 로드 실패";
  }
});

watch(selectedPlaces, () => {
  renderMap();
});

onBeforeUnmount(() => {
  playbackToken += 1;
  clearMap();
});
</script>

<style scoped>
/* Theme selector styles */
.theme-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
  align-items: center;
}
.theme-btn {
  background: #eef2ff;
  color: #243b6b;
  border: 1px solid #cbd5ff;
  padding: 8px 12px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
}
.theme-btn.active {
  background: linear-gradient(90deg, #7c83ff, #3aa0ff);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 6px 22px rgba(58,160,255,0.18);
}
.theme-hint {
  margin-top: 8px;
  color: #475569;
  font-size: 0.95rem;
}

.sim-layout {
  display: flex;
  gap: 20px;
  align-items: stretch;
  width: 100%;
  box-sizing: border-box;
}

.right-panel {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.mini-map-panel {
  flex: 1 0 320px;
  min-height: 260px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: #fff;
}
.kakao-map {
  width: 100%;
  height: 100%;
  min-height: 260px;
}

.info-panel {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.04);
}
.info-panel .route-summary p {
  margin: 6px 0;
  color: #374151;
}
.controls {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.speed-label {
  align-self: center;
  color: #374151;
  margin-left: 8px;
}
.speed-select {
  padding: 6px;
  border-radius: 6px;
}

.tab-content {
  display: block;
}

.ai-prompt-area {
  margin-bottom: 20px;
}

.input-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.prompt-input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.route-summary {
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  margin-bottom: 12px;
}

.route-summary p {
  margin: 4px 0;
  font-size: 0.95rem;
}

.route-list {
  list-style: none;
  padding: 0;
  line-height: 2;
  margin: 0 0 12px;
}

.route-list li {
  padding: 4px 8px;
  border-radius: 8px;
}

.route-list li.active {
  background: #dbeafe;
  color: #1d4ed8;
  font-weight: 700;
}

.trip-cta {
  margin-top: 14px;
}

.start-trip-btn {
  width: 100%;
  background: #1d9e75;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.start-trip-btn:disabled {
  background: #cbd5e1;
  cursor: not-allowed;
}

.stop-trip-btn {
  width: 100%;
  background: #e24b4a;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background-color: #0056b3;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary.full {
  width: 100%;
  margin-top: 10px;
}

.simulation-box {
  margin-top: 14px;
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.simulation-box h4 {
  margin: 0 0 8px;
}

.simulation-box ul {
  margin: 0;
  padding-left: 18px;
}

.simulation-box.empty {
  color: #6b7280;
}

.simulation-log {
  margin: 0;
  padding-left: 18px;
  line-height: 1.6;
}

.picker-block {
  margin-top: 20px;
}
.picker-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.picker-head h3 {
  margin: 0;
}
.luna-rec-btn {
  display: flex;
  align-items: center;
  gap: 7px;
  background: #eeedfe;
  color: #3c3489;
  border: 1px solid #afa9ec;
  border-radius: 999px;
  padding: 7px 14px;
  font-size: 0.85rem;
  cursor: pointer;
}
.luna-rec-av {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #7f77dd;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}
.picker-filter {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.filter-chip {
  font-size: 0.8rem;
  padding: 5px 13px;
  border-radius: 999px;
  border: 1px solid #dbe4f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
}
.filter-chip.on {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #93c5fd;
}
.picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}
.pick-card {
  position: relative;
  border-radius: 12px;
  border: 1px solid #dbe4f0;
  background: #fff;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s;
}
.pick-card:hover {
  border-color: #93c5fd;
}
.pick-card.sel {
  border: 2px solid #2563eb;
}
.pick-thumb {
  height: 96px;
  background: #e2e8f0;
  overflow: hidden;
}
.pick-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pick-noimg {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.75rem;
}
.pick-body {
  padding: 9px 11px 11px;
}
.pick-name {
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 3px;
}
.pick-addr {
  font-size: 0.7rem;
  color: #94a3b8;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pick-cat {
  display: inline-block;
  font-size: 0.65rem;
  padding: 1px 8px;
  border-radius: 999px;
  margin-top: 6px;
}
.cat-관광지 {
  background: #faeeda;
  color: #854f0b;
}
.cat-음식점 {
  background: #fcebeb;
  color: #a32d2d;
}
.cat-문화시설 {
  background: #e1f5ee;
  color: #0f6e56;
}
.cat-숙박 {
  background: #eeedfe;
  color: #3c3489;
}
.cat-쇼핑 {
  background: #fbeaf0;
  color: #993556;
}
.pick-order {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 600;
  border: 2px solid #fff;
  z-index: 2;
}

.course-list-block {
  margin-top: 20px;
}

.course-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.status-text {
  margin: 0 0 14px;
  color: #4b5563;
}

.status-text.error {
  color: #b91c1c;
}

.dogam-overlay {
  position: absolute;
  inset: 0;
  z-index: 30;
  background: rgba(10, 14, 24, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dogam-card-wrap {
  text-align: center;
  color: #fff;
}

.dogam-title {
  margin: 0 0 10px;
  font-size: 1.1rem;
}

.dogam-flip {
  width: 190px;
  height: 260px;
  margin: 0 auto 12px;
  perspective: 800px;
}

.dogam-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.dogam-flip.revealed .dogam-inner {
  transform: rotateY(180deg);
}

.dogam-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 12px;
}

.dogam-back {
  background: #2c3648;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8fa0bd;
  font-size: 42px;
  font-weight: 700;
}

.dogam-front {
  background: #f7f3e8;
  color: #26313f;
  transform: rotateY(180deg);
  padding: 8px;
  display: flex;
  flex-direction: column;
  border: 3px solid #94a3b8;
}

.dogam-front.rarity-SSR {
  border-color: #ef9f27;
}
.dogam-front.rarity-SR {
  border-color: #7f77dd;
}

.dogam-img {
  height: 110px;
  border-radius: 8px;
  overflow: hidden;
  background: #5d7ea0;
}

.dogam-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.dogam-noimg {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dbe4f0;
  font-size: 0.8rem;
}

.dogam-badge {
  align-self: center;
  margin: 8px 0 4px;
  padding: 2px 12px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: #eef2f7;
  color: #475569;
}

.rarity-SSR .dogam-badge {
  background: #faeeda;
  color: #854f0b;
}

.rarity-SR .dogam-badge {
  background: #eeedfe;
  color: #3c3489;
}

.dogam-front strong {
  font-size: 0.92rem;
}
.dogam-front p {
  margin: 4px 0 0;
  font-size: 0.72rem;
  color: #5f6b7a;
  line-height: 1.4;
  flex: 1;
  overflow: hidden;
}

.dogam-front em {
  font-style: normal;
  font-size: 0.7rem;
  color: #7a6c50;
}

.dogam-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.event-overlay {
  position: absolute;
  inset: 0;
  z-index: 25;
  background: rgba(10, 14, 24, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.event-card {
  background: #1c2530;
  color: #f5f2e8;
  border-radius: 14px;
  padding: 18px 20px;
  width: min(340px, 88%);
  text-align: center;
}

.event-card h3 {
  margin: 0 0 6px;
  font-size: 1.05rem;
  color: #ffd9a0;
}

.event-card p {
  margin: 0 0 14px;
  font-size: 0.85rem;
  line-height: 1.55;
  color: #d9dee8;
}

.event-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.event-btn {
  background: #f5f2e8;
  color: #26313f;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 0.85rem;
  cursor: pointer;
}

.event-btn:last-child {
  background: #3a4658;
  color: #f5f2e8;
}

.photo-spot {
  position: absolute;
  right: -280px;
  top: 78px;
  z-index: 14;
  width: 230px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 12px;
  padding: 10px 12px;
  transition: right 0.4s ease;
  color: #26313f;
}

.photo-spot.on {
  right: 14px;
}

.photo-spot h4 {
  margin: 0 0 2px;
  font-size: 0.85rem;
}

.photo-spot p {
  margin: 0;
  font-size: 0.72rem;
  color: #5f6b7a;
}

.photo-bar {
  position: relative;
  height: 14px;
  border-radius: 999px;
  background: #e6e2d6;
  margin: 8px 0;
}

.photo-zone {
  position: absolute;
  left: 38%;
  width: 24%;
  top: 0;
  bottom: 0;
  background: #9fe1cb;
  border-radius: 999px;
}

.photo-mark {
  position: absolute;
  top: -3px;
  width: 6px;
  height: 20px;
  border-radius: 3px;
  background: #d85a30;
}

.photo-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.photo-res {
  font-size: 0.75rem;
  font-weight: 700;
  color: #0f6e56;
  min-height: 1em;
}

.luna-bubble {
  position: absolute;
  left: 14px;
  bottom: 64px;
  z-index: 14;
  display: flex;
  gap: 8px;
  align-items: flex-end;
  opacity: 0;
  transform: translateY(8px);
  transition: all 0.35s ease;
  pointer-events: none;
}

.luna-bubble.on {
  opacity: 1;
  transform: translateY(0);
}

.luna-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #7f77dd;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  flex: none;
}

.luna-text {
  background: rgba(255, 255, 255, 0.94);
  color: #26315f;
  border-radius: 10px;
  padding: 7px 11px;
  font-size: 0.78rem;
  max-width: 240px;
  line-height: 1.45;
}

.driving-scene {
  position: relative;
  flex: 1;
  min-width: 320px;
  min-height: 520px;
  overflow: hidden;
  border-radius: 12px;
}

.drive-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 520px;
  overflow: hidden;
  background: #8bd2f0;
}

.drive-canvas[data-phase="morning"] {
  --sky: #9fd4f3;
  --sky2: #d9eefb;
  --mtn: #7d9c8a;
  --grass: #78b25e;
  --grass2: #6aa452;
  --road: #5b6470;
  --dash: #f5f2e8;
  --edge: #e8e4d8;
  --sun: #ffe9a3;
  --sun-x: 20%;
  --sun-y: 22%;
}

.drive-canvas[data-phase="noon"] {
  --sky: #6fbdef;
  --sky2: #c9e9fb;
  --mtn: #6f987f;
  --grass: #7fc063;
  --grass2: #70b054;
  --road: #646d7a;
  --dash: #ffffff;
  --edge: #f2efe6;
  --sun: #fff3c4;
  --sun-x: 50%;
  --sun-y: 10%;
}

.drive-canvas[data-phase="evening"] {
  --sky: #3b3f75;
  --sky2: #f2925e;
  --mtn: #3f4a56;
  --grass: #4a6b4a;
  --grass2: #40603f;
  --road: #3e434e;
  --dash: #ffd9a0;
  --edge: #c9b896;
  --sun: #ff8a4d;
  --sun-x: 74%;
  --sun-y: 52%;
}

.sky {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(var(--sky) 0%, var(--sky) 30%, var(--sky2) 56%);
}

.sun {
  position: absolute;
  left: var(--sun-x);
  top: var(--sun-y);
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--sun);
  transform: translate(-50%, -50%);
  z-index: 2;
  transition: all 0.9s ease;
}

.mountains {
  position: absolute;
  right: -5%;
  top: 36%;
  left: -5%;
  height: 20%;
  z-index: 2;
  opacity: 0.7;
  background: var(--mtn);
  clip-path: polygon(
    0 100%,
    0 72%,
    12% 38%,
    24% 76%,
    38% 25%,
    52% 74%,
    68% 34%,
    82% 72%,
    93% 42%,
    100% 68%,
    100% 100%
  );
}

.sky,
.mountains,
.ground-plane,
.road-strip {
  transition:
    background 0.9s ease,
    border-color 0.9s ease;
}

.horizon-zone {
  position: absolute;
  left: 0;
  right: 0;
  top: 56%;
  bottom: 0;
  overflow: hidden;
  perspective: 340px;
  perspective-origin: 50% 0%;
  z-index: 4;
}

.ground-plane {
  position: absolute;
  left: 50%;
  top: 0;
  width: 340%;
  height: 520%;
  transform: translateX(-50%) rotateX(74deg);
  transform-origin: top center;
  background: repeating-linear-gradient(
    to bottom,
    var(--grass) 0 90px,
    var(--grass2) 90px 180px
  );
  animation: ground-roll 0.62s linear infinite paused;
}

.road-strip {
  position: absolute;
  left: 50%;
  top: 0;
  height: 100%;
  width: 150px;
  transform: translateX(-50%);
  background: var(--road);
  border-left: 9px solid var(--edge);
  border-right: 9px solid var(--edge);
}

.center-dash {
  position: absolute;
  left: 50%;
  top: 0;
  height: 100%;
  width: 9px;
  transform: translateX(-50%);
  background: repeating-linear-gradient(
    to bottom,
    var(--dash) 0 52px,
    transparent 52px 122px
  );
}

.drive-canvas.playing .ground-plane {
  animation-play-state: running;
}

@keyframes ground-roll {
  to {
    background-position-y: 180px;
  }
}

.tree {
  position: absolute;
  left: 50%;
  top: 55.5%;
  width: 44px;
  height: 60px;
  margin-left: -22px;
  opacity: 0;
  transform-origin: 50% 100%;
  z-index: 6;
  animation: 3.4s ease-in infinite paused;
}

.tree-l {
  animation-name: tree-pass-l;
}
.tree-r {
  animation-name: tree-pass-r;
}

.drive-canvas.playing .tree {
  animation-play-state: running;
}

@keyframes tree-pass-l {
  0% {
    transform: translate(-16px, -6px) scale(0.06);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translate(-300px, 190px) scale(2.1);
    opacity: 1;
  }
}

@keyframes tree-pass-r {
  0% {
    transform: translate(16px, -6px) scale(0.06);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translate(300px, 190px) scale(2.1);
    opacity: 1;
  }
}

.vehicle-static {
  position: absolute;
  bottom: 82px;
  left: 50%;
  z-index: 10;
  transform: translateX(-50%);
  pointer-events: none;
}

.car-svg {
  display: block;
  animation: car-bob calc(var(--drive-speed) / 3) ease-in-out infinite paused;
}

.drive-canvas.playing .car-svg {
  animation-play-state: running;
}

.car-shadow {
  position: absolute;
  bottom: -14px;
  left: 50%;
  width: 190px;
  height: 22px;
  transform: translateX(-50%);
  border-radius: 50%;
  background: rgba(10, 14, 22, 0.32);
}

.drive-hud {
  position: absolute;
  z-index: 12;
  color: #fff;
}

.hud-top {
  top: 12px;
  right: 12px;
  left: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  text-shadow: none;
}

.hud-left {
  background: rgba(18, 26, 40, 0.68);
  border-radius: 10px;
  padding: 7px 12px;
  display: grid;
  gap: 2px;
}

.hud-left span {
  font-size: 0.75rem;
  opacity: 0.85;
}
.hud-left strong {
  font-size: 1.05rem;
  font-weight: 600;
}

.hud-right {
  background: rgba(18, 26, 40, 0.68);
  border-radius: 10px;
  padding: 7px 12px;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 0.85rem;
}

.hud-stats {
  display: flex;
  gap: 14px;
  background: rgba(18, 26, 40, 0.68);
  border-radius: 10px;
  padding: 7px 12px;
  font-size: 0.85rem;
  color: #fff;
}

.hud-stats .stat {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}

.hud-stats em {
  position: absolute;
  top: -18px;
  right: 0;
  font-style: normal;
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
  animation: delta-float 1.4s ease forwards;
}

.hud-stats em.up {
  color: #7ee2b8;
}
.hud-stats em.down {
  color: #ff9b9b;
}

.hud-bottom {
  right: 12%;
  bottom: 12px;
  left: 12%;
  padding: 8px 12px;
  border-radius: 10px;
  background: rgba(18, 26, 40, 0.68);
  backdrop-filter: none;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 7px;
  font-size: 0.78rem;
}

.drive-progress {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.25);
}

.progress-inner {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #34d399, #06b6d4);
  transition: width 300ms linear;
}

.drive-canvas.playing .center-line,
.drive-canvas.playing .scenery-item {
  animation-play-state: running;
}

@keyframes dash-move {
  to {
    background-position-y: 52px;
  }
}

@keyframes scenery-approach {
  0% {
    transform: translateY(-20%) scale(0.35);
    opacity: 0;
  }
  15% {
    opacity: 1;
  }
  100% {
    transform: translateY(380%) scale(2);
    opacity: 0;
  }
}

@keyframes car-bob {
  50% {
    transform: translateY(-3px) rotate(0.5deg);
  }
}

@keyframes delta-float {
  0% {
    opacity: 0;
    transform: translateY(4px);
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-8px);
  }
}

@media (max-width: 980px) {
  .sim-layout {
    flex-direction: column;
  }

  .right-panel {
    width: 100%;
  }

  .mini-map-panel {
    flex-basis: 280px;
  }
}
</style>
