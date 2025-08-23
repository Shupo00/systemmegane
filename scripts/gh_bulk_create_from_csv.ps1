Param(
  [string]$Csv = "docs/issues/issues.csv",
  [string]$LabelsOverride = ""
)

# Requires: GitHub CLI `gh` authenticated to the target repo.
if (-not (Test-Path $Csv)) {
  Write-Error "CSV not found: $Csv"
  exit 1
}

$rows = Import-Csv -Path $Csv
foreach ($row in $rows) {
  $title = $row.title
  $body = $row.body -replace "\\n", "`n"
  $labels = if ($LabelsOverride -ne "") { $LabelsOverride } else { $row.labels }
  Write-Host "Creating issue: $title"
  gh issue create --title "$title" --body "$body" --label "$labels"
}

Write-Host "Done."

