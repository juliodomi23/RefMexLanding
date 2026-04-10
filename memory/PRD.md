# REFMEX Landing Page - PRD

## Problema Original
Construir landing page para REFMEX (Red de Estudios Fiscales de México) - servicios fiscales, contables y legales con diseño premium azul/blanco.

## Usuario Solicitante
Cliente REFMEX

## Requerimientos Core
- Landing page single-page con navegación smooth scroll
- **Tema: Azul/Blanco** (cambiado de negro/dorado)
- Logo sin fondo blanco
- Integración WhatsApp: 529611807499
- Facebook: https://www.facebook.com/RefmexRedDeEstudios
- 3 oficinas: Chiapas, Nuevo León, Estado de México

## Arquitectura
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Backend**: FastAPI + MongoDB
- **Componentes**: Shadcn/UI (tabs, select, toast)

## Implementado ✅
- [x] Navbar fija con smooth scroll
- [x] Hero con logo, estadísticas (30+, 3, 12+), CTAs
- [x] Sección Quiénes Somos con tarjeta flotante azul
- [x] Sección Valores (5 tarjetas)
- [x] Sección Servicios (13 servicios en grid)
- [x] Bolsa de Trabajo con formulario funcional (guarda en MongoDB)
- [x] Blog con 3 categorías en tabs (administrable)
- [x] Contacto con 3 oficinas + links Maps
- [x] Footer con Facebook correcto
- [x] Botón flotante WhatsApp funcionando
- [x] Responsive design

## APIs Backend
- POST /api/applications - Crear aplicación de trabajo
- GET /api/applications - Obtener aplicaciones
- POST /api/blog/seed - Sembrar artículos
- GET /api/blog - Obtener artículos
- GET /api/blog?category=X - Filtrar por categoría

## Backlog P1
- [ ] Panel admin para ver aplicaciones de trabajo
- [ ] Editor de artículos de blog
- [ ] Página de términos de uso completa
- [ ] Página de política de privacidad
- [ ] Multi-idioma (traducción)

## Fecha: Enero 2025
