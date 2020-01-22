import http.server
import socketserver
import webbrowser
url = "http://localhost:8000"
webbrowser.open(url)
PORT = 8000
Handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()
