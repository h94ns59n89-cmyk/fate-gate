$watchDir = Join-Path $PSScriptRoot "src"
$debounceMs = 3000
$lastEvent = 0
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $watchDir
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

Write-Host "Watching $watchDir for changes..." -ForegroundColor Cyan
Write-Host "Auto-commit + push enabled. Press Ctrl+C to stop." -ForegroundColor Yellow

$action = {
  $now = [Environment]::TickCount
  if ($now -lt ($script:lastEvent + $debounceMs)) { return }
  $script:lastEvent = $now
  $changedFile = $Event.SourceEventArgs.FullPath
  $changeType = $Event.SourceEventArgs.ChangeType
  $relative = if ($changedFile) { [System.IO.Path]::GetRelativePath($PSScriptRoot, $changedFile) } else { "unknown" }
  Write-Host "[$(Get-Date -Format 'HH:mm:ss')] $changeType : $relative" -ForegroundColor Magenta
  Start-Sleep -Milliseconds 1500
  try {
    Push-Location $PSScriptRoot
    git add -A 2>&1 | Out-Null
    $status = git status --porcelain
    if ($status) {
      $msg = "auto-sync: $($status.Count) file(s) changed"
      git commit -m $msg 2>&1 | Out-Null
      Write-Host "Committed: $msg" -ForegroundColor Green
      git push 2>&1 | Tee-Object -Variable pushResult | Out-Null
      Write-Host "Pushed to remote" -ForegroundColor Green
    } else {
      Write-Host "No changes to commit" -ForegroundColor DarkGray
    }
  } catch {
    Write-Host "Sync error: $_" -ForegroundColor Red
  } finally {
    Pop-Location
  }
}

Register-ObjectEvent $watcher "Changed" -Action $action | Out-Null
Register-ObjectEvent $watcher "Created" -Action $action | Out-Null
Register-ObjectEvent $watcher "Deleted" -Action $action | Out-Null
Register-ObjectEvent $watcher "Renamed" -Action $action | Out-Null

try {
  Wait-Event
} finally {
  $watcher.EnableRaisingEvents = $false
  $watcher.Dispose()
  Write-Host "Watcher stopped." -ForegroundColor Cyan
}
