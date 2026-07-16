import { reactive, watch } from 'vue'

const STORAGE_KEY = 'localhub-game'

function expForLevel(level) {
  return Math.round((level + 1) * 130)
}

function createInitialState() {
  return {
    player: { level: 7, exp: 480, expMax: 950, title: '초보 여행자' },
    coins: 48000,
    energy: 72,
    energyMax: 100,
    happiness: 60,
    fatigue: 20,
    luna: { level: 2, exp: 120, expMax: 300 },
    day: 3,
    phase: 'morning',
    districts: { /* 기존과 동일 */ },
    dex: {},
    dexTotal: 386,

    // 변경됨: 단일 목표 대신 일일 퀘스트 목록 도입
    dailyQuests: [
      { id: 'q1', type: 'happiness', target: 20, current: 0, rewards: { exp: 150, coins: 500 }, claimed: false, title: '소소한 힐링', desc: '행복도 20 올리기' },
      { id: 'q2', type: 'energy', target: 30, current: 0, rewards: { exp: 200, coins: 1000 }, claimed: false, title: '활기찬 발걸음', desc: '에너지 30 소모하기' },
      { id: 'q3', type: 'discover', target: 1, current: 0, rewards: { exp: 300, coins: 2000 }, claimed: false, title: '새로운 발견', desc: '새로운 장소 1곳 도감에 등록하기' }
    ],

    itinerary: [],
    dayStart: null,
  }
}

// module-level singleton state shared across all composable calls
const state = reactive(createInitialState())

// simple deep clone helper for safe persistence payloads
function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

// deep merge persisted data onto a fresh seed
function mergeDeep(target, source) {
  if (!source || typeof source !== 'object') return target

  for (const key of Object.keys(source)) {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      mergeDeep(targetValue, sourceValue)
    } else {
      target[key] = clone(sourceValue)
    }
  }

  return target
}

// save current singleton state into localStorage
function saveState() {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore storage failures
  }
}

// load persisted state and merge into the singleton
function loadState() {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw)
    mergeDeep(state, parsed)
  } catch {
    // ignore corrupt storage and keep seed state
  }
}

// format today's date as YYYY.MM.DD
function todayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

// detect district from place metadata
function matchDistrict(place) {
  const text = [
    place?.district,
    place?.addr1,
    place?.address,
    place?.name,
    place?.title,
  ]
    .filter(Boolean)
    .join(' ')

  if (!text) return null

  const rules = [
    ['구미시내', ['구미시내', '원평', '송정', '형곡', '신평', '광평', '지산', '도량', '구미']],
    ['선산읍', ['선산읍', '선산']],
    ['해평면', ['해평면', '해평']],
    ['고아읍', ['고아읍', '고아']],
    ['옥동읍', ['옥동읍', '옥동']],
  ]

  for (const [district, keywords] of rules) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return district
    }
  }

  return null
}

// --- 새로 추가된 내부 헬퍼 함수: 퀘스트 진행도 업데이트 ---
function updateQuestProgress(type, amount) {
  const quest = state.dailyQuests.find(q => q.type === type && !q.claimed);
  if (quest) {
    quest.current = Math.min(quest.target, quest.current + amount);
  }
}

// level-up loop for a stat block with exp / expMax / level
function applyExpProgress(target, amount) {
  if (!Number.isFinite(amount) || amount <= 0) return

  target.exp += amount
  while (target.exp >= target.expMax) {
    target.exp -= target.expMax
    target.level += 1
    target.expMax = expForLevel(target.level)
  }
}

// clamp helper for 0 ~ energyMax fields
function clampEnergy(value) {
  return Math.max(0, Math.min(state.energyMax, value))
}

// composable: returns the shared singleton state and action functions
export function useGameState() {
  return {
    // shared singleton state
    state,

    // exp / currency
    gainExp,
    addCoins,
    spendCoins,

    // resource changes
    useEnergy,
    gainEnergy,
    changeHappiness,
    changeFatigue,

    // luna growth
    addLunaExp,

    // discovery / collections
    rarityOf,
    discover,
    dexCount,
    discoveryRate,

    // daily goal / day cycle
    claimQuest,
    startDay,
    advancePhase,
    endDay,
    nextDay,

    // full reset
    reset,
  }
}

// player exp gain with repeat level-up support
function gainExp(n) {
  applyExpProgress(state.player, Number(n) || 0)
}

// add coins directly
function addCoins(n) {
  state.coins += Number(n) || 0
}

// spend coins only when balance is enough
function spendCoins(n) {
  const amount = Number(n) || 0
  if (amount > state.coins) return false
  state.coins -= amount
  return true
}

// consume energy with clamp
function useEnergy(n) {
  const amount = Number(n) || 0;
  state.energy = clampEnergy(state.energy - amount);
  updateQuestProgress('energy', amount); // 에너지 소모 퀘스트 연동
}

// restore energy with clamp
// restore energy with clamp
function gainEnergy(n) {
  state.energy = clampEnergy(state.energy + (Number(n) || 0))
}

// change happiness with clamp
function changeHappiness(d) {
  const amount = Number(d) || 0;
  if (amount > 0) updateQuestProgress('happiness', amount); // 행복도 증가 퀘스트 연동
  state.happiness = Math.max(0, Math.min(100, state.happiness + amount));
}

// change fatigue with clamp
function changeFatigue(d) {
  state.fatigue = clamp100(state.fatigue + (Number(d) || 0))
}

// luna affinity exp gain with the same level-up logic
function addLunaExp(n) {
  applyExpProgress(state.luna, Number(n) || 0)
}

// rarity rules for a place
function rarityOf(place) {
  if (place?.image && place?.typeId === '12') return 'SSR'
  if (place?.image) return 'SR'
  return 'R'
}

// add a place to dex and district discovery counts if new
function discover(place) {
  if (!place?.id || state.dex[place.id]) return false;

  const district = matchDistrict(place)

  state.dex[place.id] = {
    rarity: rarityOf(place),
    category: place.category || '기타',
    date: todayString(),
  }

  if (district && state.districts[district]) {
    state.districts[district].discovered += 1
  }
  updateQuestProgress('discover', 1); // 장소 발견 퀘스트 연동
  return true;
}

// count discovered dex entries
function dexCount() {
  return Object.keys(state.dex).length
}

// discovery percent against total
function discoveryRate() {
  return Math.round((dexCount() / state.dexTotal) * 100)
}

// --- 일일 퀘스트 보상 수령 로직 ---
function claimQuest(questId) {
  const quest = state.dailyQuests.find(q => q.id === questId);
  if (!quest || quest.claimed || quest.current < quest.target) return false;

  // 보상 지급 (핵심 요구사항: 경험치 획득)
  gainExp(quest.rewards?.exp || 0);
  addCoins(quest.rewards?.coins || 0);
  quest.claimed = true;

  return true;
}

// snapshot current day state for settlement
function startDay() {
  state.dayStart = {
    coins: state.coins,
    happiness: state.happiness,
    fatigue: state.fatigue,
    dexCount: dexCount(),
    lunaExp: state.luna.exp,
  }
  state.phase = 'morning'
  return state.dayStart
}


// move phase forward in the daily cycle
function advancePhase() {
  const order = ['morning', 'noon', 'evening', 'night']
  const index = order.indexOf(state.phase)
  if (index >= 0 && index < order.length - 1) {
    state.phase = order[index + 1]
  } else {
    state.phase = 'settlement'
  }
  return state.phase
}

// settle day using the stored snapshot
function endDay() {
  const start = state.dayStart || {
    coins: state.coins,
    happiness: state.happiness,
    fatigue: state.fatigue,
    dexCount: dexCount(),
    lunaExp: state.luna.exp,
  }

  return {
    spent: Math.max(0, start.coins - state.coins),
    happinessDelta: state.happiness - start.happiness,
    fatigueDelta: state.fatigue - start.fatigue,
    newDiscoveries: Math.max(0, dexCount() - start.dexCount),
    lunaDelta: state.luna.exp - start.lunaExp,
  }
}

// advance to the next day and rebuild the daily baseline
function nextDay() {
  state.day += 1;
  state.phase = 'morning';
  state.energy = state.energyMax;
  state.happiness = 60;
  state.fatigue = 20;

  // 다음 날이 되면 퀘스트 초기화
  state.dailyQuests.forEach(q => {
    q.current = 0;
    q.claimed = false;
  });

  state.itinerary = [];
  startDay();
}

// full state reset to the original seed
// full state reset to the original seed
function reset() {
  const fresh = createInitialState()

  state.player = clone(fresh.player)
  state.coins = fresh.coins
  state.energy = fresh.energy
  state.energyMax = fresh.energyMax
  state.happiness = fresh.happiness
  state.fatigue = fresh.fatigue
  state.luna = clone(fresh.luna)
  state.day = fresh.day
  state.phase = fresh.phase

  state.dex = {}
  state.districts = clone(fresh.districts)
  for (const key of Object.keys(state.districts)) {
    state.districts[key].discovered = 0
  }

  state.dexTotal = fresh.dexTotal
  state.dailyGoal = clone(fresh.dailyGoal)
  state.itinerary = []
  state.dayStart = null

  saveState()
}
// persist once on module load after merging any saved payload
loadState()

// keep the singleton saved whenever it changes
watch(
  state,
  () => {
    saveState()
  },
  { deep: true },
)