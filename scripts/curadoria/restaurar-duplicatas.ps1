param([string]$Manifesto = 'curadoria\duplicatas-removidas.csv')
# Desfaz remover-duplicatas.ps1: devolve cada arquivo da quarentena ao caminho original.
$root = (Get-Location).Path
foreach ($r in Import-Csv -LiteralPath $Manifesto) {
  $src = Join-Path $root $r.quarentena; $dst = Join-Path $root $r.original
  if (-not (Test-Path -LiteralPath $src)) { Write-Warning "ausente na quarentena: $($r.quarentena)"; continue }
  if (Test-Path -LiteralPath $dst) { Write-Warning "já existe, ignorado: $($r.original)"; continue }
  New-Item -ItemType Directory -Force (Split-Path $dst) | Out-Null
  Move-Item -LiteralPath $src -Destination $dst
  "restaurado: $($r.original)"
}
