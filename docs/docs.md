# UTEC Diagram - Hackathon Cloud Computing

## Introduction
El presente documento describe la propuesta para el reto **UTEC Diagram**, una herramienta basada en el concepto **Diagrams ad Code**, que permite la generación, edición y visualización de diagramas técnicos a partir de definiciones escritas como código. La aplicación será una solución serverless que incluirá una interfaz web interactiva. Esta iniciativa busca facilitar la documentación técnica, automatizar la creación de diagramas (como arquitecturas en la nube, diagramas entidad-telación y visualizaciones de estructuras JSON), y mejorar la trazabilidad en proyectos de software e infraestructura.

## Objetivo del proyecto
Diseñar y desarrollar una aplicación web completamente serverless, basada en la infraestructura de AWS, que proporcione un entorno visual e interactivo para la definición y renderización de diagramas técnicos a partir de código fuente. Esta herramienta permitirá generar tres tipos principales de visualizaciones: arquitecturas de soluciones con servicios de AWS, diagramas entidad-telación (ER) y estructuras JSON representadas gráficamente.

Cada diagrama y su código fuente correspondiente serán almacenados en buckets de Amazon SS, organizados por tipo de diagrama, permitiendo así su acceso inmediato y la posibilidad de descarga para documentación técnica.

## Requerimientos funcionales

### Frontend
- Página de signuplogin para autenticación en la web.
- El usuario puede escrito: código en un editor embebido.
- El usuario puede subir un archivo con la definición del diagrama (.txt) (opcional).
- El usuario puede pegar texto desde el portapageles.
- Hay un botón "General diagram" que envía el código al backend.
- El diagrama se muestra solo después de presionar "General".
- El usuario puede visualizar el diagrama como imagen (SVG o PNG).
- Se permite exportar el diagrama en PNG, SVG o PDF.
- El usuario puede seleccionar el tipo de diagrama (AWS, ER, etc.).
- Cada tipo de diagrama recibe un input distinto.
- El frontend valida que haya código antes de enviarlo.
- El usuario puede cargar código desde una URL de GitHub (opcional).

# Backend (Api REST)

- Reche peliciones con código fuente enviado desde el frontend.
- Rutas protegidas por token generado en login.
- Valida el formato y contenido del código recibido.
- Genera el diagrama a partir del código usando una herramienta de diagramación (ej. Diagrams_ERA\cheny, etc.).
- Diagramas y código fuente se guardan en bucket S3 con identificación único por usuario.
- Reforma el diagrama como imagen (PNG o SXQ) al frontend.
- Permite especificar el tipo de diagrama solicitado (ej. arquitectura AWS, ER, etc.).
- Maneja errores de parsing o generación y responde con mensajes claros (**400/500**).

---

## Especificaciones:

- **El login debe ser multitenancy.**
- **El frontend debe estar en S3.**
- **Rutas totalmente protegidas por token.**
- **Uso de api gateway para la exposición de las apis.**

---

## Tecnologías propuestas

| Componente    | Tecnología    |
|---|---|
| Lenguaje de diagramas (propuestos) | Diagrams / ERA\cheny / ISO2\qngp0 / Mermaid |
| Backend (generador)    | Python en Lambda    |
| Frontend    | React / Vite en S3    |
| Api REST    | Api Gateway    |








---
SCOPE ESPERADO: EN UN LADO CÓDIGO Y EN OTRO LADO SE GENERA LA IMAGEN (poder guardar la imagen)
API-GATEWAY: Debe tener una ruta desprotegida para que puedan hacer un get a los diagramas y verificar que se están creando en el s3
Hacer propio diagrama de arquitectura de solución
