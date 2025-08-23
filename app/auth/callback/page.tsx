'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();
  useEffect(() => {
    // After middleware exchanges code for a session, send the user home
    const t = setTimeout(() => router.replace('/'), 500);
    return () => clearTimeout(t);
  }, [router]);
  return (
    <div className="card">
      <h2>ログイン処理中…</h2>
      <p className="muted">少しお待ちください。</p>
    </div>
  );
}

