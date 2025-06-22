import os
import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from auth_utils import validate_token

# Configuración AWS
dynamodb = boto3.resource('dynamodb')
DIAGRAMS_TABLE = os.environ['DIAGRAMS_TABLE']
BUCKET = os.environ['BUCKET']
HEADERS = {'Access-Control-Allow-Origin': '*'}


def lambda_handler(event, context):
    # Validar token JWT y multitenancy
    headers = event.get('headers', {})
    auth_header = headers.get('Authorization') or headers.get('authorization', '')
    if not auth_header.startswith('Bearer '):
        return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Token de autorización requerido'})}
    token = auth_header.replace('Bearer ', '').strip()
    if not token:
        return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Token no válido'})}

    header_tenant = headers.get('X-Tenant-Id') or headers.get('x-tenant-id')
    tenant_id, user_id = validate_token(token)
    if header_tenant != tenant_id:
        return {'statusCode': 403, 'headers': HEADERS, 'body': json.dumps({'error': 'Tenant no autorizado'})}

    try:
        table = dynamodb.Table(DIAGRAMS_TABLE)
        # Query solo los diagramas de este tenant y usuario
        resp = table.query(
            KeyConditionExpression=Key('tenant_id').eq(tenant_id),
            FilterExpression=Attr('owner_id').eq(user_id)
        )
        items = resp.get('Items', [])
        # Ordenar por created_at descendente
        sorted_items = sorted(items, key=lambda x: x.get('created_at', ''), reverse=True)
        history = []
        for item in sorted_items:
            url = f"https://{BUCKET}.s3.amazonaws.com/{item.get('image_s3key')}"
            history.append({
                'diagram_id': item.get('diagram_id'),
                'createdAt': item.get('created_at'),
                'diagram_type': item.get('diagram_type'),
                'code': item.get('source_code_s3key') and None,  # omitir código completo o podría extraer del S3
                's3_url': url
            })
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps(history)}
    except Exception as e:
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': str(e)})}
