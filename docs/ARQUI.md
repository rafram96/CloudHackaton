# Arquitectura de Solución

1. **Auth Service JWT Multitenancy**
   - Lambda (Python) para registro (`/register`) y login (`/login`).
   - Generación y verificación de JWT (python-jose).  
   - DynamoDB como User Store (user_id, password hasheada, tenant_id).  
   - Middleware en Lambdas protegidas para validar token y tenant_id.

2. **Hosting Frontend**
   - S3 estático con React/Vite.  

3. **API Gateway**
   - **POST /generate** (protegida con JWT) → Lambda "Generate Diagram".
   - **GET /diagram/{id}** (pública) → acceso directo a S3.

4. **Lambda: Generar Diagrama**
   - Recibe payload JSON con código y header `Authorization: Bearer <JWT>`.
   - Valida JWT y extrae tenant_id.
   - Genera diagrama usando librerías:
     - diagrams (mingrammer)
     - ERAlchemy
     - mermaid-cli (invocado vía subprocess)
   - Convierte a SVG, PNG o PDF (Pillow / reportlab).
   - Almacena en S3: `bucket-diagramas/{tenant_id}/{diagram_id}.{ext}`.
   - Registra metadata en DynamoDB (diagram_id, tenant_id, timestamp, tipo).

5. **Flujo de Datos**
   - Usuario → Auth → JWT
   - Usuario → S3 (descarga frontend)
   - Frontend → POST /generate → API Gateway → Lambda → S3 (almacena)
   - Frontend → GET /diagram/{id} → API Gateway → S3 (recupera)
