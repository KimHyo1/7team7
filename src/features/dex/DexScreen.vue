<template>
  <section class="dex-screen">
    <header class="dex-header">
      <div>
        <h2>도감</h2>
        <p class="collection-text">수집률 {{ collectedCount }} / {{ totalCount }} ({{ collectionRate }}%)</p>
      </div>

      <button type="button" class="dev-btn" @click="sampleDiscover">
        샘플 발견(dev)
      </button>
    </header>

    <nav class="category-tabs" aria-label="도감 카테고리">
      <button
        v-for="category in ['전체', ...categories]"
        :key="category"
        type="button"
        class="category-tab"
        :class="{ active: activeCategory === category }"
        @click="activeCategory = category"
      >
        {{ category }}
      </button>
    </nav>

    <div class="filter-bar" aria-label="도감 필터">
      <button
        v-for="item in filterButtons"
        :key="item.value"
        type="button"
        class="filter-chip"
        :class="{ active: filter === item.value }"
        @click="filter = item.value"
      >
        {{ item.label }}
      </button>
    </div>

    <div v-if="visiblePlaces.length > 0" class="dex-grid">
      <article
        v-for="place in visiblePlaces"
        :key="place.id"
        class="dex-card"
        :class="{ discovered: isDiscovered(place.id), locked: !isDiscovered(place.id) }"
      >
        <template v-if="isDiscovered(place.id)">
          <div class="card-image">
            <img v-if="place.image" :src="place.image" :alt="place.name" loading="lazy" />
            <div v-else class="no-image">이미지 없음</div>
          </div>

          <div class="card-body">
            <div class="card-top">
              <h3 class="place-name">{{ place.name }}</h3>
              <span class="rarity-badge" :class="'rarity-' + state.dex[place.id].rarity">
                {{ state.dex[place.id].rarity }}
              </span>
            </div>

            <div class="stars" :aria-label="`${starsFor(state.dex[place.id].rarity)}점`">
              <span v-for="n in starsFor(state.dex[place.id].rarity)" :key="n">★</span>
            </div>

            <p class="meta-line">{{ place.address || '주소 정보 없음' }}</p>
            <p class="meta-line">발견일 {{ state.dex[place.id].date }}</p>
          </div>
        </template>

        <template v-else>
          <div class="locked-mask">
            <div class="locked-icon">🔒</div>
            <div class="locked-name">???</div>
            <div class="locked-label">미발견</div>
          </div>
        </template>
      </article>
    </div>

    <div v-else class="empty-state">
      표시할 항목이 없습니다
    </div>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue'
import { usePlaces } from '../../game/usePlaces.js'
import { useGameState } from '../../game/useGameState.js'

// 공유 데이터 소스
const { categories, byCategory } = usePlaces()
const { state, discover } = useGameState()

// 현재 카테고리를 '전체'로 기본 설정
const activeCategory = ref('전체')
const filter = ref('all')

// 필터 버튼에서 희귀, 전설 제거
const filterButtons = [
  { label: '전체', value: 'all' },
  { label: '미발견', value: 'undiscovered' },
]

// 전체 카탈로그를 탭 순서대로 합친 목록
const allPlaces = computed(() => categories.flatMap((category) => byCategory(category)))

// 발견 여부 확인
function isDiscovered(placeId) {
  return Boolean(state.dex[placeId])
}

// 전체 수집 수
const collectedCount = computed(() =>
  allPlaces.value.filter((place) => isDiscovered(place.id)).length,
)

// 전체 개수
const totalCount = computed(() => allPlaces.value.length)

// 수집률 퍼센트
const collectionRate = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((collectedCount.value / totalCount.value) * 100)
})

// 별점 계산 헬퍼
function starsFor(rarity) {
  if (rarity === 'SSR') return 4
  if (rarity === 'SR') return 3
  return 2
}

// 현재 탭에 표시할 목록 계산
const visiblePlaces = computed(() => {
  // 선택된 카테고리가 '전체'일 경우 합쳐진 allPlaces를 사용, 아니면 해당 카테고리만 사용
  const baseList = activeCategory.value === '전체' 
    ? allPlaces.value 
    : byCategory(activeCategory.value)

  return baseList.filter((place) => {
    const discovered = state.dex[place.id]

    if (filter.value === 'all') return true
    if (filter.value === 'undiscovered') return !discovered

    return true
  })
})

// 샘플 발견 버튼: 현재 카테고리에서 최대 5개 무작위 발견 처리
function sampleDiscover() {
  // 샘플 발견 로직도 카테고리가 '전체'일 때를 처리하도록 수정
  const baseList = activeCategory.value === '전체' 
    ? allPlaces.value 
    : byCategory(activeCategory.value)
    
  const candidates = baseList.filter((place) => !isDiscovered(place.id))
  if (candidates.length === 0) return

  const shuffled = [...candidates].sort(() => Math.random() - 0.5)
  const picks = shuffled.slice(0, 5)

  for (const place of picks) {
    discover(place)
  }
}
</script>

<style scoped>
/* 기존 스타일 유지 */
.dex-screen {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  box-sizing: border-box;
}

.dex-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.dex-header h2 {
  margin: 0;
  font-size: 1.4rem;
  font-weight: 800;
}

.collection-text {
  margin: 6px 0 0;
  color: #475569;
  font-size: 0.95rem;
}

.dev-btn {
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  color: #0f172a;
  border-radius: 10px;
  padding: 9px 12px;
  cursor: pointer;
  font-weight: 600;
}

.category-tabs,
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-tab,
.filter-chip {
  border: 1px solid #dbe3ee;
  background: #fff;
  color: #64748b;
  border-radius: 999px;
  padding: 7px 14px;
  cursor: pointer;
  font-size: 0.9rem;
}

.category-tab.active,
.filter-chip.active {
  background: #eff6ff;
  color: #1d4ed8;
  border-color: #93c5fd;
  font-weight: 700;
}

.dex-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.dex-card {
  border: 1px solid #dbe3ee;
  border-radius: 14px;
  overflow: hidden;
  background: #fff;
  min-height: 250px;
}

.dex-card.discovered {
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.04);
}

.dex-card.locked {
  background: #111827;
  border-color: #111827;
}

.card-image {
  height: 130px;
  background: #e2e8f0;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.no-image {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 0.85rem;
  background: #e2e8f0;
}

.card-body {
  padding: 12px;
}

.card-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: flex-start;
}

.place-name {
  margin: 0;
  font-size: 1rem;
  line-height: 1.3;
}

.rarity-badge {
  flex: none;
  border-radius: 999px;
  padding: 4px 9px;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
}

.rarity-SSR {
  background: #d4a017;
}

.rarity-SR {
  background: #7c3aed;
}

.rarity-R {
  background: #64748b;
}

.stars {
  margin-top: 8px;
  color: #f59e0b;
  font-size: 0.86rem;
  letter-spacing: 1px;
}

.meta-line {
  margin: 6px 0 0;
  color: #64748b;
  font-size: 0.86rem;
}

.locked-mask {
  height: 100%;
  min-height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.82);
  text-align: center;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.96), rgba(17, 24, 39, 0.88));
  filter: grayscale(1) blur(0.2px);
}

.locked-icon {
  font-size: 1.5rem;
}

.locked-name {
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.locked-label {
  font-size: 0.85rem;
  color: #cbd5e1;
}

.empty-state {
  padding: 28px 16px;
  text-align: center;
  color: #64748b;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  background: #fff;
}

@media (max-width: 640px) {
  .dex-header {
    flex-direction: column;
    align-items: stretch;
  }

  .dev-btn {
    width: 100%;
  }
}
</style>