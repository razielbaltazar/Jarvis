param([string]$Workspace,[string]$Destino)
$ErrorActionPreference='Stop'
$taskRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if(-not $Workspace){$Workspace=Join-Path $taskRoot 'workspace'}
$Workspace=[IO.Path]::GetFullPath($Workspace)
$taskRecords=Join-Path $Workspace '.jarvis\tasks.json'
if(-not (Test-Path -LiteralPath $taskRecords -PathType Leaf)){throw 'Nenhum registro local encontrado nesta pasta de trabalho.'}
$taskData=Get-Content -LiteralPath $taskRecords -Raw | ConvertFrom-Json
if($taskData.version -ne 1 -or $null -eq $taskData.items){throw 'Formato de registros não reconhecido; nada foi alterado.'}
$taskOutputRoot=Join-Path $taskRoot 'project\outputs\backups'
if(-not $Destino){$Destino=Join-Path $taskOutputRoot ('jarvis-dados-'+(Get-Date -Format 'yyyyMMdd-HHmmss')+'.zip')}
$Destino=[IO.Path]::GetFullPath($Destino)
if([IO.Path]::GetExtension($Destino) -ne '.zip'){throw 'O destino precisa terminar em .zip.'}
$taskStage=Join-Path $taskOutputRoot ('staging-'+[guid]::NewGuid())
$taskStage=[IO.Path]::GetFullPath($taskStage)
if(-not $taskStage.StartsWith([IO.Path]::GetFullPath($taskOutputRoot)+[IO.Path]::DirectorySeparatorChar)){throw 'Diretório temporário inválido.'}
try{
 New-Item -ItemType Directory -Force -Path $taskStage,(Split-Path -Parent $Destino) | Out-Null
 Copy-Item -LiteralPath $taskRecords -Destination (Join-Path $taskStage 'tasks.json')
 $taskManifest=[ordered]@{format='jarvis-data-backup';version=1;created_at=(Get-Date).ToUniversalTime().ToString('o');contains=@('tasks')}
 $taskManifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $taskStage 'manifest.json') -Encoding utf8
 Compress-Archive -LiteralPath (Join-Path $taskStage 'tasks.json'),(Join-Path $taskStage 'manifest.json') -DestinationPath $Destino -CompressionLevel Optimal -Force
 Write-Output $Destino
}finally{if(Test-Path -LiteralPath $taskStage){Remove-Item -LiteralPath $taskStage -Recurse -Force}}
