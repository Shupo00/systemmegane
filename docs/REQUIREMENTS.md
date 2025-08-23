要件定義書（最新版）

プロダクト名：社会システム日記
目的： 日記（1日単位）に対して、社会システムを擬人化した“コードAIキャラ”がその日全体を各自の二値コードでコメント。解釈の多様性を“楽しく”可視化する。

0. 用語・前提

日記（Diary）：ユーザーがその日に書いた複数エントリの集合。UIは1日ページでまとめて扱う。

日全体コメント（Daily Comment）：その日全体に対する1キャラの要約コメント（再生成可・保存可）。

コードAIキャラ：ルーマンの機能システムと二値コードに基づく人格化キャラクター。

無料キャラ：常に解放・自動表示（5体）。

課金キャラ：Stripeの買い切り ¥500で個別解放（3体。まとめ買いでも可）。

1. スコープ・目標
1.1 何を実現するか

書く → その日全体を各キャラが解釈 → コメントを保存 → いつでも見返せる“スタック”体験。

デフォルト表示（無料キャラ）は常に開いた状態で、日ごとの解釈の“並列性”がひと目で分かる。

課金キャラはロック表示→Stripe決済→即時解放→コメント生成。

1.2 成功指標（KPI）

D1日記作成率（初回訪問で日記1件以上）：≥ 40%

1日平均コメント閲覧キャラ数：≥ 4体

購入転換率（課金キャラロック表示→決済成功）：≥ 3%

再訪率（7日以内）：≥ 25%

2. ペルソナ（簡易）

知的エンタメ好き：SNSで大喜利や教養系コンテンツが好き。視点のズレを楽しみたい。

学習者/教育者：授業やゼミで“多視点”を体験させる教材として使いたい。

日常の整理屋：モヤモヤを言語化し、多角的に見たい。

3. 画面/UX要件
3.1 トップ：カレンダー画面（デフォルト）

月表示・今日を強調。前月/翌月へ遷移可。

日付セル

当日エントリ数のバッジ（例：●3）。0件は無表示。

クリック/タップで日別ページを右パネル or モーダルで開く（SPは全画面遷移）。

3.2 日別ページ（1日単位）

上段：新規入力欄（プレーンテキスト、改行保持）

送信でdiary_entriesに追記。日付は自動付与（ユーザーTZで当日）。

投稿後、日全体要約（summary）を自動更新（初回 or 指定時）。

中段：当日エントリ一覧（新しい順）

タイムスタンプ表示（入力時点）。削除/編集はMVPでは“削除のみ”（任意）。

下段：キャラコメントセクション（その日“全体”に対するコメント）

無料5体＝自動展開表示（常に開いている状態）

🏛️ パワー先生（政治：権力保持/服従）

⚖️ ジャッジ（法：合法/違法）

🎨 アート（芸術：美/醜）

✨ プリースト（宗教：内在/超越）

👩‍🏫 ティーチャー（教育：良い学び/悪い学び）

課金3体＝ロック表示

💵 マーケット（経済：支払う/支払わない）

📰 ニュース君（マスメディア：情報/非情報）

🔬 トゥルース博士（科学：真/偽）

各キャラ部品：

アイコン（シール風画像）＋名前＋二値コード表示

吹き出しに保存済みコメントを表示（無い場合は「生成する」ボタン）

再生成ボタン（当該キャラのみ）／履歴（後述）

ロック表示（課金キャラ）

鍵アイコン＋薄表示＋プレビュー1行（例：「体験版コメント：…」）

「¥500で解放」ボタン → Stripe Checkout → 成功後即時アンロック＆コメント生成

3.3 検索/一覧（次期）

月を跨ぐワード検索、日別ナビゲーション、タグは次期以降（MVPは無し）。

4. 機能要件
4.1 日記作成/保存

入力：テキスト（Markdown不要、改行保持）。

日付自動付与（クライアントのTZを優先、保存時にサーバーでもUTC保持）。

エントリ複数可。削除のみ可（MVP）。編集はv2で。

4.2 日全体要約（Daily Summary）

その日の全エントリを結合 → 長文ならサーバーで要約 → daily_summaries.summary_textに保存/更新。

タイミング：

初回その日への初投稿時、自動生成（または初回キャラ生成時に遅延生成）

「再要約」ボタンでも再生成可（任意）

4.3 キャラコメント生成・保存

各キャラはその日全体（=summary_text or 連結本文）を**1フレーズ（最大65字、日本語、絵文字なし）**でコメント。

生成API呼出 → 結果をdaily_commentsへUPSERT。

既存があれば保存済みを表示。ユーザー操作で再生成可（保存更新）。

コメントはキャラごとに1個/日（バージョン履歴は任意）。

4.4 課金（Stripe買い切り ¥500）

対象：マーケット/ニュース君/トゥルース博士の3体。

ロックUI→Checkout→Webhookでpurchased_charactersに登録→即時解放。

1回の購入で3体まとめ解放 or 個別解放は運用で選択（MVPはまとめ解放推奨）。

4.5 表示・スタック

任意日付を開けば、保存済みの各キャラコメントが並ぶ（スタックの再閲覧）。

無料5体は常に開いた状態で先頭表示。課金3体はロック or 解放後に通常表示。

キャッシュ：日付×キャラのローカルキャッシュを持ち、再訪で瞬時表示→サーバー同期で更新。

5. 非機能要件

レスポンシブ：SP 360px～、タップ目標44px以上。

応答性能：

投稿→一覧反映：< 300ms（DB書込後に反映）

コメント初表示（保存済み）：< 150ms（キャッシュ→DB）

コメント生成API：p95 < 2.5s（OpenAI応答込み）

可用性：99.9%（アプリ層）。

セキュリティ：XSS/CSRF対策、Webhook署名検証、RLS（行レベルセキュリティ）。

個人情報：メール/UIDのみ。日記内容はユーザーの所有（ToS/Privacyで明記）。

監査・ロギング：重要イベント（課金、生成エラー）をサーバーログへ。

レート制御：キャラごと再生成は3秒間隔、1日あたり各キャラ最大10回（変更可）。

6. データモデル（PostgreSQL/Supabase想定）
-- users（匿名運用→将来メール/SSO）
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  premium_active boolean default false,    -- まとめ解放用（使わない場合はpurchased_charactersで管理）
  created_at timestamptz default now()
);

-- characters（固定でも良いがDB管理にしておく）
create table characters (
  id text primary key,               -- 'power','judge','market','art','truth','news','teacher','priest'
  name text not null,
  code text not null,                -- 二値コード表示
  is_premium boolean not null default false,
  created_at timestamptz default now()
);

-- diary_entries（1日複数可）
create table diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,                -- ユーザーTZでの日付をサーバーで確定
  content text not null,
  created_at timestamptz default now()
);
create index on diary_entries(user_id, date);

-- daily_summaries（1ユーザー×1日でユニーク）
create table daily_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  summary_text text not null,
  updated_at timestamptz default now(),
  unique (user_id, date)
);

-- daily_comments（1ユーザー×1日×キャラでユニーク）
create table daily_comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  date date not null,
  character_id text references characters(id) on delete cascade,
  comment_text text not null,
  model text,                        -- gpt-4o-mini 等
  generated_at timestamptz default now(),
  unique (user_id, date, character_id)
);

-- 課金：買い切り（まとめ解放 or 個別）
create table purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  sku text not null,                 -- 'bundle_3chars_500jpy' 等
  amount_jpy integer not null,
  status text not null,              -- 'paid','refunded'
  stripe_session_id text unique,
  created_at timestamptz default now()
);

-- 個別キャラ解放にする場合はこちらを使用（まとめ解放なら省略可）
create table purchased_characters (
  user_id uuid references users(id) on delete cascade,
  character_id text references characters(id) on delete cascade,
  purchased_at timestamptz default now(),
  primary key (user_id, character_id)
);


RLS例（イメージ）

diary_entries/daily_*：user_id = auth.uid() のみSELECT/INSERT/UPDATE/DELETE可。

characters：全員SELECT可。

purchases/purchased_characters：user_id = auth.uid() のみSELECT可。

7. API仕様（最小）
7.1 認証

Supabase Auth（匿名→メール/SSOに拡張可能）。

リクエストはセッショントークンでユーザー特定。

7.2 サマリー生成

POST /api/summary

入力：{ date }（サーバーが当日エントリを集約）

処理：結合→必要ならOpenAIで要約→daily_summaries UPSERT

出力：{ summary_text }

7.3 キャラコメント生成

POST /api/comment

入力：{ date, character_id }

課金チェック：characters.is_premiumなら、premium_active or purchased_charactersに存在するか検査。

処理：daily_summaries.summary_text（無ければ内部で生成）をプロンプト化→OpenAI→daily_comments UPSERT

出力：{ comment_text }

GET /api/comment?date=YYYY-MM-DD

出力：当日分の全キャラのcomment_text一覧（保存済みだけ）。

7.4 Stripe Checkout

POST /api/checkout

入力：なし（サーバーでuserIdをメタデータに付帯）

出力：{ url }（Stripe Checkout URL）

POST /api/stripe/webhook

署名検証。checkout.session.completedでpurchasesに挿入。

まとめ解放の場合：users.premium_active = true。

個別解放の場合：purchased_charactersに3体分挿入。

8. OpenAI 仕様
8.1 モデル・温度

既定：gpt-4o-mini（temperature 0.6, max_tokens ~80）

将来：高品質モード切替（gpt-4o）

8.2 プロンプト設計（例）

System（各キャラごと）

例：パワー先生（政治）

あなたは政治システムのAI。権力の配分・決定・服従の観点だけでコメントする。
日本語で最大65文字。絵文字・顔文字なし。断定口調。具体性を優先。


User

日付: 2025-08-19
本日の出来事（要約）:
{summary_text}


出力：テキスト1行

8.3 入力制御

summary_textが長い場合はサーバーで先に要約（埋め込みorトークン制限）。

禁則：個人名/機密はクライアント警告（初回のみ）、OpenAIの標準フィルタに依存＋軽いNGワード置換。

9. UIコンポーネント仕様（抜粋）

Calendar：react-day-picker等。

DiaryList：日付指定でdiary_entriesを取得→カード表示。

CharacterBar：8体のカードを横並び（SP：スクロール）。

無料5体＝自動展開

課金3体＝ロック（薄表示＋鍵）／解放済みは通常

CommentBubble：保存済みコメントを表示。再生成ボタン、最終生成時刻の表示。

PaywallModal：3体まとめ解放の説明、¥500ボタン、サンプル1行、決済約款リンク。

Toast/Alert：生成成功/失敗、課金キャンセルなどの通知。

10. 分析・計測

calendar_open, day_open, entry_create, summary_generate,
comment_generate, paywall_view, checkout_start, purchase_success.

ペイウォールA/B（価格文言・利点箇条書き・サンプル有無）。

11. テスト観点（例）
11.1 正常系

連投で複数エントリ→サマリー生成→無料5体のコメント保存→再訪で同文。

課金キャラをタップ→Checkout→成功→即解放→コメント生成・保存。

月跨ぎ移動、当日・過去日付の閲覧。

11.2 例外系

OpenAI失敗（タイムアウト/レート）→ユーザーに再試行導線。

Stripeキャンセル→ロック継続。成功Webhook遅延→再訪時に解放確認。

セッション切れ→コメント生成不可→ログイン導線。

12. リスクと対応

生成ブレ：最大65字＋口調統制でノイズ低減。必要ならテンプレ後整形。

トークンコスト：要約＋オンデマンド生成（タップ時）で制御。

不適切表現：標準フィルタ＋簡易NG置換＋通報導線（v2）。

課金不整合：クライアント表示はサーバー真実源のpurchasesを都度確認。Webhook再送対応。

13. ロードマップ（提案）

MVP（2–3週）：

カレンダー/日別/無料5体/保存/サマリー/コメント再生成

Stripeまとめ解放（¥500）/Webhook/解放反映

OpenAI最小実装・RLS・エラーハンドリング

v1.1：

コメント履歴（versioning）・“前回からの変化”表示

ローカルキャッシュ・オフライン投稿

v1.2：

SNS共有（カード画像化）・音声読み上げ・多言語

個別キャラ販売/バンドル切替・A/B

14. 受入れ基準（概要）

カレンダーから任意日付を開くと、新規入力＋当日一覧＋無料5体の保存済みコメントが即表示。

無い日付は「生成」ボタンでコメントを新規作成・保存できる。

課金キャラは鍵表示→Stripe成功→即解放→コメント生成ができる。

再訪時、保存されたコメントがそのまま表示される（スタック可）。

p95応答：表示<150ms（保存済み）、生成API<2.5s。

以上。