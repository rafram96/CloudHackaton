# Generate Service API

Este documento describe brevemente los endpoints disponibles en el **generate-service**:

## POST /generate/preview

- Descripción: Valida el token de acceso, parsea y valida el JSON de entrada, convierte a sintaxis **Mermaid** y devuelve el código a renderizar en el cliente.
- URL ejemplo: `https://<tu-gateway>/generate/preview`
- Headers:
  - `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "code": "{ ... }",
    "type": "json",
    "format": "svg",
    "token": "<token-de-acceso>"
  }
  ```
- Response (200):
  ```json
  { "diagram": "graph TD\nA-->B\n..." }
  ```

## POST /generate/save

- Descripción: Valida el token, genera el diagrama (Mermaid → PNG/SVG), lo guarda en S3 y registra metadata en DynamoDB. Devuelve la URL pública y el `diagram_id`.
- URL ejemplo: `https://<tu-gateway>/generate/save`
- Headers:
  - `Content-Type: application/json`
- Body (JSON):
  ```json
  {
    "code": "{ ... }",
    "type": "json",
    "format": "svg",
    "token": "<token-de-acceso>"
  }
  ```
- Response (200):
  ```json
  {
    "diagram_id": "<uuid>",
    "url": "https://<bucket>.s3.amazonaws.com/<owner_id>/<diagram_id>/diagram.svg"
  }
  ```

> **Nota**: ambos endpoints tienen habilitado CORS (`Access-Control-Allow-Origin: *`) y dependen de la capa `extraLibs` para ejecutar `mmdc` (Mermaid CLI) contra la sintaxis generada.
