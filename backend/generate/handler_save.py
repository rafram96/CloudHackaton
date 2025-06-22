import os
import json
import uuid
import subprocess
from datetime import datetime
import boto3

from parser_json import load, validate, to_ir
from renderer import ir_to_mermaid
from auth_utils import validate_token

# Configuración AWS
dynamodb = boto3.resource('dynamodb')
s3 = boto3.client('s3')
TOKENS_TABLE = os.environ['TOKENS_TABLE']
DIAGRAMS_TABLE = os.environ['DIAGRAMS_TABLE']
BUCKET = os.environ['BUCKET']


def lambda_handler(event, context):
    # Leer input
    body = json.loads(event.get('body', '{}'))
    code = body.get('code', '')
    dtype = body.get('type', '').lower()
    fmt = body.get('format', 'svg')
    token = body.get('token', '')

    try:
        # Validar token y obtener user_id
        user_id = validate_token(token)

        if dtype != 'json':
            return {'statusCode': 400, 'body': json.dumps({'error': 'Tipo no soportado'})}

        # Parseo y generación de IR
        obj = load(code)
        validate(obj)
        ir = to_ir(obj)
        mermaid_code = ir_to_mermaid(ir)

        # Generar diagram_id y nombres de archivo
        diagram_id = str(uuid.uuid4())
        prefix = f"{user_id}/{diagram_id}/"
        source_key = prefix + 'source.txt'
        image_key = prefix + f'diagram.{fmt}'

        # Guardar código fuente en S3
        s3.put_object(
            Bucket=BUCKET,
            Key=source_key,
            Body=code,
            ContentType='text/plain'
        )

        # Generar SVG/PNG con mermaid-cli
        tmp_mmd = f'/tmp/{diagram_id}.mmd'
        tmp_img = f'/tmp/{diagram_id}.{fmt}'
        with open(tmp_mmd, 'w') as f:
            f.write(mermaid_code)
        subprocess.run(['mmdc', '-i', tmp_mmd, '-o', tmp_img], check=True)

        # Subir imagen generada
        with open(tmp_img, 'rb') as f_img:
            s3.put_object(
                Bucket=BUCKET,
                Key=image_key,
                Body=f_img,
                ContentType='image/svg+xml' if fmt=='svg' else 'image/png'
            )

        # Registrar metadatos en DynamoDB
        table = dynamodb.Table(DIAGRAMS_TABLE)
        table.put_item(Item={
            'owner_id': user_id,
            'diagram_id': diagram_id,
            'type': dtype,
            'created_at': datetime.utcnow().isoformat(),
            'source_code_s3key': source_key,
            'image_s3key': image_key,
            'format': fmt,
            'status': 'success'
        })

        # URL pública
        url = f"https://{BUCKET}.s3.amazonaws.com/{image_key}"
        return {'statusCode': 200, 'body': json.dumps({'diagram_id': diagram_id, 'url': url})}

    except Exception as e:
        # Error
        return {'statusCode': 400, 'body': json.dumps({'error': str(e)})}
