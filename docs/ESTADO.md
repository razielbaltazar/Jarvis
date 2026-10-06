# Estado para retomada
Atualizado em 06/10/2026.

## Uso e continuidade
Retomada autorizada. Nova barreira: 80% RESTANTES ou menos (20% consumidos), após o usuário retirar e redefinir a barreira nesta etapa. Última consulta: 83% restantes. Consultar entre marcos e preservar economia.

## Funciona
Hermes v0.21.5 instalado pelo PM, upstream 85db7c3a6886762773827598793b0b51ef4e3325 preservado. Qwen3.5-2B Q4_K_M baixado e hash verificado. Motor CUDA b11370, modelo local e ferramentas de arquivo/terminal testados. Aplicativo desktop compilado e aberto. Perfil default tem nome exibido Jarvis; identidade configurada por SOUL.md. Não há API paga obrigatória.

## Testes confirmados
- Conversa direta em português; uma resposta teve imprecisão factual, então qualidade precisa de revisão.
- Hermes criou arquivo e site HTML, e editou somente o h1 solicitado; comparação completa aprovou a edição.
- Botão de tema passou em teste JavaScript com DOM simulado; não houve inspeção visual em navegador.
- Projeto demonstracao tem AGENTS.md e ESTADO.md; leitura pela ferramenta identificou o objetivo correto.
- Terminal calculou SHA256 que coincidiu com Get-FileHash.
- Backend desktop ficou pronto após aproximadamente 44s e respondeu API/status.
- Pelo canal WebSocket autenticado usado pelo desktop, Jarvis respondeu identidade correta e voz/agenda ausentes. Depois criou recado.txt com Operacao desktop validada; conteúdo conferido diretamente.
- Cliques/interação visual do usuário na janela não foram automatizados. Evidência da janela veio do screenshot do usuário.

## Configuração funcional
Pastas irmãs em <JARVIS_ROOT>: hermes-agent, runtime, models, project, workspace, logs.
Endpoint 127.0.0.1:8081/v1; alias jarvis-local; contexto REAL 64000, cache K/V q8_0; max_turns 10, run_budget_seconds 180. agent.execution_guidance=true; agent.tool_use_enforcement=false; platform_toolsets.cli=[file, terminal]. Curator e métricas compartilhadas pausado/desativadas respectivamente.
config/SOUL.md aplicado em runtime/SOUL.md; cópia de recuperação preservada. Script Aplicar-Configuracao.ps1 reproduz essas opções pelo CLI oficial (sintaxe verificada; aplicação completa do script ainda não executada).

## Problemas resolvidos e limites
Visual C++ atualizado para 14.51.36247.0 corrigiu 0xc0000005; instalador recomendou reinicialização, mas motor funcionou sem ela.
O processo antigo na porta 8081 servia 16384 tokens apesar da configuração Hermes 64000. Foi substituído; /props confirmou 64000. Iniciador agora verifica contexto real antes de reutilizar servidor.
WebSocket exige credencial local do registro de rendezvous; teste sem ela falhou. Credencial nunca publicada nem impressa.
Forçar tool_use_enforcement=true levou a ferramentas/pesquisas desnecessárias para pergunta simples. false e conjunto essencial corrigiram o teste.
Memória nativa é compartilhada pelo perfil; arquivos por projeto são organização, não sandbox. Voz, agenda e Alexa não instaladas/conectadas. Marca visual/executável ainda Hermes; identidade e perfil são Jarvis.

## Operação
scripts/Iniciar-Jarvis.ps1 -Desktop abre a janela e mantém o servidor criado por ele até fechar o app. Preserva servidor externo existente. Sem Desktop, modo CLI. QueryFile executa pedido único; Workspace escolhe projeto; Toolsets aceita lista.
scripts/Novo-Projeto.ps1 cria pasta em workspace/projetos e registros sem sobrescrever projeto existente. Atalho local Jarvis.lnk foi criado em outputs e lançado; logs confirmaram relaunch da instância existente sem duplicação. Ver docs/USO.md.

## Próxima ação
Interface própria implementada em desktop/, preservando upstream. Orbe CSS azul, estados reais, conversa abaixo, painéis Sistema/Atividade, recursos sob demanda e interrupção via RPC. Ponte Electron isolada e autenticada; teste integrado criou verificacao-hud.txt e conferiu conteúdo, painéis e ausência de Node/credencial no renderer. Credencial usa helper oficial Windows para caminho/ACL privados. Erro da versão antiga corrigido e janela normal reaberta; usuário enviou screenshot antigo com a falha. Retomada automática da última sessão por pasta/default validada após reabrir: retomada.json confirmou restored=true. Usa session_key/resumed para persistência, evitando confundir runtime id. Atalho existente passa a abrir HUD via -Desktop; -HermesDesktop preserva recuperação.

Marco de interface e retomada concluído. Próxima ação: confirmar operação cotidiana e ampliar capacidades em etapas, priorizando voz e organização de tarefas. Voz e agenda seguem ausentes. Sem autoedição ou Ultron nesta fase. Menus não simulam integrações.
Fase 3 básica concluída. Próxima ação visual: implementar prévia da orbe, depois integrar ao desktop sem descartar interface funcional. Usuário comprovou por screenshot que já enviou cinco referências e dois vídeos antes de interromper uma execução. Direção recuperada em docs/INTERFACE.md: tela minimalista escura, orbe central animada/interativa, detalhes opcionais. Não tratar referências como ausentes. Originais reenviados e preservados em work/referencias-Jarvis da conversa: oito imagens e Download.mp4. Imagens vistas; vídeo ainda não analisado. Nenhum arquivo de referência enviado ao GitHub. Base atual pode ser usada. Próximo teste útil: tarefa real do usuário, evitando repetir testes já aprovados. Depois priorizar memória, agenda ou voz sem ampliar tudo simultaneamente.

## GitHub
https://github.com/razielbaltazar/Jarvis é público. Não enviar runtime, modelos, credenciais, logs ou dados pessoais. Sincronizar mudanças de scripts/documentação deste marco; commits locais anteriores foram preservados em branches de recuperação.

## Ultron
Visão futura, sem tarefas atuais.
