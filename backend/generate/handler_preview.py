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
        # Cargar parámetros
        body = json.loads(event.get('body', '{}'))
        code = body.get('code', '')
        input_type = body.get('type', '').lower()
        diagram_type = body.get('diagram', '')
        fmt = body.get('format', 'svg')
        
        # Extraer token JWT del header Authorization
        headers = event.get('headers', {})
        auth_header = headers.get('Authorization') or headers.get('authorization', '')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Token de autorización requerido'})}
        
        token = auth_header.replace('Bearer ', '').strip()
        
        if not token:
            return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Token vacío no válido'})}

        # Autenticación y multitenancy: validar token y tenant
        headers_in = event.get('headers', {})
        header_tenant = headers_in.get('X-Tenant-Id') or headers_in.get('x-tenant-id')
        tenant_id, user_id = validate_token(token)
        if not header_tenant or header_tenant != tenant_id:
            return {'statusCode': 403, 'headers': HEADERS, 'body': json.dumps({'error': 'Tenant no autorizado'})}
        # Solo aceptamos JSON, AWS y ER
        if input_type not in ['json', 'aws', 'er']:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': f'Tipo no soportado en preview: {input_type}. Tipos válidos: json, aws, er'})}

        if not isinstance(code, (str, dict)):
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': "El campo 'code' debe ser un JSON válido o una cadena JSON."})}

        # Determinar diagrama para JSON
        if input_type == 'json':
            # Validar tipo de diagrama Mermaid
            valid = ['flowchart', 'sequenceDiagram', 'classDiagram', 'stateDiagram']
            if diagram_type not in valid:
                diagram_type = 'flowchart'  # por defecto
        # Para ER y AWS aún no implementados, se ignora el diagram_type
        else:
            # Mantener diagram_type tal cual o asignar predeterminado
            diagram_type = diagram_type or 'flowchart'  # para AWS y ER usará flowchart si no se especifica

        # Generar código Mermaid directamente desde el parser
        obj = load(code)
        validate(obj)

        # Generar código Mermaid directamente desde el parser
        mermaid_code = to_ir(obj, diagram_type)

        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'diagram': mermaid_code})}

    except Exception as e:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': str(e)})}

