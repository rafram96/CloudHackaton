import os
import json
import boto3
import hashlib
import uuid
from datetime import datetime, timedelta
#
dynamodb = boto3.resource('dynamodb')
USERS_TABLE = os.environ['USERS_TABLE']
TOKENS_TABLE = os.environ['TOKENS_TABLE']

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def lambda_handler(event, context):
    # Parsear body JSON
    body = event.get('body', '{}')
    data = json.loads(body)
    user_id = data.get('user_id')
    password = data.get('password')
    if not user_id or not password:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Falta user_id o password'})}

    table_users = dynamodb.Table(USERS_TABLE)
    resp = table_users.get_item(Key={'user_id': user_id})
    if 'Item' not in resp:
        return {'statusCode': 403, 'body': {'error': 'Usuario no existe'}}

    stored_hash = resp['Item'].get('hash_password')
    if hash_password(password) != stored_hash:
        return {'statusCode': 403, 'body': {'error': 'Password incorrecto'}}

    # Generar token y expiración
    token = str(uuid.uuid4())
    expires = (datetime.utcnow() + timedelta(hours=1)).isoformat()

    table_tokens = dynamodb.Table(TOKENS_TABLE)
    try:
        table_tokens.put_item(Item={'token': token, 'user_id': user_id, 'expires': expires})
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}

    return {'statusCode': 200, 'body': json.dumps({'token': token})}
