import os
import boto3
from datetime import datetime

# Configuración DynamoDB
dynamodb = boto3.resource('dynamodb')
TOKENS_TABLE = os.environ['TOKENS_TABLE']

def lambda_handler(event, context):
    token = event.get('token')
    if not token:
        return {'statusCode': 400, 'body': {'error': 'Falta token en la petición'}}

    table = dynamodb.Table(TOKENS_TABLE)
    try:
        resp = table.get_item(Key={'token': token})
    except Exception as e:
        return {'statusCode': 500, 'body': {'error': str(e)}}

    if 'Item' not in resp:
        return {'statusCode': 403, 'body': {'error': 'Token no válido'}}

    expires = resp['Item'].get('expires')
    user_id = resp['Item'].get('user_id')
    try:
        exp_time = datetime.fromisoformat(expires)
    except ValueError:
        return {'statusCode': 500, 'body': {'error': 'Formato de fecha inválido'}}

    if datetime.utcnow() > exp_time:
        return {'statusCode': 403, 'body': {'error': 'Token expirado'}}

    # Retornar user_id para uso en endpoints protegidos
    return {'statusCode': 200, 'body': {'message': 'Token válido', 'user_id': user_id}}
