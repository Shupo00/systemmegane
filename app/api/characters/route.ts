import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '../../../lib/supabase-server';
import { getRepoForRequest } from '../../../lib/repo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const supa = getServerSupabase();
  const repo = getRepoForRequest(supa);
  const list = await repo.listCharacters();
  return NextResponse.json({ characters: list });
}
