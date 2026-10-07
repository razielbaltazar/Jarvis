"""Deterministic local records tool; uses the same validator as the desktop UI."""
from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[3]
SCHEMA = {
    'name': 'jarvis_records',
    'description': 'Salvar, consultar e concluir tarefas, notas e lembretes locais. Use esta ferramenta para anotar/guardar; não edite o JSON manualmente. Retorna confirmação da gravação real. Lembretes só funcionam com o app aberto.',
    'parameters': {'type': 'object', 'properties': {
        'action': {'type': 'string', 'enum': ['create', 'list', 'complete']},
        'type': {'type': 'string', 'enum': ['note', 'task', 'reminder'], 'description': 'note para anotação, task para tarefa, reminder para lembrete; padrão note.'},
        'text': {'type': 'string', 'description': 'Texto exato a guardar; necessário para create.'},
        'due_at': {'type': 'string', 'description': 'Somente para reminder: ISO8601 com fuso explícito; se incerto, pergunte ao usuário.'},
        'id': {'type': 'string', 'description': 'Identificador retornado por list, para complete.'},
        'done': {'type': 'boolean', 'description': 'true para concluir/arquivar; false para reabrir.'}
    }, 'required': ['action']}
}

def handle(args, task_id='default', **kwargs):
    try:
        from tools.file_tools_paths import _resolve_base_dir, _terminal_env_type_for_task
        if _terminal_env_type_for_task(task_id) not in ('local', 'host'):
            return json.dumps({'success': False, 'error': 'Registros Jarvis disponíveis somente no workspace local.'}, ensure_ascii=False)
        workspace = str(_resolve_base_dir(task_id))
        payload = dict(args)
        if payload.get('action') == 'create':
            payload.setdefault('type', 'note')
        node = next((ROOT / 'runtime' / 'tools').glob('node-*/node.exe'))
        result = subprocess.run([str(node), str(ROOT / 'project' / 'desktop' / 'task-cli.cjs'), workspace],
                                input=json.dumps(payload), capture_output=True, text=True, encoding='utf-8',
                                timeout=20, creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0))
        return json.dumps(json.loads(result.stdout), ensure_ascii=False)
    except Exception as error:
        return json.dumps({'success': False, 'error': str(error)[:500]}, ensure_ascii=False)

def register(ctx):
    ctx.register_tool(name='jarvis_records', toolset='jarvis_local', schema=SCHEMA, handler=handle)
