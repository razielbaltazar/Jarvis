# Estado para retomada
Atualizado em 07/10/2026.

## Uso
Barreira atual: 70% restantes (30% consumidos). Janela de uso foi renovada durante esta etapa; última leitura inicial renovada: 99% restantes. Prioridade: abertura confiável, voz contínua e ícone, depois notas por conversa. WhatsApp e redes sociais continuam excluídos da autorização para agir como usuário.

## Base funcional
Hermes v0.21.5, upstream separado e preservado. Qwen3.5-2B Q4_K_M local, CUDA b11370, endpoint 127.0.0.1:8081/v1, contexto real 64000, cache K/V q8_0. max_turns=10, run_budget_seconds=180. Sem API paga obrigatória. Dell G15: 8 GB RAM, RTX 3050 4 GB.
HUD Electron minimalista, orbe, conversa, painéis opcionais. Recuperação de conversa usa stored_session_id/session_key, não ID transitório. Marco anterior validou reabertura e arquivo pelo desktop. Iniciar-Jarvis.ps1 -Desktop abre HUD; -HermesDesktop conserva alternativa original.

## Implementado nesta etapa
Voz local pelo PM oficial: extras stt-whisper, piper e voice. Piper pt_BR-faber-medium em CPU; Whisper base CPU int8, português. Botão de microfone exige clique; transcrição preenche campo sem enviar automaticamente. Leitura de respostas opcional e desativada por padrão. Não houve teste do microfone físico nem audição pelo usuário.
Tarefas, notas e lembretes no painel, por workspace, em .jarvis/tasks.json. Validação, gravação atômica, concluir/reabrir sem excluir. Lembretes exigem app aberto; notificações opt-in. Nenhuma notificação real foi disparada no teste.
Pedidos nativos de aprovação/clarificação apresentados no HUD, sem aprovação automática. Teste de renderer passou; rodada de aprovação real do backend ainda não validada.
Extensão plugins/jarvis-records instalada e habilitada pelo CLI oficial. Ferramenta jarvis_records reutiliza validador do painel por ponte JSON; sem editar upstream.

## Evidência e pendência importante
Voz: geração/transcrição direta e ponte Electron autenticada passaram, microfone não utilizado. Arquivos em cha/outputs/Jarvis/voz da conversa.
Renderer real Electron: microfone desligado ao abrir, revisão antes do envio, erro de áudio antigo não altera nova tarefa, texto de aprovação escapado e cancelamento passaram.
Task-store: três testes passaram (persistência, JSON inválido preservado, lembretes).
Teste diário: salvar/concluir pelo painel passou; salvar nota por linguagem natural FALHOU em duas tentativas. Modelo confirmou sem gravar corretamente. Extensão foi adicionada entre tentativas, mas a segunda também não salvou. Não declarar notas por conversa operacionais.
Chat simples confirmou resposta em português e liberação do formulário no teste real Electron; conteúdo também conferido na sessão de teste. A segunda mensagem que pediu guardar uma palavra acionou ferramentas e não concluiu a validação; teste de duas mensagens/retomada deste marco não aprovado. Próxima ação: investigar registro/disponibilidade/assinatura da jarvis_records e testar chamada direta antes de mais uma rodada de modelo. Inspecionar apenas sessão de teste e logs curtos. Workspace da segunda tentativa: workspace/projetos/verificacao-diaria-20261007b. Não repetir instalações nem testes já aprovados.

## Reprodução e limites
Configurar-Voz.ps1 e verificar_voz.py reproduzem configuração/teste. Instalar-Extensoes.ps1 instala plugin e habilita toolset jarvis_local. Perfis CLI devem incluir file, terminal, jarvis_local.
Janela normal reiniciada em 07/10 para carregar extensão/SOUL. Iniciador proprietário PID 13984. Diagnóstico privado logs/jarvis-connection-<pid>.json confirma conexão inicial; conferir também que processo e motor continuam vivos. Não matar servidor compartilhado antes de fechar o iniciador proprietário. Microfone permanece desligado por padrão.
Agenda Google/Apple ainda não conectada. Sem conselho de agentes, autoedição ou Ultron; Ultron é visão futura.
Piper é GPLv3 (OHF-Voice/piper1-gpl/COPYING); MODEL_CARD da voz pt_BR-faber-medium declara dataset CC0. Rever distribuição/licenças na etapa comercial, sem presumir licença de dataset como licença de tudo.

## Continuidade
Repositório https://github.com/razielbaltazar/Jarvis público. Nunca publicar runtime, modelos, credenciais, logs, referências ou dados pessoais. Salvar código/documentação desta etapa; sincronização remota deve ser verificada separadamente.

## Marco posterior: voz contínua e abertura
Modo voz por botão único ou pedido textual "ative o modo voz". Captura nativa por VAD, pausa 1,5s, auto-envio, TTS local e rearmamento após áudio terminar. Encerramento disponível durante processamento/transcrição. Microfone desligado na abertura; sem barge-in automático. Teste Chromium passou: dez verificações em cha/outputs/Jarvis/voz-continua/renderer-resultado.json. Dispositivo AMD enumerado; não gravamos áudio pessoal no teste. Uso com voz real permanece a validar.
Abrir-Jarvis.vbs inicia oculto; Instalar-Atalho.ps1 cria atalho com ícone J próprio na área de trabalho e outputs. BrowserWindow tem ícone próprio e apresentação explícita; AppUserModelId Jarvis.Desktop. Iniciador protege aberturas concorrentes e registra falhas. Abrir novamente manteve PID 1300 e modelo healthy; conexão inicial conferida em logs/jarvis-connection-1300.json.
Correção adicional: consulta tardia da disponibilidade de voz não deve substituir PROCESSANDO por PRONTO no meio de uma resposta. Isso podia encerrar testes anteriores prematuramente. Próxima etapa iniciada: repetir apenas teste diário por conversa no workspace verificacao-diaria-20261007c; não repetir instalação ou testes de voz aprovados.


## Auditoria e estabilização posterior
PDF de 12 páginas entregue ao usuário em 07/10, com capturas controladas sem dados reais, diagnóstico, prioridades, fontes oficiais e prompt para outra IA. Não publicar PDF/capturas pessoais sem pedido específico. Arquivo da conversa: cha/outputs/Jarvis/output/pdf/Jarvis-Analise-Interface-e-Prompt.pdf.
A falha de reconexão foi identificada: Hermes já tinha backend regular vivo, mas a busca consultava apenas host-desktop-serve. main.cjs agora testa ambos os registros oficiais host-serve e host-desktop-serve, com autenticação apenas no processo principal. Teste diário passou da conexão, sem encerrar o backend compartilhado. Notas ainda não aprovadas: modelo salvou o texto como task em vez de note e editou JSON diretamente; o registro anterior foi preservado. Próxima ação: conferir disponibilidade da ferramenta jarvis_records no agente e impedir confirmação sem tipo/gravação correta. Sem mais rodadas repetidas até esse diagnóstico.
## Marco atual: Gemini, entrada livre e notas
Modelo padrão Gemini 3.1 Flash-Lite. Chave somente runtime/.env, backup da configuração local em runtime/config.before-gemini.yaml. Teste API e teste real Electron -> Hermes -> Gemini passaram, com resposta conferida em cha/outputs/Jarvis/gemini/gemini-resultado.json. Qwen preservado; iniciar com Gemini dispensa carregar o servidor local. Não ativar faturamento.
Caixa de texto permanece habilitada durante execução, áudio, aprovações e desconexão. Enter durante tarefa enfileira; fila permite Enviar agora, Editar e Remover. Enviar agora/Ctrl+Enter solicita interrupção e aguarda message.complete antes de enviar. Rascunhos/fila guardados localmente; fila recuperada após reinício exige envio explícito. Falhas pausam a fila; não reenviar automaticamente pedidos de confirmação incerta. Esc solicita interrupção/recusa aprovação e para áudio/captura. Aviso após 60 segundos sem eventos; não confundir solicitação de parada com confirmação.
Teste renderer isolado passou em 15 verificações: voz, entrada durante tarefa, serialização da fila, aguardar cancelamento, editar e preservar fila na desconexão. Evidência cha/outputs/Jarvis/fila/renderer-resultado.json. Teste anterior sem isolamento encontrou rascunho persistido de rodada antiga; corrigido o isolamento do teste.
Falha de notas diagnosticada: handler retornava dict comum, mas Hermes exige string JSON. Corrigido plugin e cópia runtime, sem alterar upstream. Backend reiniciado após fechamento normal do app para carregar extensão. Teste real Gemini validou criação de nota como note, resultado success/saved, confirmação do agente e preservação da tarefa existente: cha/outputs/Jarvis/notas-corrigidas/tarefas-resultado.json. Sessão isolada 20261007_152326_074274. Um teste anterior verificava só o arquivo e podia aprovar apesar de erro do agente; agora exige também confirmação sem erro. Não generalizar para todos os cenários.
Estudo externo incorporado como referência, não comandos: prioridade confiabilidade, texto/fila, layout adaptativo, voz com interrupção, acabamento visual. Busto de luz opcional futuro. Barge-in e microfone físico ainda não validados; sem alegar voz equivalente a sistemas Live.
Próxima etapa: layout compacto/gavetas e legibilidade, validar abrir/fechar/retomar repetidamente e voz física com usuário; integrações de agenda posteriormente. Barreira atual 70% restantes.

Layout posterior: painel único por vez, tipografia de conversa 15px, controles maiores, camadas separadas e gaveta compacta. Teste Chromium 720x600 confirmou painel sem sobrepor entrada mesmo com fila; 16 verificações passaram. Não substitui validação em todas as escalas de tela. Código carregado na próxima abertura do app.
