# Estado para retomada
Atualizado em 06/10/2026.

## Funciona
Hermes instalado; versão, ajuda e integridade dos componentes básicos verificadas. Terminal e interface web compilados. Desktop e gateway não instalados. Qwen3.5-2B Q4_K_M baixado e SHA256 verificado.

## Configuração
Estrutura local: <JARVIS_ROOT>/hermes-agent (upstream), runtime (dados), models (modelo), project (este repositório), workspace (tarefas).
Endpoint previsto: http://127.0.0.1:8081/v1; alias jarvis-local; contexto 16384; máximo 10 turnos e 180 segundos por execução. Curator pausado.

## Bloqueio
llama.cpp b11370 CUDA, Vulkan e CPU falharam em --version com 0xc0000005. Eventos apontam biblioteca MSVCP140.dll 14.28.29914.0. Instalador Microsoft Visual C++ x64 baixado e assinatura validada; atualização ainda não executada.

## Próxima ação
Atualizar Visual C++ oficial, repetir verificação do motor, iniciar modelo e testar português e chamada de ferramenta em workspace de teste. Validar scripts/Iniciar-Jarvis.ps1 antes de apresentar como pronto. Não repetir download do modelo.

## GitHub
Repositório: https://github.com/razielbaltazar/Jarvis
Documentação pública sem credenciais, arquivos pessoais ou diagnóstico detalhado. Estrutura inicial publicada e sincronizada com a cópia local. Este arquivo registra a próxima ação para continuidade.

O Jarvis ainda não está operacional. Ultron é visão futura, sem pendências atuais.
