"""Live Calendar adapter. Never reads the former ICS snapshot or caches events."""
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SCOPE = 'https://www.googleapis.com/auth/calendar'


def service():
    token = ROOT / 'runtime/google_token.json'
    if not token.exists():
        return None
    payload = json.loads(token.read_text(encoding='utf-8'))
    scopes = payload.get('scopes') or payload.get('scope') or []
    if isinstance(scopes, str):
        scopes = scopes.split()
    if SCOPE not in scopes:
        raise ValueError('Autorize o escopo Calendar antes de usar a agenda.')
    os.environ['HERMES_HOME'] = str(ROOT / 'runtime')
    sys.path.insert(0, str(ROOT / 'hermes-agent'))
    import hermes_bootstrap  # Compose only the Hermes PM-managed dependencies.
    sys.path.insert(0, str(ROOT / 'hermes-agent/skills/productivity/google-workspace/scripts'))
    import google_api
    google_api.SCOPES = [SCOPE]
    return google_api.build_service('calendar', 'v3')


def timestamp(value):
    parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
    if parsed.tzinfo is None:
        raise ValueError('Informe data e hora com fuso explícito.')
    return parsed


def execute(args, api):
    if api is None:
        return {'success': False, 'connected': False, 'live_sync': False,
                'events': [], 'error': 'Google Calendar ainda não autorizado no Jarvis.'}
    action = args.get('action', 'list')
    calendar = args.get('calendar_id', 'primary')
    events = api.events()
    if action == 'list':
        now = datetime.now(timezone.utc)
        start = args.get('from') or now.isoformat()
        end = args.get('to') or (now + timedelta(days=30)).isoformat()
        if timestamp(end) <= timestamp(start):
            raise ValueError('O fim do período deve ser posterior ao início.')
        items, page = [], None
        for _ in range(10):
            result = events.list(calendarId=calendar, timeMin=start, timeMax=end,
                                 singleEvents=True, orderBy='startTime', maxResults=100,
                                 pageToken=page).execute()
            items.extend(result.get('items', []))
            page = result.get('nextPageToken')
            if not page:
                break
        rows = [{'id': item['id'], 'etag': item.get('etag'),
                 'title': item.get('summary', '(Sem título)'),
                 'start': item.get('start', {}).get('dateTime') or item.get('start', {}).get('date'),
                 'end': item.get('end', {}).get('dateTime') or item.get('end', {}).get('date'),
                 'all_day': 'date' in item.get('start', {})}
                for item in items if item.get('status') != 'cancelled']
        return {'success': True, 'connected': True, 'live_sync': True, 'events': rows,
                'checked_at': now.isoformat(), 'truncated': bool(page)}
    if action not in ('create', 'update'):
        raise ValueError('Ação de agenda não suportada.')
    title = args.get('title', '').strip()
    if not title or len(title) > 1000:
        raise ValueError('Informe um título válido.')
    if timestamp(args['end']) <= timestamp(args['start']):
        raise ValueError('O fim do compromisso deve ser posterior ao início.')
    body = {'summary': title, 'start': {'dateTime': args['start']},
            'end': {'dateTime': args['end']}}
    if action == 'create':
        result = events.insert(calendarId=calendar, body=body, sendUpdates='none').execute()
    else:
        if not args.get('id') or not args.get('etag'):
            raise ValueError('Consulte antes o evento para obter id e etag atuais.')
        request = events.patch(calendarId=calendar, eventId=args['id'], body=body, sendUpdates='none')
        request.headers['If-Match'] = args['etag']
        result = request.execute()
    return {'success': True, 'connected': True, 'live_sync': True,
            'id': result['id'], 'etag': result.get('etag'), 'action': action}


def run(args):
    try:
        return execute(args, service())
    except BaseException as error:
        if isinstance(error, (KeyboardInterrupt, GeneratorExit)):
            raise
        # Avoid raw remote responses, auth URLs, tokens and personal data in errors.
        status = getattr(getattr(error, 'resp', None), 'status', None)
        message = str(error) if isinstance(error, (ValueError, KeyError)) else 'Falha ao acessar Google Calendar; confira a autorização e a conexão.'
        if status == 412:
            message = 'O evento mudou no Google. Consulte novamente antes de alterar.'
        return {'success': False, 'connected': False, 'live_sync': False,
                'events': [], 'error': message, 'status': status}


if __name__ == '__main__':
    print(json.dumps(run(json.load(sys.stdin)), ensure_ascii=False))
