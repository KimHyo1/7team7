export async function openaiChat(messages) {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  const model = import.meta.env.VITE_OPENAI_MODEL; 
  
  if (!key) throw new Error('VITE_OPENAI_API_KEY가 설정되지 않았습니다.');
  if (!model) throw new Error('.env 파일에 VITE_OPENAI_MODEL이 설정되지 않았습니다.');

  const body = {
    model: model,
    messages: messages,
    max_completion_tokens: 3000 
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(`OpenAI API 오류 ${res.status}: ${text}`);

  let data;
  try { data = JSON.parse(text); } catch (e) { throw new Error('OpenAI 파싱 실패'); }

  console.log('[CHAT] OpenAI 응답 전체 데이터:', data);

  const choice = data.choices?.[0] ?? null;
  if (!choice) return '';

  return choice.message?.content ?? '';
}
