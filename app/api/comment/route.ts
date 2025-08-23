import { NextRequest, NextResponse } from 'next/server';
import { getRepoForRequest } from '../../../lib/repo';
import { getOrSetUserIdCookie } from '../../../lib/user';
import { getServerSupabase } from '../../../lib/supabase-server';
import { CHARACTERS, getCharacter, isPremiumCharacter } from '../../../lib/characters';
import { generateCharacterComment, isOpenAIConfigured, generateSummary as aiGenerateSummary } from '../../../lib/openai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const FREE = CHARACTERS.filter((c) => !c.premium);

function mockGenerate(characterId: string, summary: string): string {
  // very naive character-flavored comments up to 160 chars
  const base = summary || '出来事は穏やか。';
  const tail = base.slice(0, 140);
  const prefix: Record<string, string> = {
    power: '権力関係を直視せよ: ',
    judge: '規範の線引きを確認: ',
    art: '表現の質感に注目: ',
    priest: '内在と超越の往復: ',
    teacher: '学びの成果を点検: ',
    market: '交換の妥当性を査定: ',
    news: '情報の公共性を吟味: ',
    truth: '真偽の基準を限定: ',
  };
  const text = (prefix[characterId] || '') + tail;
  return text.slice(0, 160);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date_required' }, { status: 400 });
  const supa = getServerSupabase();
  const { data: userData } = supa ? await supa.auth.getUser() : { data: { user: null } };
  const userId = userData?.user?.id || getOrSetUserIdCookie();
  const repo = getRepoForRequest(userData?.user ? supa : null);
  const list = await repo.listComments(userId, date);
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { date, character_id } = body as { date?: string; character_id?: string };
  if (!date || !character_id)
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });

  // Enforce OpenAI availability if required
  if (process.env.REQUIRE_OPENAI === 'true' && !isOpenAIConfigured()) {
    return NextResponse.json({ error: 'openai_required' }, { status: 503 });
  }

  // simple premium gate (mock): allow only FREE unless env unlocks
  if (isPremiumCharacter(character_id) && process.env.PREMIUM_ACTIVE !== 'true') {
    return NextResponse.json({ error: 'locked' }, { status: 402 });
  }

  const supa = getServerSupabase();
  const { data: userData } = supa ? await supa.auth.getUser() : { data: { user: null } };
  const userId = userData?.user?.id || getOrSetUserIdCookie();
  const repo = getRepoForRequest(userData?.user ? supa : null);
  // Obtain context for generation: prefer stored daily summary; if missing, synthesize from entries and store.
  let summary = (await repo.getSummary(userId, date))?.summaryText || '';
  if (!summary) {
    const entries = await repo.listEntries(userId, date);
    const joined = entries.map((e) => e.content).reverse().join('\n');
    // Simple summarizer as fallback
    const simpleSummarize = (text: string) => {
      const t = (text || '').replace(/\s+/g, ' ').trim();
      return t.slice(0, 160) + (t.length > 160 ? '…' : '');
    };
    let synth = '';
    if (isOpenAIConfigured()) synth = (await aiGenerateSummary(joined)) || '';
    if (!synth) synth = simpleSummarize(joined);
    try { await repo.upsertSummary(userId, date, synth); } catch {}
    summary = synth;
  }
  let comment = '';
  let modelNote = 'mock';
  const c = getCharacter(character_id);
  if (isOpenAIConfigured() && c) {
    const ai = await generateCharacterComment(c.system, date, summary);
    if (ai) {
      comment = ai;
      modelNote = process.env.OPENAI_MODEL_COMMENT || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    }
  }
  if (!comment) comment = mockGenerate(character_id, summary);
  const rec = await repo.upsertComment(userId, date, character_id, comment, modelNote);
  return NextResponse.json(rec);
}
