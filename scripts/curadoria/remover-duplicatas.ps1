param(
  [string]$Duplicatas = 'docs\fase-1-diagnostico\duplicatas.csv',
  [string]$Quarentena = '_duplicatas',
  [string]$Manifesto  = 'curadoria\duplicatas-removidas.csv',
  [switch]$Executar
)
# Move as cópias redundantes de TEMAS/ para a quarentena, mantendo a mesma estrutura de pastas.
# Nada é apagado: cada movimento fica registrado no manifesto e pode ser desfeito com restaurar-duplicatas.ps1.
# Sem -Executar, apenas mostra o que seria feito (simulação).
$root = (Get-Location).Path
$temas = Join-Path $root 'TEMAS'
$rows = Import-Csv -LiteralPath $Duplicatas

# Grupos "mesma foto, duas técnicas no nome" aguardam decisão curatorial: ficam intocados.
$pendentes = $rows | Group-Object grupo | Where-Object {
  $n = $_.Group.arquivo -join '|'
  $_.Group[0].tipo -eq 'exata' -and $n -match 'SERIGRAFIA' -and $n -match 'ACR.LICA S TECIDO|CAMISA ALGOD|PINTURA'
} | ForEach-Object Name

$log = foreach ($r in $rows | Where-Object recomendacao -eq 'redundante') {
  if ($pendentes -contains $r.grupo) { continue }
  $keep = $rows | Where-Object { $_.grupo -eq $r.grupo -and $_.recomendacao -eq 'PRESERVAR' } | Select-Object -First 1
  $rel = $r.caminho.Substring($temas.Length + 1)
  $dest = Join-Path (Join-Path $root $Quarentena) $rel
  if ($Executar) {
    if (-not (Test-Path -LiteralPath $r.caminho)) { Write-Warning "não encontrado: $rel"; continue }
    if ((Get-FileHash -LiteralPath $r.caminho -Algorithm SHA256).Hash -ne $r.sha256) { Write-Warning "hash mudou, ignorado: $rel"; continue }
    New-Item -ItemType Directory -Force (Split-Path $dest) | Out-Null
    Move-Item -LiteralPath $r.caminho -Destination $dest
  }
  [pscustomobject]@{
    grupo = $r.grupo; tipo = $r.tipo
    original = "TEMAS\$rel"
    quarentena = "$Quarentena\$rel"
    preservado = "TEMAS\" + $keep.caminho.Substring($temas.Length + 1)
    sha256 = $r.sha256
  }
}
if ($Executar) {
  New-Item -ItemType Directory -Force (Split-Path $Manifesto) | Out-Null
  $log | Export-Csv -LiteralPath $Manifesto -NoTypeInformation -Encoding UTF8
}
"grupos pendentes (técnica): $($pendentes.Count)"
"arquivos $(if ($Executar) { 'movidos' } else { 'a mover (simulação)' }): $(@($log).Count)"
