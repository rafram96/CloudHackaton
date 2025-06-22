import os
import json
import uuid
import base64
from datetime import datetime
import boto3

from auth_utils import validate_token

# Configuración AWS
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
TOKENS_TABLE = os.environ['TOKENS_TABLE']
DIAGRAMS_TABLE = os.environ['DIAGRAMS_TABLE']
BUCKET = os.environ['BUCKET']

HEADERS = {'Access-Control-Allow-Origin': '*'}

def lambda_handler(event, context):
    """
    Endpoint para guardar diagramas desde imagen base64 del frontend
    Endpoint: POST /generate/save-frontend
    Body JSON: { image_base64, type, format, diagram, token, code }
    Response: { diagram_id, url }
    """
    try:
        body = json.loads(event.get('body', '{}'))
        image_base64 = body.get('image_base64', '')
        input_type = body.get('type', 'frontend').lower()
        fmt = body.get('format', 'png').lower()  # Default PNG desde frontend
        diagram_type = body.get('diagram', 'flowchart')
        token = body.get('token', '')
        code = body.get('code', '{}')  # Para metadatos

        # Validar token y obtener user_id
        user_id = validate_token(token)

        if not image_base64:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'No se recibió imagen'})}

        # Decodificar imagen base64
        try:
            image_data = base64.b64decode(image_base64)
        except Exception as e:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': f'Error decodificando imagen: {str(e)}'})}

        # Generar IDs únicos
        diagram_id = str(uuid.uuid4())
        now_str = datetime.utcnow().strftime('%Y%m%dT%H%M%S')
        prefix = f"{user_id}/{diagram_id}/"
        source_key = prefix + f'source_{now_str}.txt'
        image_key = prefix + f'diagram_{now_str}.{fmt}'        # Guardar código fuente en S3
        s3.put_object(
            Bucket=BUCKET,
            Key=source_key,
            Body=code,
            ContentType='text/plain',
            ACL='public-read'
        )

        # Determinar Content-Type
        content_type_map = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'svg': 'image/svg+xml'
        }
        content_type = content_type_map.get(fmt, 'image/png')

        # Subir imagen directamente a S3 (sin procesamiento adicional por ahora)
        s3.put_object(
            Bucket=BUCKET,
            Key=image_key,
            Body=image_data,
            ContentType=content_type,
            ACL='public-read'
        )

        # Registrar metadatos en DynamoDB
        table = dynamodb.Table(DIAGRAMS_TABLE)
        table.put_item(Item={
            'owner_id': user_id,
            'diagram_id': diagram_id,
            'type': input_type,
            'diagram_type': diagram_type,
            'created_at': datetime.utcnow().isoformat(),
            'source_code_s3key': source_key,
            'image_s3key': image_key,
            'format': fmt,
            'status': 'success',
            'source': 'frontend_render'
        })

        # URL pública
        url = f"https://{BUCKET}.s3.amazonaws.com/{image_key}"
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'diagram_id': diagram_id, 'url': url})}

    except Exception as e:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': str(e)})}
