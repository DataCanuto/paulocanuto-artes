param([string]$Root, [string]$OutCsv)
# Somente leitura: abre cada arquivo, calcula SHA-256, dimensões, orientação EXIF e dHash 64 bits.
Add-Type -AssemblyName System.Drawing
$exts = '.jpg','.jpeg','.png','.gif','.webp','.bmp','.tif','.tiff'
$files = Get-ChildItem -LiteralPath $Root -Recurse -File | Where-Object { $exts -contains $_.Extension.ToLower() }
$rows = New-Object System.Collections.Generic.List[object]
$i = 0
foreach ($f in $files) {
  $i++
  $sha = (Get-FileHash -LiteralPath $f.FullName -Algorithm SHA256).Hash
  $w = $null; $h = $null; $orient = 1; $dhash = ''; $err = ''
  try {
    $fs = [System.IO.File]::OpenRead($f.FullName)
    try {
      $img = [System.Drawing.Image]::FromStream($fs, $false, $false)
      try {
        $w = $img.Width; $h = $img.Height
        if ($img.PropertyIdList -contains 0x0112) { $orient = [int]$img.GetPropertyItem(0x0112).Value[0] }
        # dHash: reduz para 9x8 em tons de cinza e compara pixels vizinhos na horizontal
        $bmp = New-Object System.Drawing.Bitmap 9, 8
        $g = [System.Drawing.Graphics]::FromImage($bmp)
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.DrawImage($img, 0, 0, 9, 8)
        $g.Dispose()
        $bits = New-Object System.Text.StringBuilder
        for ($y = 0; $y -lt 8; $y++) {
          for ($x = 0; $x -lt 8; $x++) {
            $a = $bmp.GetPixel($x, $y); $b = $bmp.GetPixel($x + 1, $y)
            $la = 0.299*$a.R + 0.587*$a.G + 0.114*$a.B
            $lb = 0.299*$b.R + 0.587*$b.G + 0.114*$b.B
            [void]$bits.Append($(if ($la -gt $lb) { '1' } else { '0' }))
          }
        }
        $bmp.Dispose()
        $dhash = $bits.ToString()
      } finally { $img.Dispose() }
    } finally { $fs.Dispose() }
  } catch { $err = $_.Exception.Message }
  # EXIF 5..8 = imagem gravada girada 90°; a orientação visual inverte largura/altura
  $vw = $w; $vh = $h
  if ($orient -ge 5 -and $orient -le 8) { $vw = $h; $vh = $w }
  $rows.Add([pscustomobject]@{
    tema     = $f.Directory.FullName.Substring($Root.Length).TrimStart('\')
    arquivo  = $f.Name
    caminho  = $f.FullName
    ext      = $f.Extension.ToLower()
    bytes    = $f.Length
    largura  = $vw
    altura   = $vh
    exif_orientacao = $orient
    sha256   = $sha
    dhash    = $dhash
    erro     = $err
  })
  if ($i % 100 -eq 0) { Write-Host "$i/$($files.Count)" }
}
$rows | Export-Csv -LiteralPath $OutCsv -NoTypeInformation -Encoding UTF8
Write-Host "OK $($rows.Count) imagens"
