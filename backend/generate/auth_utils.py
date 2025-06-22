import os
import boto3
from datetime import datetime

# Cliente DynamoDB para tokens
dynamodb = boto3.resource('dynamodb')
TOKENS_TABLE = os.environ['TOKENS_TABLE']


def validate_token(token: str) -> tuple:
    """Valida el token y retorna (tenant_id, user_id), o lanza Exception"""
    table = dynamodb.Table(TOKENS_TABLE)
    resp = table.get_item(Key={'token': token})
    if 'Item' not in resp:
        raise Exception('Token no válido')
    item = resp['Item']
    try:
        exp_time = datetime.fromisoformat(item['expires'])
    except Exception:
        raise Exception('Formato de fecha inválido en token')
    if datetime.utcnow() > exp_time:
        raise Exception('Token expirado')
    # Retornar tenant_id y user_id
    return item.get('tenant_id'), item.get('user_id')
