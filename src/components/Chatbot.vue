<template>
  <div class="chatbot-container">
    <div v-if="open" class="chat-window">
      <div class="chat-header">
        <h4>🤖 LocalHub AI</h4>
        <button type="button" @click="open = false">X</button>
      </div>

      <div class="chat-body">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['message', message.role]"
        >
          <div class="bubble">{{ message.text }}</div>
        </div>
      </div>

      <form class="chat-input" @submit.prevent="sendMessage">
        <input
          v-model="input"
          type="text"
          placeholder="예: 금오산 근처 조용한 카페 추천해줘"
          autocomplete="off"
        />
        <button type="submit" :disabled="loading">
          {{ loading ? '전송 중...' : '전송' }}
        </button>
      </form>
    </div>

    <button v-else class="floating-btn" @click="open = true">
      💬 챗봇
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { openaiChat } from '../utils/openai';
import { loadLocalDatasets, retrieveRelevantSnippet } from '../utils/localSearch';

const open = ref(false);
const input = ref('');
const loading = ref(false);
const messages = ref([
  { role: 'bot', text: '안녕하세요! 구미 관련 질문을 해주세요. 예: 금오산 근처 추천 코스 알려줘' },
]);

let datasets = {};

onMounted(async () => {
  datasets = await loadLocalDatasets();
});

function detectIntent(text) {
  const q = text.toLowerCase();
  if ((q.includes('추천') || q.includes('추천해')) && q.includes('관광')) return '권역별 관광지 추천';
  if (q.includes('축제') || q.includes('일정')) return '축제 일정 안내';
  if (q.includes('맛집') || q.includes('음식점')) return '모범 음식점 추천';
  if (q.includes('게시판') || q.includes('글') || q.includes('검색')) return '커뮤니티 게시글 검색';
  return '일반 지역 질의';
}

async function sendMessage() {
  if (!input.value.trim()) return;

  const userText = input.value.trim();
  messages.value.push({ role: 'user', text: userText });
  input.value = '';
  loading.value = true;

  try {
    const intent = detectIntent(userText);
    const snippet = retrieveRelevantSnippet(datasets, userText, 5);

    const systemText = `
당신은 구미 지역 정보를 제공하는 AI 어시스턴트입니다.
사용자의 질문에 답할 때, 제공된 로컬 데이터 요약만을 참조하세요.
추천 요청에는 최대 5개 항목으로 간결히 답변하고,
항목별 위치와 간단한 이유를 함께 제시하세요.
응답은 한국어로 작성합니다.
`;

    const messagesPayload = [
      { role: 'system', content: systemText },
      {
        role: 'user',
        content: `
질문: ${userText}
요청 유형: ${intent}
로컬 데이터 요약:
${snippet}
        `,
      },
    ];

    const answer = await openaiChat(messagesPayload, {
      max_tokens: 500,
      temperature: 0.65,
    });

    messages.value.push({ role: 'bot', text: answer });
  } catch (error) {
    messages.value.push({
      role: 'bot',
      text: `죄송합니다. 응답 중 오류가 발생했습니다. (${error.message})`,
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.chatbot-container {
  position: fixed;
  right: 20px;
  bottom: 20px;
  z-index: 1000;
}
.floating-btn {
  background: #0056b3;
  color: #fff;
  border: none;
  padding: 14px 18px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18);
}
.chat-window {
  width: 360px;
  max-width: calc(100vw - 32px);
  height: 520px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}
.chat-header {
  background: #0056b3;
  color: #fff;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-header button {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
}
.chat-body {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #f4f7fa;
}
.message {
  margin-bottom: 12px;
}
.message.user {
  text-align: right;
}
.message.bot {
  text-align: left;
}
.bubble {
  display: inline-block;
  padding: 12px 14px;
  border-radius: 16px;
  background: #e9ecef;
  max-width: 85%;
  word-break: break-word;
}
.message.user .bubble {
  background: #0056b3;
  color: #fff;
}
.chat-input {
  display: flex;
  gap: 10px;
  padding: 12px 14px;
  border-top: 1px solid #e6e9ed;
  background: #fff;
}
.chat-input input {
  flex: 1;
  border: 1px solid #d4d7db;
  border-radius: 12px;
  padding: 10px 12px;
}
.chat-input button {
  background: #0056b3;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 0 16px;
  cursor: pointer;
}
.chat-input button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
@media (max-width: 520px) {
  .chatbot-container {
    right: 12px;
    bottom: 12px;
  }
  .chat-window {
    width: min(100vw - 24px, 100%);
    height: 68vh;
  }
}
</style>