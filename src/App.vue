.card { background:#fff; border-radius:12px; padding:12px; border:1px solid #e6edf5; box-shadow: 0 8px 18px rgba(15,23,42,0.04); margin-bottom:10px }
<template>
  <div class="app-shell">
    <!-- master header -->
    <header class="header">
      <div class="logo">
        <h1>📍 Gumi LocalHub</h1>
        <p>AI 맞춤형 구미 여행 & 정보 공유</p>
      </div>
    </header>


    <!-- tabs -->
    <nav class="nav-tabs">
      <button
        :class="{ active: currentTab === 'home' }"
        @click="currentTab = 'home'"
      >
        🏠 홈
      </button>
      <button
        :class="{ active: currentTab === 'map' }"
        @click="currentTab = 'map'"
      >
        🗺️ AI 여행 코스 & 지도
      </button>
      <button
        :class="{ active: currentTab === 'community' }"
        @click="currentTab = 'community'"
      >
        💬 구미 커뮤니티
      </button>
      <button
        :class="{ active: currentTab === 'dex' }"
        @click="currentTab = 'dex'"
      >
        📖 도감
      </button>
    </nav>

    <!-- content: community OR map -->
    <main class="main-layout" v-if="currentTab === 'community'">
      <section class="community-panel">
        <CommunityBoard
          :posts="filteredPosts"
          :categories="categories"
          :current-category="currentCategory"
          :search-query="searchQuery"
          :sort-by="sortBy"
          :popular-posts="popularPosts"
          @select-post="selectPost"
          @change-category="currentCategory = $event"
          @update-search="searchQuery = $event"
          @update-sort="sortBy = $event"
          @open-form="openForm"
          @edit-post="editPost"
          @delete-post="deletePost"
          @like-post="likePost"
        />
      </section>

    <div v-if="showForm" class="modal-backdrop">
      <div class="modal">
       <PostForm
          v-if="useLegacyPostForm"
          :form="form"
          :categories="categories"
          :editing="Boolean(editingId)"
          @update:form="updateForm"
          @submit="submitPost"
          @cancel="resetForm"
        />

        <!-- 새 폼 -->
        <BoardForm
          v-else
          :form="form"
          :categories="categories"
          :editing="Boolean(editingId)"
          :places="placeList"
          @update:form="updateForm"
          @submit="submitPost"
          @cancel="resetForm"
          @place-selected="onPlaceSelected"
        />
      </div>
    </div>

    <!-- 상세 팝업 제거: 카드 클릭 시 모달로 뜨지 않도록 변경 -->
    <aside class="side-panel">
        <PostDetail
          v-if="selectedPost"
          :post="selectedPost"
          @edit="editPost"
          @delete="deletePost"
          @like="likePost"
          @add-comment="addComment"
          @view-map="(rec) => { currentTab.value = 'map' }"
        />

        <div v-else class="empty-state">
          <h3>아직 선택된 게시글이 없습니다</h3>
          <p>게시글 카드를 눌러 상세 내용을 확인해보세요.</p>
        </div>

        <!-- Best & Region info moved here so they appear under AI 추천 -->
        <section class="best" v-if="popularPosts && popularPosts.length">
          <h4>🔥 베스트 글 TOP5</h4>
          <ol>
            <li v-for="(p, idx) in popularPosts" :key="p.id" @click="selectPost(p)">
              <div class="rank-wrap">
                <span class="medal">{{ idx===0? '🥇' : idx===1? '🥈' : idx===2? '🥉' : idx+1 }}</span>
              </div>
              <div class="thumb-mini">
                <img :src="p.thumbnail || '/assets/community/local.svg'" :alt="p.title || 'thumb'" />
              </div>
              <div class="info">
                <div class="title">{{ p.title }}</div>
                <div class="meta">❤️ {{ p.likes || 0 }} · 💬 {{ (p.comments && p.comments.length) || 0 }}</div>
              </div>
            </li>
          </ol>
        </section>

        <section class="region-info">
          <h4>📍 구미 지역 정보</h4>
          <div class="card region-card">
            <div class="weather">
              <div class="w-title">🌤 오늘 날씨</div>
              <div class="w-desc">맑음</div>
              <div class="w-temp">27°C</div>
            </div>
          </div>
          <div class="card region-card">
            <div class="p-title">🏞 인기 장소</div>
            <ul class="places-list">
              <li>금오산</li>
              <li>동락공원</li>
              <li>낙동강 변</li>
            </ul>
          </div>
        </section>
        
        <section class="write-card card">
          <h4>✍️ 지역 이야기를 공유해보세요</h4>
          <p>구미 주민들의 정보를 나누고 의견을 얻어보세요.</p>
          <button class="submit-btn" @click="openForm">글 작성하기</button>
        </section>
      </aside>
    </main>
    <main
      class="main-content"
      v-else-if="currentTab === 'home'"
      style="max-width: 1280px; margin: 20px auto; padding: 0 24px"
    >
      <HomeScreen />
    </main>
    <main
      class="main-content"
      v-else-if="currentTab === 'dex'"
      style="max-width: 1280px; margin: 20px auto; padding: 0 24px"
    >
      <DexScreen />
    </main>

    <main class="main-content" v-else3032808_image2_1.jpg>
      <div style="max-width: 1280px; margin: 20px auto 0; padding: 0 24px">
        <WeatherTravelPage @close="showWeatherPage = false" />
      </div>

      <MapSection />
    </main>

    <!-- Weather modal / panel (non-routing) -->
    <div v-if="weatherOpen" class="weather-overlay">
      <div class="weather-panel">
        <div class="weather-header">
          <h3>여행 날씨 검색</h3>
          <button class="btn-secondary" @click="weatherOpen = false">
            닫기
          </button>
        </div>

        <div class="weather-search">
          <input
            v-model="weatherLocation"
            placeholder="지역명 입력 (예: 구미)"
          />
          <button class="btn-primary" @click="loadWeather(weatherLocation)">
            검색
          </button>
        </div>

        <div class="weather-body">
          <div v-if="weatherLoading">날씨 정보를 가져오는 중입니다 ☁️</div>
          <div v-else-if="weatherError">{{ weatherError }}</div>
          <div v-else-if="!weatherData">검색어를 입력하고 검색해보세요.</div>
          <div v-else class="weather-results">
            <WeatherCard :weather="weatherData" />
            <TravelScore v-if="travelScore" :scoreData="travelScore" />
          </div>
        </div>
      </div>
    </div>

    <!-- chatbot always present (bound to community chat state) -->
    <ChatbotWidget
      :messages="chatMessages"
      :is-open="chatOpen"
      :input-value="chatInput"
      :is-loading="chatLoading"
      @toggle="chatOpen = !chatOpen"
      @update:input-value="chatInput = $event"
      @send-message="sendChatMessage"
    />

    <!-- <button class="weather-page-floating" @click="showWeatherPage = true">
      여행 페이지
    </button> -->
  </div>
</template>

<script setup>
const placeList = computed(() =>
  Object.values(datasets.value || {})
    .flat()
    .map((it) => ({
      id: it.contentid || it.id,
      name: it.title || it.name,
      image: it.firstimage || it.firstimage2 || "",
      address: it.addr1 || it.address || "",
      category: "" // 필요하면 매핑 추가
    }))
);

// BoardForm에서 보낸 선택된 장소 처리
function onPlaceSelected(place) {
  if (!place) {
    form.value.thumbnail = "/assets/community/local.svg";
  } else if (place.image) {
    form.value.thumbnail = place.image;
  }
}
import BoardForm from "./features/community/BoardForm.vue";
import HomeScreen from "./features/home/HomeScreen.vue";
import DexScreen from "./features/dex/DexScreen.vue";
import { openaiChat } from "./services/openai";
import {
  loadLocalDatasets,
  retrieveRelevantSnippet,
} from "./utils/localsearch";
import { computed, onMounted, ref } from "vue";
import MapSection from "./components/MapSection.vue";
import CommunityBoard from "./components/CommunityBoard.vue";
import PostForm from "./components/PostForm.vue";
import PostDetail from "./components/PostDetail.vue";
import ChatbotWidget from "./components/ChatbotWidget.vue";
import WeatherCard from "./components/WeatherCard.vue";
import TravelScore from "./components/TravelScore.vue";
import WeatherTravelPage from "./components/WeatherTravelPage.vue";
import { fetchCurrentWeather } from "./services/weather";
import { calculateTravelScore } from "./utils/travelScore";

// Tab (master)
const currentTab = ref("map");
const chatLoading = ref(false)

// Community state
const categories = ["전체", "자유", "맛집", "여행후기", "지역정보", "질문"];
const currentCategory = ref("전체");
const searchQuery = ref("");
const sortBy = ref("latest");
const showForm = ref(false);
const editingId = ref(null);
const form = ref({
  title: "",
  category: "자유",
  content: "",
  author: "",
  password: "",
});
const boardPosts = ref([]);
const selectedPostId = ref(null);
const selectedPostOverride = ref(null);
const chatOpen = ref(false);
const chatInput = ref("");
const chatMessages = ref([
  {
    role: "bot",
    text: "안녕하세요! 구미의 익명 커뮤니티에 오신 걸 환영합니다. 맛집, 후기, 지역 정보를 자유롭게 나눠보세요.",
  },
]);
const datasets = ref({});

// Weather page state
const weatherOpen = ref(false);
const weatherLocation = ref("구미");
const weatherLoading = ref(false);
const weatherError = ref("");
const weatherData = ref(null);
const travelScore = ref(null);
const showWeatherPage = ref(false);

const initialPosts = [

]

onMounted(async () => {
  datasets.value = await loadLocalDatasets();
  const storedPosts = localStorage.getItem("localhub-posts");
  boardPosts.value = storedPosts ? JSON.parse(storedPosts) : initialPosts;
  if (boardPosts.value.length) {
    selectedPostId.value = boardPosts.value[0].id;
  }
});

const selectedPost = computed(
  () =>
    boardPosts.value.find((post) => post.id === selectedPostId.value) || selectedPostOverride.value || null,
);
const popularPosts = computed(() =>
  [...boardPosts.value]
    .sort(
      (a, b) =>
        b.likes + b.comments.length * 2 - (a.likes + a.comments.length * 2),
    )
    .slice(0, 3),
);
const filteredPosts = computed(() => {
  let list = [...boardPosts.value];
  if (currentCategory.value !== "전체")
    list = list.filter((post) => post.category === currentCategory.value);
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.trim().toLowerCase();
    list = list.filter((post) =>
      [post.title, post.content, post.author].some((value) =>
        (value || "").toLowerCase().includes(query),
      ),
    );
  }
  if (sortBy.value === "popular") {
    list.sort(
      (a, b) =>
        b.likes + b.comments.length * 2 - (a.likes + a.comments.length * 2),
    );
  } else if (sortBy.value === "views") {
    list.sort((a, b) => b.views - a.views);
  } else {
    list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  return list;
});

function persistPosts() {
  localStorage.setItem("localhub-posts", JSON.stringify(boardPosts.value));
}
function resetForm() {
  showForm.value = false;
  editingId.value = null;
  form.value = {
    title: "",
    category: "자유",
    content: "",
    author: "",
    password: "",
    thumbnail: "/assets/community/local.svg",
  };
}
function openForm() {
  resetForm();
  showForm.value = true;
}
function updateForm(nextValue) {
  form.value = nextValue;
}
function submitPost() {
  if (!form.value.title || !form.value.content || !form.value.author || !form.value.password) {
    window.alert("모든 필드를 입력해주세요.");
    return;
  }

  if (editingId.value) {
    boardPosts.value = boardPosts.value.map((post) =>
      post.id === editingId.value
        ? { ...post, ...form.value, comments: post.comments || [], aiScore: computeAiScore(form.value), thumbnail: form.value.thumbnail || "/assets/community/local.svg" }
        : post
    );
  } else {
    boardPosts.value.unshift({
      id: Date.now(),
      title: form.value.title,
      category: form.value.category,
      content: form.value.content,
      author: form.value.author,
      password: form.value.password,
      createdAt: new Date().toLocaleDateString("ko-KR"),
      views: 0,
      likes: 0,
      comments: [],
      aiScore: computeAiScore(form.value),
      thumbnail: form.value.thumbnail || "/assets/community/local.svg",
    });
  }

  persistPosts();
  resetForm();
}
function computeAiScore(post) {
  const text = ((post.title || "") + " " + (post.content || "")).toLowerCase();
  const cat = (post.category || "").toLowerCase();
  let score = 30;
  const keywords = {
    맛집: ["맛집", "한식", "카페", "분식", "디저트", "식당", "음식"],
    여행후기: ["등산", "후기", "여행", "산책", "관광", "코스", "경치"],
    지역정보: ["주차", "정보", "행사", "축제", "공용", "안내", "소식"],
    질문: ["문의", "질문", "추천", "혼잡", "가능"],
    자유: [],
  };
  const ks = keywords[post.category] || keywords[cat] || [];
  ks.forEach((k) => {
    if (text.includes(k)) score += 15;
  });
  if (text.length > 80) score += 10;
  if (text.includes("추천")) score += 10;
  return Math.min(95, score);
}

function selectPost(post) {
  const exists = boardPosts.value.find((p) => p.id === post.id);
  if (!exists) {
    selectedPostOverride.value = post;
  } else {
    selectedPostOverride.value = null;
  }
  selectedPostId.value = post.id;
  viewPost(post);
}
function viewPost(post) {
  const target = boardPosts.value.find((item) => item.id === post.id);
  if (target) {
    target.views += 1;
    persistPosts();
  }
}
function editPost(post) {
  editingId.value = post.id;
  form.value = {
    title: post.title,
    category: post.category,
    content: post.content,
    author: post.author,
    password: post.password,
    thumbnail: post.thumbnail || "/assets/community/local.svg",
  };
  showForm.value = true;
  selectedPostId.value = post.id;
}
function deletePost(post) {
  const password = window.prompt("삭제하려면 비밀번호를 입력하세요");
  if (password === post.password) {
    boardPosts.value = boardPosts.value.filter((item) => item.id !== post.id);
    persistPosts();
    selectedPostId.value = boardPosts.value[0]?.id || null;
  } else {
    window.alert("비밀번호가 일치하지 않습니다.");
  }
}
function likePost(post) {
  const target = boardPosts.value.find((item) => item.id === post.id);
  if (target) {
    target.likes += 1;
    persistPosts();
  }
}
function addComment({ postId, author, content }) {
  const target = boardPosts.value.find((post) => post.id === postId);
  if (!target || !author || !content) return;
  target.comments.push({
    id: Date.now(),
    author,
    content,
    createdAt: new Date().toLocaleDateString("ko-KR"),
  });
  persistPosts();
}

async function loadWeather(location = weatherLocation.value) {
  weatherError.value = "";
  weatherData.value = null;
  travelScore.value = null;
  if (!location) {
    weatherError.value = "해당 지역 정보를 찾을 수 없습니다.";
    return;
  }
  weatherLoading.value = true;
  try {
    // 서비스에서 env 키(DEFAULT_WEATHER_KEY)를 사용하므로 여기서는 키를 직접 읽지 않습니다
    const data = await fetchCurrentWeather(location);
    if (!data || !data.city) {
      weatherError.value = "해당 지역 정보를 찾을 수 없습니다.";
      return;
    }
    weatherData.value = data;
    travelScore.value = calculateTravelScore({
      temp: data.temp,
      weather: data.weather,
      rain: data.rain,
    });
  } catch (err) {
    console.error(err);
    weatherError.value = err?.message || "날씨 정보를 불러오지 못했습니다.";
  } finally {
    weatherLoading.value = false;
  }
}

function detectIntent(text) {
  const lower = text.toLowerCase();
  if (
    (lower.includes("추천") || lower.includes("추천해")) &&
    (lower.includes("관광") || lower.includes("권역") || lower.includes("여행"))
  ) {
    return "관광지 추천";
  }
  if (
    lower.includes("축제") ||
    lower.includes("일정") ||
    lower.includes("행사")
  ) {
    return "축제 일정";
  }
  if (
    lower.includes("맛집") ||
    lower.includes("음식점") ||
    lower.includes("현지 음식")
  ) {
    return "모범 음식점";
  }
  if (
    lower.includes("게시판") ||
    lower.includes("글") ||
    lower.includes("검색")
  ) {
    return "커뮤니티 게시글 검색";
  }
  return "일반 지역 질의";
}

async function sendChatMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  chatMessages.value.push({ role: "user", text: message });
  chatInput.value = "";

  chatLoading.value = true

  try {
    const intent = detectIntent(message);
    const snippet = retrieveRelevantSnippet(datasets.value, message, 5);

    console.log("[로컬 검색 결과]:", snippet);
    let combinedPrompt = `[지시사항]\n당신은 구미 지역 정보를 제공하는 친절한 AI 어시스턴트입니다. 응답은 한국어로 자연스럽게 작성하세요.\n`;

    if (!snippet) {
      combinedPrompt += `현재 사용자 질문에 해당하는 로컬 데이터가 없습니다. 당신의 일반적인 지식을 바탕으로 구미에 대해 안내해주세요.\n\n`;
    } else {
      combinedPrompt += `아래의 '로컬 데이터 요약'을 바탕으로 질문에 답변해주세요.\n\n`;
    }

    combinedPrompt += `[사용자 질문]: ${message}\n`;
    combinedPrompt += `[요청유형]: ${intent}\n`;
    combinedPrompt += `[로컬 데이터 요약]:\n${snippet || "데이터 없음"}`;

    // 배열 안에 오직 'user' 역할 하나만 넣어서 보냅니다.
    const reply = await openaiChat([{ role: "user", content: combinedPrompt }]);

    const replyText =
      typeof reply === "string"
        ? reply.trim()
        : reply
          ? JSON.stringify(reply)
          : "";
    chatMessages.value.push({
      role: "bot",
      text: replyText || "응답을 찾지 못했습니다.",
    });
  } catch (err) {
    console.error('sendChatMessage error', err)
    chatMessages.value.push({ role: 'bot', text: `응답 생성 중 오류가 발생했습니다. (${err.message})` })
  } finally {
    chatLoading.value = false 
  }
}
</script>

<style scoped>
/* merged styles: master header + community layout */
.app-shell {
  min-height: 100vh;
  background: linear-gradient(135deg, #f3f8ff 0%, #eefbf4 100%);
  color: #16324f;
  font-family: "Pretendard", "Noto Sans KR", sans-serif;
  padding: 0;
  box-sizing: border-box;
}
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
  border-bottom: 2px solid #e9ecef;
}
.logo h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #2c3e50;
}
.logo p {
  margin: 5px 0 0;
  font-size: 0.9rem;
  color: #6c757d;
}
.weather-widget {
  font-weight: bold;
  color: #0056b3;
}

.nav-tabs {
  display: flex;
  gap: 10px;
  padding: 20px;
  justify-content: center;
  background: transparent;
}
.nav-tabs button {
  padding: 10px 20px;
  border: 1px solid #dee2e6;
  background: #f8f9fa;
  cursor: pointer;
  border-radius: 8px;
  font-weight: bold;
}
.nav-tabs button.active {
  background: #fff;
  border-top: 3px solid #0056b3;
}

.main-layout {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 12px;
  align-items: start;
  max-width: 1600px;
  margin: 12px auto;
  padding: 0 12px 24px;
  box-sizing: border-box;
}
.main-layout > aside,
.main-layout > .side-panel {
  align-self: start;
  margin-top: 0;
}
.community-panel,
.side-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 0;
}

/* ensure left community column aligns to top of grid and has no extra top margin */
.community-panel { align-self: start; margin-top: 0; }

.empty-state {
  background: #fff;
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  border: 1px solid #e6edf5;
}

.main-content {
  padding: 20px;
  border: 1px solid #dee2e6;
  border-top: none;
  min-height: 600px;
  max-width: 1200px;
  margin: 20px auto;
}

.btn-primary,
.chat-input button {
  background: #2563eb;
  color: white;
}
.btn-secondary {
  background: #e2e8f0;
  color: #0f172a;
}
.small {
  padding: 6px 10px;
  font-size: 0.9rem;
}

/* board layout styles */
.board-layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
}
.post-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}
.post-detail-card h3 {
  margin-top: 0;
}

/* chatbot styles */
.chatbot-container {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 1000;
}
.chat-floating-btn {
  border: none;
  border-radius: 999px;
  background: #0f766e;
  color: white;
  padding: 14px 18px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(15, 118, 110, 0.25);
}
.chat-window {
  width: 320px;
  height: 460px;
  border-radius: 16px;
  background: white;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.15);
  overflow: hidden;
}

/* styles for best & region-info moved from CommunityBoard */
.best { background:#fff; border-radius:12px; padding:12px; border:1px solid #e6edf5; margin-top:12px }
.best h4 { margin:0 0 8px }
.best ol { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px }
.best li { display:flex; gap:10px; align-items:center; cursor:pointer; padding:8px; border-radius:10px }
.best .rank-wrap { width:36px; display:flex; align-items:center; justify-content:center }
.best .medal { font-size:1.05rem }
.thumb-mini { width:84px; height:56px; border-radius:8px; flex-shrink:0; overflow:hidden }
.thumb-mini img{ width:100%; height:100%; object-fit:cover; display:block }
.best .title { font-weight:700; color:#18344f; margin-bottom:4px }
.best .meta { color:#7d8da2; font-size:0.85rem }
.region-card { padding:10px }
.places-list { margin:0; padding-left:16px }

/* ensure region-info uses card styling for readability */
.region-info { display:flex; flex-direction:column; gap:8px; margin-top:12px }
.region-info .card { background:#fff; border-radius:12px; padding:12px; border:1px solid #e6edf5; box-shadow: 0 8px 18px rgba(15,23,42,0.04) }

/* write-card: 명확한 흰색 박스 스타일로 가독성 향상 */
.write-card { background:#fff; border-radius:12px; padding:12px; border:1px solid #e6edf5; box-shadow: 0 8px 18px rgba(15,23,42,0.04); margin-top:12px }
.write-card h4 { margin:0 0 8px }
.write-card p { margin:0 0 8px; color:#516274 }
.write-card .submit-btn { width:100%; padding:10px; border-radius:8px }

/* Ensure all direct children of the right side-panel align and fill width consistently */
.side-panel > * { width: 100%; box-sizing: border-box; margin: 0 0 12px 0 }
.side-panel .detail-card { margin: 0 0 12px 0 }

.modal-backdrop { position: fixed; inset: 0; background: rgba(10,15,30,0.35); display:flex; align-items:center; justify-content:center; z-index:2000 }
.modal { width: 720px; max-width: 95%; }

.chat-header {
  background: #0f766e;
  color: white;
  padding: 12px 14px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-body {
  flex: 1;
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
}
.message {
  padding: 8px 10px;
  border-radius: 10px;
  max-width: 90%;
}
.message.bot {
  background: #e2e8f0;
  align-self: flex-start;
}
.message.user {
  background: #dbeafe;
  align-self: flex-end;
}
.chat-input {
  display: flex;
  gap: 8px;
  padding: 10px;
  border-top: 1px solid #e2e8f0;
}
.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.recommendation-summary {
  color: #2563eb;
  font-weight: 600;
}

@media (max-width: 900px) {
  .main-layout {
    grid-template-columns: 1fr;
    padding: 0 12px 24px;
  }
  .main-content {
    margin: 12px;
  }
}

/* weather modal styles */
.weather-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(2, 6, 23, 0.45);
  z-index: 1200;
}
.weather-panel {
  width: min(920px, 96%);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 20px 60px rgba(2, 6, 23, 0.3);
}
.weather-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.weather-search {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.weather-search input {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #e6edf5;
}
.weather-body {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.weather-results {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}
.weather-floating {
  position: fixed;
  right: 24px;
  bottom: 96px;
  z-index: 1300;
  border-radius: 999px;
  padding: 10px 14px;
  background: #ff7ab6;
  color: white;
  border: none;
  box-shadow: 0 10px 30px rgba(255, 122, 182, 0.18);
  cursor: pointer;
}
.weather-page-floating {
  position: fixed;
  right: 24px;
  bottom: 150px;
  z-index: 1300;
  border-radius: 10px;
  padding: 8px 12px;
  background: #0f766e;
  color: white;
  border: none;
  box-shadow: 0 8px 20px rgba(15, 118, 110, 0.18);
  cursor: pointer;
}

.chat-input input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.chat-input button {
  background: #0056b3;
  color: white;
  border: none;
  padding: 0 10px;
  margin-left: 5px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
