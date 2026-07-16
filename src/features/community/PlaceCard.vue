<template>
  <section class="board-form">
    <div class="form-panel">
      <div class="form-header">
        <h3>{{ editing ? '게시글 수정' : '새 글 작성' }}</h3>
        <button class="ghost-btn" type="button" @click="$emit('cancel')">취소</button>
      </div>

      <form @submit.prevent="onSubmit" class="compose-form">
        <label>
          제목
          <input v-model="localForm.title" type="text" placeholder="제목을 입력하세요" required />
        </label>

        <label>
          카테고리
          <select v-model="localForm.category">
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </label>

        <label>
          내용
          <textarea v-model="localForm.content" rows="6" placeholder="공유할 내용을 적어주세요" required />
        </label>

        <label>
          익명 닉네임
          <input v-model="localForm.author" type="text" placeholder="예: 익명_001" required />
        </label>

        <label>
          비밀번호
          <input v-model="localForm.password" type="password" placeholder="수정/삭제용 비밀번호" required />
        </label>

        <div class="form-actions">
          <button class="submit-btn" type="submit">{{ editing ? '수정 완료' : '게시글 등록' }}</button>
        </div>
      </form>
    </div>

    <aside class="picker-preview">
      <div class="picker-section">
        <div class="picker-head">
          <h4>장소 선택 (선택하면 썸네일 자동 적용)</h4>
          <p class="hint">제목/내용에 등장한 장소를 탭하거나 리스트에서 선택하세요.</p>
        </div>

        <div class="picker-grid">
          <PlaceCard
            v-for="(p, idx) in places"
            :key="p.id || idx"
            :place="p"
            :selected="selectedPlace && selectedPlace.id === (p.id || p.contentid)"
            :order="null"
            @toggle="togglePlace"
          />
        </div>
      </div>

      <div class="preview">
        <h4>선택된 장소 미리보기</h4>
        <div class="preview-card" v-if="selectedPlace">
          <img :src="selectedPlace.image" alt="place image" v-if="selectedPlace.image" />
          <div v-else class="preview-noimg">이미지 없음</div>
          <strong>{{ selectedPlace.name }}</strong>
          <p class="addr">{{ selectedPlace.address }}</p>
        </div>
        <div v-else class="preview-empty">
          <p>장소를 선택하면 미리보기가 여기에 표시됩니다.</p>
        </div>
      </div>
    </aside>
  </section>
</template>

<script setup>
import { reactive, toRefs, watch, ref } from 'vue'
import PlaceCard from '../../components/PlaceCard.vue'

defineProps({
  form: { type: Object, required: true },
  categories: { type: Array, required: true },
  editing: { type: Boolean, default: false },
  places: { type: Array, default: () => [] } // 장소 목록(외부에서 주입)
})
defineEmits(['submit', 'cancel', 'update:form', 'place-selected'])

const props = defineProps()
const emit = defineEmits()

const localForm = reactive({ ...props.form })
watch(() => props.form, (n) => {
  Object.assign(localForm, n || {})
})

const selectedPlace = ref(null)

function togglePlace(place) {
  // place 식별자: try common keys
  const id = place.id || place.contentid || place.contentId
  if (selectedPlace.value && (selectedPlace.value.id || selectedPlace.value.contentid) == id) {
    selectedPlace.value = null
    emit('place-selected', null)
  } else {
    // normalize a bit to keep preview fields consistent
    selectedPlace.value = {
      id: id,
      name: place.name || place.title || place.placeName,
      image: place.image || place.firstimage || place.firstimage2 || '',
      address: place.address || place.addr1 || place.addr || '',
      raw: place
    }
    emit('place-selected', selectedPlace.value)
  }
}

function onSubmit() {
  emit('update:form', { ...localForm })
  emit('submit') // 부모에서 form 상태를 읽어 처리하도록 함
  // place도 같이 보낼 수 있음 (optional)
  emit('place-selected', selectedPlace.value)
}
</script>

<style scoped>
.board-form {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 18px;
  align-items: start;
}
.form-panel {
  background: #fff;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #e6edf5;
  box-shadow: 0 8px 20px rgba(15,23,42,0.04);
}
.form-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
.compose-form label { display:block; margin-bottom:10px; font-weight:600; color:#374151 }
.compose-form input, .compose-form select, .compose-form textarea { width:100%; padding:10px; border-radius:10px; border:1px solid #dce7f4; font:inherit }
.form-actions { margin-top:8px }

.picker-preview { display:flex; flex-direction:column; gap:12px }
.picker-section { background:#fff; padding:12px; border-radius:12px; border:1px solid #e6edf5 }
.picker-head { display:flex; flex-direction:column; gap:4px; margin-bottom:8px }
.hint { font-size:0.85rem; color:#6b7280; margin:0 }

.picker-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(120px,1fr)); gap:8px; max-height:360px; overflow:auto; padding-right:6px }

/* preview */
.preview { background:#fff; padding:12px; border-radius:12px; border:1px solid #e6edf5; text-align:center }
.preview-card img { width:100%; height:140px; object-fit:cover; border-radius:8px; margin-bottom:8px }
.preview-noimg { height:140px; display:flex; align-items:center; justify-content:center; color:#94a3b8; background:#f1f5f9; border-radius:8px; margin-bottom:8px }
.preview-empty { color:#6b7280; padding:24px 10px }

.ghost-btn { background:#f4f7fb; border:none; padding:6px 10px; border-radius:999px; cursor:pointer }
.submit-btn { margin-top:8px; background:linear-gradient(120deg,#2c7be5,#2bbd7f); color:#fff; border:none; padding:10px 12px; border-radius:10px; font-weight:700; width:100% }
</style>