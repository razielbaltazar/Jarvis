param()
$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$env:HERMES_HOME = Join-Path $taskRoot 'runtime'
$taskDestination = Join-Path $env:HERMES_HOME 'plugins\jarvis-records'
New-Item -ItemType Directory -Path $taskDestination -Force | Out-Null
foreach ($taskName in @('plugin.yaml','__init__.py')) {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot "..\plugins\jarvis-records\$taskName") -Destination (Join-Path $taskDestination $taskName) -Force
}
$taskHermes = Join-Path $taskRoot 'runtime\bin\hermes.exe'
& $taskHermes plugins enable jarvis-records
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível habilitar a extensão local.' }
& $taskHermes config set platform_toolsets.cli '[file, terminal, browser, memory, skills, todo, jarvis_local]'
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível habilitar as ferramentas locais.' }
Write-Host 'Extensão de registros Jarvis instalada, mantendo o código upstream separado.'
