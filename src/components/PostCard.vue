<template>
  <article class="post-card" @click="$emit('view')">
    <div class="thumb">
      <img :src="post.thumbnail || placeholder" :alt="post.title || 'thumbnail'" />
    </div>
    <div class="content">
      <div class="meta-top">
        <div class="left-meta">
          <span class="badge">{{ post.category }}</span>
          <span class="ai-pill">⭐ AI {{ post.aiScore || 0 }}%</span>
        </div>
        <span class="date">{{ post.createdAt }}</span>
      </div>
      <h3 class="title">{{ post.title }}</h3>
      <p class="excerpt">{{ post.content }}</p>
      <div class="meta-row">
        <span class="author">{{ post.author }}</span>
        <span class="views">👁 {{ post.views }}</span>
        <span class="likes">❤️ {{ post.likes }}</span>
        <span class="comments">💬 {{ post.comments?.length || 0 }}</span>
      </div>
      <div class="actions">
        <button class="primary" @click.stop="$emit('view')">상세보기</button>
        <div class="small-actions">
          <button class="mini" @click.stop="$emit('edit')">수정</button>
          <button class="mini" @click.stop="$emit('delete')">삭제</button>
          <button class="mini" @click.stop="$emit('like')">좋아요</button>
        </div>
      </div>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({ post: { type: Object, required: true } })
const emit = defineEmits(['view', 'edit', 'delete', 'like'])
const placeholder = '/assets/community/food1.svg'
</script>

<style scoped>
.post-card { display:flex; gap:16px; background:#fff; border-radius:16px; padding:12px; box-shadow:0 8px 20px rgba(15,23,42,0.04); border:1px solid #e6edf5; transition: transform .12s ease, box-shadow .12s ease }
.post-card:hover { transform: translateY(-6px); box-shadow:0 18px 30px rgba(15,23,42,0.08) }
.thumb { width:120px; height:90px; border-radius:12px; overflow:hidden; flex-shrink:0 }
.thumb img{ width:100%; height:100%; object-fit:cover; display:block }
.content { flex:1; display:flex; flex-direction:column; gap:8px }
.meta-top { display:flex; justify-content:space-between; align-items:center; gap:8px }
.badge { background:#eaf4ff; color:#2c7be5; padding:6px 10px; border-radius:999px; font-weight:700 }
.title { margin:0; color:#18344f; font-size:1.05rem; line-height:1.2 }
.excerpt { margin:0; color:#5d6b7a; font-size:0.95rem; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden }
.meta-row { display:flex; gap:12px; color:#6b7e8f; font-size:0.9rem; align-items:center }
.ai-pill { background:#fff4e6; color:#d08b00; padding:4px 8px; border-radius:999px; font-weight:700; margin-left:8px; }
.actions { display:flex; justify-content:space-between; align-items:center; gap:8px }
.primary { background:linear-gradient(120deg,#2c7be5,#2bbd7f); color:white; border:none; padding:8px 14px; border-radius:999px; cursor:pointer }
.small-actions { display:flex; gap:6px }
.mini { background:#f4f7fb; border:1px solid #dce7f4; color:#36506b; padding:6px 8px; border-radius:999px; cursor:pointer }
@media (max-width:640px){ .post-card{flex-direction:column} .thumb{width:100%;height:160px} }
</style>
