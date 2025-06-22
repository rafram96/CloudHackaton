import os
import json

HEADERS = {'Access-Control-Allow-Origin': '*'}
from parser_json import load, validate, to_ir
from renderer import ir_to_mermaid
from auth_utils import validate_token

"""
Lambda para preview de diagramas en memoria.
Endpoint: POST /generate/preview
Body JSON: { code, type, format, token }
Response: { diagram: mermaid_syntax }
"""

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        code = body.get('code', '')
        dtype = body.get('type', '').lower()
        fmt = body.get('format', 'svg')
        token = body.get('token', '')

        # Autenticación y multitenancy
        user_id = validate_token(token)

        # Soporte solo JSON en preview
        if dtype != 'json':
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Tipo no soportado en preview'})}

        # Parseo y validación
        obj = load(code)
        validate(obj)
        ir = to_ir(obj)
        mermaid_code = ir_to_mermaid(ir)

        # Devolver mermaid syntax para render en cliente
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'diagram': mermaid_code})}
    except Exception as e:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': str(e)})}
