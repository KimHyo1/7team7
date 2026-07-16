<template>
  <section class="form-card">
    <div class="form-header">
      <h3>{{ editing ? '게시글 수정' : '새 글 작성' }}</h3>
      <button class="ghost-btn" type="button" @click="$emit('cancel')">취소</button>
    </div>
    <form @submit.prevent="$emit('submit')">
      <label>
        제목
        <input :value="form.title" type="text" placeholder="제목을 입력하세요" @input="$emit('update:form', { ...form, title: $event.target.value })" required />
      </label>
      <label>
        카테고리
        <select :value="form.category" @change="$emit('update:form', { ...form, category: $event.target.value })">
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
      </label>
      <label>
        내용
        <textarea :value="form.content" rows="6" placeholder="공유할 내용을 적어주세요" @input="$emit('update:form', { ...form, content: $event.target.value })" required />
      </label>
      <label>
        익명 닉네임
        <input :value="form.author" type="text" placeholder="예: 익명_001" @input="$emit('update:form', { ...form, author: $event.target.value })" required />
      </label>
      <label>
        비밀번호
        <input :value="form.password" type="password" placeholder="수정/삭제용 비밀번호" @input="$emit('update:form', { ...form, password: $event.target.value })" required />
      </label>
      <button class="submit-btn" type="submit">{{ editing ? '수정 완료' : '게시글 등록' }}</button>
    </form>
  </section>
</template>

<script setup>
defineProps({ form: { type: Object, required: true }, categories: { type: Array, required: true }, editing: { type: Boolean, default: false } })
defineEmits(['submit', 'cancel', 'update:form'])
</script>

<style scoped>
.form-card { background: #fff; border-radius: 20px; padding: 20px; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06); border: 1px solid #e6edf5; }
.form-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
h3 { margin: 0; color: #18344f; }
label { display: flex; flex-direction: column; gap: 6px; margin-bottom: 10px; color: #4c6076; font-weight: 600; }
input, select, textarea { border: 1px solid #dce7f4; border-radius: 12px; padding: 10px 12px; font: inherit; }
textarea { resize: vertical; min-height: 100px; }
.ghost-btn, .submit-btn { border: none; border-radius: 999px; padding: 8px 12px; cursor: pointer; }
.ghost-btn { background: #f4f7fb; color: #4b6077; }
.submit-btn { margin-top: 8px; background: linear-gradient(120deg, #2c7be5, #2bbd7f); color: white; font-weight: 700; width: 100%; }
</style>
