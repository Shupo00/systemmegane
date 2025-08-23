'use client';
import { useState } from 'react';
import { getBrowserSupabase } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const supa = getBrowserSupabase();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function signIn() {
    if (!supa) {
      setMsg('Supabase未設定です。プロジェクト直下の .env に NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY / SUPABASE_URL / SUPABASE_ANON_KEY を設定し、サーバを再起動してください。');
      return;
    }
    setLoading(true);
    setMsg('');
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supa.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } });
    setLoading(false);
    if (error) setMsg(error.message);
    else setMsg('メールを送信しました。リンクからログインしてください。');
  }

  async function signOut() {
    if (!supa) return;
    await supa.auth.signOut();
    router.push('/');
  }

  return (
    <div className="card">
      <h2>ログイン</h2>
      <p className="muted">メールのマジックリンクでログインできます。</p>
      <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <div className="row">
        <button className="btn primary" onClick={signIn} disabled={loading}>{loading ? '送信中…' : 'ログインリンクを送る'}</button>
        <button className="btn ghost" onClick={signOut}>ログアウト</button>
      </div>
      <p className="muted">{msg}</p>
    </div>
  );
}
