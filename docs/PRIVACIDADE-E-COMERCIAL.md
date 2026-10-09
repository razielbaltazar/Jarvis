# Privacidade e preparação comercial

## Dados

- Conversas, sessões, tarefas e credenciais pertencem ao usuário.
- Credenciais, arquivos pessoais, logs e diagnósticos privados não entram no Git.
- O modo Gemini envia o conteúdo necessário ao provedor. O modo local mantém inferência no computador, mas ferramentas de internet ainda podem transmitir consultas.
- O produto deve mostrar o provedor ativo e o estado real de cada conexão.
- Diagnósticos destinados ao suporte devem excluir conteúdo de conversas, caminhos pessoais e tokens.

## Distribuição

- Hermes Agent usa licença MIT; preservar seus avisos.
- Qwen3.5 usa Apache 2.0 conforme o artefato instalado.
- Piper e cada voz/modelo precisam de revisão separada antes de redistribuição comercial.
- Nenhuma alegação de privacidade, funcionamento offline ou compatibilidade deve exceder os testes realizados.

## Entrada no mercado

1. Concluir a V1 neste computador.
2. Testar instalação, atualização e reversão em outro Windows.
3. Fazer piloto acompanhado com três usuários e tarefas reais.
4. Medir conclusão, tempo economizado, custo de modelo e necessidade de suporte.
5. Definir preço e termos somente depois dessas medições.

O formato inicial recomendado é aplicativo local com modelo ou provedor configurado pelo cliente. Isso evita assumir consumo ilimitado e permite oferecer operação local quando o hardware comportar.
