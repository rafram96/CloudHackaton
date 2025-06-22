# UTEC Diagram - Hackathon Cloud Computing

## 📌 Descripción del Proyecto
Herramienta **serverless** basada en **Diagram as Code** para generación, edición y visualización de diagramas técnicos desde código.

## 🎯 Objetivo
Desarrollar aplicación web serverless en AWS para:
- Definición interactiva de diagramas técnicos
- Renderización desde código fuente
- Soporte para 3 tipos de diagramas:

### ☁️ Tipos de Diagramas
| Icono | Tipo | Descripción |
|-------|------|-------------|
| ☁️ | Arquitecturas AWS | Visualización de soluciones con servicios AWS |
| 🗄️ | Diagramas E-R | Diagramas entidad-relación para bases de datos |
| 📊 | Estructuras JSON | Representaciones gráficas de estructuras JSON |

**Almacenamiento:** Diagramas y código fuente en Amazon S3 organizados por tipo.

## ⚙️ Requerimientos Funcionales

### 🖥️ Frontend
- Autenticación (signup/login)
- Editor de código embebido
- Opciones de entrada:
  - Escritura directa
  - Subida de archivo .txt (opcional)
  - Pegado desde portapapeles
  - Carga desde GitHub (opcional)
- Botón "Generar diagrama"
- Visualización (SVG/PNG)
- Exportación (PNG/SVG/PDF)
- Selector de tipo de diagrama
- Validación previa al envío

### ⚡ Backend (API REST)
- Endpoints protegidos por token
- Validación de código
- Generación de diagramas con:
  - Diagrams
  - ERAlchemy
  - Otras herramientas
- Almacenamiento en S3 (diagramas + código)
- Retorno de imágenes (PNG/SVG)
- Manejo de errores (400/500)

## 🔧 Especificaciones Técnicas
| Requisito | Tecnología |
|-----------|------------|
| Login multitenancy | Cognito |
| Frontend en S3 | React/Vite |
| Protección de rutas | JWT Tokens |
| Exposición APIs | API Gateway |

## 🛠️ Stack Tecnológico
| Componente | Tecnología |
|------------|------------|
| Lenguajes diagramación | Diagrams/ERAlchemy/json2graph/Mermaid |
| Backend | Python (Lambda) |
| Frontend | React/Vite |
| API | API Gateway |

## 📋 Bases del Evento
**Objetivo:** Fomentar aprendizaje práctico y colaborativo en Cloud Computing.

**👥 Participantes:**
- Estudiantes de Cloud Computing
- Equipos de 1-3 personas
- Registro obligatorio

**📊 Criterios Evaluación:**
1. Entregables completos
2. Solución técnica (arquitectura/eficiencia)
3. Avance demostrado

**💡 Nota:** Se valora el progreso, no necesariamente producto final.

## 📦 Entregables Obligatorios
1. Links:
   - Solución final
   - Frontend desplegado
2. Repositorio GitHub
3. Endpoint validación S3
4. Diagrama de arquitectura

---
SCOPE ESPERADO: EN UN LADO CÓDIGO Y EN OTRO LADO SE GENERA LA IMAGEN (poder guardar la imagen)
API-GATEWAY: Debe tener una ruta desprotegida para que puedan hacer un get a los diagramas y verificar que se están creando en el s3
Hacer propio diagrama de arquitectura de solución