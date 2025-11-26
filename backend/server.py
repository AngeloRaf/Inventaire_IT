from wsgiref.simple_server import make_server
from controllers import handle_items, handle_item_id, json_response

def app(environ, start_response):
    path = environ.get('PATH_INFO', '')
    method = environ['REQUEST_METHOD']

    if method == 'OPTIONS':
        return json_response(start_response, 204, {})

    if path == '/api/items':
        return handle_items(environ, start_response)

    if path.startswith('/api/items/'):
        item_id = path.split('/api/items/')[1]
        if not item_id:
            return json_response(start_response, 400, {'error': 'ID manquant'})
        return handle_item_id(environ, start_response, item_id)

    return json_response(start_response, 404, {'error': 'Route inconnue'})

if __name__ == '__main__':
    # Essaye avec localhost et port 5000
    with make_server('127.0.0.1', 8000, app) as httpd:
        print("WSGI server on http://127.0.0.1:8000")
        httpd.serve_forever()
