"""Calendar-only adapter over the installed Hermes Google OAuth setup.
Run with the Hermes-managed Python. Credentials remain under HERMES_HOME.
"""
import importlib.util
import os
import sys
from pathlib import Path
root = Path(__file__).resolve().parents[2]
os.environ['HERMES_HOME'] = str(root / 'runtime')
upstream = root / 'hermes-agent'
sys.path.insert(0, str(upstream))
scripts = upstream / 'skills/productivity/google-workspace/scripts'
sys.path.insert(0, str(scripts))
spec = importlib.util.spec_from_file_location('jarvis_google_oauth', scripts / 'setup.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
module.SCOPES = ['https://www.googleapis.com/auth/calendar']
if __name__ == '__main__':
    module.main()
