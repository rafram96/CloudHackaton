import os
import boto3
import json
import hashlib

HEADERS = {'Access-Control-Allow-Origin': '*'}

dynamodb = boto3.resource('dynamodb')
USERS_TABLE = os.environ['USERS_TABLE']

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def lambda_handler(event, context):
    body = event.get('body', '{}')
    data = json.loads(body)
    tenant_id = data.get('tenant_id')
    user_id = data.get('user_id')
    password = data.get('password')

    if not tenant_id or not user_id or not password:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'Falta tenant_id, user_id o password'})}

    hashed = hash_password(password)
    table = dynamodb.Table(USERS_TABLE)
    try:
        # Almacenar usuario con multitenancy
        table.put_item(Item={'tenant_id': tenant_id, 'user_id': user_id, 'hash_password': hashed})
        return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps({'message': 'Usuario registrado', 'user_id': user_id})}
    except Exception as e:
        return {'statusCode': 500, 'headers': HEADERS, 'body': json.dumps({'error': str(e)})}
