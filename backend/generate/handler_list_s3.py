import os
import json
import boto3

# Configuración AWS
s3 = boto3.client('s3')
BUCKET = os.environ['BUCKET']
HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*'
}

def lambda_handler(event, context):
    try:
        # Listar todos los objetos del bucket
        response = s3.list_objects_v2(Bucket=BUCKET, Delimiter='/')
        
        directories = []
        
        # Obtener prefijos (directorios de nivel superior - tenants)
        if 'CommonPrefixes' in response:
            for prefix in response['CommonPrefixes']:
                tenant_dir = prefix['Prefix'].rstrip('/')
                directories.append({
                    'type': 'tenant',
                    'name': tenant_dir,
                    'path': tenant_dir
                })
        
        # También obtener subdirectorios para cada tenant
        for tenant in directories:
            try:
                tenant_response = s3.list_objects_v2(
                    Bucket=BUCKET, 
                    Prefix=tenant['path'] + '/',
                    Delimiter='/'
                )
                
                users = []
                if 'CommonPrefixes' in tenant_response:
                    for user_prefix in tenant_response['CommonPrefixes']:
                        user_path = user_prefix['Prefix'].rstrip('/')
                        user_name = user_path.split('/')[-1]
                        
                        # Listar diagramas del usuario
                        user_response = s3.list_objects_v2(
                            Bucket=BUCKET,
                            Prefix=user_path + '/',
                            Delimiter='/'
                        )
                        
                        diagrams = []
                        if 'CommonPrefixes' in user_response:
                            for diagram_prefix in user_response['CommonPrefixes']:
                                diagram_path = diagram_prefix['Prefix'].rstrip('/')
                                diagram_id = diagram_path.split('/')[-1]
                                diagrams.append(diagram_id)
                        
                        users.append({
                            'name': user_name,
                            'path': user_path,
                            'diagrams': diagrams
                        })
                
                tenant['users'] = users
            except Exception as e:
                tenant['users'] = []
                tenant['error'] = str(e)
        
        return {
            'statusCode': 200,
            'headers': HEADERS,
            'body': json.dumps({
                'bucket': BUCKET,
                'directories': directories,
                'total_tenants': len(directories)
            })
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': HEADERS,
            'body': json.dumps({'error': str(e)})
        }
