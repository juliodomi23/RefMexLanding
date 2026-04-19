# REFMEX Landing Page - PRD

## Problema Original
Landing page para REFMEX (Red de Estudios Fiscales de México) con contenido completo de servicios fiscales, contables y legales.

## Usuario Solicitante
Cliente REFMEX

## Requerimientos Core Implementados ✅
- **Tema:** Azul/Blanco
- **Logo:** Sin fondo blanco
- **WhatsApp Principal:** 529612298120
- **Facebook:** https://www.facebook.com/RefmexRedDeEstudios
- **Selector de Idioma:** Español/English

## Oficinas (Números Actualizados)
1. **Chiapas:** 961 229 8120, 961 128 9177
2. **Nuevo León:** 813 586 5600  
3. **Estado de México:** 557 500 9770

## Secciones Implementadas ✅
1. **Navbar** - Fija con selector de idioma
2. **Hero** - Estadísticas 30+, 3, 13+
3. **Quiénes Somos** - Contenido completo con cita destacada
4. **Valores** - 5 tarjetas + Sección de Ética (principios a-e)
5. **Servicios** - 13 servicios con modales detallados
   - Cada servicio tiene botón "Contratar Servicio" → WhatsApp personalizado
   - REPSE incluye requisitos para Personas Físicas (12) y Morales (13)
6. **Bolsa de Trabajo** - Formulario funcional que guarda en MongoDB
7. **Blog** - 3 categorías en tabs
8. **Contacto** - 2 tarjetas (Chat directo + Agendar Asesoría) + 3 oficinas
9. **Footer** - Modales de Términos, Privacidad, Descargo

## APIs Backend
- POST /api/applications - Aplicaciones de trabajo
- GET /api/applications - Listar aplicaciones
- POST /api/blog/seed - Sembrar artículos
- GET /api/blog - Obtener artículos

## Backlog P1
- [ ] Panel admin para ver aplicaciones de trabajo
- [ ] Editor de artículos de blog (CMS simple)
- [ ] Implementar traducción completa a inglés
- [ ] Sistema de calendario real para agendar citas
- [ ] Formulario de contacto con email

## Fecha: Enero 2025
