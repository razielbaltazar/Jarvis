# Estado para retomada
Atualizado em 07/10/2026. Etapa 5 do plano: memória, voz e integrações; núcleo e HUD funcionais, consolidação da primeira versão utilizável.

## Limite e escopo
Pausar em 50% restantes (50% consumidos), conforme autorização atual. Consultar entre marcos, sem gastar para atingir a barreira. WhatsApp e redes sociais excluídos da autorização para agir como usuário. Código/documentação podem ser sincronizados no GitHub; nunca publicar runtime, credenciais, logs ou dados pessoais.

## Funciona e foi verificado
- Hermes v0.21.5 separado, sem alterações upstream; Electron com HUD, ícone Jarvis e iniciador oculto. Atalho verificado em C:/Users/razie/Desktop/Jarvis.lnk. Duas aberturas pelo atalho mantiveram um processo normal.
- Gemini 3.1 Flash-Lite como padrão, API e conversa real Electron -> Hermes -> Gemini aprovadas. Chave só em runtime/.env. Sem ativação de faturamento. Iniciar com Gemini dispensa carregar o servidor local.
- Qwen3.5-2B Q4_K_M preservado, llama.cpp CUDA b11370, contexto 64000 e cache q8_0. Backup da configuração local: runtime/config.before-gemini.yaml. Dell G15: 8 GB RAM, RTX 3050 4 GB.
- Criação real de arquivo pelo Gemini via write_file, conteúdo conferido e confirmação do agente. Teste isolado em workspace/projetos/verificacao-arquivo-gemini-20261007; evidência cha/outputs/Jarvis/arquivo-gemini/resultado.json.
- Cinco aberturas do Electron com duas respostas preservadas. Fila real serializou dois pedidos. Rodada adicional confirmou reconexão com socket já aberto sem apagar histórico nem alterar o modelo mostrado. IDs persistidos: stored_session_id, session_key/resumed; não usar apenas ID transitório. Evidência cha/outputs/Jarvis/retomada-atual/reabertura-*.json.
- Entrada habilitada durante tarefas, voz e desconexão. Enter enfileira; Enviar agora/Ctrl+Enter solicita interrupção e aguarda message.complete. Editar/Remover disponíveis. Fila e rascunho persistidos localmente; erros/reinício exigem revisão explícita antes do reenvio. Esc para áudio/captura e solicita interrupção/recusa aprovação. Aviso após 60 segundos sem eventos.
- Painel único, fonte de conversa 15px, controles maiores, gaveta compacta e espaço para entrada/fila. Teste 720x600 não sobrepôs painel e entrada. Dezesseis verificações renderer passaram; não substitui todas as escalas/tamanhos.
- Notas/tarefas/lembretes no painel e ferramenta jarvis_records. Handler deve retornar STRING JSON: dict comum era rejeitado, apesar da gravação. Corrigido no plugin e runtime; Gemini confirmou nota como note e preservou tarefa existente. Evidência cha/outputs/Jarvis/notas-corrigidas/tarefas-resultado.json, sessão 20261007_152326_074274.
- Escritas de registros agora usam exclusão mútua entre processos e gravação atômica. Cinco testes passaram, incluindo quatro processos concorrentes preservando 80 registros. Colisão retorna erro explícito, sem sobrescrever. JSON inválido preservado.

## Voz e limites reais
Whisper base CPU int8 pt e Piper pt_BR-faber-medium; instalação via PM oficial. Modo voz por botão único ou pedido “ative o modo voz”: VAD, pausa 1,5s, auto-envio, TTS e nova escuta. Microfone desligado na abertura; captura pausa durante fala. Testes de ponte, síntese/transcrição e ciclo com áudio simulado passaram. Usuário não consegue testar microfone agora; uso físico permanece PENDENTE. Barge-in, eco e latência física não validados. Lembretes exigem app aberto e notificações opt-in; nenhuma notificação pessoal disparada em testes.
Aprovações/clarificações nativas aparecem na tela. Teste de aprovação simulada passou; falta rodada real que solicite aprovação. Cancelamento solicitado não equivale a ação desfeita.

## Operação e continuidade
ESTADO.md é o resumo atual; PLANO.md guarda apenas decisões. Histórico Git e testes guardam marcos anteriores. scripts/Iniciar-Jarvis.ps1 -Desktop abre HUD; -HermesDesktop conserva alternativa original. Instalar-Atalho.ps1 recria atalho. Configurar-Voz.ps1 e verificar_voz.py reproduzem voz; Instalar-Extensoes.ps1 instala jarvis-records. CLI toolsets file, terminal, jarvis_local.
Não iniciar segundo instalador. Não matar backend compartilhado; main.cjs autentica registros host-serve e host-desktop-serve e encerra somente o backend que iniciou. Marker privado logs/jarvis-connection-<pid>.json confirma conexão, não atividade atual.
Se processo morrer durante gravação, pode restar .jarvis/tasks.lock: conferir PID do arquivo e ausência de gravador vivo antes de remover SOMENTE esse bloqueio. Não apagar tasks.json nem remover bloqueio automaticamente.
Piper GPLv3, dataset da voz declarado CC0; conferir distribuição na etapa comercial. PDF privado de 12 páginas com análise e prompt em cha/outputs/Jarvis/output/pdf/Jarvis-Analise-Interface-e-Prompt.pdf.

## Próxima ação
Validar voz física quando usuário puder. Depois integrar Google Calendar (antes de Apple) com autorização própria do Jarvis; conexão do Codex não é automaticamente transferida ao app. Refinar resultados de arquivos/código e testes de aprovação/cancelamento conforme tarefas reais. Busto de luz opcional futuro. Sem conselho de agentes, autoedição ou Ultron nesta etapa.

## Preparação Calendar e revisão posterior
Adaptador scripts/calendar_setup.py reutiliza setup Google do Hermes e restringe SCOPES a Calendar. --check retornou NOT_AUTHENTICATED; cliente e token ausentes. Nenhuma agenda acessada ou evento alterado. docs/GOOGLE-CALENDAR.md guarda continuação. docs/REVISAO.md avalia funcionamento, UX, segurança, desempenho e manutenção sem aplicar melhorias da revisão. User reforçou critérios visuais, para executar apenas na etapa apropriada.

## Bloqueio concreto Google Cloud
Navegador Chrome chegou à conta Google autenticada. Cloud bloqueou acesso por verificação em duas etapas desativada. Página de segurança aberta para o usuário ativar pessoalmente; regra da ferramenta exige hand-off para alteração de credencial/autenticação. Não contornar. Depois da ativação, atualizar Cloud e continuar configuração OAuth Calendar; usuário autorizou operar na sua conta. Nenhum projeto/cliente OAuth criado e nenhum evento alterado. Nova barreira 50% restantes.

## Alternativa sem mudar a segurança da conta
Usuário recusou ativar 2SV; respeitar essa decisão. Abas de segurança fechadas, nenhuma configuração de autenticação alterada. Exportação Google Calendar via navegador funcionou; ZIP pessoal permanece em Downloads, fora do Git. scripts/import_calendar.py importou 2 eventos, sem recorrência, para runtime/calendar/snapshot.json privado. Painel Agenda consulta apenas a cópia local, com data de importação e opção de mostrar anteriores. Não é sincronização automática nem integração de escrita. Sem enviar eventos ao Gemini. Recorrências/instâncias recorrentes são ignoradas com aviso explícito; desconhecimento de data/fuso também gera aviso. Parser e renderer passaram (17 verificações). Calendar bridge autenticada somente no processo principal. Dependências Google foram sincronizadas via PM oficial; pode restar pasta .previous-python em uso até encerrar processos antigos; não apagar à força. OAuth segue preparado como opção, bloqueado sem 2SV na conta Cloud.
