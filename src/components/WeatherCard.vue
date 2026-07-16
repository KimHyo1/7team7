<template>
  <div v-if="hasData" class="weather-card">
    <div class="header">
      <div class="title">{{ displayCity }}</div>
      <img v-if="iconUrl" :src="iconUrl" alt="icon" class="icon" />
    </div>

    <div class="body">
      <div class="temp">{{ safeTemp !== null ? safeTemp + '°C' : '--' }}</div>
      <div class="desc">{{ displayDesc }}</div>
      <div class="meta">
        <div>체감: {{ safeFeels !== null ? safeFeels + '°C' : '--' }}</div>
        <div>습도: {{ safeHumidity !== null ? safeHumidity + '%' : '--' }}</div>
        <div>강수량: {{ safeRain }} mm</div>
      </div>
    </div>
  </div>

  <div v-else class="weather-card placeholder">
    <div class="header">
      <div class="title">날씨 정보 없음</div>
    </div>
    <div class="body">
      <div class="temp">--</div>
      <div class="desc">정보를 불러오는 중이거나 데이터가 없습니다.</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  weather: {
    type: Object,
    required: false,
    default: () => ({}),
  },
})

const w = computed(() => props.weather || {})

const safeTemp = computed(() =>
  typeof w.value.temp === 'number' && Number.isFinite(w.value.temp) ? Math.round(w.value.temp) : null
)
const safeFeels = computed(() =>
  typeof w.value.feels_like === 'number' && Number.isFinite(w.value.feels_like) ? Math.round(w.value.feels_like) : null
)
const safeHumidity = computed(() =>
  typeof w.value.humidity === 'number' && Number.isFinite(w.value.humidity) ? w.value.humidity : null
)
const safeRain = computed(() => {
  const r = w.value.rain ?? 0
  return typeof r === 'number' && Number.isFinite(r) ? r : 0
})

const displayCity = computed(() => {
  if (w.value.city && String(w.value.city).trim()) return `${w.value.city}${w.value.country ? ' (' + w.value.country + ')' : ''}`
  if (w.value.raw?.name) return `${w.value.raw.name}${w.value.raw?.sys?.country ? ' (' + w.value.raw.sys.country + ')' : ''}`
  return '알 수 없는 지역'
})

const displayDesc = computed(() =>
  w.value.weather || w.value.raw?.weather?.[0]?.description || '정보 없음'
)

const hasData = computed(() => {
  return (
    safeTemp.value !== null ||
    safeFeels.value !== null ||
    safeHumidity.value !== null ||
    (w.value.raw && (w.value.raw.name || w.value.raw.main))
  )
})

const iconUrl = computed(() =>
  w.value.icon ? `https://openweathermap.org/img/wn/${w.value.icon}@2x.png` : (w.value.raw?.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${w.value.raw.weather[0].icon}@2x.png` : '')
  
)

</script>

<style scoped>
.weather-card { background: #fff; border-radius: 16px; padding: 16px; box-shadow: 0 8px 20px rgba(12, 38, 63, 0.06); max-width: 360px; }
.header { display:flex; justify-content:space-between; align-items:center }
.title { font-weight:700; color:#16324f }
.icon { width:56px; height:56px }
.temp { font-size:36px; font-weight:800; color:#2563eb }
.desc { color:#475569; margin-bottom:8px }
.meta { display:flex; gap:12px; color:#334155; font-size:0.9rem }

.weather-card.placeholder { opacity: 0.9; background: linear-gradient(180deg,#fbfdff,#f7fbff); }
</style>