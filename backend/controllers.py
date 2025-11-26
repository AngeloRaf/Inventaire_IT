# controllers.py
import json
from models import list_items, get_item, create_item, update_item, delete_item
from datetime import date, datetime

def default_serializer(obj):
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()  # → "2025-01-01"
    raise TypeError(f"Type {type(obj)} not serializable")

def read_json(environ):
    try:
        length = int(environ.get('CONTENT_LENGTH', '0'))
    except ValueError:
        length = 0
    body = environ['wsgi.input'].read(length) if length > 0 else b''
    if not body:
        return {}
    try:
        return json.loads(body.decode('utf-8'))
    except json.JSONDecodeError:
        return {}

def json_response(start_response, status_code, payload, headers=None):
    status_text = {
        200: "200 OK", 201: "201 Created", 204: "204 No Content",
        400: "400 Bad Request", 404: "404 Not Found", 405: "405 Method Not Allowed",
        500: "500 Internal Server Error",
    }[status_code]

    h = [
        ('Content-Type', 'application/json; charset=utf-8'),
        ('Access-Control-Allow-Origin', '*'),
        ('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'),
        ('Access-Control-Allow-Headers', 'Content-Type'),
    ]
    if headers:
        h.extend(headers)

    start_response(status_text, h)
    
    # ←←← LA LIGNE MAGIQUE ICI
    return [json.dumps(payload, default=default_serializer).encode('utf-8')]

def handle_items(environ, start_response):
    method = environ['REQUEST_METHOD']
    if method == 'OPTIONS':
        return json_response(start_response, 204, {})
    if method == 'GET':
        data = list_items()
        return json_response(start_response, 200, data)
    if method == 'POST':
        body = read_json(environ)
        # validations minimales
        for req in ('name', 'category', 'status'):
            if not body.get(req):
                return json_response(start_response, 400, {'error': f'{req} requis'})
        new_id = create_item(body)
        item = get_item(new_id)
        return json_response(start_response, 201, item)
    return json_response(start_response, 405, {'error': 'Méthode non autorisée'})

def handle_item_id(environ, start_response, item_id):
    method = environ['REQUEST_METHOD']
    if method == 'OPTIONS':
        return json_response(start_response, 204, {})
    if method == 'GET':
        item = get_item(item_id)
        if not item:
            return json_response(start_response, 404, {'error': 'Introuvable'})
        return json_response(start_response, 200, item)
    if method == 'PUT':
        body = read_json(environ)
        for req in ('name', 'category', 'status'):
            if not body.get(req):
                return json_response(start_response, 400, {'error': f'{req} requis'})
        count = update_item(item_id, body)
        if count == 0:
            return json_response(start_response, 404, {'error': 'Introuvable'})
        item = get_item(item_id)
        return json_response(start_response, 200, item)
    if method == 'DELETE':
        count = delete_item(item_id)
        if count == 0:
            return json_response(start_response, 404, {'error': 'Introuvable'})
        return json_response(start_response, 200, {'deleted': item_id})
    return json_response(start_response, 405, {'error': 'Méthode non autorisée'})
