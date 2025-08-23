import type { Metadata } from 'next';
import './globals.css';
import 'react-day-picker/dist/style.css';
import { Noto_Serif_JP } from 'next/font/google';
import dynamic from 'next/dynamic';

const serif = Noto_Serif_JP({ subsets: ['latin'], weight: ['400','700'], variable: '--font-serif' });
const AuthMenu = dynamic(() => import('@/app/components/AuthMenu'), { ssr: false });
import 'react-day-picker/dist/style.css';

export const metadata: Metadata = {
  title: '社会システム日記',
  description: '多視点の“コードAIキャラ”が日記にコメントするアプリ',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    <html lang="ja">
      <body className={serif.variable}>
        <div className="container">
          <header>
            <h1>社会システム日記</h1>
            <nav className="muted">
              <a href="/">ホーム</a>
              {hasSupabase && <AuthMenu />}
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
