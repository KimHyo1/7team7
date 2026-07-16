<template>
  <section class="detail-card">
    <section class="ai-recommend">
      <h4>✨ AI 장소 추천</h4>
      <p class="rec-sub">이 게시글과 함께 방문하면 좋은 장소</p>
      <div class="rec-list">
        <article class="rec-item" v-for="rec in recommendations" :key="rec.id">
          <div class="rec-left">
            <div class="rec-icon">🍜</div>
          </div>
          <div class="rec-body">
            <div class="rec-title">{{ rec.title }}</div>
            <div class="rec-meta">📍 거리: {{ rec.distance }}</div>
            <div class="rec-reason">💡 {{ rec.reason }}</div>
          </div>
          <!-- map button removed per request -->
        </article>
      </div>
    </section>
    <div class="detail-top">
      <div class="left">
        <span class="detail-badge">{{ post.category }}</span>
        <h3 class="detail-title">{{ post.title }}</h3>
        <div class="author-row">
          <span class="author">작성자 {{ post.author }}</span>
          <span class="date">{{ post.createdAt }}</span>
          <span class="views">조회 {{ post.views }}</span>
        </div>
      </div>
      <div class="right-actions">
        <button class="like-btn" @click="$emit('like')">❤️ {{ post.likes || 0 }}</button>
        <button class="soft-btn" @click="$emit('edit', post)">수정</button>
        <button class="soft-btn" @click="$emit('delete', post)">삭제</button>
      </div>
    </div>

    <div class="content-card">
      <p class="detail-content">{{ post.content }}</p>
    </div>

    <div class="ai-wrap">
      <div class="ai-card">
        <h4>✨ AI 요약</h4>
        <p>{{ post.aiSummary || 'AI가 요약한 핵심 정보를 보여줍니다.' }}</p>
      </div>

      <div class="ai-questions">
        <h5>💡 AI 추천 질문</h5>
        <div class="qa-row">
          <button v-for="q in post.aiQuestions || ['주차 가능한가요?','아이와 방문하기 좋은가요?','방문 시간 추천해주세요.']" :key="q" class="qa-btn" @click="$emit('ask-question', q)">{{ q }}</button>
        </div>
      </div>
    </div>

    <CommentSection :comments="post.comments || []" @add-comment="$emit('add-comment', $event)" @ai-answer-request="$emit('ai-answer-request', $event)" @like-comment="$emit('like-comment', $event)" />
  </section>
</template>

<script setup>
import { computed } from 'vue'
import CommentSection from './CommentSection.vue'
const props = defineProps({ post: { type: Object, required: true } })
const emit = defineEmits(['edit', 'delete', 'like', 'add-comment', 'ask-question', 'view-map'])

const recommendations = computed(() => {
  const p = props.post || {}
  const loc = p.location || '구미'
  // simple mocked recommendations based on category/location
  return [
    {
      id: 'r1',
      title: `${loc} 맛집 추천`,
      distance: '500m',
      reason: '식사 후 산책하기 좋은 코스입니다.',
    },
    {
      id: 'r2',
      title: '근처 카페 추천',
      distance: '300m',
      reason: '후기 작성자가 좋아할 만한 분위기입니다.',
    },
  ]
})

function openMap(rec){ emit('view-map', rec) }
</script>

<style scoped>
.detail-card { background: #fff; border-radius: 18px; padding: 18px; box-shadow: 0 12px 30px rgba(15,23,42,0.06); border: 1px solid #e6edf5; display:flex; flex-direction:column; gap:12px }
.detail-top { display:flex; justify-content:space-between; gap:12px; align-items:flex-start }
.detail-title { margin:6px 0 0; color:#18344f }
.author-row { display:flex; gap:10px; color:#6b7e8f; font-size:0.92rem }
.right-actions { display:flex; gap:8px; align-items:center }
.soft-btn { border:1px solid #dce7f4; background:#f7fbff; color:#36506b; border-radius:999px; padding:7px 10px; cursor:pointer }
.like-btn { background:#fff0f0; border:1px solid #ffd6dd; padding:8px 12px; border-radius:999px }
.content-card { background:#fff; border-radius:12px; padding:12px; border:1px solid #e6edf5; box-shadow:0 6px 18px rgba(15,23,42,0.03) }
.ai-wrap { display:flex; flex-direction:column; gap:8px }
.ai-card { background:linear-gradient(180deg,#fff 0%, #f7fbff 100%); border-radius:12px; padding:12px; border:1px solid #e6edf5 }
.ai-card h4 { margin:0 0 6px }
.ai-questions { display:flex; flex-direction:column; gap:6px }
.qa-row { display:flex; gap:8px; flex-wrap:wrap }
.qa-btn { background:#fff; border:1px solid #e6edf5; padding:6px 10px; border-radius:999px; font-size:0.92rem; cursor:pointer }

.ai-recommend { background: linear-gradient(180deg,#fff 0%, #f7fbff 100%); border-radius:12px; padding:12px; border:1px solid #e6edf5; box-shadow: 0 10px 24px rgba(15,23,42,0.04) }
.ai-recommend h4{ margin:0 0 6px }
.rec-sub { color:#6b7e8f; margin:0 0 8px }
.rec-list { display:flex; flex-direction:column; gap:8px }
.rec-item { display:flex; gap:10px; align-items:flex-start; background:#fff; border-radius:10px; padding:8px; border:1px solid #eef6ff }
.rec-icon { font-size:1.4rem }
.rec-title { font-weight:700; color:#18344f }
.rec-meta { color:#7d8da2; font-size:0.92rem }
.rec-reason { color:#516274; font-size:0.95rem; margin-top:4px }
.rec-action { margin-left:auto }
.map-btn { background:linear-gradient(120deg,#2c7be5,#2bbd7f); color:white; border:none; padding:6px 10px; border-radius:999px; cursor:pointer }
</style>
