param([string]$Csv, [int]$MaxD, [string]$OutPrefix)
# Gera folhas de contato (pares lado a lado) para revisão visual. Não altera nada no acervo.
Add-Type -AssemblyName System.Drawing
$r = Import-Csv -LiteralPath $Csv | Where-Object dhash | Sort-Object sha256 -Unique
$vals = foreach ($it in $r) { [Convert]::ToUInt64($it.dhash, 2) }
$pairs = @()
for ($i = 0; $i -lt $r.Count; $i++) { for ($j = $i + 1; $j -lt $r.Count; $j++) {
  $x = $vals[$i] -bxor $vals[$j]; $d = 0; while ($x -ne 0) { $x = $x -band ($x - 1); $d++ }
  if ($d -le $MaxD) { $pairs += ,@($d, $r[$i], $r[$j]) } } }
$pairs = $pairs | Sort-Object { $_[0] }
$cellW = 360; $cellH = 260; $lab = 46; $perSheet = 6
$font = New-Object System.Drawing.Font 'Segoe UI', 8
$sheet = 0
for ($s = 0; $s -lt $pairs.Count; $s += $perSheet) {
  $chunk = $pairs[$s..([math]::Min($s + $perSheet, $pairs.Count) - 1)]
  $bmp = New-Object System.Drawing.Bitmap ($cellW * 2 + 30), (($cellH + $lab + 12) * $chunk.Count)
  $g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode = 'HighQualityBicubic'
  $row = 0
  foreach ($p in $chunk) {
    $y0 = $row * ($cellH + $lab + 12)
    for ($k = 0; $k -lt 2; $k++) {
      $it = $p[1 + $k]; $x0 = 10 + $k * ($cellW + 10)
      $img = [System.Drawing.Image]::FromFile($it.caminho)
      $sc = [math]::Min($cellW / $img.Width, $cellH / $img.Height)
      $w = [int]($img.Width * $sc); $h = [int]($img.Height * $sc)
      $g.DrawImage($img, $x0 + ($cellW - $w) / 2, $y0 + ($cellH - $h) / 2, $w, $h); $img.Dispose()
      $txt = "#$($s + $row + 1) d=$($p[0])  $($it.largura)x$($it.altura)`n$($it.tema.Split('.')[0])\$($it.arquivo)"
      $g.DrawString($txt, $font, [System.Drawing.Brushes]::Black, (New-Object System.Drawing.RectangleF $x0, ($y0 + $cellH + 2), $cellW, $lab))
    }
    $row++
  }
  $g.Dispose(); $sheet++
  $bmp.Save("$OutPrefix-$sheet.png", [System.Drawing.Imaging.ImageFormat]::Png); $bmp.Dispose()
}
"folhas: $sheet  pares: $($pairs.Count)"
