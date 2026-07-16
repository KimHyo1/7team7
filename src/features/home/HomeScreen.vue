<template>
  <section class="home-screen">
    <header class="status-bar">
      <div class="profile-block">
        <div class="profile-header">
          <span class="level-badge">Lv.{{ state.player.level }}</span>
          <span class="profile-name">{{ state.player.title }}</span>
        </div>
        <div class="exp-row">
          <div class="exp-meta">
            <span>EXP</span>
            <span>{{ state.player.exp }} / {{ state.player.expMax }}</span>
          </div>
          <div class="exp-bar">
            <div class="exp-fill" :style="{ width: expPercent + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="resource-block">
        <div class="resource-item coin">
          <span class="icon">💰</span>
          <strong>{{ state.coins.toLocaleString() }}</strong>
        </div>
        <div class="resource-item energy">
          <div class="energy-meta">
            <span class="icon">⚡</span>
            <strong>{{ state.energy }} / {{ state.energyMax }}</strong>
          </div>
          <div class="energy-bar">
            <div class="energy-fill" :style="{ width: energyPercent + '%' }"></div>
          </div>
          <div class="energy-timer" v-if="state.energy < state.energyMax">
            회복까지 {{ recoveryText }}
          </div>
        </div>
      </div>
    </header>

<section class="hero-banner" :class="'phase-' + state.phase">
      <!-- 배경 장식용 빛 효과 -->
      <div class="hero-glow"></div>

      <div class="hero-content">
        <!-- 게임 UI 느낌의 날짜 뱃지 -->
        <div class="day-badge">
          <span class="day-text">Day {{ state.day }}</span>
          <span class="phase-divider">|</span>
          <span class="phase-text">{{ phaseInfo.icon }} {{ phaseInfo.text }}</span>
        </div>
        
        <!-- 메인 카피 -->
        <h1 class="hero-title">
          <span class="highlight">구미</span>에서의 새로운 하루,<br />
          어떤 모험이 기다리고 있을까요?
        </h1>
        <p class="hero-subtitle">오늘의 퀘스트를 달성하고 보상을 획득하세요!</p>
      </div>
    </section>

    <section class="quest-section">
      <div class="quest-head">
        <h2>📜 오늘의 일일 퀘스트</h2>
        <div class="dev-actions">
          <button class="dev-btn" @click="changeHappiness(10)">행복도 +10</button>
          <button class="dev-btn" @click="useEnergy(10)">에너지 -10</button>
        </div>
      </div>

      <ul class="quest-list">
        <li 
          v-for="quest in state.dailyQuests" 
          :key="quest.id" 
          class="quest-card"
          :class="{ 'is-completed': quest.current >= quest.target, 'is-claimed': quest.claimed }"
        >
          <div class="quest-info">
            <h3>{{ quest.title }}</h3>
            <p>{{ quest.desc }}</p>
            <div class="reward-tags">
              <span class="tag exp">EXP {{ quest.rewards.exp }}</span>
              <span class="tag coin">💰 {{ quest.rewards.coins.toLocaleString() }}</span>
            </div>
            
            <div class="quest-progress" v-if="!quest.claimed">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: Math.round((quest.current / quest.target) * 100) + '%' }"
                ></div>
              </div>
              <span class="progress-text">{{ quest.current }} / {{ quest.target }}</span>
            </div>
          </div>

          <div class="quest-action">
            <button 
              v-if="quest.claimed" 
              class="btn-quest claimed" 
              disabled
            >완료됨 ✓</button>
            <button 
              v-else-if="quest.current >= quest.target" 
              class="btn-quest ready" 
              @click="claimQuest(quest.id)"
            >보상 받기</button>
            <button 
              v-else 
              class="btn-quest locked" 
              disabled
            >진행 중</button>
          </div>
        </li>
      </ul>
    </section>
  </section>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useGameState } from '../../game/useGameState.js'

const phaseInfo = computed(() => {
  const map = {
    morning: { text: '아침', icon: '🌅' },
    noon: { text: '점심', icon: '☀️' },
    evening: { text: '저녁', icon: '🌇' },
    night: { text: '밤', icon: '🌙' }
  }
  return map[state.phase] || { text: '알 수 없음', icon: '🕒' }
})

const { state, claimQuest, useEnergy, changeHappiness, gainEnergy } = useGameState()

// 기존 진행률 계산 로직
const expPercent = computed(() => {
  const max = state.player.expMax || 1
  return Math.max(0, Math.min(100, Math.round((state.player.exp / max) * 100)))
})

const energyPercent = computed(() => {
  const max = state.energyMax || 1
  return Math.max(0, Math.min(100, Math.round((state.energy / max) * 100)))
})

// 에너지 회복 타이머 로직 (기존과 동일)
const RECOVER_SECONDS = 6
const countdown = ref(RECOVER_SECONDS)
let intervalId = null

const recoveryText = computed(() => {
  const seconds = Math.max(0, countdown.value)
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
})

onMounted(() => {
  intervalId = window.setInterval(() => {
    if (state.energy >= state.energyMax) return
    countdown.value -= 1
    if (countdown.value <= 0) {
      gainEnergy(1)
      countdown.value = RECOVER_SECONDS
    }
  }, 1000)
})

onUnmounted(() => {
  if (intervalId) window.clearInterval(intervalId)
})
</script>

<style scoped>
/* 전체 레이아웃 */
.home-screen {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 상단 스탯 바 스타일 게임 느낌으로 강화 */
.status-bar {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  padding: 20px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
}

.profile-block { flex: 1; }
.profile-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.level-badge {
  background: #2563eb;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 0.9rem;
}
.profile-name {
  font-size: 1.2rem;
  font-weight: 800;
  color: #0f172a;
}

.exp-row { display: grid; gap: 8px; }
.exp-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 700;
  color: #64748b;
}
.exp-bar {
  width: 100%; height: 12px;
  border-radius: 999px; background: #e2e8f0;
}
.exp-fill {
  height: 100%; border-radius: inherit;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
  transition: width 0.3s ease;
}

.resource-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 220px;
}
.resource-item {
  display: flex;
  flex-direction: column;
  background: #f8fafc;
  padding: 10px 14px;
  border-radius: 12px;
}
.resource-item.coin {
  flex-direction: row;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
}
.energy-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.energy-bar {
  width: 100%; height: 8px;
  border-radius: 999px; background: #cbd5e1;
  margin-bottom: 4px;
}
.energy-fill {
  height: 100%; border-radius: inherit;
  background: linear-gradient(90deg, #22c55e, #14b8a6);
  transition: width 0.3s ease;
}
.energy-timer {
  font-size: 0.75rem; color: #64748b; text-align: right;
}

/* =========================================
   히어로 배너 (게임 타이틀 스타일)
========================================= */
.hero-banner {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 40px 32px;
  color: #ffffff;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.15);
  transition: all 0.5s ease;

/* --- 이미지 배경 삽입 --- */
  background-image: url('../home/hero-banner.png');
  background-size: cover; /* 이미지가 배너를 가득 채우도록 */
  background-repeat: no-repeat;
}

/* --- 배경 장식 효과 수정: 이미지와 겹치지 않게 opacity 조정 --- */
.hero-glow {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0.5; /* 이미지 가리지 않게 살짝 투명하게 */
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1; /* 오버레이보다 위에 위치 */
}

/* Day 뱃지 (글래스모피즘) */
.day-badge {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.15); /* 조금 더 투명하게 */
  backdrop-filter: blur(8px);
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  margin-bottom: 18px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.phase-divider {
  opacity: 0.5;
  font-weight: 400;
}

.phase-text {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.9;
}

/* 메인 타이틀 */
.hero-title {
  margin: 0 0 12px;
  font-size: clamp(1.5rem, 4vw, 2.1rem); /* 크기 약간 조절 */
  line-height: 1.4;
  font-weight: 800;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2); /* 그림자 강화 */
}

/* 지역명 포인트 컬러 */
.hero-title .highlight {
  color: #fde047; /* 부드러운 노란색 */
  position: relative;
}

.hero-subtitle {
  margin: 0;
  font-size: 1rem;
  color: #f8fafc;
  opacity: 0.95;
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

/* 퀘스트 섹션 */
.quest-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.quest-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.quest-head h2 { margin: 0; font-size: 1.25rem; font-weight: 800; }
.dev-actions { display: flex; gap: 8px; }
.dev-btn {
  padding: 6px 12px; border-radius: 8px;
  background: #e2e8f0; border: none; font-size: 0.8rem; cursor: pointer;
}

.quest-list {
  list-style: none; padding: 0; margin: 0;
  display: grid; gap: 12px;
}
.quest-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.02);
  transition: transform 0.2s;
}
.quest-card:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0,0,0,0.05); }

.quest-info h3 { margin: 0 0 4px; font-size: 1.1rem; color: #0f172a; }
.quest-info p { margin: 0 0 12px; font-size: 0.9rem; color: #64748b; }

.reward-tags { display: flex; gap: 8px; margin-bottom: 12px; }
.tag {
  padding: 4px 8px; border-radius: 6px; font-size: 0.8rem; font-weight: 700;
}
.tag.exp { background: #eff6ff; color: #2563eb; }
.tag.coin { background: #fef3c7; color: #d97706; }

.quest-progress { display: flex; align-items: center; gap: 12px; }
.quest-progress .progress-bar {
  flex: 1; max-width: 200px; height: 8px;
  background: #f1f5f9; border-radius: 999px;
}
.quest-progress .progress-fill {
  height: 100%; border-radius: inherit; background: #3b82f6;
  transition: width 0.3s;
}
.progress-text { font-size: 0.85rem; font-weight: 600; color: #475569; }

.btn-quest {
  padding: 12px 24px; border-radius: 12px; font-weight: 800;
  border: none; cursor: pointer; transition: all 0.2s;
}
.btn-quest.locked { background: #f1f5f9; color: #94a3b8; cursor: not-allowed; }
.btn-quest.ready {
  background: linear-gradient(135deg, #2563eb, #6366f1);
  color: white; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}
.btn-quest.ready:hover { transform: scale(1.05); }
.btn-quest.claimed { background: #dcfce7; color: #166534; cursor: not-allowed; }

/* 모바일 반응형 */
@media (max-width: 640px) {
  .status-bar { flex-direction: column; }
  .quest-card { flex-direction: column; align-items: flex-start; gap: 16px; }
  .quest-action, .btn-quest { width: 100%; }
}
</style>