<template>
  <article
    class="pick-card"
    :class="{ sel: selected }"
    @click="$emit('toggle', place)"
    role="button"
    :aria-pressed="selected ? 'true' : 'false'"
  >
    <div v-if="selected && order" class="pick-order">{{ order }}</div>
    <div class="pick-thumb">
      <img v-if="place.image" :src="place.image" alt="" loading="lazy" />
      <div v-else class="pick-noimg">이미지 없음</div>
    </div>
    <div class="pick-body">
      <p class="pick-name">{{ place.name }}</p>
      <p class="pick-addr">{{ place.address || '주소 없음' }}</p>
      <span class="pick-cat" :class="'cat-' + (place.category || '기타')">
        {{ place.category || '기타' }}
      </span>
    </div>
  </article>
</template>

<script setup>
defineProps({
  place: { type: Object, required: true },
  selected: { type: Boolean, default: false },
  order: { type: [Number, String], default: null }
})
defineEmits(['toggle'])
</script>

<style scoped>
/* pick-card (MapSection.vue에서 복사/재사용한 스타일) */
.pick-card {
  position: relative;
  border-radius: 12px;
  border: 1px solid #dbe4f0;
  background: #fff;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s;
}
.pick-card:hover {
  border-color: #93c5fd;
}
.pick-card.sel {
  border: 2px solid #2563eb;
}
.pick-thumb {
  height: 96px;
  background: #e2e8f0;
  overflow: hidden;
}
.pick-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.pick-noimg {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 0.75rem;
}
.pick-body {
  padding: 9px 11px 11px;
}
.pick-name {
  font-size: 0.82rem;
  font-weight: 600;
  line-height: 1.3;
  margin: 0 0 3px;
}
.pick-addr {
  font-size: 0.7rem;
  color: #94a3b8;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.pick-cat {
  display: inline-block;
  font-size: 0.65rem;
  padding: 1px 8px;
  border-radius: 999px;
  margin-top: 6px;
}
.cat-관광지 { background: #faeeda; color: #854f0b; }
.cat-음식점 { background: #fcebeb; color: #a32d2d; }
.cat-문화시설 { background: #e1f5ee; color: #0f6e56; }
.cat-숙박 { background: #eeedfe; color: #3c3489; }
.cat-쇼핑 { background: #fbeaf0; color: #993556; }

.pick-order {
  position: absolute;
  top: 7px;
  right: 7px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 600;
  border: 2px solid #fff;
  z-index: 2;
}
</style>