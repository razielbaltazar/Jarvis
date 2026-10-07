# Revisão do marco atual — 07/10/2026
Revisão baseada no código e nas evidências já produzidas; nenhum novo ciclo de execução ou correção foi realizado como parte desta revisão. Sem agentes extras: a margem de uso é pequena e a análise pode aproveitar os testes existentes.

## Resultado
Núcleo utilizável por texto, Gemini, ferramentas de arquivos, notas e fila. Não é o Jarvis completo do plano: agenda ainda não autenticada; voz física e interrupção pela fala não validadas; integrações adicionais, memória documental, automações complexas e multimídia ainda não concluídas. Etapa 5 é ampla, não prova de conclusão de todas as capacidades imaginadas.

## Funcionamento
Prioridade alta: validar o ciclo de voz com microfone/fones; hoje é por turnos, captura pausada na fala. Testar aprovação e cancelamento reais, inclusive ferramenta em execução; cancelar não desfaz efeitos anteriores. Retomada e reconexão passaram em sessão isolada; não presumir cobertura de toda falha de rede ou desligamento abrupto.
Google Calendar depende de cliente OAuth e consentimento próprios. Adaptador Calendar-only preparado e --check confirmou ausência de token. Não confundir a conexão do Codex ou a chave Gemini com uma conta vinculada ao Jarvis.

## Interface e experiência
Manter orbe, informação sob demanda e HUD minimalista. Critérios do usuário: sofisticação, versatilidade, praticidade, eficiência, estabilidade e visual agradável. Fazer adaptação quando entrar a etapa visual, com referências reais se necessário, sem implementar propostas durante esta revisão.
Amostra compacta 720x600 passou; ampliar cobertura para 1280x720/1920x1080 e escalas 100/125/150%. Conferir aprovação, fila longa e resultados extensos juntos. Refinar estados separados de voz/agente/entrada, mutar versus encerrar, indicação de fila pausada e estado de cancelamento. Código/arquivos precisam de copiar/abrir e resultados mais ricos; links não devem executar ações arbitrárias. Contraste, teclado e nomes acessíveis precisam de auditoria completa, não apenas impressão visual.

## Dados e segurança
Proteção entre gravações concorrentes e JSON inválido testada. Uma queda no meio da gravação pode deixar tasks.lock e exigir recuperação manual; não apagar o bloqueio de um processo vivo. Definir backup/restauração dos dados do usuário antes de expansão da memória.
Chave API está fora do Git, mas foi enviada no chat; trocar essa chave é recomendável. Dados enviados ao Gemini deixam o computador: distinguir claramente uso local e online. Não ampliar escopos Google além da integração solicitada. Token, rascunhos e conversas ficam localmente; armazenamento local não equivale a criptografia de tudo.
Publicação de produtos, mensagens e exclusões importantes continuam sujeitas ao escopo autorizado; WhatsApp/redes sociais excluídos. Sem autoedição irrestrita.

## Desempenho e custo
Gemini reduz pressão no notebook, mas exige internet e tem cotas. Qwen preservado como alternativa; falta seletor simples de modelo e teste atualizado de retorno ao modo local. 8 GB RAM continuam limitando voz, contexto e tarefas simultâneas. Medir latência real antes de prometer fluidez. Não ligar múltiplos modelos/conselhos para suprir problemas de interface.

## Manutenção e produto
Preservar upstream e extensões pequenas. Expandir testes somente quando nova capacidade/erro justificar. Monitorar compatibilidade: documentação Google do upstream menciona --services, mas o código instalado não aceita a opção; adaptador restringe SCOPES a Calendar. Conferir novamente depois de atualizar Hermes.
Antes de distribuir comercialmente: empacotamento, instalação/atualização, privacidade e licenças (incluindo Piper GPLv3) precisam revisão. Ultron segue fora da V1.

## Sequência proposta
1. Autenticar Calendar e validar leitura; alterações reais apenas quando solicitadas.
2. Validar voz física quando o usuário puder; aprovação/cancelamento com tarefas reais.
3. Adaptar interface aos resultados e controles que existem, com auditoria de tamanhos/escala.
4. Expandir memória de arquivos e integrações conforme uso, sem prometer completude antecipada.
Esta lista é análise e direcionamento, não autorização para aplicar automaticamente todas as melhorias.

Atualização de estado após revisão: usuário manteve 2SV desativada; OAuth não concluído. Importação local de 2 eventos e painel Agenda implementados na continuidade da integração, com testes separados da revisão. Melhorias futuras: sincronização, edição autorizada e suporte a recorrências; não declarar a cópia local equivalente a conexão Google completa.
