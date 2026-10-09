# Recuperar o Jarvis arquivado

O desenvolvimento desta variante Hermes + HUD foi suspenso. Versão pública de referência: ec1ee34. A instalação nova OpenJarvis é independente.

## Reinstalação

1. Escolha uma pasta raiz e clone https://github.com/razielbaltazar/Jarvis.git na subpasta `project`.
2. Obtenha o Hermes oficial em https://github.com/NousResearch/hermes-agent. A instalação original usou o commit `85db7c3a6886762773827598793b0b51ef4e3325`; a compatibilidade com versões posteriores precisa ser testada.
3. Execute o instalador oficial `scripts/install.ps1` do Hermes com `-HermesHome <RAIZ>/runtime -InstallDir <RAIZ>/hermes-agent -NonInteractive -SkipBrowser -SkipComputerUse`.
4. Crie `<RAIZ>/workspace`. Configure um provedor próprio pelo Hermes; as credenciais não estão neste repositório.
5. Execute `project/scripts/Aplicar-Configuracao.ps1` e `project/scripts/Instalar-Extensoes.ps1`. Preserve o modelo configurado; não use `RestaurarModeloLocal` sem preparar o modelo e motor descritos em INSTALACAO.md.
6. Prepare o aplicativo desktop conforme a documentação oficial da versão Hermes utilizada. O iniciador espera o Electron em `hermes-agent/apps/desktop/node_modules/electron/dist/electron.exe`.
7. Execute `project/scripts/Instalar-Atalho.ps1` e abra o Jarvis.

## Dados e limites

Runtime, modelos, históricos, chaves e arquivos pessoais não são publicados. A cópia local arquivada preserva esses dados separadamente. Sem ela, a reinstalação começa sem histórico e requer novas credenciais.

A versão 0.9 é candidata à V1. Consulte VALIDACAO-V1.md: cancelamento durante ferramenta ativa, voz física e autenticação Calendar não estão concluídos. Estas instruções documentam dependências e caminhos; uma instalação limpa completa ainda não foi comprovada. Não remover a cópia local arquivada até essa comprovação.
