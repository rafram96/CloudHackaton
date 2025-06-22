# UTEC Diagram – Hackathon Cloud Computing

## 📌 Descripción del Proyecto
Herramienta **serverless** basada en el concepto _Diagram as Code_ que permite la generación, edición y visualización de diagramas técnicos a partir de definiciones escritas como código.

## 🎯 Objetivo
Diseñar y desarrollar una aplicación web completamente serverless en AWS que proporcione un entorno visual e interactivo para la definición y renderización de diagramas técnicos a partir de código fuente.

## ☁️ Tipos de Diagramas
| Icono | Tipo                  | Descripción                                         |
|-------|-----------------------|-----------------------------------------------------|
| ☁️     | Arquitecturas AWS     | Visualización de soluciones con servicios de AWS    |
| 🗄️     | Diagramas E-R         | Diagramas entidad-relación para bases de datos      |
| 📊     | Estructuras JSON      | Representaciones gráficas de estructuras JSON       |

## 💾 Almacenamiento
Cada diagrama y su código fuente correspondiente se almacenan en Amazon S3, organizados por tipo de diagrama, permitiendo acceso inmediato y descarga para documentación técnica.

---

## ⚙️ Requerimientos Funcionales

### 🖥️ Frontend
- **Autenticación**: página de signup/login.
- **Editor de código**: embebido con validación previa (Monaco/CodeMirror).
- **Entradas de diagrama**:
  - Escritura directa en editor.
  - Subida de archivo `.txt` (opcional).
  - Pegado desde portapapeles.
  - Carga desde URL de GitHub (opcional).
- **Generación**: botón “Generar diagrama” que envía el código al backend.
- **Visualización**: muestra el diagrama tras la generación (SVG/PNG).
- **Exportación**: descarga en PNG, SVG o PDF.
- **Selector**: tipo de diagrama (AWS, JSON).

### ⚡ Backend (API REST)
- **Endpoints protegidos** por token (JWT generado al login).
- **Validación** del formato y contenido del código recibido.
- **Generación** de diagramas usando Diagrams, json2graph, Mermaid, etc.
- **Almacenamiento**: guarda diagrama e input en S3 con identificador único por usuario.
- **Respuesta**: retorna imagen (PNG o SVG) al frontend.
- **Gestión de errores**: respuestas 400/500 con mensajes claros.
- **Endpoint público** (`GET`) para verificar diagramas en S3.
- **Selector de tipo**: permite especificar el tipo de diagrama en la petición.

---

## 🔧 Especificaciones Técnicas

### Requisitos Obligatorios
- Login multitenancy (No Cognito).
- Frontend desplegado en S3 (React/Vite).
- Rutas protegidas con JWT.
- Exposición de APIs con API Gateway.

### 🛠️ Tecnologías Propuestas
| Componente               | Tecnología                               |
|--------------------------|------------------------------------------|
| Lenguaje de diagramas    | Diagrams / ERAlchemy / json2graph / Mermaid |
| Backend (Lambda)         | Python                                    |
| Frontend                 | React / Vite                              |
| API REST                 | API Gateway                               |

---

## 📋 Bases de la Hackathon

**🎯 Objetivo:**
Fomentar el aprendizaje práctico y el trabajo colaborativo en Cloud Computing. Cada equipo debe diseñar y entregar una solución funcional e innovadora.

**👥 Participantes:**
- Alumnos matriculados en Cloud Computing.
- Equipos de 1–3 integrantes (de distintas secciones).
- Inscripción obligatoria.

**📊 Criterios de Evaluación:**
1. Entregables completos.
2. Solución técnica (arquitectura cloud y eficiencia).
3. Avance y esfuerzo demostrados.

> **Nota:** No se espera un producto final perfecto; se evaluará el progreso y el aprendizaje.

## 📦 Entregables
1. **Links**:
   - Solución final.
   - Frontend desplegado.
2. **Repositorio GitHub** con el código.
3. **Endpoint de validación S3** (ruta pública GET).
4. **Diagrama de arquitectura** de la solución.

---
