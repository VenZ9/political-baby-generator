#!/usr/bin/env python3
"""Minimal mock of OpenRouter's /api/v1/images endpoint for local testing."""
import base64
import json
from http.server import BaseHTTPRequestHandler, HTTPServer

# 1x1 red PNG
PNG = base64.b64encode(bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
    "890000000d4944415478da63f8cfc0000003010100b8f6b7a30000000049454e44ae426082"
)).decode()


class H(BaseHTTPRequestHandler):
    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(n) or b"{}")
        auth = self.headers.get("Authorization", "")
        # Echo back what we received so the test can assert on the prompt.
        with open("/tmp/mock_openrouter_last.json", "w") as f:
            json.dump({"auth": auth, "body": body}, f)
        if not auth.startswith("Bearer sk-or-"):
            self.send_response(401)
            self.end_headers()
            self.wfile.write(b'{"error":"unauthorized"}')
            return
        out = json.dumps({
            "created": 1748372400,
            "data": [{"b64_json": PNG, "media_type": "image/png"}],
            "usage": {"total_tokens": 10, "cost": 0.001},
        }).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(out)))
        self.end_headers()
        self.wfile.write(out)

    def log_message(self, *a):
        pass


HTTPServer(("127.0.0.1", 4599), H).serve_forever()
