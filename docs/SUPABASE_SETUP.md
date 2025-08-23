# Supabase セットアップ（開発用）

このプロジェクトをSupabase/PostgreSQLで動かすための手順です。MVPではRLS/認証を簡略化し、サーバ側でService Role Keyを使用します（本番はNG）。

## 1. プロジェクト作成
- Supabaseで新規プロジェクトを作成（リージョン任意）
- `Project URL` と `anon key` / `service_role key` を控える

## 2. スキーマ適用
- `supabase/schema.sql` をSQLエディタで実行
- 既定キャラを投入（例）:
```sql
insert into characters(id, name, code, is_premium) values
('power','パワー先生','権力/服従',false),
('judge','ジャッジ','合法/違法',false),
('art','アート','美/醜',false),
('priest','プリースト','内在/超越',false),
('teacher','ティーチャー','良い学び/悪い学び',false),
('market','マーケット','支払う/支払わない',true),
('news','ニュース君','情報/非情報',true),
('truth','トゥルース博士','真/偽',true)
on conflict do nothing;
```

## 3. 環境変数設定
- `.env` に以下を設定（ローカル開発向け）:
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE=eyJhbGciOi...
```
- 本番ではService Roleを使わず、Supabase Authのユーザー文脈でRLSを有効化します

## 4. 実行
- `npm run dev`
- 既存のローカルJSONストレージはフォールバック用として残ります

## 5. メモ
- RLS/ポリシーは `schema.sql` のコメントを参照し、本番導入時に有効化してください
- 後続でAuth（匿名→メール/SSO）・Stripe Webhook連携を追加します

