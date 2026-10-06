param()
$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$taskHermes = Join-Path $taskRoot 'runtime\bin\hermes.exe'
$env:HERMES_HOME = Join-Path $taskRoot 'runtime'
if (-not (Test-Path -LiteralPath $taskHermes)) { throw 'Instale o Hermes antes de aplicar esta configuração.' }
$taskSoul = Join-Path $taskRoot 'runtime\SOUL.md'
if (Test-Path -LiteralPath $taskSoul) {
    Copy-Item -LiteralPath $taskSoul -Destination ($taskSoul + '.before-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
}
Copy-Item -LiteralPath (Join-Path $PSScriptRoot '..\config\SOUL.md') -Destination $taskSoul -Force
$taskSettings = [ordered]@{
    'model.default' = 'jarvis-local'
    'model.provider' = 'custom'
    'model.base_url' = 'http://127.0.0.1:8081/v1'
    'model.context_length' = '64000'
    'agent.max_turns' = '10'
    'agent.run_budget_seconds' = '180'
    'agent.execution_guidance' = 'true'
    'agent.tool_use_enforcement' = 'false'
    'platform_toolsets.cli' = '[file, terminal]'
}
foreach ($taskSetting in $taskSettings.GetEnumerator()) {
    & $taskHermes config set $taskSetting.Key $taskSetting.Value
    if ($LASTEXITCODE -ne 0) { throw "Não foi possível aplicar $($taskSetting.Key)." }
}
& $taskHermes profile rename default Jarvis
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível definir o nome do perfil.' }
Write-Host 'Configuração básica Jarvis aplicada. Abra uma nova conversa para usar as mudanças.'
