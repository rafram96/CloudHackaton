# Planificación Backend – UTEC Diagram

Este documento describe la arquitectura y los componentes del backend para soporte de generación y preview de diagramas.

## 1. Estructura de Carpetas
```
backend/
├── auth/
│   ├── Lambda_CrearUsuario.py
│   ├── Lambda_LoginUsuario.py
│   ├── Lambda_ValidarTokenAcceso.py
│   └── serverless.yml
└── generate/
    ├── parser_json.py      # Parseo y validación de JSON
    ├── renderer.py         # Generación de diagrama (Mermaid/CLI)
    ├── handler_preview.py  # Lambda POST /generate/preview
    ├── handler_save.py     # Lambda POST /generate/save
    └── serverless.yml      # Definición de funciones y recursos
```

## 2. Endpoints

### 2.1 POST /generate/preview
- **Propósito:** Compilar código en memoria y devolver imagen base64 sin persistir.
- **Input:**
  ```json
  { "code": "...texto JSON...", "type": "json", "format": "svg", "token": "<JWT>" }
  ```
- **Flujo:**
  1. Validar token y extraer `user_id` (reusar Lambda_ValidarTokenAcceso).
  2. `parser_json.load` + `parser_json.validate` → AST/objeto.
  3. `parser_json.to_ir` → IR genérico.
  4. `renderer.from_ir(ir, format)` → cadena Mermaid o SVG.
  5. Convertir a base64 y devolver `{ "image": "data:image/svg+xml;base64,..." }`.

### 2.2 POST /generate/save
- **Propósito:** Generar y almacenar diagrama en S3 y metadatos en DynamoDB.
- **Input:**
  ```json
  { "code": "...texto JSON...", "type": "json", "format": "svg", "token": "<JWT>" }
  ```
- **Flujo:**
  1. Validar token y obtener `user_id`.
  2. Mismo parseo y renderizado que en preview.
  3. Generar `diagram_id` único.
  4. Guardar en S3 bajo `h_diagrams/{user_id}/{diagram_id}/diagram.<ext>` y `source.txt`.
  5. Registrar en DynamoDB `h_diagrams` (PK=user_id, SK=diagram_id, attrs...).
  6. Devolver `{ "diagram_id": "...", "url": "https://...s3.amazonaws.com/..." }`.

### 2.3 GET /diagrams/{user_id}
- **Propósito:** Listar diagramas guardados por usuario.
- **Flujo:** Query DynamoDB `h_diagrams` por Partition Key `user_id`.
- **Output:** Lista de objetos `{ diagram_id, created_at, type, url }`.

### 2.4 GET /diagrams/{user_id}/{diagram_id}
- **Propósito:** Devolver URL o stream de imagen.
- **Flujo:** GetItem DynamoDB y generar URL firmado S3 o redirigir.

## 3. Recursos AWS
- **S3**: Buckets `frontend-<env>` y `diagramas-<env>`.
- **DynamoDB**: Tabla `h_diagrams` (PK=user_id, SK=diagram_id).
- **Lambda**: Funciones `preview` y `save`, fuera de VPC para baja latencia.
- **API Gateway**: Rutas públicas y protegidas con token.

## 4. Seguridad y Multitenancy
- Todas las funciones protegidas validan `token` y usan `user_id` en Partition Key.
- No se exponen datos entre usuarios.
- Tokens con expiración y stored en DynamoDB `h_tokens_access`.


---

