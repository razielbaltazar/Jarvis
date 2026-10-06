param(
    [string]$QueryFile,
    [string]$Workspace,
    [string]$Toolsets = 'file,terminal,memory'
)

$ErrorActionPreference = 'Stop'
$taskPreviousLocation = Get-Location
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$env:HERMES_HOME = Join-Path $taskRoot 'runtime'
$taskModel = Join-Path $taskRoot 'models\Qwen3.5-2B-Q4_K_M.gguf'
$taskHermes = Join-Path $taskRoot 'runtime\bin\hermes.exe'
if (-not $Workspace) { $Workspace = Join-Path $taskRoot 'workspace' }
if ($QueryFile) { $QueryFile = (Resolve-Path -LiteralPath $QueryFile).Path }
if (-not (Test-Path -LiteralPath $Workspace -PathType Container)) { throw 'Pasta de trabalho ausente.' }
$taskEngine = Get-ChildItem -LiteralPath (Join-Path $taskRoot 'runtime\tools') -Directory -Filter 'llamacpp-cuda-*' | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Filter 'llama-server.exe' -Recurse -File } | Select-Object -First 1
if (-not $taskEngine -or -not (Test-Path -LiteralPath $taskModel)) { throw 'Motor ou modelo ausente. Consulte INSTALACAO.md.' }
$taskServer = $null
try {
    $taskExisting = $null
    try { $taskExisting = Invoke-RestMethod 'http://127.0.0.1:8081/v1/models' -TimeoutSec 2 } catch {}
    if ($taskExisting -and 'jarvis-local' -notin $taskExisting.data.id) { throw 'A porta 8081 está em uso por outro modelo.' }
    if (-not $taskExisting) {
        New-Item -ItemType Directory -Force -Path (Join-Path $taskRoot 'logs') | Out-Null
        $taskArgs = @('-m', ('"' + $taskModel + '"'), '--alias', 'jarvis-local', '--host', '127.0.0.1', '--port', '8081', '-c', '64000', '-ngl', '99', '-b', '256', '-ub', '128', '-np', '1', '--jinja', '--reasoning-budget', '0', '--cache-type-k', 'q8_0', '--cache-type-v', 'q8_0')
        $taskServer = Start-Process -FilePath $taskEngine.FullName -ArgumentList $taskArgs -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskRoot 'logs\modelo-out.log') -RedirectStandardError (Join-Path $taskRoot 'logs\modelo-error.log')
        $taskReady = $false
        for ($taskAttempt = 0; $taskAttempt -lt 120; $taskAttempt++) {
            if ($taskServer.HasExited) { throw 'O modelo não iniciou. Consulte logs\modelo-error.log na pasta do Jarvis.' }
            try { $taskHealth = Invoke-RestMethod 'http://127.0.0.1:8081/health' -TimeoutSec 1; if ($taskHealth.status -eq 'ok') { $taskReady = $true; break } } catch {}
            Start-Sleep -Milliseconds 500
        }
        if (-not $taskReady) { throw 'O modelo não ficou pronto dentro do prazo.' }
    }
    Set-Location -LiteralPath $Workspace
    if ($QueryFile) {
        & $taskHermes chat --cli -Q --oneshot -t $Toolsets --checkpoints --query-file $QueryFile
    } else {
        Write-Host 'Jarvis local pronto. Use /exit para sair.'
        & $taskHermes chat --cli -t $Toolsets --checkpoints
    }
    if ($LASTEXITCODE -ne 0) { throw "Hermes terminou com código $LASTEXITCODE." }
} finally {
    if ($taskServer -and -not $taskServer.HasExited) { Stop-Process -Id $taskServer.Id }
    Set-Location -LiteralPath $taskPreviousLocation.Path
}

