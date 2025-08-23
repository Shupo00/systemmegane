import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  // With auth-helpers, client component client reads NEXT_PUBLIC_* by default,
  // but we keep a guard and call without explicit params.
  return createClientComponentClient();
}
