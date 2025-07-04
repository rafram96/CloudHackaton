# Definición del Modelo de Datos

## 1. Entidades Principales
- **Usuario**: atributos básicos (user_id, nombre, email, hash_password, tenant_id).
- **Diagrama**: identificador, tipo (AWS, ER, JSON), timestamp de creación, owner_id, nombre, descripción.
- **Metadata de Diagrama**: formato de salida (SVG, PNG o PDF), estado (pendiente, generado, error) y mensaje de error.  
  El código fuente se almacena en S3 como texto (`.txt`) y las imágenes generadas en rutas separadas (`.svg`/`.png`).

## 2. Atributos y Tipos de Datos
| Entidad  | Atributo           | Tipo         | Descripción                                 |
|----------|--------------------|--------------|---------------------------------------------|
| Usuario  | user_id            | String (PK)  | Identificador único de usuario              |
| Diagrama | diagram_id         | String (PK)  | Identificador único de diagrama             |
| Diagrama | owner_id           | String (GSI) | user_id del creador                         |
| Diagrama | type               | String       | Tipo de diagrama (`aws`, `er`, `json`)     |
| Diagrama | created_at         | String       | Timestamp ISO 8601                          |
| Diagrama | source_code_s3key  | String       | Ruta al código en S3 (`.txt`)               |
| Diagrama | image_s3key        | String       | Ruta a la imagen generada en S3 (`.svg`/`.png`)
| Metadata | format             | String       | Formato de salida solicitado (SVG, PNG, PDF)|
| Metadata | status             | String       | `pending`, `success`, `error`               |
| Metadata | error_message      | String       | Descripción en caso de fallo                |

## 3. Relaciones y Accesos
- Un Usuario puede tener muchos Diagramas (1:N).
- Diagrama pertenece a un solo Usuario.

## 4. Índices y Consultas
- Índice por `owner_id` para listar diagramas de un usuario.
- Índice por `type` para filtrar por tipo de diagrama.
- Índice compuesto (owner_id, created_at) para paginación.

## 5. Esquema de Almacenamiento en S3
- Bucket: `diagramas-<env>`
- Prefijo por usuario: `/{owner_id}/{diagram_id}/`  
  - `source.txt`  
  - `diagram.svg`  
  - `diagram.png`

## 6. Políticas de Seguridad y Retención
- Encriptación en reposo y en tránsito.
- TTL o limpieza automática de diagramas antiguos (opcional).

## 7. Librerías Recomendadas
- Frontend:
  - React, Vite
  - mermaid (renderizado de diagramas en cliente)
  - file-saver (exportar PNG/SVG/PDF)
- Backend (Python Lambda):
  - diagrams (mingrammer)  
  - ERAlchemy (diagramas E-R)
  - json2graph (estructuras JSON)
  - Pillow o reportlab (conversión a PNG/PDF)

---
