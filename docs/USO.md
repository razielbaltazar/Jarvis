# Uso local

O projeto deve permanecer em `<JARVIS_ROOT>/project`, com runtime e models como pastas irmãs.

## Conversar
No PowerShell, execute `scripts/Iniciar-Jarvis.ps1`. O script inicia o servidor local quando necessário e encerra apenas o servidor criado por ele ao sair. Modo por arquivo de consulta e abertura/saída da interface interativa validados. A conversa interativa por automação de terminal não foi concluída.

## Aplicativo desktop
Use scripts/Iniciar-Jarvis.ps1 -Desktop. App compilado no Windows; aparência original Hermes e identidade Jarvis. O modelo fica ativo enquanto a janela está aberta. Fechar a janela encerra o servidor iniciado pelo script; servidores existentes são preservados. Conversa pela janela ainda precisa de validação. As ferramentas do desktop seguem sua própria configuração; Toolsets é usado no modo CLI.

## Trabalhar em projeto
Execute `scripts/Novo-Projeto.ps1 -Nome meu-site -Objetivo 'Criar um site pessoal'`. A pasta é criada em workspace/projetos, com AGENTS.md e ESTADO.md. Se existir, o script não sobrescreve.

Inicie `scripts/Iniciar-Jarvis.ps1 -Workspace '<caminho da pasta criada>' -Toolsets 'file,terminal'`. Para executar uma tarefa única, acrescente `-QueryFile '<arquivo de texto com o pedido>'`.

## Identidade
`config/SOUL.md` contém a identidade conversacional. Copie-o para runtime/SOUL.md ao aplicar atualizações; preserve uma cópia anterior. Isso mantém o upstream sem alterações e não renomeia todos os elementos da interface Hermes.

## Contexto e limites
AGENTS.md e ESTADO.md organizam contexto por pasta. São orientação ao agente, não sandbox nem garantia de sigilo. A memória nativa do Hermes é compartilhada pelo perfil; use arquivos do projeto para detalhes específicos. Integrações de agenda e voz ainda não estão conectadas. O modelo pequeno pode inventar fatos: valide resultados relevantes.

Durante o desenvolvimento assistido, pausar quando a barra de uso restante chegar a 65% ou menos. Essa regra é acompanhada pelo assistente de desenvolvimento, não pelo modelo local.
