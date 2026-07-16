<template>
  <div class="chatbot-feature">
    <button v-if="!open" class="chat-toggle" @click="open = true">
      💬 LocalHub AI 챗봇
    </button>

    <div v-else class="chat-panel">
      <header class="panel-header">
        <div>
          <strong>LocalHub AI 챗봇</strong>
          <p>구미 여행 / 축제 / 맛집 / 커뮤니티 문의</p>
        </div>
        <button type="button" @click="open = false">닫기</button>
      </header>

      <div class="panel-body">
        <div
          v-for="(message, index) in messages"
          :key="index"
          :class="['bubble', message.role]"
        >
          <div class="bubble-text">{{ message.text }}</div>
        </div>

        <div v-if="loading" class="loading">응답 생성 중...</div>
      </div>

      <form class="panel-input" @submit.prevent="sendMessage">
        <input
          v-model="query"
          type="text"
          placeholder="예: 금오산 근처 추천 코스 알려줘"
          autocomplete="off"
        />
        <button type="submit" :disabled="loading || !query.trim()">
          {{ loading ? '전송중...' : '전송' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { openaiChat } from '../../utils/openai.js';
import { loadLocalDatasets, retrieveRelevantSnippet } from '../../utils/localsearch.js';

const open = ref(false);
const query = ref('');
const loading = ref(false);
const messages = ref([
  {
    role: 'bot',
    text: '안녕하세요! 구미 여행, 축제, 맛집, 커뮤니티 검색 등을 도와드려요.'
  }
]);

let datasets = {};

onMounted(async () => {
  datasets = await loadLocalDatasets();
});

function detectIntent(text) {
  const lower = text.toLowerCase();
  if ((lower.includes('추천') || lower.includes('추천해')) && (lower.includes('관광') || lower.includes('권역') || lower.includes('여행'))) {
    return '관광지 추천';
  }
  if (lower.includes('축제') || lower.includes('일정') || lower.includes('행사')) {
    return '축제 일정';
  }
  if (lower.includes('맛집') || lower.includes('음식점') || lower.includes('현지 음식')) {
    return '모범 음식점';
  }
  if (lower.includes('게시판') || lower.includes('글') || lower.includes('검색')) {
    return '커뮤니티 게시글 검색';
  }
  return '일반 지역 질의';
}

async function sendMessage() {
  const userText = query.value.trim();
  if (!userText) return;

  messages.value.push({ role: 'user', text: userText });
  query.value = '';
  loading.value = true;

  try {
    const intent = detectIntent(userText);
    const snippet = retrieveRelevantSnippet(datasets, userText, 5);
    console.log('[CHAT] 검색된 데이터 요약:', snippet);

    // 🚨 system 역할을 쓰지 못하므로, 하나의 텍스트로 모두 합칩니다.
    let combinedPrompt = `[지시사항]\n당신은 구미 지역 정보를 제공하는 친절한 AI 어시스턴트입니다. 응답은 한국어로 자연스럽게 작성하세요.\n`;
    
    if (!snippet) {
      combinedPrompt += `현재 사용자 질문에 해당하는 로컬 데이터가 없습니다. 당신의 일반적인 지식을 바탕으로 구미에 대해 안내해주세요.\n\n`;
    } else {
      combinedPrompt += `아래의 '로컬 데이터 요약'을 바탕으로 질문에 답변해주세요.\n\n`;
    }

    combinedPrompt += `[사용자 질문]: ${userText}\n`;
    combinedPrompt += `[로컬 데이터 요약]:\n${snippet || '데이터 없음'}`;

    // 배열 안에 오직 'user' 하나만 넣어서 보냅니다!
    const answer = await openaiChat([
      { role: 'user', content: combinedPrompt }
    ]);

    const replyText = (answer && answer.trim()) ? answer.trim() : '요청은 접수했지만 적절한 답을 찾지 못했습니다.';
    messages.value.push({ role: 'bot', text: replyText });
  } catch (err) {
    console.error('[CHAT] 에러:', err);
    messages.value.push({ role: 'bot', text: `죄송합니다. 응답 중 오류가 발생했습니다. (${err.message})` });
  } finally {
    loading.value = false;
  }
}

</script>

<style scoped>
.chatbot-feature {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  font-family: 'Pretendard', sans-serif;
}

.chat-toggle {
  background: #0056b3;
  color: white;
  border: none;
  border-radius: 999px;
  padding: 14px 20px;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
}

.chat-panel {
  width: 360px;
  max-width: calc(100vw - 32px);
  height: 520px;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 18px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

.panel-header {
  padding: 16px;
  background: #0056b3;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-header p {
  margin: 4px 0 0;
  font-size: 0.85rem;
  opacity: 0.9;
}

.panel-body {
  padding: 16px;
  flex: 1;
  overflow-y: auto;
  background: #f7f9fc;
}

.bubble {
  margin-bottom: 12px;
  display: flex;
}

.bubble.user {
  justify-content: flex-end;
}

.bubble.bot {
  justify-content: flex-start;
}

.bubble-text {
  max-width: 82%;
  padding: 12px 14px;
  border-radius: 16px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble.bot .bubble-text {
  background: #e9ecef;
  color: #212529;
}

.bubble.user .bubble-text {
  background: #0056b3;
  color: white;
}

.loading {
  font-size: 0.92rem;
  color: #555;
  margin-top: 8px;
}

.panel-input {
  display: flex;
  gap: 10px;
  padding: 14px 16px;
  border-top: 1px solid #e6e9ed;
  background: white;
}

.panel-input input {
  flex: 1;
  border: 1px solid #ced4da;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 0.95rem;
}

.panel-input button {
  background: #0056b3;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0 16px;
  cursor: pointer;
}

.panel-input button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@media (max-width: 520px) {
  .chatbot-feature {
    bottom: 14px;
    right: 14px;
  }

  .chat-panel {
    width: calc(100vw - 28px);
    height: 68vh;
  }
}
</style>