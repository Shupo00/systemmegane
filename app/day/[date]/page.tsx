'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Modal } from '../../components/Modal';

type Entry = { id: string; content: string; createdAt: string };
type Comment = { characterId: string; commentText: string; generatedAt: string; model?: string };

type CharacterUI = { id: string; name: string; code: string; premium: boolean; icon: string };

export default function DayPage() {
  const { date } = useParams<{ date: string }>();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [comments, setComments] = useState<Record<string, Comment>>({});
  const [summaryText, setSummaryText] = useState('');
  const [characters, setCharacters] = useState<CharacterUI[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const d = useMemo(() => (Array.isArray(date) ? date[0] : date), [date]);

  async function load() {
    const safeJson = async <T,>(res: Response, fallback: T): Promise<T> => {
      try {
        if (!res.ok) return fallback;
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) return fallback;
        return (await res.json()) as T;
      } catch {
        return fallback;
      }
    };

    try {
      const [r1, r2] = await Promise.all([
        fetch(`/api/entries?date=${d}`),
        fetch(`/api/comment?date=${d}`),
      ]);
      const es = await safeJson<Entry[]>(r1, []);
      const cs = await safeJson<Comment[]>(r2, []);
      setEntries(es);
      const map: Record<string, Comment> = {};
      for (const c of cs) map[c.characterId] = c;
      setComments(map);
    } catch (e) {
      // noop: keep current state
    }
  }

  async function ensureSummary() {
    const res = await fetch('/api/summary', { method: 'POST', body: JSON.stringify({ date: d }) });
    if (res.ok) {
      const j = await res.json();
      setSummaryText(j.summaryText);
    }
  }

  useEffect(() => {
    load();
    ensureSummary();
    // load characters
    fetch('/api/characters')
      .then((r) => (r.ok ? r.json() : Promise.resolve({ characters: [] })))
      .then((j) => setCharacters(j.characters || []))
      .catch(() => setCharacters([]));
  }, [d]);

  async function submitEntry() {
    if (!content.trim()) return;
    const res = await fetch('/api/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: d, content }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({} as any));
      alert(j?.error ? `投稿エラー: ${j.error}` : '投稿エラー');
      return;
    }
    setContent('');
    await load();
    await ensureSummary();
  }

  async function generate(characterId: string) {
    const res = await fetch('/api/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: d, character_id: characterId }),
    });
    if (res.ok) {
      const j = await res.json().catch(() => null as any);
      if (j) setComments((prev) => ({ ...prev, [j.characterId]: j }));
    } else {
      const j = await res.json().catch(() => ({} as any));
      alert(j?.error === 'openai_required' ? 'OpenAI未設定のため生成できません（REQUIRE_OPENAI=true）' : '生成エラー');
    }
  }

  const activeChar = activeId ? characters.find((c) => c.id === activeId) || null : null;
  const activeComment = activeId ? comments[activeId] : undefined;

  return (
    <div className="day-grid">
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <div className="row" style={{ alignItems: 'center' }}>
          <button className="btn ghost" onClick={() => router.push('/')}>← 別の日付へ</button>
          <h2 style={{ margin: 0 }}>日別ページ: {d}</h2>
        </div>
      </div>

      <div className="day-layout" style={{ gridColumn: '1 / -1', width: '100%' }}>
      <div className="card">
        <h3>新規入力</h3>
        <textarea className="input" rows={5} placeholder="今日の出来事…" value={content} onChange={(e) => setContent(e.target.value)} />
        <div className="row"><button className="btn primary" onClick={submitEntry}>投稿</button></div>
      </div>
      <div className="card entries-card">
        <h3>当日エントリ</h3>
        {entries.length === 0 && <p className="muted">まだありません</p>}
        {entries.length > 0 && (
          <div className="stack">
            {entries.map((e) => (
              <div key={e.id} className="entry-card">
                <div className="entry-meta">{new Date(e.createdAt).toLocaleString()}</div>
                <div style={{ whiteSpace: 'pre-wrap' }}>{e.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3>日全体要約</h3>
        <p style={{ whiteSpace: 'pre-wrap' }}>{summaryText || '（未生成）'}</p>
        <div className="row"><button className="btn" onClick={() => fetch('/api/summary', { method: 'POST', body: JSON.stringify({ date: d, force: true }) }).then(async (r) => { if (!r.ok) { const j = await r.json().catch(()=>({} as any)); alert(j?.error === 'openai_required' ? 'OpenAI未設定のため要約できません（REQUIRE_OPENAI=true）' : '要約エラー'); } else { await ensureSummary(); } })}>再要約</button></div>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3>無料キャラ（自動展開）</h3>
        <div className="grid">
          {characters.filter((c)=>!c.premium).map((c) => (
            <div key={c.id} className="card">
              <div className="character-head">
                <img
                  className="avatar"
                  src={`${c.icon}${c.icon.includes('?') ? '&' : '?'}v=${process.env.NEXT_PUBLIC_ASSET_TAG ?? ''}`}
                  alt={c.name}
                  data-tried="namepng"
                  onError={(e) => {
                    const tried = (e.currentTarget.getAttribute('data-tried') || '').split(',');
                    const v = `${process.env.NEXT_PUBLIC_ASSET_TAG ?? ''}`;
                    if (!tried.includes('idpng')) {
                      e.currentTarget.src = `/characters/${encodeURIComponent(c.id)}.png?v=${v}`;
                      e.currentTarget.setAttribute('data-tried', [...tried, 'idpng'].join(','));
                      return;
                    }
                    if (!tried.includes('idsvg')) {
                      e.currentTarget.src = `/characters/${encodeURIComponent(c.id)}.svg?v=${v}`;
                      e.currentTarget.setAttribute('data-tried', [...tried, 'idsvg'].join(','));
                      return;
                    }
                    e.currentTarget.src = `/characters/placeholder.svg?v=${v}`;
                  }}
                />
                <div>
                  <div><strong>{c.name}</strong> <span className="muted">{c.code}</span>
                    {comments[c.id] && (
                      <span className={`badge ${comments[c.id]?.model && comments[c.id]?.model !== 'mock' ? 'ai' : 'mock'}`}>
                        {comments[c.id]?.model && comments[c.id]?.model !== 'mock' ? 'AI' : 'Mock'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', minHeight: '2.4em' }}>{comments[c.id]?.commentText || '未生成'}</p>
              <div className="row">
                <button className="btn" onClick={() => generate(c.id)}>{comments[c.id] ? '再生成' : '生成'}</button>
                <button className="btn ghost" onClick={() => setActiveId(c.id)}>詳細</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3>課金キャラ（ロック）</h3>
        <div className="grid">
          {characters.filter((c)=>c.premium).map((c) => (
            <div key={c.id} className="card lock">
              <div className="character-head">
                <img
                  className="avatar"
                  src={`${c.icon}${c.icon.includes('?') ? '&' : '?'}v=${process.env.NEXT_PUBLIC_ASSET_TAG ?? ''}`}
                  alt={c.name}
                  data-tried="namepng"
                  onError={(e) => {
                    const tried = (e.currentTarget.getAttribute('data-tried') || '').split(',');
                    const v = `${process.env.NEXT_PUBLIC_ASSET_TAG ?? ''}`;
                    if (!tried.includes('idpng')) {
                      e.currentTarget.src = `/characters/${encodeURIComponent(c.id)}.png?v=${v}`;
                      e.currentTarget.setAttribute('data-tried', [...tried, 'idpng'].join(','));
                      return;
                    }
                    if (!tried.includes('idsvg')) {
                      e.currentTarget.src = `/characters/${encodeURIComponent(c.id)}.svg?v=${v}`;
                      e.currentTarget.setAttribute('data-tried', [...tried, 'idsvg'].join(','));
                      return;
                    }
                    e.currentTarget.src = `/characters/placeholder.svg?v=${v}`;
                  }}
                />
                <div>
                  <div><strong>🔒 {c.name}</strong> <span className="muted">{c.code}</span>
                    {comments[c.id] && (
                      <span className={`badge ${comments[c.id]?.model && comments[c.id]?.model !== 'mock' ? 'ai' : 'mock'}`}>
                        {comments[c.id]?.model && comments[c.id]?.model !== 'mock' ? 'AI' : 'Mock'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <p className="muted">¥500で解放（MVP: 環境変数で解放可）</p>
              <div className="row">
                <button className="btn ghost" onClick={() => generate(c.id)}>生成（解放時）</button>
                <button className="btn ghost" onClick={() => setActiveId(c.id)}>詳細</button>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', minHeight: '2.4em' }}>{comments[c.id]?.commentText || 'ロック中'}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal
        open={!!activeChar}
        title={activeChar ? `${activeChar.name}（${activeChar.code}）` : ''}
        onClose={() => setActiveId(null)}
        actions={activeChar ? (
          <>
            <button className="btn" onClick={() => generate(activeChar.id)}>{activeComment ? '再生成' : '生成'}</button>
            <button className="btn ghost" onClick={() => setActiveId(null)}>閉じる</button>
          </>
        ) : null}
      >
        {activeChar && (
          <div className="stack">
            <div className="character-head">
              <img
                className="avatar"
                src={`${activeChar.icon}${activeChar.icon.includes('?') ? '&' : '?'}v=${process.env.NEXT_PUBLIC_ASSET_TAG ?? ''}`}
                alt={activeChar.name}
              />
              <div>
                <div className="muted">モデル: {activeComment?.model || '—'}</div>
                <div className="muted">時刻: {activeComment?.generatedAt ? new Date(activeComment.generatedAt).toLocaleString() : '—'}</div>
              </div>
            </div>
            <div className="card" style={{ background: '#fff', borderColor: 'var(--border)' }}>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', lineHeight: 1.7 }}>
                {activeComment?.commentText || '未生成（生成を押してください）'}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
