import os
import json

HEADERS = {'Access-Control-Allow-Origin': '*'}
from parser_json import load, validate, to_ir
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
        input_type = body.get('type', '').lower()
        # Obtener el tipo de diagrama de Mermaid, por defecto 'flowchart'
        diagram_type = body.get('diagram', '').lower()
        if diagram_type not in ['flowchart', 'sequence', 'class', 'state', 'er', 'gantt', 'pie', 'journey', 'requirement', 'git', 'mindmap', 'timeline', 'quadrant']:
            diagram_type = 'flowchart'
        fmt = body.get('format', 'svg')
        token = body.get('token', '')

        # Autenticación y multitenancy
        user_id = validate_token(token)

        # Solo aceptamos JSON por ahora
        if input_type != 'json':
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Tipo no soportado en preview'})}

        if not isinstance(code, (str, dict)):
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': "El campo 'code' debe ser un JSON válido o una cadena JSON."})}

        # Generar código Mermaid directamente desde el parser
        obj = load(code)
        validate(obj)
        mermaid_code = to_ir(obj, diagram_type)

        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'diagram': mermaid_code})}

    except Exception as e:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': str(e)})}

