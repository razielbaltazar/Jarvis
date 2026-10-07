param(
    [string]$QueryFile,
    [string]$Workspace,
    [string[]]$Toolsets = @('file', 'terminal', 'jarvis_local'),
    [switch]$Desktop,
    [switch]$HermesDesktop
)

$ErrorActionPreference = 'Stop'
$taskPreviousLocation = Get-Location
$taskToolsets = $Toolsets -join ','
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$env:HERMES_HOME = Join-Path $taskRoot 'runtime'
$taskModel = Join-Path $taskRoot 'models\Qwen3.5-2B-Q4_K_M.gguf'
$taskHermes = Join-Path $taskRoot 'runtime\bin\hermes.exe'
$taskDesktopExe = Join-Path $taskRoot 'hermes-agent\apps\desktop\release\win-unpacked\Hermes.exe'
$taskElectron = Join-Path $taskRoot 'hermes-agent\apps\desktop\node_modules\electron\dist\electron.exe'
if ($HermesDesktop) { $Desktop = $true }
if ($Desktop -and $QueryFile) { throw 'Use Desktop para conversar na janela, ou QueryFile para tarefa única.' }
if ($Desktop -and $HermesDesktop -and -not (Test-Path -LiteralPath $taskDesktopExe)) { throw 'Aplicativo desktop ainda não compilado. Consulte docs/USO.md.' }
if ($Desktop -and -not $HermesDesktop -and -not (Test-Path -LiteralPath $taskElectron)) { throw 'Runtime desktop ausente. Consulte docs/USO.md.' }
if (-not $Workspace) { $Workspace = Join-Path $taskRoot 'workspace' }
$env:JARVIS_WORKSPACE = $Workspace
if ($QueryFile) { $QueryFile = (Resolve-Path -LiteralPath $QueryFile).Path }
if (-not (Test-Path -LiteralPath $Workspace -PathType Container)) { throw 'Pasta de trabalho ausente.' }
$taskEngine = Get-ChildItem -LiteralPath (Join-Path $taskRoot 'runtime\tools') -Directory -Filter 'llamacpp-cuda-*' | ForEach-Object { Get-ChildItem -LiteralPath $_.FullName -Filter 'llama-server.exe' -Recurse -File } | Select-Object -First 1
if (-not $taskEngine -or -not (Test-Path -LiteralPath $taskModel)) { throw 'Motor ou modelo ausente. Consulte INSTALACAO.md.' }
$taskServer = $null
$taskStartupMutex = $null
$taskStartupOwned = $false
if ($Desktop) {
    $taskStartupMutex = [Threading.Mutex]::new($false, 'Local\JarvisStartup')
    $taskStartupOwned = $taskStartupMutex.WaitOne(0)
    if (-not $taskStartupOwned) { $taskStartupMutex.Dispose(); return }
}
try {
    $taskExisting = $null
    try { $taskExisting = Invoke-RestMethod 'http://127.0.0.1:8081/v1/models' -TimeoutSec 2 } catch {}
    if ($taskExisting -and 'jarvis-local' -notin $taskExisting.data.id) { throw 'A porta 8081 está em uso por outro modelo.' }
    if ($taskExisting) {
        $taskProps = Invoke-RestMethod 'http://127.0.0.1:8081/props' -TimeoutSec 3
        if ([int]$taskProps.default_generation_settings.n_ctx -lt 64000) {
            throw 'O servidor existente tem contexto menor que 64000. Encerre o motor antigo do Jarvis antes de reiniciar; não reutilizar essa conexão.'
        }
    }
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
    if ($Desktop -and -not $HermesDesktop) {
        $taskJarvisProcess = Start-Process -FilePath $taskElectron -ArgumentList ('"' + (Join-Path $taskRoot 'project\desktop') + '"') -WindowStyle Hidden -PassThru
        $taskStartupMutex.ReleaseMutex(); $taskStartupOwned = $false
        $taskJarvisProcess.WaitForExit()
        $LASTEXITCODE = $taskJarvisProcess.ExitCode
    } elseif ($Desktop) {
        & $taskHermes desktop --skip-build --local --hermes-root (Join-Path $taskRoot 'hermes-agent') --cwd $Workspace
        if ($LASTEXITCODE -ne 0) { throw "Desktop terminou com código $LASTEXITCODE." }
        $taskDesktopProcess = $null
        for ($taskAttempt = 0; $taskAttempt -lt 20; $taskAttempt++) {
            $taskDesktopRoot = Get-CimInstance Win32_Process -Filter "Name = 'Hermes.exe'" | Where-Object { $_.ExecutablePath -eq $taskDesktopExe -and $_.CommandLine -notmatch '--type=' } | Select-Object -First 1
            $taskDesktopProcess = if ($taskDesktopRoot) { Get-Process -Id $taskDesktopRoot.ProcessId -ErrorAction SilentlyContinue } else { $null }
            if ($taskDesktopProcess) { break }
            Start-Sleep -Milliseconds 500
        }
        if (-not $taskDesktopProcess) { throw 'O aplicativo não permaneceu aberto.' }
        Write-Host 'Jarvis desktop aberto. Feche a janela para encerrar o modelo iniciado por este script.'
        $taskDesktopProcess.WaitForExit()
    } elseif ($QueryFile) {
        & $taskHermes chat --cli -Q --oneshot -t $taskToolsets --checkpoints --query-file $QueryFile
    } else {
        Write-Host 'Jarvis local pronto. Use /exit para sair.'
        & $taskHermes chat --cli -t $taskToolsets --checkpoints
    }
    if ($LASTEXITCODE -ne 0) { throw "Hermes terminou com código $LASTEXITCODE." }
} catch {
    $taskFailure = $_.Exception.Message
    [IO.File]::WriteAllText((Join-Path $taskRoot 'logs\inicio-erro.log'), $taskFailure)
    if ($Desktop) {
        $taskPopup = New-Object -ComObject WScript.Shell
        $taskPopup.Popup("Jarvis não conseguiu abrir: $taskFailure", 15, 'Jarvis', 16) | Out-Null
    }
    throw
} finally {
    if ($taskStartupOwned) { $taskStartupMutex.ReleaseMutex() }
    if ($taskStartupMutex) { $taskStartupMutex.Dispose() }
    if ($taskServer -and -not $taskServer.HasExited) { Stop-Process -Id $taskServer.Id }
    Set-Location -LiteralPath $taskPreviousLocation.Path
}
