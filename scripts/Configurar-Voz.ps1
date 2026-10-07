param([switch]$Instalar)
$ErrorActionPreference = 'Stop'
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$taskHermes = Join-Path $taskRoot 'runtime\bin\hermes.exe'
$env:HERMES_HOME = Join-Path $taskRoot 'runtime'
if ($Instalar) {
    & $taskHermes pm install --extra stt-whisper --extra piper --extra voice
    if ($LASTEXITCODE -ne 0) { throw 'Falha ao instalar os extras oficiais de voz.' }
}
$taskConfig = Join-Path $env:HERMES_HOME 'config.yaml'
Copy-Item -LiteralPath $taskConfig -Destination ($taskConfig + '.before-voice-' + (Get-Date -Format 'yyyyMMdd-HHmmss'))
$taskSettings = [ordered]@{
    'stt.enabled' = 'true'
    'stt.provider' = 'local'
    'stt.language' = 'pt'
    'stt.local.model' = 'base'
    'stt.local.language' = 'pt'
    'stt.local.device' = 'cpu'
    'stt.local.compute_type' = 'int8'
    'stt.local.unload_after_idle_seconds' = '60'
    'tts.provider' = 'piper'
    'tts.piper.voice' = 'pt_BR-faber-medium'
    'tts.piper.voices_dir' = (Join-Path $taskRoot 'models\voices')
    'tts.piper.use_cuda' = 'false'
    'voice.max_recording_seconds' = '20'
    'voice.silence_duration' = '1.5'
}
foreach ($taskSetting in $taskSettings.GetEnumerator()) {
    & $taskHermes config set $taskSetting.Key $taskSetting.Value
    if ($LASTEXITCODE -ne 0) { throw "Falha ao aplicar $($taskSetting.Key)." }
}
Write-Host 'Voz local configurada. Microfone permanece desligado até uma ação explícita na janela.'
