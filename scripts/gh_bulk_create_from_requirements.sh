#!/usr/bin/env bash
set -euo pipefail

# Requires: GitHub CLI `gh` authenticated to the target repo.
REQ_FILE=${1:-docs/REQUIREMENTS.md}
LABELS=${2:-feature}

if [[ ! -f "$REQ_FILE" ]]; then
  echo "Requirements file not found: $REQ_FILE" >&2
  exit 1
fi

grep -E "^- FR-[0-9]+:" "$REQ_FILE" | while IFS= read -r line; do
  id=$(sed -E 's/^- (FR-[0-9]+):.*/\1/' <<<"$line")
  title_raw=$(sed -E 's/^- FR-[0-9]+:[[:space:]]*(.*)$/\1/' <<<"$line")
  title="feat: $id $title_raw"
  body=$(cat <<EOF
- 要件ID: $id
- 概要: $title_raw
- 受け入れ基準: Given/When/Then で記載

### タスク（WBS）
- [ ] 要件精査（受け入れ基準をテスト可能に）
- [ ] スキーマ設計/マイグレーション
- [ ] API契約（エンドポイント/DTO/エラー）
- [ ] アプリ層（ユースケース/バリデーション）
- [ ] UI（フォーム/状態/アクセシビリティ）
- [ ] 権限/セキュリティ（認可/監査）
- [ ] テスト（単体/結合/E2E、カバレッジ）
- [ ] 性能/監視（p95/メトリクス/ログ）
- [ ] ドキュメント更新（README/AGENTS/API）
EOF
)

  echo "Creating issue: $title"
  gh issue create --title "$title" --body "$body" --label "$LABELS"
done

echo "Done."

