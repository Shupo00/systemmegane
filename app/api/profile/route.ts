import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const supa = getServerSupabase();
  if (!supa) return NextResponse.json({ error: 'supabase_not_configured' }, { status: 500 });
  const { data } = await supa.auth.getUser();
  const user = data?.user;
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const username = (body?.username || '').toString().trim();
  if (!username) return NextResponse.json({ error: 'invalid_username' }, { status: 400 });

  const { error } = await supa.from('users').upsert({ id: user.id, email: user.email, username }, { onConflict: 'id' });
  if (error) return NextResponse.json({ error: 'failed_to_save', detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

