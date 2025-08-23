import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '../../../../lib/supabase-server';
import { getOrSetUserIdCookie } from '../../../../lib/user';
import { getRepoForRequest } from '../../../../lib/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // YYYY-MM
  if (!month || !/^\d{4}-\d{2}$/.test(month)) return NextResponse.json({ error: 'invalid_month' }, { status: 400 });
  const supa = getServerSupabase();
  const { data: userData } = supa ? await supa.auth.getUser() : { data: { user: null } };
  const userId = userData?.user?.id || getOrSetUserIdCookie();
  const repo = getRepoForRequest(userData?.user ? supa : null);
  const counts = await repo.listEntryCountsByMonth(userId, month);
  return NextResponse.json({ counts });
}
