import os
import boto3
import json
from datetime import datetime

# Configuración DynamoDB
dynamodb = boto3.resource('dynamodb')
TOKENS_TABLE = os.environ['TOKENS_TABLE']

def lambda_handler(event, context):
    # Parsear body JSON
    body = event.get('body', '{}')
    data = json.loads(body)
    token = data.get('token')
    if not token:
        return {'statusCode': 400, 'body': json.dumps({'error': 'Falta token en la petición'})}

    table = dynamodb.Table(TOKENS_TABLE)
    try:
        resp = table.get_item(Key={'token': token})
    except Exception as e:
        return {'statusCode': 500, 'body': json.dumps({'error': str(e)})}

    if 'Item' not in resp:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Token no válido'})}

    expires = resp['Item'].get('expires')
    user_id = resp['Item'].get('user_id')
    try:
        exp_time = datetime.fromisoformat(expires)
    except ValueError:
        return {'statusCode': 500, 'body': json.dumps({'error': 'Formato de fecha inválido'})}

    if datetime.utcnow() > exp_time:
        return {'statusCode': 401, 'body': json.dumps({'error': 'Token expirado'})}

    # Respuesta exitosa con user_id
    return {'statusCode': 200, 'body': json.dumps({'message': 'Token válido', 'user_id': user_id})}
