# 社会システム日記（Next.js MVP）

Next.js 14 App Router のMVPです。要件のうち「日記入力（1日単位）」「日全体要約（簡易）」「無料5キャラのコメント生成（モック）」「課金3キャラのロック表示」を実装しています。データはローカルJSONに保存します。

## 使い方
- 前提: Node.js 18+ がインストール済み
- 依存インストール: `npm install`
- 環境変数（任意）: `.env` に `PREMIUM_ACTIVE=true` を設定すると課金キャラを解放（MVP簡易動作）
- 起動: `npm run dev` → http://localhost:3000
- Supabase使用（任意）:
  - `.env` に `SUPABASE_URL`, `SUPABASE_ANON_KEY` を設定するとDB保存/認証が有効化
  - ログイン: `/auth` からメールのマジックリンクでログイン
  - RLS/DDL適用は `supabase/schema.sql` と `docs/SUPABASE_SETUP.md` を参照
- OpenAI使用（任意）:
  - `.env` に `OPENAI_API_KEY` を設定し、必要なら `OPENAI_MODEL_SUMMARY`/`OPENAI_MODEL_COMMENT` を指定（既定は `gpt-4o-mini`）
  - サマリー/キャラコメントの生成がOpenAIに切替（未設定時は簡易要約/モック生成）
  - 厳格モード: `REQUIRE_OPENAI=true` で未設定時はAPIがエラー（生成を許可しない）

## 操作
- トップで日付を選択 → 日別ページへ
- 新規入力でテキスト投稿 → 要約が自動生成（簡易）
- 無料5キャラは「生成/再生成」でコメント保存
- 課金3キャラはロック表示（`PREMIUM_ACTIVE=true` で生成可）

## API（App Router）
- `POST /api/summary` { date, force? } → サマリーUPSERT（簡易要約）
- `GET /api/comment?date=YYYY-MM-DD` → 保存済みコメント一覧
- `POST /api/comment` { date, character_id } → コメントUPSERT（モック生成）
- `GET /api/entries?date=YYYY-MM-DD` / `POST /api/entries` → 当日エントリ取得/作成

## 構成
- ページ: `app/page.tsx`（日付選択）、`app/day/[date]/page.tsx`（日別）
- API: `app/api/*/route.ts`
- データ: `lib/repo.ts` 抽象化。`lib/repo.supabase.ts`（DB）/ `lib/fsdb.ts`（ローカルJSON）
- グローバルスタイル: `app/globals.css`

## 今後の実装（要件連動）
- 認証（Supabase Auth）とRLS、PostgreSQLスキーマ実装
- OpenAIによる高品質サマリー/コメント生成、レート制御
- Stripe CheckoutとWebhook、解放状態の永続化
- カレンダーUI、E2E/性能テスト、計測イベント

仕様・運用ルールは `AGENTS.md` と `docs/`（REQUIREMENTS/IMPLEMENTATION_PLAN/ADR）を参照してください。
Supabase設定は `docs/SUPABASE_SETUP.md` を参照。
