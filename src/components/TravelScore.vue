<template>
  <div v-if="hasData" class="travel-score">
    <div class="score-row">
      <div class="score">{{ displayScore }}</div>
      <div class="grade">{{ scoreData.grade }}</div>
    </div>
    <div class="message">{{ scoreData.message }}</div>
    <div class="stars">{{ stars }}</div>
    <img v-if="characterSrc" :src="characterSrc" class="character" />
  </div>

  <div v-else class="travel-score placeholder">
    <div class="score-row">
      <div class="score">--</div>
      <div class="grade">정보 없음</div>
    </div>
    <div class="message">여행 점수를 불러오는 중입니다.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  scoreData: {
    type: Object,
    required: false,
    default: () => ({}),
  },
})

const scoreData = props.scoreData || {}
const hasData = computed(() => !!(scoreData && (scoreData.score !== undefined || scoreData.grade)))

const displayScore = computed(() => (typeof scoreData.score === 'number' ? Math.round(scoreData.score) : '--'))

const stars = computed(() => {
  const s = typeof scoreData.score === 'number' ? Math.round(scoreData.score / 20) : 0
  return '★'.repeat(Math.max(0, Math.min(5, s)))
})

const characterSrc = computed(() => {
  try {
    if (scoreData.grade === '좋음') return new URL('../assets/sunny.svg', import.meta.url).href
    if (scoreData.grade === '보통') return new URL('../assets/cloudy.svg', import.meta.url).href
    if (scoreData.grade) return new URL('../assets/rainy.svg', import.meta.url).href
  } catch (e) {
    return ''
  }
  return ''
})
</script>

<style scoped>
.travel-score { background:#fff; border-radius:16px; padding:16px; box-shadow:0 8px 20px rgba(12,38,63,0.06); max-width:360px }
.score-row { display:flex; gap:12px; align-items:center }
.score { font-size:32px; font-weight:800; color:#0f766e }
.grade { font-weight:700; color:#334155 }
.message { margin-top:8px; color:#475569 }
.stars { margin-top:6px; color:#f59e0b }
.character { width:80px; margin-top:12px }
.travel-score.placeholder { opacity:0.95; background:linear-gradient(180deg,#fbfdff,#f7fbff) }
</style>