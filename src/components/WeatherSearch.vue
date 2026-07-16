<template>
  <div class="weather-search-row">
    <input v-model="q" @keyup.enter="onSearch" placeholder="지역을 입력하세요 (예: 서울, 부산, 제주)" />
    <button class="btn-primary" @click="onSearch">검색</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const emit = defineEmits(['search'])
const q = ref('')
function onSearch() { if (!q.value.trim()) return; emit('search', q.value.trim()) }
</script>

<style scoped>
.weather-search-row { display:flex; gap:8px; align-items:center }
.weather-search-row input { flex:1; padding:10px; border-radius:10px; border:1px solid #e6edf5 }
.weather-search-row button { padding:10px 14px; border-radius:10px; border:none; cursor:pointer }
</style>
