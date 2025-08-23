import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

// Returns a Supabase client for Route Handlers (app/api/*)
export function getServerSupabase() {
  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  // createRouteHandlerClient reads NEXT_PUBLIC_* from env implicitly and binds cookies
  return createRouteHandlerClient({ cookies });
}
