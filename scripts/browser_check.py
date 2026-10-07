"""Exercise Hermes browser against a disposable local fixture, not user tabs."""
import json
import os
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

root = Path(__file__).resolve().parents[2]
os.environ['HERMES_HOME'] = str(root / 'runtime')
sys.path.insert(0, str(root / 'hermes-agent'))
import hermes_bootstrap
from tools.browser_tool import browser_navigate, browser_snapshot
from tools.browser_tool_lifecycle import cleanup_browser


class Fixture(BaseHTTPRequestHandler):
    def do_GET(self):
        data = b'<html><title>Jarvis browser check</title><body><h1>jarvis-browser-functional</h1></body></html>'
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, *args):
        pass


if __name__ == '__main__':
    server = ThreadingHTTPServer(('127.0.0.1', 0), Fixture)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        navigation = json.loads(browser_navigate(f'http://127.0.0.1:{server.server_port}/', task_id='jarvis-browser-check'))
        snapshot = browser_snapshot(task_id='jarvis-browser-check')
        if 'jarvis-browser-functional' not in snapshot:
            raise RuntimeError('Browser fixture marker missing: ' + str(navigation)[:300])
        print(json.dumps({'browser_local_functional': True, 'personal_tabs_used': False}))
    finally:
        cleanup_browser('jarvis-browser-check')
        server.shutdown()
        server.server_close()
