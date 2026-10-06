param(
    [Parameter(Mandatory = $true)][string]$Nome,
    [Parameter(Mandatory = $true)][string]$Objetivo
)

$ErrorActionPreference = 'Stop'
if ($Nome -notmatch '^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$') {
    throw 'Use um nome curto com letras, números, hífen ou sublinhado.'
}
if ($Nome -match '^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$') { throw 'Nome reservado pelo Windows.' }
$taskRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$taskProjects = Join-Path $taskRoot 'workspace\projetos'
$taskProject = Join-Path $taskProjects $Nome
if (Test-Path -LiteralPath $taskProject) { throw 'Projeto já existe. Abra o existente para continuar.' }
New-Item -ItemType Directory -Path $taskProject -Force | Out-Null
@"
# Projeto: $Nome

Objetivo: $Objetivo

Leia ESTADO.md antes de trabalhar. Consulte apenas os arquivos relevantes deste projeto.
Atualize ESTADO.md ao concluir uma etapa: resultado confirmado, pendências e próxima ação.
Não copie dados de outros projetos. A memória global do perfil não é memória privada deste projeto.
Não salve informações específicas deste projeto na memória global; use arquivos nesta pasta.
Não publique, envie mensagens nem exclua dados sem autorização para a ação concreta.
Preserve mudanças existentes e confirme os resultados por ferramenta antes de anunciar sucesso.
"@ | Set-Content -LiteralPath (Join-Path $taskProject 'AGENTS.md') -Encoding utf8
@"
# Estado: $Nome

Objetivo: $Objetivo

## Resultado confirmado
Pasta e instruções de projeto criadas. Nenhuma implementação realizada.

## Pendências
Definir a primeira entrega pequena, implementar e verificar.

## Próxima ação
Trabalhar nesta pasta pelo iniciador Jarvis usando o parâmetro Workspace.
"@ | Set-Content -LiteralPath (Join-Path $taskProject 'ESTADO.md') -Encoding utf8
Write-Output $taskProject
