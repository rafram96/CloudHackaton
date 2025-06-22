import os
import boto3
import json
import hashlib

# Crea cliente DynamoDB
dynamodb = boto3.resource('dynamodb')
USERS_TABLE = os.environ['USERS_TABLE']

def hash_password(password):
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def lambda_handler(event, context):
    # Parsear body JSON
    body = event.get('body', '{}')
    data = json.loads(body)
    user_id = data.get('user_id')
    password = data.get('password')

    if not user_id or not password:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Falta user_id o password'})}

    hashed = hash_password(password)
    table = dynamodb.Table(USERS_TABLE)
    try:
        # Almacenar usuario
        table.put_item(Item={'user_id': user_id, 'hash_password': hashed})
        return {'statusCode': 200, 'body': json.dumps({'message': 'Usuario registrado', 'user_id': user_id})}
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}
