# Tablas DynamoDB

### h_users
- Partition Key: `user_id` (String)
- Atributos: 
  - `email` (String)
  - `hash_password` (String)
  - `tenant_id` (String)

### h_diagrams
- Partition Key: `owner_id` (String)
- Sort Key: `diagram_id` (String)
- Atributos:
  - `type` (String) — `aws`, `er`, `json`
  - `created_at` (String, ISO 8601 timestamp)
  - `source_code_s3key` (String)
  - `image_s3key` (String)
  - `format` (String) — SVG, PNG o PDF
  - `status` (String) — `pending`, `success`, `error`
  - `error_message` (String)

### h_tokens_access
- Partition Key: `token` (String)
- Atributos:
  - `expires` (String, ISO 8601 timestamp)

---
