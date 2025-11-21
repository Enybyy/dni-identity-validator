from flask import Flask, request, jsonify, make_response, send_from_directory
import requests
import os
import webbrowser
from pathlib import Path

app = Flask(__name__)

API_BASE = 'https://api.decolecta.com/v1/reniec/dni'

# Agregar cabeceras CORS a todas las respuestas
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, X-API-Token, Authorization'
    return response

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'status': 'ok',
        'message': 'Proxy Decolecta activo',
        'endpoints': ['/api/dni?numero=XXXXXXXX', '/health']
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'ok': True})

# Ruta para servir el archivo HTML
@app.route('/verificador_dni.html')
def serve_html():
    return send_from_directory('.', 'verificador_dni.html')

@app.route('/api/dni', methods=['GET', 'OPTIONS'])
def proxy_dni():
    if request.method == 'OPTIONS':
        return make_response(('', 204))

    numero = request.args.get('numero', '').strip()
    if not numero:
        return jsonify({'error': 'Falta parametro numero'}), 400

    # Token enviado desde el cliente en un header no estándar
    token = request.headers.get('X-API-Token', '').strip()
    # Permitir Authorization opcional
    if not token:
        auth = request.headers.get('Authorization', '').strip()
        if auth.lower().startswith('bearer '):
            token = auth.split(' ', 1)[1]
    if not token:
        # Permitir token como query param para pruebas manuales
        token = request.args.get('token', '').strip()
    if not token:
        # Alternativa: leer desde variable de entorno para pruebas locales
        token = os.getenv('DECOLECTA_TOKEN', '').strip()
    if not token:
        return jsonify({'error': 'Falta token de la API'}), 401

    url = f"{API_BASE}?numero={numero}"
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json'
    }

    try:
        resp = requests.get(url, headers=headers, timeout=15)
        content_type = resp.headers.get('Content-Type', 'application/json')
        # Reenviar respuesta y status
        return make_response((resp.content, resp.status_code, {'Content-Type': content_type}))
    except requests.exceptions.Timeout:
        return jsonify({'error': 'Timeout al consultar API de Decolecta'}), 504
    except Exception as e:
        return jsonify({'error': f'Error al consultar API: {str(e)}'}), 502

if __name__ == '__main__':
    # Construir la URL local y abrir en el navegador
    url = 'http://127.0.0.1:5000/verificador_dni.html'
    webbrowser.open(url)
    port = int(os.getenv('PORT', '5000'))
    app.run(host='0.0.0.0', port=port, debug=True)
