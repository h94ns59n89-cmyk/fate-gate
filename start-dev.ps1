$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = 'cmd.exe'
$psi.Arguments = '/c cd /d "C:\00.My document\@@\星隅人格系统项目\fate-gate" && npx next dev -p 3000'
$psi.UseShellExecute = $false
$psi.CreateNoWindow = $true
[System.Diagnostics.Process]::Start($psi)
Write-Output 'dev server started'
