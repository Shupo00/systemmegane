#!/usr/bin/env bash
set -euo pipefail

REQ_FILE=${1:-docs/REQUIREMENTS.md}
OUT=${2:-docs/issues/issues.csv}

if [[ ! -f "$REQ_FILE" ]]; then
  echo "Requirements file not found: $REQ_FILE" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUT")"

csv_escape() {
  local s=${1//"/""}
  printf '"%s"' "$s"
}

{
  echo "title,body,labels"
  awk '
    function esc_commas(s){ gsub(/,/, "、", s); return s }
    function mk_body(id, title,   body){
      body = "- 要件ID: " id "\\n" \
             "- 概要: " title "\\n" \
             "- 受け入れ基準: Given/When/Then で記載\\n\\n" \
             "### タスク（WBS）\\n" \
             "- [ ] 要件精査（受け入れ基準をテスト可能に）\\n" \
             "- [ ] スキーマ設計/マイグレーション\\n" \
             "- [ ] API契約（エンドポイント/DTO/エラー）\\n" \
             "- [ ] アプリ層（ユースケース/バリデーション）\\n" \
             "- [ ] UI（フォーム/状態/アクセシビリティ）\\n" \
             "- [ ] 権限/セキュリティ（認可/監査）\\n" \
             "- [ ] テスト（単体/結合/E2E、カバレッジ）\\n" \
             "- [ ] 性能/監視（p95/メトリクス/ログ）\\n" \
             "- [ ] ドキュメント更新（README/AGENTS/API）";
      return body
    }
    {
      if (match($0, /^- (FR-[0-9]+):[[:space:]]*(.+)$/, m)) {
        id=m[1]; title=m[2];
        title=esc_commas(title);
        t = "feat: " id " " title;
        b = mk_body(id, title);
        # shell does quoting; here we just print raw and let shell wrap
        printf "%s,%s,%s\n", t, b, "feature";
      }
    }
  ' "$REQ_FILE" \
  | while IFS= read -r line; do
      # Wrap fields with CSV quoting now
      title=${line%%,*}
      rest=${line#*,}
      body=${rest%,feature}
      labels=feature
      csv_title=$(csv_escape "$title")
      csv_body=$(csv_escape "$body")
      csv_labels=$(csv_escape "$labels")
      printf "%s,%s,%s\n" "$csv_title" "$csv_body" "$csv_labels"
    done
} > "$OUT"

echo "Generated $OUT"

