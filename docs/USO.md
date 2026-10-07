# Usar o Jarvis

Abra o atalho Jarvis ou execute scripts/Iniciar-Jarvis.ps1 -Desktop. Aguarde a conexão ficar pronta. Digite no campo inferior e pressione Enter. Clique em Conversa ou na orbe para abrir o histórico. Interromper solicita cancelamento; Reconectar aparece quando a conexão falha.

O aplicativo usa Hermes com Qwen3.5-2B Q4_K_M local. Não exige API paga. A última conversa da mesma pasta é retomada ao reabrir. O modelo pequeno pode errar fatos ou confirmar ações que não executou; resultados importantes precisam de conferência.

## Voz e tarefas
Microfone: clique para iniciar a captura; a transcrição fica no campo para revisão e envio manual. Ouvir resposta gera voz local. A opção de ler automaticamente vem desligada. Geração e transcrição de arquivo passaram nos testes; microfone físico ainda precisa ser conferido com o usuário.

Tarefas abre o painel para salvar notas, tarefas e lembretes, concluir/arquivar e reabrir. Registros ficam em .jarvis/tasks.json dentro da pasta de trabalho. Lembretes exigem o aplicativo aberto e notificações autorizadas no painel. Pedidos de anotação por conversa ainda estão em validação; prefira o painel por enquanto.

Agenda Google/Apple ainda não conectada. Nenhum módulo de WhatsApp ou rede social autorizado para agir como usuário.

## Pastas e recuperação
scripts/Novo-Projeto.ps1 cria workspace/projetos/<nome>, com orientação e registro, sem sobrescrever projeto existente. Use -Workspace '<caminho>' no iniciador para trabalhar nela. Sem -Desktop, abre CLI; -QueryFile executa um pedido de arquivo de texto. Os toolsets CLI padrão são file, terminal, jarvis_local.

-HermesDesktop conserva a interface original como alternativa. A versão Jarvis usa Electron já instalado; empacotamento independente fica para depois. Fechar o aplicativo encerra o motor que o próprio iniciador criou, preservando servidores externos.

Aplicar-Configuracao.ps1 reproduz modelo e ferramentas; Configurar-Voz.ps1 configura voz; Instalar-Extensoes.ps1 instala a extensão de registros pelo mecanismo nativo. Não reinstale a cada abertura. Leia docs/ESTADO.md antes de continuar desenvolvimento. Barreira atual do assistente de desenvolvimento: 30% restantes; isso não limita o modelo local.