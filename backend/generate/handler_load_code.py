import os
import json
import boto3
from auth_utils import validate_token

# Configuración AWS
s3 = boto3.client('s3')
BUCKET = os.environ['BUCKET']
HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
}

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
        body = json.loads(event.get('body', '{}'))
        s3_key = body.get('s3_key')
        
        if not s3_key:
            return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'S3 key requerida'})}
        
        # Verificar que la clave pertenece al tenant/usuario correcto
        if not s3_key.startswith(f"{tenant_id}/{user_id}/"):
            return {'statusCode': 403, 'headers': HEADERS, 'body': json.dumps({'error': 'Acceso no autorizado al archivo'})}
        
        # Descargar archivo de S3
        response = s3.get_object(Bucket=BUCKET, Key=s3_key)
        code = response['Body'].read().decode('utf-8')
        
        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({'code': code})
        }
        
    except s3.exceptions.NoSuchKey:
        return {'statusCode': 404, 'headers': HEADERS, 'body': json.dumps({'error': 'Archivo no encontrado'})}
    except Exception as e:
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': str(e)})}
