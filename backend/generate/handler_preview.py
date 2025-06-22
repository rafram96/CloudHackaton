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
        # Obtener el tipo de diagrama de Mermaid en camelCase, por defecto 'flowchart'
        diagram_type = body.get('diagram', '')
        fmt = body.get('format', 'svg')
        token = body.get('token', '')

        # Autenticación y multitenancy
        user_id = validate_token(token)        # Solo aceptamos JSON, AWS y ER
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

