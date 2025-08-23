# Issue Seeds 使い方

このフォルダには、`docs/REQUIREMENTS.md` の FR をもとに Issue の雛形を生成するための成果物を置きます。

## 生成コマンド（Markdown）
- Bash (macOS/Linux/WSL):
  - `bash scripts/generate_issue_seeds.sh`
- PowerShell (Windows):
  - `pwsh -File scripts/generate_issue_seeds.ps1`

既定では `docs/issues/SEEDS.md` が生成されます。GitHub の Issue 作成画面に内容をコピー＆ペーストするか、GitHub CLI を使う場合は各ブロックを `gh issue create` に流用してください。

## 小ワザ
- REQUIREMENTS.md で FR ラインは `- FR-001: タイトル` 形式にしてください（抽出対象）。
- さらに詳細なWBSが必要な場合は `docs/IMPLEMENTATION_PLAN.md` のテンプレートを参照し、各FRブロックに追記します。

---

## 生成コマンド（CSV → gh一括）
- CSV生成:
  - Bash: `bash scripts/generate_issue_csv.sh`
  - PowerShell: `pwsh -File scripts/generate_issue_csv.ps1`
  - 出力: `docs/issues/issues.csv`（列: `title,body,labels`。改行は `\n` でエンコード）

## 一括発行（GitHub CLIが必要）
- Bash（REQUIREMENTS.md から直接）:
  - `bash scripts/gh_bulk_create_from_requirements.sh`  ※ `gh auth login` 済みで実行
- PowerShell（CSV から）:
  - `pwsh -File scripts/gh_bulk_create_from_csv.ps1`

注意:
- 事前に `gh auth login` で対象リポジトリに認証してください。
- ラベルはデフォルトで `feature`。必要に応じてスクリプト引数で上書き可能です。
