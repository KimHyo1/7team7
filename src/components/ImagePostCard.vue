<template>
  <article class="image-post" @click="$emit('view')">
    <div class="img-wrap">
      <img :src="post.thumbnail || placeholder" :alt="post.title" loading="lazy" />
    </div>
    <div class="body">
      <div class="top-row">
        <span class="badge">{{ post.category }}</span>
        <span class="ai-pill">⭐ AI {{ post.aiScore || 0 }}%</span>
        <span class="location">📍 {{ post.location || '구미' }}</span>
      </div>
      <h3 class="title">{{ post.title }}</h3>
      <p class="excerpt">{{ post.content }}</p>
      <div class="meta-row">
        <span>{{ post.author }}</span>
        <span class="views">👁 {{ post.views || 0 }}</span>
        <span class="likes">❤️ {{ post.likes || 0 }}</span>
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
const emit = defineEmits(['view','edit','delete','like'])
const placeholder = 'https://via.placeholder.com/600x400?text=No+Image'
</script>

<style scoped>
.image-post { display:flex; gap:12px; background:#fff; border-radius:12px; overflow:hidden; border:1px solid #e6edf5; box-shadow: 0 8px 18px rgba(15,23,42,0.04); cursor:pointer }
.img-wrap { width: 160px; flex-shrink:0; height:110px; overflow:hidden }
.img-wrap img { width:100%; height:100%; object-fit:cover; display:block }
.body { padding:12px; flex:1; display:flex; flex-direction:column; gap:6px }
.top-row { display:flex; gap:8px; align-items:center }
.badge { background:#eaf4ff; color:#2c7be5; border-radius:999px; padding:4px 8px; font-weight:700 }
.ai-pill { background:#fff4e6; color:#d08b00; padding:4px 8px; border-radius:999px; font-weight:700 }
.title { margin:0; color:#18344f; font-size:1.05rem }
.excerpt { margin:0; color:#5d6b7a; font-size:0.95rem; max-height:2.6em; overflow:hidden }
.meta-row { margin-top:auto; color:#6b7e8f; font-size:0.9rem; display:flex; gap:12px }
.actions { display:flex; justify-content:space-between; align-items:center; gap:8px; margin-top:8px }
.primary { background:linear-gradient(120deg,#2c7be5,#2bbd7f); color:white; border:none; padding:8px 14px; border-radius:999px; cursor:pointer }
.small-actions { display:flex; gap:6px }
.mini { background:#f4f7fb; border:1px solid #dce7f4; color:#36506b; padding:6px 8px; border-radius:999px; cursor:pointer }
@media (max-width:640px){ .image-post{flex-direction:column} .img-wrap{width:100%;height:160px} }
</style>
