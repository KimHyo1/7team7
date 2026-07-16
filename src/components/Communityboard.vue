<template>
  <div class="community-wrap">
    <div class="left">
      <BoardList
        v-bind="props"
        v-on="$attrs"
        @edit-post="$emit('edit-post', $event)"
        @select-post="$emit('select-post', $event)"
        @open-form="$emit('open-form')"
        @delete-post="$emit('delete-post', $event)"
        @like-post="$emit('like-post', $event)"
      />
    </div>
    <aside class="right">
      
    </aside>
  </div>
</template>


<script setup>
import { computed } from 'vue'
import BoardList from '../features/community/BoardList.vue'
const props = defineProps({ posts: Array, categories: Array, currentCategory: String, searchQuery: String })
const source = computed(() => (props.posts && props.posts.length) ? props.posts : [])
const top5 = computed(() => source.value.slice().sort((a,b)=> (b.likes||0) - (a.likes||0)).slice(0,5))
</script>


<style scoped>
.community-wrap { display:flex; gap:16px; }
.left { flex: 7 }
.right { flex: 3 }
.best { background:#fff; border-radius:12px; padding:12px; border:1px solid #e6edf5 }
.best h4 { margin:0 0 8px }
.best ol { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:10px }
.best li { display:flex; gap:10px; align-items:center; cursor:pointer; padding:8px; border-radius:10px }
.best .rank-wrap { width:36px; display:flex; align-items:center; justify-content:center }
.best .medal { font-size:1.05rem }
.thumb-mini { width:84px; height:56px; border-radius:8px; flex-shrink:0; overflow:hidden }
.thumb-mini img{ width:100%; height:100%; object-fit:cover; display:block }
.best .title { font-weight:700; color:#18344f; margin-bottom:4px }
.best .meta { color:#7d8da2; font-size:0.85rem }
.card { background:#fff; border-radius:12px; padding:12px; border:1px solid #e6edf5; box-shadow: 0 8px 18px rgba(15,23,42,0.04); margin-bottom:10px }
.region-card { padding:10px }
.places-list { margin:0; padding-left:16px }
@media (max-width:900px){
  .community-wrap{
    flex-direction: column;
  }

  .right{
    order: 2;
    margin-top: 0;
  }
}
</style>