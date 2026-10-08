param([switch]$RestaurarModeloLocal)
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
    'agent.max_turns' = '10'
    'agent.run_budget_seconds' = '180'
    # Fail visibly instead of keeping the HUD in a multi-minute recovery ladder.
    'agent.api_max_retries' = '1'
    'agent.auto_recovery_cycles' = '0'
    'agent.execution_guidance' = 'true'
    'agent.tool_use_enforcement' = 'false'
    'platform_toolsets.cli' = '[file, terminal, browser, web, memory, skills, todo, session_search, clarify, code_execution, delegation, tts, vision, video, jarvis_local]'
}
if ($RestaurarModeloLocal -or -not (Test-Path -LiteralPath (Join-Path $env:HERMES_HOME 'config.yaml'))) {
    $taskSettings['model.default'] = 'jarvis-local'
    $taskSettings['model.provider'] = 'custom'
    $taskSettings['model.base_url'] = 'http://127.0.0.1:8081/v1'
    $taskSettings['model.context_length'] = '64000'
}
foreach ($taskSetting in $taskSettings.GetEnumerator()) {
    & $taskHermes config set $taskSetting.Key $taskSetting.Value
    if ($LASTEXITCODE -ne 0) { throw "Não foi possível aplicar $($taskSetting.Key)." }
}
& $taskHermes profile rename default Jarvis
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível definir o nome do perfil.' }
Write-Host 'Configuração básica Jarvis aplicada. Abra uma nova conversa para usar as mudanças.'
