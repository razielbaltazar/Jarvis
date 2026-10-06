# Estado para retomada
Atualizado em 06/10/2026.

## Funciona
Hermes instalado; versão, ajuda e integridade dos componentes básicos verificadas. Terminal e interface web compilados. Desktop e gateway não instalados. Qwen3.5-2B Q4_K_M baixado e SHA256 verificado.

## Configuração
Estrutura local: <JARVIS_ROOT>/hermes-agent (upstream), runtime (dados), models (modelo), project (este repositório), workspace (tarefas).
Endpoint previsto: http://127.0.0.1:8081/v1; alias jarvis-local; contexto 64000, cache K/V q8_0; máximo 10 turnos e 180 segundos por execução. Curator pausado.

## Validação atual
Microsoft Visual C++ atualizado para 14.51.36247.0; instalador retornou 3010 (reinicialização recomendada), mas o motor CUDA b11370 passou em --version e iniciou sem reiniciar. Resposta direta em português recebida. Hermes exige contexto mínimo 64000 nesta versão; servidor ajustado e carregado com cerca de 3381 MiB de VRAM total em uso. Teste de ferramenta aprovado: Hermes criou teste-jarvis.txt com o conteúdo solicitado; arquivo conferido diretamente. A resposta curta apresentou imprecisão factual; qualidade ainda precisa ser avaliada.

## Próxima ação
Validar o lançador completo e iniciar um pequeno projeto de teste; avaliar latência e qualidade antes de ampliar ferramentas. Validar scripts/Iniciar-Jarvis.ps1 antes de apresentar como pronto. Não repetir download do modelo.

## GitHub
Repositório: https://github.com/razielbaltazar/Jarvis
Documentação pública sem credenciais, arquivos pessoais ou diagnóstico detalhado. Estrutura inicial publicada e sincronizada com a cópia local. Este arquivo registra a próxima ação para continuidade.

O Jarvis ainda não está operacional. Ultron é visão futura, sem pendências atuais.
