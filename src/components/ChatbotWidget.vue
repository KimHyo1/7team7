<template>
  <div class="chat-shell">
    <Transition name="chat-slide">
      <div v-if="isOpen" class="chat-window" role="dialog" aria-label="LocalHub Chatbot">
        <div class="chat-header">
          <strong>🤖 LocalHub AI 챗봇</strong>
          <button type="button" @click="$emit('toggle')" aria-label="닫기">✕</button>
        </div>
        
        <div class="chat-body" ref="chatBodyRef">
          <div v-for="(message, index) in messages" :key="index" class="message" :class="message.role">
            {{ message.text }}
          </div>
          
          <div v-if="isLoading" class="message bot typing-indicator">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        </div>

        <div class="quick-replies" v-if="messages.length <= 1">
          <button @click="sendQuickReply('금오산 근처 맛집 추천해줘')">🍜 금오산 맛집</button>
          <button @click="sendQuickReply('이번 주말 구미 축제 일정 알려줘')">🎉 주말 축제</button>
          <button @click="sendQuickReply('조용한 산책 코스 짜줘')">🌿 산책 코스</button>
        </div>
        
        <div class="chat-footer">
          <input
            ref="inputRef"
            :value="inputValue"
            type="text"
            placeholder="궁금한 구미 정보를 물어보세요!"
            @input="$emit('update:input-value', $event.target.value)"
            @keyup.enter="$emit('send-message')"
            aria-label="챗 입력"
          />
          <button type="button" @click="$emit('send-message')" :disabled="isLoading">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <button v-show="!isOpen" class="floating-btn" type="button" @click="$emit('toggle')" aria-label="챗봇 열기">
      <span class="btn-icon">💬</span> AI 챗봇
    </button>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  messages: { type: Array, required: true },
  isOpen: { type: Boolean, default: false },
  inputValue: { type: String, default: '' },
  isLoading: { type: Boolean, default: false } // 부모로부터 로딩 상태 받기
})

const emit = defineEmits(['toggle', 'update:input-value', 'send-message'])

const chatBodyRef = ref(null)
const inputRef = ref(null)

// 챗봇 창이 열릴 때 입력창에 자동 포커스
watch(() => props.isOpen, async (newVal) => {
  if (newVal) {
    await nextTick()
    if (inputRef.value) inputRef.value.focus()
  }
})

// 메시지 자동 스크롤
watch(
  () => props.messages.length, // 메시지 개수가 변할 때만 감지 (타이핑 성능 향상)
  async () => {
    await nextTick()
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
    }
  }
)

// 타이핑 인디케이터 상태일 때도 스크롤 내리기
watch(() => props.isLoading, async (newVal) => {
  if (newVal) {
    await nextTick()
    if (chatBodyRef.value) chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight
  }
})

// 추천 질문 클릭 시 바로 전송하는 함수
function sendQuickReply(text) {
  emit('update:input-value', text)
  setTimeout(() => {
    emit('send-message')
  }, 50)
}
</script>

<style scoped>
.chat-shell { position: fixed; right: 24px; bottom: 24px; z-index: 1500; }

.chat-window { 
  width: min(350px, calc(100vw - 32px)); 
  background: white; 
  border-radius: 20px; 
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.15); 
  overflow: hidden; 
  border: 1px solid #e4edf7; 
  position: absolute;
  bottom: 0;
  right: 80px; 
  display: flex;
  flex-direction: column;
  transform-origin: bottom right; /* 애니메이션 시작점 */
}

/* 🌟 Vue Transition 애니메이션 설정 */
.chat-slide-enter-active, .chat-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.chat-slide-enter-from, .chat-slide-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.chat-header { 
  display: flex; justify-content: space-between; align-items: center; 
  padding: 16px; 
  background: linear-gradient(135deg, #2c7be5, #2bbd7f); 
  color: white; 
}
.chat-header strong { font-size: 1.05rem; letter-spacing: -0.5px; }
.chat-header button { background: rgba(255,255,255,0.2); border: none; color: white; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; transition: background 0.2s;}
.chat-header button:hover { background: rgba(255,255,255,0.4); }

.chat-body { display: flex; flex-direction: column; gap: 10px; padding: 16px; height: 320px; overflow-y: auto; background: #f8fafc; }

.message { padding: 10px 14px; border-radius: 16px; line-height: 1.5; font-size: 0.95rem; white-space: pre-wrap; word-break: break-word; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.message.bot { background: white; border: 1px solid #e4edf7; color: #334155; align-self: flex-start; border-top-left-radius: 4px; }
.message.user { background: #2c7be5; color: white; align-self: flex-end; border-top-right-radius: 4px; }

/* 🌟 타이핑 인디케이터 애니메이션 */
.typing-indicator { display: flex; gap: 4px; padding: 14px 18px; align-items: center; }
.typing-indicator .dot { width: 6px; height: 6px; background-color: #94a3b8; border-radius: 50%; animation: typing 1.4s infinite ease-in-out both; }
.typing-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator .dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }

/* 🌟 추천 질문 칩 (가로 스크롤) */
.quick-replies { display: flex; gap: 8px; padding: 0 12px 12px; overflow-x: auto; background: #f8fafc; scrollbar-width: none; }
.quick-replies::-webkit-scrollbar { display: none; }
.quick-replies button { flex-shrink: 0; background: white; border: 1px solid #cbd5e1; border-radius: 999px; padding: 8px 12px; font-size: 0.85rem; color: #475569; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
.quick-replies button:hover { border-color: #2c7be5; color: #2c7be5; background: #eff6ff; }

.chat-footer { display: flex; align-items: center; gap: 10px; padding: 12px; background: white; border-top: 1px solid #e2e8f0; }
.chat-footer input { flex: 1; border: none; outline: none; padding: 10px; font-size: 0.95rem; background: #f1f5f9; border-radius: 12px; }
.chat-footer input::placeholder { color: #94a3b8; }
.chat-footer button { background: #2c7be5; color: white; border: none; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s; }
.chat-footer button:hover:not(:disabled) { background: #1e40af; }
.chat-footer button:disabled { background: #94a3b8; cursor: not-allowed; }

.floating-btn { border: none; border-radius: 999px; background: linear-gradient(135deg, #2c7be5, #2bbd7f); color: white; padding: 14px 22px; cursor: pointer; box-shadow: 0 10px 24px rgba(44, 123, 229, 0.3); font-weight: bold; font-size: 1rem; display: flex; align-items: center; gap: 8px; transition: transform 0.2s; }
.floating-btn:hover { transform: translateY(-3px); box-shadow: 0 14px 28px rgba(44, 123, 229, 0.4); }

@media (max-width: 520px) {
  .chat-window { position: fixed; bottom: 90px; right: 16px; width: calc(100vw - 32px); height: 75vh; }
  .chat-body { height: 100%; flex: 1; }
}
</style>