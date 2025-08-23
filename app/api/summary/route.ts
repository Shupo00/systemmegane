import { NextRequest, NextResponse } from 'next/server';
import { getRepoForRequest } from '@/lib/repo';
import { getOrSetUserIdCookie } from '@/lib/user';
import { getServerSupabase } from '@/lib/supabase-server';
import { generateSummary as aiGenerateSummary, isOpenAIConfigured } from '@/lib/openai';

export const runtime = 'nodejs';

function simpleSummarize(text: string): string {
  // naive summary: first sentence up to ~120 chars
  const t = text.replace(/\s+/g, ' ').trim();
  return t.slice(0, 120) + (t.length > 120 ? '…' : '');
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { date, force } = body as { date?: string; force?: boolean };
  if (!date) return NextResponse.json({ error: 'date_required' }, { status: 400 });
  const supa = getServerSupabase();
  const { data: userData } = supa ? await supa.auth.getUser() : { data: { user: null } };
  const userId = userData?.user?.id || getOrSetUserIdCookie();
  const repo = getRepoForRequest(userData?.user ? supa : null);

  if (!force) {
    const existing = await repo.getSummary(userId, date);
    if (existing) return NextResponse.json(existing);
  }

  const entries = await repo.listEntries(userId, date);
  const joined = entries.map((e) => e.content).reverse().join('\n');
  let summaryText = '';
  if (process.env.REQUIRE_OPENAI === 'true' && !isOpenAIConfigured()) {
    return NextResponse.json({ error: 'openai_required' }, { status: 503 });
  }
  if (isOpenAIConfigured()) {
    summaryText = (await aiGenerateSummary(joined || '')) || '';
  }
  if (!summaryText) summaryText = simpleSummarize(joined || '');
  const rec = await repo.upsertSummary(userId, date, summaryText);
  return NextResponse.json(rec);
}
