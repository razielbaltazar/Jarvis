# Instruções de trabalho

- Objetivo: Jarvis pessoal e comercial, núcleo sem serviços pagos obrigatórios. Base Hermes; manter upstream separado e preferir extensões.
- Primeiro leia docs/ESTADO.md. Leia outros arquivos só quando necessário. Reutilize fatos já confirmados; reverifique apenas estado mutável relevante.
- Use pesquisas específicas, git diff e trechos de arquivos em vez de reler repositórios inteiros. Agrupe consultas independentes e limite saídas. Não repita verificações aprovadas sem mudança ou motivo concreto.
- Prefira ferramentas diretas/APIs/CLI quando disponíveis; use interface gráfica quando necessário. Plugins são usados conforme a tarefa, não todos carregados sem necessidade.
- Preserve instruções estáveis e curtas. Não prometa controle de prompt caching: é gerenciado pela plataforma e não remove limites de uso.
- Código e scripts para operações repetíveis; comunicação curta sobre resultado, bloqueios e próxima etapa. Sem automatizar ações externas não autorizadas.
- Continuar autonomamente as etapas do plano já autorizado, sem pedir aprovação entre etapas. Instalações, correções, testes e sincronização deste repositório estão autorizados.
- Barreira de uso: consultar limites ao iniciar e entre marcos. Pausar quando o limite RESTANTE chegar a 65% ou menos (35% consumidos), salvar estado e aguardar confirmação. Medidor atual: usar janela de 5 horas como referência da barra indicada pelo usuário; janela semanal distinta. Não prometer interrupção exata durante chamada em andamento.
- Aprovação antes de publicar produtos, enviar mensagens, excluir dados ou alterar significativamente áreas fora do projeto. Não expor credenciais ou documentos pessoais.
- Nunca versionar runtime, modelos, logs, .env, chaves ou cópias do computador. Revisar a lista de arquivos antes de enviar ao GitHub.
- Ao terminar ou interromper: atualizar docs/ESTADO.md (funciona, pendências, próxima ação), registrar apenas decisões importantes em docs/PLANO.md e salvar um commit de etapa concreta.
- Instalações Hermes usam seu PM; não modificar suas dependências com pip avulso. Manter a possibilidade de recuperar a última configuração funcional.
- Sem conselho de agentes, voz ou autoedição antes de validar conversa e ferramentas locais. Ultron fica para depois.
