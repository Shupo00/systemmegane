Param(
  [string]$Req = "docs/REQUIREMENTS.md",
  [string]$Out = "docs/issues/SEEDS.md"
)

if (-not (Test-Path $Req)) {
  Write-Error "Requirements file not found: $Req"
  exit 1
}

$dir = Split-Path $Out -Parent
if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir | Out-Null }

$header = @(
  "# Issue Seeds from REQUIREMENTS",
  "",
  "Source: $Req",
  "Generated: $([DateTime]::UtcNow.ToString('yyyy-MM-ddTHH:mm:ssZ'))",
  ""
) -join "`n"

Set-Content -Path $Out -Value $header -Encoding UTF8

Get-Content -Path $Req -Encoding UTF8 | ForEach-Object {
  $line = $_
  if ($line -match '^- (FR-\d+):\s*(.+)$') {
    $id = $Matches[1]
    $title = $Matches[2]
    $block = @(
      "",
      "## $id $title",
      "",
      "Title: feat: $id $title",
      "Labels: feature",
      "Body:",
      "- 要件ID: $id",
      "- 概要: $title",
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
      "- [ ] ドキュメント更新（README/AGENTS/API）",
      ""
    ) -join "`n"
    Add-Content -Path $Out -Value $block -Encoding UTF8
  }
}

Write-Host "Generated $Out"

