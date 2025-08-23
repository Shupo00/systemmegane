"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrowserSupabase } from '@/lib/supabase-browser';

type UserInfo = { email?: string | null } | null;

export default function AuthMenu() {
  const supa = getBrowserSupabase();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!supa) return;
    supa.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser({ email: data?.user?.email ?? null });
    });
    const { data: sub } = supa.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email } : null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, [supa]);

  if (!supa) return null;

  async function signOut() {
    setLoading(true);
    await supa.auth.signOut();
    setLoading(false);
    router.refresh();
  }

  if (!user) {
    return (
      <span>
        · <a href="/auth">ログイン</a>
      </span>
    );
  }

  return (
    <span>
      · <span className="muted" title={user.email || undefined}>ログイン中</span>
      {' '}<button className="btn small" style={{ marginLeft: '.5rem' }} onClick={signOut} disabled={loading}>{loading ? '処理中…' : 'ログアウト'}</button>
    </span>
  );
}
