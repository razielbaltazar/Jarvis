# Instalação

## Estrutura
Definir <JARVIS_ROOT> como pasta local da instalação. Este repositório fica em project; upstream em hermes-agent; dados em runtime; modelos em models; tarefas em workspace.

## Base instalada
Fonte: https://github.com/NousResearch/hermes-agent
Commit: 85db7c3a6886762773827598793b0b51ef4e3325
Versão: v0.21.5+8076.g85db7c3; Python 3.14.7.
Instalador oficial scripts/install.ps1 com -HermesHome <JARVIS_ROOT>/runtime -InstallDir <JARVIS_ROOT>/hermes-agent -NonInteractive -SkipBrowser -SkipComputerUse.
HERMES_HOME deve apontar para runtime ao chamar o comando runtime/bin/hermes.exe. Novas dependências Hermes usam seu PM, sem pip avulso.

## Modelo
unsloth/Qwen3.5-2B-GGUF; licença Apache 2.0.
Revisão: f6d5376be1edb4d416d56da11e5397a961aca8ae
Arquivo: Qwen3.5-2B-Q4_K_M.gguf; 1.280.835.840 bytes.
SHA256: aaf42c8b7c3cab2bf3d69c355048d4a0ee9973d48f16c731c0520ee914699223
Configuração: provider custom, endpoint http://127.0.0.1:8081/v1, alias jarvis-local, contexto 64000 com cache K/V q8_0, máximo 10 turnos e 180 segundos. Curator pausado.

## Verificações
Versão, ajuda e pm doctor dos componentes básicos concluídos. Modelos, navegador e controle de tela não faziam parte da instalação inicial.
CUDA/Vulkan/CPU b11370 falharam em --version, 0xc0000005. Eventos indicam MSVCP140.dll 14.28.29914.0. Visual C++ oficial atualizado para 14.51.36247.0; motor CUDA passou em --version e carregou o modelo sem reiniciar.

## Retomada
Ler ESTADO.md. Não repetir downloads concluídos nem iniciar instalações simultâneas. Iniciar-Jarvis.ps1 validado por QueryFile em execução não interativa, com encerramento do servidor. Conversa direta e criação de arquivo/site via Hermes testadas. Modo interativo ainda não testado. Executar o script em project/scripts; QueryFile e Workspace opcionais. Não instalar modelos ou runtime dentro deste repositório.
