param([string]$Destino = [Environment]::GetFolderPath('DesktopDirectory'))
$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$taskAsset = Get-Content -LiteralPath (Join-Path $taskRoot 'project\desktop\icon.cjs') -Raw
$taskBase64 = [regex]::Match($taskAsset, 'base64,([^'']+)').Groups[1].Value
$taskBytes = [Convert]::FromBase64String($taskBase64)
$taskIcons = Join-Path $taskRoot 'runtime\icons'
New-Item -ItemType Directory -Path $taskIcons -Force | Out-Null
$taskStream = [IO.MemoryStream]::new()
$taskWriter = [IO.BinaryWriter]::new($taskStream)
$taskWriter.Write([uint16]0); $taskWriter.Write([uint16]1); $taskWriter.Write([uint16]1)
$taskWriter.Write([byte]0); $taskWriter.Write([byte]0); $taskWriter.Write([byte]0); $taskWriter.Write([byte]0)
$taskWriter.Write([uint16]1); $taskWriter.Write([uint16]32)
$taskWriter.Write([uint32]$taskBytes.Length); $taskWriter.Write([uint32]22); $taskWriter.Write($taskBytes)
$taskIcon = Join-Path $taskIcons 'jarvis.ico'
[IO.File]::WriteAllBytes($taskIcon, $taskStream.ToArray())
$taskWriter.Dispose(); $taskStream.Dispose()
if (-not (Test-Path -LiteralPath $Destino -PathType Container)) { throw 'Pasta de atalhos ausente.' }
$taskShell = New-Object -ComObject WScript.Shell
$taskLink = $taskShell.CreateShortcut((Join-Path $Destino 'Jarvis.lnk'))
$taskLink.TargetPath = Join-Path $env:WINDIR 'System32\wscript.exe'
$taskLink.Arguments = '"' + (Join-Path $PSScriptRoot 'Abrir-Jarvis.vbs') + '"'
$taskLink.WorkingDirectory = Join-Path $taskRoot 'project'
$taskLink.IconLocation = $taskIcon + ',0'
$taskLink.Description = 'Jarvis local · conversa e projetos'
$taskLink.Save()
