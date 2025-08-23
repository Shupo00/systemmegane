import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  // Only init Supabase when public env is present
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createMiddlewareClient({ req, res });
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    const { pathname, search } = new URL(req.url);
    const publicPaths = ['/auth', '/auth/callback'];
    const isPublic = publicPaths.some((p) => pathname.startsWith(p));
    if (!session && !isPublic) {
      const redirectUrl = new URL('/auth', req.url);
      redirectUrl.searchParams.set('next', pathname + search);
      return NextResponse.redirect(redirectUrl);
    }
  }
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
