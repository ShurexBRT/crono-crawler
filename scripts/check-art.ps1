$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$root = Split-Path -Parent $PSScriptRoot
$files = @(Get-ChildItem -LiteralPath (Join-Path $root 'assets/backgrounds/production') -Filter '*.png' -File)
$files += Get-Item -LiteralPath (Join-Path $root 'assets/sprites/elias-production-source.png')
$files += Get-Item -LiteralPath (Join-Path $root 'assets/sprites/story-characters-production.png')
$files += Get-ChildItem -LiteralPath (Join-Path $root 'assets/memories') -Filter '*.png' -File
$files += Get-Item -LiteralPath (Join-Path $root 'assets/ui/memory-vault-book.png')
$report = foreach ($file in $files) {
  $bitmap = [System.Drawing.Bitmap]::new($file.FullName)
  try {
    $transparent = 0
    $opaque = 0
    $sampled = 0
    for ($y = 4; $y -lt $bitmap.Height; $y += 12) {
      for ($x = 4; $x -lt $bitmap.Width; $x += 12) {
        $alpha = $bitmap.GetPixel($x, $y).A
        if ($alpha -lt 12) { $transparent += 1 }
        if ($alpha -gt 240) { $opaque += 1 }
        $sampled += 1
      }
    }
    $isSprite = $file.Directory.Name -eq 'sprites'
    $isMemory = $file.Directory.Name -eq 'memories'
    if ($isSprite -and ($transparent / $sampled -lt 0.4 -or $opaque / $sampled -lt 0.05)) {
      throw "Invalid sprite alpha: $($file.Name)"
    }
    if ($isMemory -and ($bitmap.Width -lt 1000 -or $bitmap.Height -lt 1000)) {
      throw "Memory illustration too small: $($file.Name)"
    }
    if (-not $isSprite -and -not $isMemory -and ($bitmap.Width -lt 1500 -or $bitmap.Height -lt 840)) {
      throw "Background too small: $($file.Name)"
    }
    [pscustomobject]@{
      path = $file.FullName.Substring($root.Length + 1).Replace('\', '/')
      width = $bitmap.Width
      height = $bitmap.Height
      bytes = $file.Length
      transparentSampleRatio = [Math]::Round($transparent / $sampled, 4)
      opaqueSampleRatio = [Math]::Round($opaque / $sampled, 4)
      sha256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
    }
  } finally { $bitmap.Dispose() }
}
$report | ConvertTo-Json -Depth 3
