type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

function getKey() {
  return process.env.OPENAI_API_KEY || '';
}

function getModelSummary() {
  return process.env.OPENAI_MODEL_SUMMARY || process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

function getModelComment() {
  return process.env.OPENAI_MODEL_COMMENT || process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

async function chat(model: string, messages: ChatMessage[], temperature = 0.6, maxTokens = 80): Promise<string | null> {
  const key = getKey();
  if (!key) return null;
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: false })
  });
  if (!res.ok) return null;
  const data = await res.json();
  const text: string | undefined = data?.choices?.[0]?.message?.content;
  if (!text) return null;
  return text.trim();
}

export async function generateSummary(text: string): Promise<string | null> {
  const content = text.length > 4000 ? text.slice(0, 4000) : text;
  const sys = 'テキスト全体の要点を日本語で1〜2文に簡潔に要約してください。最大120文字。改行なし。絵文字なし。具体的に。';
  return chat(getModelSummary(), [{ role: 'system', content: sys }, { role: 'user', content }], 0.4, 120);
}

export async function generateCharacterComment(systemPrompt: string, date: string, summaryText: string): Promise<string | null> {
  const minLen = Number(process.env.OPENAI_COMMENT_MIN_LEN || 90);
  const maxLen = Number(process.env.OPENAI_COMMENT_MAX_LEN || 160);
  const user = `日付: ${date}\n本日の出来事（要約）:\n${summaryText}`;
  const sys = `${systemPrompt}\n出力は日本語で${minLen}〜${maxLen}文字。絵文字・顔文字なし。一文で簡潔に。`;

  async function attempt(): Promise<string | null> {
    const text = await chat(getModelComment(), [{ role: 'system', content: sys }, { role: 'user', content: user }], 0.6, Math.min(220, maxLen + 40));
    if (!text) return null;
    const oneLine = text.replace(/\s+/g, ' ').trim();
    return oneLine.length > maxLen ? oneLine.slice(0, maxLen) : oneLine;
  }

  let out = await attempt();
  if (!out) return null;
  if (out.length < minLen) {
    // one retry with stricter length hint
    const stricter = `${sys}\n指定の文字数下限に満たない場合は詳細化して${minLen}〜${maxLen}文字に調整。`;
    const text = await chat(getModelComment(), [{ role: 'system', content: stricter }, { role: 'user', content: user }], 0.6, Math.min(220, maxLen + 40));
    if (text) {
      const oneLine = text.replace(/\s+/g, ' ').trim();
      out = oneLine.length > maxLen ? oneLine.slice(0, maxLen) : oneLine;
    }
  }
  return out;
}

export function isOpenAIConfigured() {
  return !!getKey();
}
