# Validação Jarvis V1

Esta matriz separa evidência real, teste simulado e dependências externas. A versão 0.9 é candidata à V1; não vira 1.0 enquanto um cenário crítico estiver pendente.

| # | Cenário | Tipo | Estado |
|---|---|---|---|
| 1 | HUD inicia e conecta ao Hermes | real | aprovado |
| 2 | Modelo responde em português | real | aprovado |
| 3 | Criação de arquivo é conferida no disco | real, crítico | aprovado |
| 4 | Histórico retorna após reabrir | real, crítico | aprovado |
| 5 | Segredos e APIs Node não aparecem no renderer | real, crítico | aprovado |
| 6 | Fila serializa dois pedidos | simulado | aprovado |
| 7 | Falha preserva pedido sem reenvio automático | simulado, crítico | aprovado |
| 8 | Interrupção aguarda confirmação do agente | simulado, crítico | aprovado |
| 9 | Aprovação é renderizada como texto seguro | simulado, crítico | aprovado |
| 10 | Pedido de esclarecimento é respondido pelo HUD | simulado | aprovado |
| 11 | Tarefas persistem depois de reabrir | unitário, crítico | aprovado |
| 12 | Escritas concorrentes preservam registros | unitário, crítico | aprovado |
| 13 | Arquivo inválido é preservado para recuperação | unitário, crítico | aprovado |
| 14 | Lembretes respeitam data e conclusão | unitário | aprovado |
| 15 | Agenda desconectada não usa cópia local | real, crítico | aprovado |
| 16 | Recursos distinguem validado, disponível e dependente | unitário | aprovado |
| 17 | Recurso de painel incompatível recebe erro explícito | integração | aprovado |
| 18 | Interface 720×600 não cobre o campo de envio | visual | aprovado |
| 19 | Troca de modelo preserva a conversa | real | aprovado em 08/10; reconfirmar antes da 1.0 |
| 20 | Cancelamento durante ferramenta ativa não duplica efeitos | real, crítico | pendente |

Resultado atual: 19 de 20 cenários com evidência, sendo um deles aprovado em rodada anterior. A condição comercial exige repetir a matriz em outra máquina e concluir o cenário 20.

Fora desta matriz por decisão ou dependência externa: conversa física por voz; OAuth do Google Calendar; piloto com usuários; instalação limpa em outro Windows.
