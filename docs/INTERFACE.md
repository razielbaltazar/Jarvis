# Direção visual Jarvis

Referências já enviadas pelo usuário; screenshot da conversa confirma cinco exemplos visuais e dois vídeos. Originais reenviados em 06/10/2026: oito imagens e Download.mp4. Cópias locais preservadas em work/referencias-Jarvis da conversa, fora do repositório público. Não pedir novamente como se nunca tivessem sido enviados. As oito imagens reenviadas foram vistas na conversa. Priorizar a orbe azul de filamentos/linhas fluidas das capturas, com a simplicidade do círculo central em jv 3; os HUDs carregados são referência secundária, para detalhes opcionais. Download.mp4 (cerca de 2,7 MB) ainda não foi reproduzido/analisado, pois atingimos a barreira de 50% restantes.

## Tela inicial
Direção refinada pelo usuário: HUD não intrusivo. Centro livre para orbe e alertas críticos; barra fina de estado no topo; sistema à esquerda e atividades reais à direita em painéis recolhidos. Conversa e cartões contextuais abaixo da orbe. Menus auxiliares podem recolher por inatividade; conversa em andamento permanece acessível. Estados de voz serão exibidos apenas depois da integração real.
Aplicativo desktop, fundo escuro, minimalista e bonito. Orbe central interativa, com rotação ou outro movimento sofisticado. Referências sugerem brilho azul/ciano, anéis e profundidade. Esses detalhes são interpretação das miniaturas, não exigência literal de copiar uma referência.

Não abrir com inúmeros painéis, métricas, textos técnicos ou um HUD carregado. Manter a possibilidade de expandir informações e controles sob demanda. A orbe deve ser o centro da experiência, com estados visuais associados ao estado real do assistente; não simular voz ativa quando ela ainda não existe.

## Implementação inicial proposta
Primeiro fazer a composição e a animação da orbe em uma prévia separada, sem substituir a interface funcional Hermes. Estados básicos: pronto, processando e resposta disponível. Texto e acesso à conversa discretos; detalhes recolhidos por padrão. Usar animação moderada e considerar redução de movimento, para preservar fluidez no notebook.

Depois integrar ao shell desktop, reutilizando o backend e o canal autenticado já validados. Preservar o código upstream e documentar o ponto de integração. Prévia visual separada é parte do desenvolvimento do app, não mudança do produto para um site.

## Continuidade
Implementação própria em desktop/: Electron com isolamento de contexto, sem Node no renderer, credencial somente no processo principal e ponte limitada a conexão, pedido, interrupção e recursos. Reutiliza o runtime Electron já instalado pelo Hermes; código upstream preservado. Iniciar-Jarvis.ps1 -Desktop passa a abrir Jarvis; -HermesDesktop mantém a interface original para recuperação. GPU é leitura real via nvidia-smi sob demanda; não há métricas fictícias.

Vídeo inspecionado por amostra aos 15 segundos (56 segundos totais, 576x1024): confirma núcleo azul luminoso e HUD periférico. Não houve reprodução integral. Referências privadas não incluídas no repositório.
Referências recebidas: não existe mais bloqueio por falta de direção visual. Não houve alteração visual no repositório antes da recuperação desta informação. Próxima ação: implementar a primeira prévia da orbe respeitando a barreira de uso vigente.
