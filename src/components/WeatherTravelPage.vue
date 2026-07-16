<template>
  <div class="weather-page">
    <header class="page-header">
      <h1>오늘의 구미 날씨 🌿</h1>
      <p class="subtitle">날씨를 확인하고 여행하기 좋은 날을 찾아보세요</p>
    </header>

    <section class="search-area">
      <button
        class="refresh-btn"
        @click="reloadGumiWeather"
        :disabled="loading"
        aria-label="구미 날씨 새로고침"
      >
        <span class="refresh-icon" :class="{ spinning: loading }" aria-hidden="true">⟳</span>
        <span class="refresh-label">{{ loading ? '로딩 중...' : '구미 날씨 새로고침' }}</span>
      </button>
    </section>

    <section class="cards-area">
      <div class="cards">
  <div class="main-cards">
    <WeatherCard :weather="weather" />
    <TravelScore v-if="scoreData" :scoreData="scoreData" />
  </div>

  <!-- 시간별 예보(24시간) -->
  <div class="forecast-block" v-if="hourly.length">
    <h4>24시간 예보 (시간 단위)</h4>
    <div class="hourly-row">
      <div v-for="h in sixHourForecast" :key="h.dt" class="hour-card">
        <div class="hour-time">{{ h.time }}</div>
        <img v-if="h.icon" :src="`https://openweathermap.org/img/wn/${h.icon}@2x.png`" alt="" />
        <div class="hour-temp">{{ Math.round(h.temp) }}°C</div>
        <div class="hour-pop">{{ Math.round((h.pop||0) * 100) }}%</div>
      </div>
    </div>
  </div>
</div>
    </section>
  </div>
</template>

<script setup>

import { ref, onMounted, computed } from 'vue'
import WeatherCard from './WeatherCard.vue'
import TravelScore from './TravelScore.vue'
import { fetchGumiWeather, fetchGumiForecastSafe } from '../services/weather'
import { calculateTravelScore } from '../utils/travelScore'

const emit = defineEmits(['close'])

const loading = ref(false)
const error = ref('')
const weather = ref(null)
const scoreData = ref(null)
const hourly = ref([])   // 추가

const sixHourForecast = computed(() => {
  const src = hourly.value || []
  if (!src.length) return []

  const result = [src[0]]
  let lastDt = src[0]?.dt || 0

  for (let i = 1; i < src.length && result.length < 4; i += 1) {
    const current = src[i]
    if (!current?.dt) continue

    // Keep entries spaced by at least 6 hours (21600 seconds)
    if (current.dt - lastDt >= 21600) {
      result.push(current)
      lastDt = current.dt
    }
  }

  return result
})

async function loadGumi() {
  error.value = ''
  weather.value = null
  scoreData.value = null
  loading.value = true
  try {
    console.log('[loadGumi] calling fetchGumiWeather()...')
    const data = await fetchGumiWeather() // uses DEFAULT_WEATHER_KEY
    console.log('[loadGumi] fetchGumiWeather returned:', data)

    if (!data) {
      error.value = '날씨 API 응답이 없습니다. (data=null)'
      return
    }
    if (!data.city) {
      console.warn('[loadGumi] missing city in data:', data)
      error.value = '구미 날씨 정보를 찾을 수 없습니다. (city 누락)'
      return
    }

    weather.value = data
    scoreData.value = calculateTravelScore({ temp: data.temp, weather: data.weather, rain: data.rain })

    // fetch hourly/daily forecast (One Call)
    try {
      console.log('[loadGumi] calling fetchGumiForecast()...')
      const fc = await fetchGumiForecastSafe()
      console.log('[loadGumi] fetchGumiForecast returned:', fc)
      hourly.value = fc.hourly || []
    } catch (e) {
      console.warn('fetchGumiForecast failed', e)
      hourly.value = []
    }
  } catch (err) {
    console.error(err)
    error.value = err?.message || '날씨 정보를 불러오지 못했습니다.'
  } finally {
    loading.value = false
  }
}


function reloadGumiWeather() {
  loadGumi()
}

onMounted(() => {
  loadGumi()
})
</script>

<style scoped>
.weather-page { padding: 24px; max-width: 1100px; margin: 0 auto }
.page-header { display:flex; align-items:center; gap:16px; justify-content:space-between }
.page-header h1 { margin:0; font-size:1.6rem }
.subtitle { margin:0; color:#475569 }
.close-btn { margin-left:12px }
.search-area { margin:18px 0 }
.cards-area { display:flex; gap:18px; flex-wrap:wrap }
.state-msg { padding:18px; background:#fff; border-radius:12px; box-shadow:0 8px 20px rgba(12,38,63,0.06) }
.cards { display:flex; gap:18px; align-items:flex-start }

@media (max-width:900px) {
  .cards { flex-direction:column }
}
.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: linear-gradient(90deg,#7c83ff,#3aa0ff);
  color: #fff;
  border: none;
  border-radius: 999px;
  box-shadow: 0 6px 18px rgba(58,160,255,0.18);
  font-weight: 700;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease, opacity .12s ease;
}
.refresh-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 26px rgba(58,160,255,0.22); }
.refresh-btn:active { transform: translateY(0); }
.refresh-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: none; }

.refresh-icon {
  display: inline-block;
  font-size: 1.05rem;
  line-height: 1;
  transition: transform .2s linear;
}
.refresh-icon.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.refresh-label { font-size: 0.95rem; }
.forecast-block { width:100%; margin-top:12px }
.hourly-row { display:grid; grid-template-columns:repeat(4, minmax(84px, 1fr)); gap:10px; padding:8px 0 }
.hour-card { min-width:84px; text-align:center; background:#fff; padding:8px; border-radius:10px; box-shadow:0 6px 18px rgba(12,38,63,0.06) }
.hour-time { font-size:0.8rem; color:#64748b; margin-bottom:4px }
.hour-temp { font-weight:700; margin-top:6px }
.main-cards { display:flex; gap:18px; flex-direction:column; min-width:280px }
@media (min-width:900px) { .main-cards { flex-direction:column } }

@media (max-width:640px) {
  .hourly-row { grid-template-columns:repeat(2, minmax(84px, 1fr)); }
}
</style>
