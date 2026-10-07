# Conexão Google Calendar
Estado: preparada, ainda não autenticada. Não declarar agenda funcional.
Base reutilizada: skills/productivity/google-workspace do Hermes. A versão instalada do setup.py não aceita --services, apesar de o SKILL.md mencionar essa opção. scripts/calendar_setup.py adapta somente o escopo Calendar, sem editar upstream nem solicitar Gmail/Drive.

## O que falta
Criar/selecionar projeto Google Cloud, habilitar somente Google Calendar API e criar OAuth Client ID do tipo Desktop app. Se estiver em Testing, incluir a conta como test user. Arquivo JSON do cliente e token ficam SOMENTE em runtime; nunca no GitHub. Uma chave Gemini não substitui OAuth Calendar.
Cliente: https://console.cloud.google.com/apis/credentials
API: https://console.cloud.google.com/apis/library/calendar-json.googleapis.com
Usuários de teste: https://console.cloud.google.com/auth/audience

## Continuação por agente
Usar Python gerenciado pelo Hermes e adaptador scripts/calendar_setup.py. --check apenas verifica autenticação. Após receber o caminho do JSON, --client-secret CAMINHO guarda o cliente. --install-deps sincroniza extra google pelo PM oficial (não pip avulso); reiniciar ambiente conforme instrução do PM. --auth-url gera consentimento somente Calendar. O fluxo instalado redireciona para localhost:1 e exige copiar o URL completo de retorno para --auth-code. Não publicar URL com código ou token.
Após autenticação, --check-live faz leitura real para verificar acesso. Conferir os scopes do token antes de usar. Operações Calendar reutilizam google_api.py do Hermes. Primeiro listar agenda; não criar/alterar eventos apenas para testar sem pedido específico. Verificar se a conta possui Advanced Protection somente se o consentimento exigir ajuste.
Até autenticar e validar, o painel deve continuar indicando agenda não conectada.

Bloqueio observado em 07/10: Google Cloud exige verificação em duas etapas na conta. Usuário precisa concluir a ativação de autenticação; depois atualizar Console. Login existente foi reconhecido, mas o gate MFA impede criar cliente. Não registrar links contendo parâmetros de sessão da conta.

## Alternativa atual sem 2SV
Decisão do usuário: não ativar verificação em duas etapas. Agenda Google exportada pelo navegador e importada como cópia local somente para consulta. Painel Agenda indica a data da cópia; compromissos anteriores podem ser mostrados. scripts/import_calendar.py aceita ICS ou ZIP, mantém dados em runtime/calendar/snapshot.json, limita volume e não extrai caminhos do ZIP. Sem atualização automática, escrita Google ou expansão de recorrências; avisos indicam eventos ignorados. Não confundir essa alternativa com OAuth conectado.
