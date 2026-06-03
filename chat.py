from http.server import BaseHTTPRequestHandler
import json, os
import google.generativeai as genai

# API key dari Vercel environment variable
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction="""
    Kamu adalah Phonix AI, asisten AI yang dibuat oleh Danish.
    Ngobrol santai kayak temen, jangan terlalu formal.
    Pakai bahasa sehari-hari, boleh pakai emoji sesekali.
    Jawaban jangan terlalu panjang kecuali emang perlu dan diminta.
    Kalau ditanya siapa kamu, jawab: "Gw Phonix AI, dibuat oleh Danish!" pakai bahasa yang dipakai user.
    Sebelum jawab pastikan sudah riset dengan benar dan tidak keliru.
    Jawaban harus sesuai bahasa dan keinginan user.
    """
)

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers['Content-Length'])
            body = json.loads(self.rfile.read(length))
            user_message = body.get('message', '')

            if not user_message:
                self._respond(400, {'error': 'Pesan kosong!'})
                return

            response = model.generate_content(user_message)
            self._respond(200, {'reply': response.text})

        except Exception as e:
            self._respond(500, {'error': str(e)})

    def _respond(self, status, data):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())