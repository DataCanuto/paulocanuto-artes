param([string]$Csv, [int]$MaxD = 6, [string]$OutCsv)
# Agrupa arquivos que representam a mesma imagem (SHA-256 igual ou dHash <= MaxD)
# e sugere qual cópia preservar. Somente leitura.
$r = @(Import-Csv -LiteralPath $Csv)
$n = $r.Count
$parent = 0..($n - 1)
function Find($i) { while ($parent[$i] -ne $i) { $parent[$i] = $parent[$parent[$i]]; $i = $parent[$i] }; $i }
function Union($a, $b) { $ra = Find $a; $rb = Find $b; if ($ra -ne $rb) { $parent[$rb] = $ra } }
$vals = foreach ($it in $r) { [Convert]::ToUInt64($it.dhash, 2) }
$kind = @{}
for ($i = 0; $i -lt $n; $i++) { for ($j = $i + 1; $j -lt $n; $j++) {
  if ($r[$i].sha256 -eq $r[$j].sha256) { Union $i $j; continue }
  $x = $vals[$i] -bxor $vals[$j]; $d = 0; while ($x -ne 0) { $x = $x -band ($x - 1); $d++ }
  if ($d -le $MaxD) { Union $i $j; $kind["$(Find $i)"] = 'visual' }
} }
# Nome genérico = sem título curatorial (Imagem51, IMG_2021..., Quadros (191), aero1, poster 3)
function IsGeneric($name) { $name -match '^(Imagem\d+|IMG_\d|Quadros \(\d+\)|aero\d|poster \d|desenho [a-z]|brush )' }
$groups = 0..($n - 1) | Group-Object { Find $_ } | Where-Object Count -gt 1
$out = foreach ($g in $groups) {
  $idx = $g.Group
  $members = $idx | ForEach-Object { $r[$_] }
  $exact = ($members | Select-Object -ExpandProperty sha256 -Unique).Count -eq 1
  $temas = ($members | ForEach-Object { $_.tema.Split('\')[0] } | Select-Object -Unique)
  $keep = $members | Sort-Object @{e={ [int]$_.largura * [int]$_.altura }; d=$true}, @{e={ if (IsGeneric $_.arquivo) {1} else {0} }}, @{e={ $_.ext -eq '.png' }; d=$true}, @{e={ $_.arquivo.Length }; d=$true} | Select-Object -First 1
  $gid = [array]::IndexOf($groups, $g) + 1
  foreach ($m in $members) {
    [pscustomobject]@{
      grupo = $gid
      tipo = $(if ($exact) { 'exata' } else { 'visual' })
      entre_temas = $(if ($temas.Count -gt 1) { 'sim' } else { 'nao' })
      recomendacao = $(if ($m.caminho -eq $keep.caminho) { 'PRESERVAR' } else { 'redundante' })
      tema = $m.tema; arquivo = $m.arquivo; largura = $m.largura; altura = $m.altura; bytes = $m.bytes
      nome_generico = $(if (IsGeneric $m.arquivo) { 'sim' } else { 'nao' })
      sha256 = $m.sha256; caminho = $m.caminho
    }
  }
}
$out | Export-Csv -LiteralPath $OutCsv -NoTypeInformation -Encoding UTF8
$byG = $out | Group-Object grupo
"grupos: $($byG.Count)  exatos: $(($byG | Where-Object { $_.Group[0].tipo -eq 'exata' }).Count)  visuais: $(($byG | Where-Object { $_.Group[0].tipo -eq 'visual' }).Count)"
"entre temas: $(($byG | Where-Object { $_.Group[0].entre_temas -eq 'sim' }).Count)"
"arquivos redundantes: $(($out | Where-Object recomendacao -eq 'redundante').Count)"
"obras unicas estimadas: $($n - ($out | Where-Object recomendacao -eq 'redundante').Count)"
"grupos visuais (nao exatos) ou com mistura:"
$byG | Where-Object { $_.Group[0].tipo -eq 'visual' } | ForEach-Object { "-- g$($_.Name)"; $_.Group | ForEach-Object { "   $($_.recomendacao)  $($_.largura)x$($_.altura)  $($_.tema.Split('.')[0])\$($_.arquivo)" } }
"grupos entre temas:"
$byG | Where-Object { $_.Group[0].entre_temas -eq 'sim' } | ForEach-Object { "-- g$($_.Name)"; $_.Group | ForEach-Object { "   $($_.recomendacao)  $($_.tema.Split('.')[0])\$($_.arquivo)" } }
"padrao TECIDO x SERIGRAFIA / CAMISA x SERIGRAFIA (mesmo arquivo, titulos de tecnica diferentes):"
($byG | Where-Object { $names = $_.Group.arquivo -join '|'; $names -match 'SERIGRAFIA' -and ($names -match 'ACR.LICA S TECIDO|CAMISA ALGOD|PINTURA') }).Count
