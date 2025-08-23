#!/usr/bin/env bash
set -euo pipefail

REQ_FILE=${1:-docs/REQUIREMENTS.md}
OUT=${2:-docs/issues/SEEDS.md}

if [[ ! -f "$REQ_FILE" ]]; then
  echo "Requirements file not found: $REQ_FILE" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"

{
  echo "# Issue Seeds from REQUIREMENTS"
  echo
  echo "Source: $REQ_FILE"
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
} > "$OUT"

# Extract lines like: - FR-001: タイトル
awk '
  function print_block(id, title) {
    print "\n## " id " " title "\n";
    print "Title: feat: " id " " title "\n";
    print "Labels: feature" "\n";
    print "Body:" "\n";
    print "- 要件ID: " id "\n";
    print "- 概要: " title "\n";
    print "- 受け入れ基準: Given/When/Then で記載\n";
    print "\n### タスク（WBS）\n";
    print "- [ ] 要件精査（受け入れ基準をテスト可能に）";
    print "- [ ] スキーマ設計/マイグレーション";
    print "- [ ] API契約（エンドポイント/DTO/エラー）";
    print "- [ ] アプリ層（ユースケース/バリデーション）";
    print "- [ ] UI（フォーム/状態/アクセシビリティ）";
    print "- [ ] 権限/セキュリティ（認可/監査）";
    print "- [ ] テスト（単体/結合/E2E、カバレッジ）";
    print "- [ ] 性能/監視（p95/メトリクス/ログ）";
    print "- [ ] ドキュメント更新（README/AGENTS/API）\n";
  }
  {
    if (match($0, /^- (FR-[0-9]+):[[:space:]]*(.+)$/, m)) {
      id=m[1]; title=m[2];
      print_block(id, title);
    }
  }
' "$REQ_FILE" >> "$OUT"

echo "Generated $OUT"

