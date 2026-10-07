"""Check Portuguese local synthesis and transcription without touching the microphone."""
from pathlib import Path
import json
import os
import sys
import time
import wave

root = Path(__file__).resolve().parents[2]
os.environ['HERMES_HOME'] = str(root / 'runtime')
os.environ['HF_HOME'] = str(root / 'cache' / 'huggingface')
sys.path.insert(0, str(root / 'hermes-agent'))
import hermes_bootstrap  # PM-managed dependency composition; no manual environment mutations.
from tools.tts_tool import _load_tts_config
from tools.tts_tool_local import _generate_piper_tts
from tools.transcription_tools import transcribe_audio

output = Path(sys.argv[1]).resolve()
output.mkdir(parents=True, exist_ok=True)
target = output / 'jarvis-voz-teste.wav'
text = 'Olá, eu sou o Jarvis. Vamos organizar suas tarefas e construir seus projetos.'
started = time.monotonic()
audio = _generate_piper_tts(text, str(target), _load_tts_config())
synthesis_seconds = round(time.monotonic() - started, 2)
with wave.open(audio, 'rb') as wav:
    duration = wav.getnframes() / wav.getframerate()
    assert duration > 1, 'Empty synthesized audio'
started = time.monotonic()
result = transcribe_audio(audio)
assert result.get('success'), result.get('error', 'Local transcription failed')
transcript = str(result.get('transcript', '')).strip()
assert 'projetos' in transcript.lower() and 'tarefas' in transcript.lower(), transcript
report = {'success': True, 'input_text': text, 'transcript': transcript, 'audio_seconds': round(duration, 2),
          'synthesis_seconds': synthesis_seconds, 'transcription_seconds': round(time.monotonic() - started, 2),
          'microphone_used': False, 'stt': 'faster-whisper base CPU int8', 'tts': 'Piper pt_BR-faber-medium CPU'}
(output / 'voz-resultado.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False))
