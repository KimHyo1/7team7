<template>
  <div class="comment-section">
    <h4>댓글</h4>
    <div v-if="comments.length" class="comment-list">
      <div v-for="comment in comments" :key="comment.id" class="comment-item">
        <div class="comment-head">
          <span class="author-badge">{{ comment.author }}</span>
          <span class="c-date">{{ comment.createdAt }}</span>
        </div>
        <p class="c-body">{{ comment.content }}</p>
        <div class="comment-actions">
          <div class="left-actions">
            <button class="small-btn" @click="$emit('like-comment', comment.id)">❤️ {{ comment.likes || 0 }}</button>
            <button class="small-btn" @click="toggleReply(comment.id)">답글</button>
          </div>
          <div class="right-actions">
            <button class="ai-btn" @click="requestAIAnswer(comment.content)">AI 답변</button>
          </div>
        </div>

        <div v-if="replies[comment.id]" class="replies">
          <div v-for="r in replies[comment.id]" :key="r.id" class="reply-item">
            <div class="comment-meta"><strong>{{ r.author }}</strong><span>{{ r.createdAt }}</span></div>
            <p>{{ r.content }}</p>
          </div>
        </div>

        <div v-if="replyTarget === comment.id" class="reply-form">
          <input v-model="replyAuthor" type="text" placeholder="익명 닉네임" />
          <textarea v-model="replyContent" rows="2" placeholder="답글을 입력하세요" />
          <div class="reply-actions">
            <button class="small-btn" @click="submitReply(comment.id)">답글 등록</button>
            <button class="small-btn" @click="cancelReply">취소</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="comment-empty">아직 댓글이 없습니다.</div>
    <form class="comment-form" @submit.prevent="submitComment">
      <div class="input-row">
        <input v-model="author" type="text" placeholder="익명 닉네임" required />
        <textarea v-model="content" rows="2" placeholder="댓글을 남겨보세요" required />
      </div>
      <div class="form-actions">
        <button type="submit" class="post-btn">작성</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const props = defineProps({ comments: { type: Array, default: () => [] } })
const emit = defineEmits(['add-comment', 'like-comment', 'ai-answer-request'])
const author = ref('')
const content = ref('')
const replyAuthor = ref('')
const replyContent = ref('')
const replyTarget = ref(null)
const replies = ref({})

function submitComment() {
  const payload = { author: author.value.trim(), content: content.value.trim() }
  emit('add-comment', payload)
  author.value = ''
  content.value = ''
}

function toggleReply(id) {
  replyTarget.value = replyTarget.value === id ? null : id
}

function cancelReply() {
  replyTarget.value = null
  replyAuthor.value = ''
  replyContent.value = ''
}

function submitReply(parentId) {
  const r = { id: Date.now(), author: replyAuthor.value || '익명', content: replyContent.value }
  replies.value[parentId] = replies.value[parentId] || []
  replies.value[parentId].push(r)
  replyAuthor.value = ''
  replyContent.value = ''
  replyTarget.value = null
}

function requestAIAnswer(contentText) {
  emit('ai-answer-request', { question: contentText })
}
</script>

<style scoped>
.comment-section { border-top: 1px solid #e5ecf4; padding-top: 12px; }
h4 { margin: 0 0 8px; color: #18344f; }
.comment-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
.comment-item { background: #fff; border-radius: 12px; padding: 10px; border:1px solid #e6edf5; box-shadow:0 8px 18px rgba(15,23,42,0.03) }
.comment-head { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px }
.author-badge { background:#f4f7fb; padding:6px 10px; border-radius:999px; color:#36506b; font-weight:700 }
.c-date { color:#7d8da2; font-size:0.9rem }
.c-body { margin:0; color:#516274 }
.comment-actions { display:flex; justify-content:space-between; align-items:center; margin-top:8px }
.left-actions { display:flex; gap:8px }
.right-actions { display:flex }
.small-btn { background:#f4f7fb; border:1px solid #e6edf5; padding:6px 8px; border-radius:999px; cursor:pointer }
.ai-btn { background:#fff; border:1px solid #ffdfe8; padding:6px 10px; border-radius:999px; color:#d03b4c }
.replies { margin-top:8px; display:flex; flex-direction:column; gap:6px }
.reply-item { background:#f8fbff; padding:8px; border-radius:10px }
.reply-form input, .reply-form textarea { border:1px solid #e6edf5; border-radius:8px; padding:6px }
.comment-empty { color:#79879a; margin-bottom:10px }
.comment-form { display:flex; flex-direction:column; gap:8px }
.input-row { display:flex; gap:8px }
.input-row input { width:160px; border:1px solid #e6edf5; border-radius:8px; padding:8px }
.input-row textarea { flex:1; border:1px solid #e6edf5; border-radius:8px; padding:8px }
.form-actions { display:flex; justify-content:flex-end }
.post-btn { background:#2c7be5; color:white; border:none; padding:8px 12px; border-radius:999px; cursor:pointer }
</style>
