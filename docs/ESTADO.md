# Estado para retomada
Atualizado em 06/10/2026.

## Funciona
Hermes instalado; versão, ajuda e integridade dos componentes básicos verificadas. Terminal e interface web compilados. Desktop e gateway não instalados. Qwen3.5-2B Q4_K_M baixado e SHA256 verificado.

## Configuração
Estrutura local: <JARVIS_ROOT>/hermes-agent (upstream), runtime (dados), models (modelo), project (este repositório), workspace (tarefas).
Endpoint previsto: http://127.0.0.1:8081/v1; alias jarvis-local; contexto 64000, cache K/V q8_0; máximo 10 turnos e 180 segundos por execução. Curator pausado.

## Validação atual
Microsoft Visual C++ atualizado para 14.51.36247.0; instalador retornou 3010 (reinicialização recomendada), mas o motor CUDA b11370 passou em --version e iniciou sem reiniciar. Resposta direta em português recebida. Hermes exige contexto mínimo 64000 nesta versão; servidor ajustado e carregado com cerca de 3381 MiB de VRAM total em uso. Teste de ferramenta aprovado: Hermes criou teste-jarvis.txt com o conteúdo solicitado; arquivo conferido diretamente. A resposta curta apresentou imprecisão factual; qualidade ainda precisa ser avaliada.

## Uso e continuidade
Retomada autorizada. Nova barreira: 65% restantes ou menos. Última consulta: 67% restantes.

## Marco validado
Iniciador passou desde o carregamento do motor até a criação de site-teste/index.html, encerrando seu servidor ao terminar. HTML UTF-8 pt-BR, CSS Grid adaptável e nenhuma URL externa. Alternância claro/escuro passou em teste JavaScript com DOM simulado; sem inspeção visual em navegador. Conteúdo da página é demonstração gerada, não plano oficial. Cerca de 10064 bytes. Modo interativo ainda não verificado.

## Identidade Jarvis
config/SOUL.md aplicado ao runtime pelo mecanismo nativo do Hermes, com cópia de recuperação local da identidade anterior. Teste inicial inventou agenda/voz; após declarar capacidades reais, nova resposta identificou Jarvis/Hermes e informou corretamente que voz e agenda não estão conectadas. Isso corrige este teste, sem garantir ausência de alucinações. Nenhuma alteração no upstream.

## Edição e projetos
Edição incremental aprovada: somente h1 mudou, comparado contra o arquivo inteiro anterior. Novo-Projeto.ps1 criou AGENTS.md e ESTADO.md por pasta. Memória padrão do Hermes é compartilhada pelo perfil; não equivale a isolamento. Iniciador recebe lista de ferramentas e normaliza vírgulas. Abertura/saída interativa testadas; conversa via terminal automatizado não concluída. Telemetria opcional desativada.

## Aplicativo desktop
Build desktop concluído: hermes-agent/apps/desktop/release/win-unpacked/Hermes.exe. Iniciador com -Desktop iniciou o aplicativo oficial e o servidor local; health retornou ok. Processo principal do app verificado. Interface não inspecionada e conversa pela janela ainda NÃO validada. Janela conserva marca Hermes; identidade conversacional é Jarvis. Iniciador aguarda o processo principal e encerra apenas seu próprio servidor quando o app fecha. O site anterior era uma tarefa de teste, não a interface do Jarvis.

## Evidência da janela
Imagem do usuário: app abriu e está em 86% da inicialização, aguardando o backend Hermes. Esse percentual é do app, não do limite. Logs confirmaram backend desktop pronto em 44 segundos e conexões WebSocket da interface aceitas; o screenshot capturou espera inicial. Modelo llama-server responde health ok. Conversa pela janela não validada.

## Validações após retomada
Backend desktop ficou pronto em aproximadamente 44 segundos; API status respondeu versão 0.21.5. Leitura de ESTADO.md por ferramenta e objetivo do projeto confirmados. Pedido inicial de cálculo não acionou terminal. Orientações nativas agent.execution_guidance e agent.tool_use_enforcement configuradas como true (alias jarvis-local não identifica a família do modelo no modo auto). Teste seguinte acionou terminal e SHA256 retornado coincidiu exatamente com Get-FileHash. Perfil default recebeu display_name Jarvis pelo CLI nativo; id permanece default. Esses testes não garantem seguimento perfeito de instruções.

## Próxima ação
Verificar a janela desktop e conversar nela usando jarvis-local. Não reconstruir o app sem necessidade. Depois testar ferramentas selecionadas por lista e leitura do contexto AGENTS.md do projeto. Atualizar marca da interface por extensão/patch documentado, preservando origem Hermes. Agenda e voz continuam ausentes.

## GitHub
Repositório: https://github.com/razielbaltazar/Jarvis
Documentação pública sem credenciais, arquivos pessoais ou diagnóstico detalhado. Estrutura inicial publicada e sincronizada com a cópia local. Este arquivo registra a próxima ação para continuidade.

Núcleo local básico operacional; Jarvis completo ainda em desenvolvimento. Ultron é visão futura, sem pendências atuais.
