# Usar o Jarvis

Abra o atalho Jarvis ou execute scripts/Iniciar-Jarvis.ps1 -Desktop. Aguarde a conexão ficar pronta. Digite no campo inferior e pressione Enter. Clique em Conversa ou na orbe para abrir o histórico. Interromper solicita cancelamento; Reconectar aparece quando a conexão falha.

O aplicativo usa Hermes com Qwen3.5-2B Q4_K_M local. Não exige API paga. A última conversa da mesma pasta é retomada ao reabrir. O modelo pequeno pode errar fatos ou confirmar ações que não executou; resultados importantes precisam de conferência.

## Voz e tarefas
Clique uma vez em ◉ ou escreva "ative o modo voz" / "quero conversar por voz". Fale e faça uma pausa: a transcrição é enviada automaticamente, o Jarvis responde em voz alta e volta a ouvir ao terminar. Clique em ■ para encerrar, inclusive durante transcrição/processamento. O microfone fica pausado durante a resposta para evitar eco. O modo vem desligado ao abrir. Erros e silêncio prolongado encerram o modo, evitando ciclos sem fim. O processamento é local e pode levar alguns segundos; ainda não há interrupção automática da resposta pela sua fala.

O ciclo passou em teste de interface com áudio/microfone simulados; síntese e transcrição locais reais foram validadas separadamente. Dispositivo de entrada AMD disponível. Conversa completa com a voz real do usuário ainda precisa de uso prático.

Tarefas abre o painel para salvar notas, tarefas e lembretes, concluir/arquivar e reabrir. Registros ficam em .jarvis/tasks.json dentro da pasta de trabalho. Lembretes exigem o aplicativo aberto e notificações autorizadas no painel. Pedidos de anotação por conversa ainda estão em validação; prefira o painel por enquanto.

Agenda Google/Apple ainda não conectada. Nenhum módulo de WhatsApp ou rede social autorizado para agir como usuário.

## Pastas e recuperação
scripts/Novo-Projeto.ps1 cria workspace/projetos/<nome>, com orientação e registro, sem sobrescrever projeto existente. Use -Workspace '<caminho>' no iniciador para trabalhar nela. Sem -Desktop, abre CLI; -QueryFile executa um pedido de arquivo de texto. Os toolsets CLI padrão são file, terminal, jarvis_local.

-HermesDesktop conserva a interface original como alternativa. A versão Jarvis usa Electron já instalado; empacotamento independente fica para depois. Fechar o aplicativo encerra o motor que o próprio iniciador criou, preservando servidores externos.

Aplicar-Configuracao.ps1 reproduz modelo e ferramentas; Configurar-Voz.ps1 configura voz; Instalar-Extensoes.ps1 instala a extensão de registros pelo mecanismo nativo. Não reinstale a cada abertura. Leia docs/ESTADO.md antes de continuar desenvolvimento. Barreira atual do assistente de desenvolvimento: 25% restantes; isso não limita o modelo local.

## Atalho e ícone
Instalar-Atalho.ps1 cria o atalho Jarvis na área de trabalho. Ele chama Abrir-Jarvis.vbs para iniciar o PowerShell oculto e o aplicativo, sem abrir um terminal. Ícone próprio azul com J, independente do Hermes. Aberturas simultâneas são protegidas por mutex e o aplicativo reaproveita a janela existente. Falha do iniciador aparece como aviso e fica em logs/inicio-erro.log.
