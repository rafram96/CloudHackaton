import os
import json
import boto3
import hashlib
import uuid
from datetime import datetime, timedelta

HEADERS = {'Access-Control-Allow-Origin': '*'}
dynamodb = boto3.resource('dynamodb')
USERS_TABLE = os.environ['USERS_TABLE']
TOKENS_TABLE = os.environ['TOKENS_TABLE']

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def lambda_handler(event, context):
    body = event.get('body', '{}')
    data = json.loads(body)
    tenant_id = data.get('tenant_id')
    user_id = data.get('user_id')
    password = data.get('password')
    if not user_id or not password:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Falta tenant_id, user_id o password'})}

    table_users = dynamodb.Table(USERS_TABLE)
    # Obtener usuario bajo tenant
    resp = table_users.get_item(Key={'tenant_id': tenant_id, 'user_id': user_id})
    stored_hash = resp.get('Item', {}).get('hash_password')
    if not stored_hash or hash_password(password) != stored_hash:
        return {'statusCode': 401, 'headers': HEADERS, 'body': json.dumps({'error': 'Usuario o contraseña incorrectos'})}

    # Generar token y expiración
    token = str(uuid.uuid4())
    expires = (datetime.utcnow() + timedelta(hours=1)).isoformat()

    table_tokens = dynamodb.Table(TOKENS_TABLE)
    try:
        # Guardar token con tenant
        table_tokens.put_item(Item={'token': token, 'tenant_id': tenant_id, 'user_id': user_id, 'expires': expires})
    except Exception as e:
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': str(e)})}

    return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'token': token, 'tenant_id': tenant_id})}
