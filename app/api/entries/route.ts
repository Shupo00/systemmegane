import { NextRequest, NextResponse } from 'next/server';
import { getRepoForRequest } from '@/lib/repo';
import { getOrSetUserIdCookie } from '@/lib/user';
import { getServerSupabase } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');
  if (!date) return NextResponse.json({ error: 'date_required' }, { status: 400 });
  const supa = getServerSupabase();
  const { data: userData } = supa ? await supa.auth.getUser() : { data: { user: null } };
  const userId = userData?.user?.id || getOrSetUserIdCookie();
  const repo = getRepoForRequest(userData?.user ? supa : null);
  const items = await repo.listEntries(userId, date);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { date, content } = body as { date?: string; content?: string };
  if (!date || !content || !content.trim())
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  const supa = getServerSupabase();
  const { data: userData } = supa ? await supa.auth.getUser() : { data: { user: null } };
  const userId = userData?.user?.id || getOrSetUserIdCookie();
  const repo = getRepoForRequest(userData?.user ? supa : null);
  try {
    const entry = await repo.addEntry(userId, date, content.trim());
    return NextResponse.json(entry, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'failed_to_write', detail: String(e) }, { status: 500 });
  }
}
