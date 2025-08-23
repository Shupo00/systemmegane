Param(
  [string]$Req = "docs/REQUIREMENTS.md",
  [string]$Out = "docs/issues/issues.csv"
)

if (-not (Test-Path $Req)) {
  Write-Error "Requirements file not found: $Req"
  exit 1
}

$dir = Split-Path $Out -Parent
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

Function CsvEscape([string]$s) {
  '"' + $s.Replace('"', '""') + '"'
}

$rows = @()
Get-Content -Path $Req -Encoding UTF8 | ForEach-Object {
  if ($_ -match '^- (FR-\d+):\s*(.+)$') {
    $id = $Matches[1]
    $titleRaw = $Matches[2].Replace(',', '、')
    $title = "feat: $id $titleRaw"
    $body = (@(
      "- 要件ID: $id",
      "- 概要: $titleRaw",
      "- 受け入れ基準: Given/When/Then で記載",
      "",
      "### タスク（WBS）",
      "- [ ] 要件精査（受け入れ基準をテスト可能に）",
      "- [ ] スキーマ設計/マイグレーション",
      "- [ ] API契約（エンドポイント/DTO/エラー）",
      "- [ ] アプリ層（ユースケース/バリデーション）",
      "- [ ] UI（フォーム/状態/アクセシビリティ）",
      "- [ ] 権限/セキュリティ（認可/監査）",
      "- [ ] テスト（単体/結合/E2E、カバレッジ）",
      "- [ ] 性能/監視（p95/メトリクス/ログ）",
      "- [ ] ドキュメント更新（README/AGENTS/API）"
    ) -join "`n")
    $label = 'feature'
    $rows += ( (CsvEscape $title) + ',' + (CsvEscape $body) + ',' + (CsvEscape $label) )
  }
}

Set-Content -Path $Out -Encoding UTF8 -Value @("title,body,labels")
Add-Content -Path $Out -Encoding UTF8 -Value $rows
Write-Host "Generated $Out"

