# Estado para retomada
Atualizado em 07/10/2026.

## Uso
Barreira atual: 80% restantes (20% consumidos). Janela de uso foi renovada durante esta etapa; última leitura inicial renovada: 99% restantes. Prioridade: abertura confiável, voz contínua e ícone, depois notas por conversa. WhatsApp e redes sociais continuam excluídos da autorização para agir como usuário.

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
Gemini: suporte nativo confirmado no Hermes; chave recebida do usuário validou listagem de modelos e disponibilidade de gemini-3.1-flash-lite. Guardada somente em runtime/.env, excluída do Git. Nenhuma geração pela API nem alteração do modelo padrão foi feita. Aguarda informação do usuário sobre Free tier/sem faturamento para respeitar custo financeiro zero. Chave válida não demonstra o nível de cobrança. Por enquanto, modelo ativo continua jarvis-local. Política da faixa gratuita do Google informa uso de dados para melhoria dos produtos; considerar antes de enviar arquivos pessoais.
