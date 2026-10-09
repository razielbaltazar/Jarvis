param([Parameter(Mandatory=$true)][string]$Arquivo,[string]$Workspace,[switch]$Substituir)
$ErrorActionPreference='Stop'
$taskRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
if(-not $Workspace){$Workspace=Join-Path $taskRoot 'workspace'}
$Workspace=[IO.Path]::GetFullPath($Workspace);$Arquivo=[IO.Path]::GetFullPath($Arquivo)
if(-not (Test-Path -LiteralPath $Arquivo -PathType Leaf)){throw 'Backup não encontrado.'}
$taskTargetDirectory=Join-Path $Workspace '.jarvis';$taskTarget=Join-Path $taskTargetDirectory 'tasks.json'
if((Test-Path -LiteralPath $taskTarget) -and -not $Substituir){throw 'Já existem registros. Use -Substituir somente após conferir o backup.'}
$taskStageRoot=Join-Path $taskRoot 'project\outputs\restore-staging'
$taskStage=Join-Path $taskStageRoot ([guid]::NewGuid());$taskStage=[IO.Path]::GetFullPath($taskStage)
if(-not $taskStage.StartsWith([IO.Path]::GetFullPath($taskStageRoot)+[IO.Path]::DirectorySeparatorChar)){throw 'Diretório temporário inválido.'}
Add-Type -AssemblyName System.IO.Compression.FileSystem
$taskArchive=[IO.Compression.ZipFile]::OpenRead($Arquivo)
try{
 $taskNames=@($taskArchive.Entries | ForEach-Object {$_.FullName})
 if(($taskNames | Where-Object {$_ -notin @('tasks.json','manifest.json') -or $_ -match '(^|[\\/])\.\.([\\/]|$)' -or [IO.Path]::IsPathRooted($_)})){throw 'Backup contém caminhos inesperados.'}
 if('tasks.json' -notin $taskNames -or 'manifest.json' -notin $taskNames){throw 'Backup incompleto.'}
}finally{$taskArchive.Dispose()}
try{
 New-Item -ItemType Directory -Force -Path $taskStage | Out-Null
 Expand-Archive -LiteralPath $Arquivo -DestinationPath $taskStage
 $taskManifest=Get-Content -LiteralPath (Join-Path $taskStage 'manifest.json') -Raw | ConvertFrom-Json
 $taskData=Get-Content -LiteralPath (Join-Path $taskStage 'tasks.json') -Raw | ConvertFrom-Json
 if($taskManifest.format -ne 'jarvis-data-backup' -or $taskManifest.version -ne 1 -or $taskData.version -ne 1 -or $null -eq $taskData.items){throw 'Backup incompatível.'}
 New-Item -ItemType Directory -Force -Path $taskTargetDirectory | Out-Null
 if(Test-Path -LiteralPath $taskTarget){Copy-Item -LiteralPath $taskTarget -Destination ($taskTarget+'.before-restore-'+(Get-Date -Format 'yyyyMMdd-HHmmss'))}
 Copy-Item -LiteralPath (Join-Path $taskStage 'tasks.json') -Destination $taskTarget -Force
 Write-Output $taskTarget
}finally{if(Test-Path -LiteralPath $taskStage){Remove-Item -LiteralPath $taskStage -Recurse -Force}}
