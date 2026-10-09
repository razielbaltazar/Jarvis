# Instruções de trabalho

- Objetivo: Jarvis pessoal e comercial, núcleo sem serviços pagos obrigatórios. Base Hermes; manter upstream separado e preferir extensões.
- Integrações exigem acesso real e sincronização com o serviço. Cópias importadas não contam como integração concluída. Respeitar a recusa de ativar 2SV; não contornar autenticação.
- Primeiro leia docs/ESTADO.md. Leia outros arquivos só quando necessário. Reutilize fatos já confirmados; reverifique apenas estado mutável relevante.
- Use pesquisas específicas, git diff e trechos de arquivos em vez de reler repositórios inteiros. Agrupe consultas independentes e limite saídas. Não repita verificações aprovadas sem mudança ou motivo concreto.
- Prefira ferramentas diretas/APIs/CLI quando disponíveis; use interface gráfica quando necessário. Plugins são usados conforme a tarefa, não todos carregados sem necessidade.
- Preserve instruções estáveis e curtas. Não prometa controle de prompt caching: é gerenciado pela plataforma e não remove limites de uso.
- Código e scripts para operações repetíveis; comunicação curta sobre resultado, bloqueios e próxima etapa. Sem automatizar ações externas não autorizadas.
- Continuar autonomamente as etapas do plano já autorizado, sem pedir aprovação entre etapas. Instalações, correções, testes e sincronização deste repositório estão autorizados.
- Barreira de uso: pausar em 55% RESTANTES, ponto médio do intervalo de 50–60% autorizado em 09/10/2026. Evitar comandos desnecessários e priorizar GitHub conectado para operações remotas. Consultar entre marcos; não gastar para atingir a barreira.
- Aprovação antes de publicar produtos, enviar mensagens, excluir dados ou alterar significativamente áreas fora do projeto. Não expor credenciais ou documentos pessoais.
- Nunca versionar runtime, modelos, logs, .env, chaves ou cópias do computador. Revisar a lista de arquivos antes de enviar ao GitHub.
- Ao terminar ou interromper: atualizar docs/ESTADO.md (funciona, pendências, próxima ação), registrar apenas decisões importantes em docs/PLANO.md e salvar um commit de etapa concreta.
- Instalações Hermes usam seu PM; não modificar suas dependências com pip avulso. Manter a possibilidade de recuperar a última configuração funcional.
- Antes de personalizar interface, front-end ou outros itens visuais, avisar o usuário e aguardar seus modelos de referência. Manter a interface original enquanto valida funcionamento.
- Sem conselho de agentes, voz ou autoedição antes de validar conversa e ferramentas locais. Ultron fica para depois.
