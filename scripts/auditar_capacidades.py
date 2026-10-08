"""Read native Hermes capability requirements without exposing credentials."""
import json
import os
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
os.environ.setdefault("HERMES_HOME", str(root / "runtime"))
sys.path.insert(0, str(root / "hermes-agent"))
import hermes_bootstrap  # Compose dependencies from Hermes' own package manager.
from hermes_cli.config import load_env
for key, value in load_env().items():
    if value is not None:
        os.environ.setdefault(key, str(value))
import model_tools  # Native discovery registers built-in tools.
from tools.registry import registry
rows = registry.get_available_toolsets()
print(json.dumps({name: {"available": bool(row["available"]), "tools": row["tools"]}
                  for name, row in rows.items()}, ensure_ascii=False))
