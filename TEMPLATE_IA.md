# Template: Landing Page Profesional (React + FastAPI + MongoDB)

Usa este archivo como prompt para una IA. Rellena todas las secciones marcadas con `[ ]` antes de pegarlo.

---

## PROMPT PARA LA IA

Quiero que construyas una landing page profesional basada en la arquitectura y estructura de REFMEX Landing. La stack es:

- **Frontend:** React (Create React App), Tailwind CSS, Framer Motion, shadcn/ui, Lucide React
- **Backend:** FastAPI + MongoDB (Motor)
- **Deploy:** Docker Compose en EasyPanel (nginx como proxy)

El proyecto tiene esta estructura de carpetas:
```
proyecto/
├── frontend/
│   ├── src/
│   │   ├── App.js          ← toda la UI
│   │   ├── translations.js ← textos ES/EN
│   │   ├── App.css         ← estilos custom
│   │   └── components/ui/  ← componentes shadcn
│   ├── nginx.conf
│   └── Dockerfile
├── backend/
│   ├── server.py
│   └── Dockerfile
└── docker-compose.yml
```

---

## DATOS DEL CLIENTE — rellenar antes de pegar

### 1. Identidad de la empresa

```
Nombre completo:        [ Ej: Consultoría Ríos y Asociados ]
Nombre corto / siglas:  [ Ej: CRA ]
Slogan principal:       [ Ej: "Tu aliado en cada decisión financiera" ]
Slogan secundario:      [ Ej: "Ayudamos a empresas a crecer con estrategia y confianza" ]
Descripción breve:      [ 2-3 líneas de quiénes son ]
Año de fundación:       [ Ej: 2010 ]
```

### 2. Colores de marca

```
Color primario (hex):   [ Ej: #1e40af — azul ]
Color secundario (hex): [ Ej: #0f172a — azul oscuro ]
Color acento (hex):     [ Ej: #3b82f6 — azul claro ]
Estilo general:         [ Ej: serio/profesional, moderno, cálido, minimalista ]
```

### 3. Contacto y redes

```
WhatsApp principal:     [ número con código de país, ej: 529612298120 ]
Mensaje WhatsApp:       [ Ej: "Hola, me gustaría obtener más información sobre sus servicios" ]
Facebook URL:           [ Ej: https://www.facebook.com/NombreEmpresa ]
Instagram URL:          [ Ej: https://www.instagram.com/NombreEmpresa ] (o dejar vacío)
LinkedIn URL:           [ Ej: https://www.linkedin.com/company/nombre ] (o dejar vacío)
Email de contacto:      [ Ej: contacto@empresa.com ]
Calendly URL:           [ Ej: https://calendly.com/empresa/ ] (o dejar vacío)
```

### 4. Oficinas / ubicaciones

```
Oficina 1:
  Ciudad/Estado:  [ Ej: Ciudad de México ]
  Dirección:      [ Ej: Av. Insurgentes Sur 1234, Col. Del Valle ]
  Teléfono(s):    [ Ej: 55 1234 5678 ]
  Email:          [ Ej: cdmx@empresa.com ]

Oficina 2:  (si aplica)
  Ciudad/Estado:  [ ]
  Dirección:      [ ]
  Teléfono(s):    [ ]
  Email:          [ ]

Oficina 3:  (si aplica)
  Ciudad/Estado:  [ ]
  Dirección:      [ ]
  Teléfono(s):    [ ]
  Email:          [ ]
```

### 5. Estadísticas del hero

```
Estadística 1: valor [ Ej: 15+ ] — etiqueta [ Ej: Años de experiencia ]
Estadística 2: valor [ Ej: 200+ ] — etiqueta [ Ej: Clientes atendidos ]
Estadística 3: valor [ Ej: 8 ]   — etiqueta [ Ej: Servicios especializados ]
```

### 6. Quiénes somos

```
Párrafo 1: [ Historia o origen de la empresa ]
Párrafo 2: [ Filosofía o enfoque de trabajo ]
Párrafo 3: [ Experiencia del equipo ]
Párrafo 4: [ Propuesta de valor diferenciadora ]
Cita destacada: [ Una frase representativa de la empresa ]

Características clave (4 items con ícono):
  1. Título: [ Ej: Experiencia ] — Descripción: [ Ej: +15 años en el sector ]
  2. Título: [ Ej: Equipo ]     — Descripción: [ Ej: Profesionales certificados ]
  3. Título: [ Ej: Presencia ]  — Descripción: [ Ej: 3 estados de la República ]
  4. Título: [ Ej: Calidad ]    — Descripción: [ Ej: Estándares internacionales ]
```

### 7. Nuestro compromiso (sección debajo de Quiénes somos)

```
Párrafo 1: [ Ej: Nuestro propósito es... ]
Párrafo 2: [ Ej: Colaboramos con nuestros clientes para... ]
```

### 8. Valores de la empresa

```
Valor 1:
  Título: [ Ej: Integridad ]
  Descripción: [ 2-3 oraciones ]

Valor 2:
  Título: [ Ej: Compromiso ]
  Descripción: [ 2-3 oraciones ]

Valor 3:
  Título: [ Ej: Innovación ]
  Descripción: [ 2-3 oraciones ]

Valor 4:
  Título: [ Ej: Confidencialidad ]
  Descripción: [ 2-3 oraciones ]

Valor 5:
  Título: [ Ej: Excelencia ]
  Descripción: [ 2-3 oraciones ]
```

### 9. Servicios

Para cada servicio necesito:
```
Servicio 1:
  Nombre:       [ Ej: Auditoría Fiscal ]
  Descripción corta: [ 1 línea para la card ]
  Descripción larga: [ 3-5 párrafos para el modal de detalle ]
  Requisitos personas físicas: [ lista de documentos, si aplica ]
  Requisitos personas morales: [ lista de documentos, si aplica ]

Servicio 2: [ repetir estructura ]
...
```

### 10. Bolsa de trabajo

```
¿Tiene sección de empleo?: [ Sí / No ]
Puestos disponibles (lista):
  - [ Ej: Contador Senior ]
  - [ Ej: Especialista Fiscal ]
  - [ ... ]
¿Por qué trabajar con nosotros? (4 puntos):
  - [ Ej: Ambiente de trabajo colaborativo ]
  - [ ... ]
```

### 11. Blog

```
¿Tiene blog?: [ Sí / No ]
Categorías de artículos (máx 3):
  - Categoría 1: [ Ej: Empresarios ] — slug: [ empresarios ]
  - Categoría 2: [ Ej: Profesionales ] — slug: [ profesionales ]
  - Categoría 3: [ Ej: Personas físicas ] — slug: [ personas-fisicas ]
```

### 12. Idiomas

```
¿Requiere versión en inglés?: [ Sí / No ]
```

### 13. Logo

```
Formato del logo: [ PNG con fondo transparente recomendado ]
URL o ruta del logo: [ pegar URL o indicar que se sustituirá después ]
Imagen del equipo / hero: [ URL de imagen o indicar que se usará Unsplash ]
```

---

## INSTRUCCIONES PARA LA IA

Con todos los datos anteriores, construye el proyecto completo siguiendo estas reglas:

### Frontend (App.js)
- Mantener la misma arquitectura de componentes: `NavBar`, `HeroSection`, `AboutSection`, `ValuesSection`, `ServicesSection`, `JobsSection`, `BlogSection`, `ContactSection`, `Footer`
- Cada sección es un componente React independiente
- Los textos van en `translations.js` separados del JSX, con soporte ES e EN
- Usar `text-justify` en párrafos de contenido
- Títulos de secciones con primera letra mayúscula, resto minúscula
- Títulos de cards en negrita (`font-bold`)
- Animaciones con Framer Motion (`whileInView` + `opacity/y`)
- Las cards de servicios abren un modal con el detalle completo
- Las cards del blog abren un modal con el contenido completo del artículo
- El botón de WhatsApp es flotante y siempre visible

### Paleta de colores
- Reemplazar `blue-600`, `blue-700`, `blue-50` con los colores del cliente
- Si el color primario no es azul, actualizar también las clases de `text-blue-*`, `bg-blue-*`, `border-blue-*`

### Backend (server.py)
- Mantener los endpoints: `GET/POST /api/blog`, `GET/POST /api/applications`, `POST /api/blog/seed`
- El seed debe hacer upsert por título (no duplicar si ya existe)
- El endpoint `/api/blog/seed` requiere autenticación con `ADMIN_TOKEN`
- Incluir los 6 artículos del blog con contenido completo (no truncado)

### Variables de entorno necesarias
```
MONGO_URL=mongodb://mongo:27017
DB_NAME=nombre_del_cliente
ADMIN_PASSWORD=contraseña_panel_blog
ADMIN_TOKEN=uuid-largo-y-random
CORS_ORIGINS=*
ENVIRONMENT=production
```

### Lo que NO debe cambiar
- La estructura del `docker-compose.yml` (sin `ports:`, con red `easypanel`)
- El `nginx.conf` con `resolver 127.0.0.11`
- El `backend/Dockerfile` con `pymongo==4.8.0`
- El patrón de modal para servicios y blog

---

## CHECKLIST ANTES DE HACER DEPLOY

- [ ] Cambié el nombre de la empresa en `translations.js`
- [ ] Actualicé los colores en `App.css` y clases de Tailwind en `App.js`
- [ ] Puse el logo correcto en la ruta `frontend/public/` y lo referencié en el NavBar
- [ ] Actualicé el número de WhatsApp en la constante `WHATSAPP_URL`
- [ ] Actualicé la URL de Facebook/redes sociales
- [ ] Actualicé la URL de Calendly (o la eliminé si no aplica)
- [ ] Verifiqué que las oficinas y teléfonos son correctos
- [ ] El blog tiene contenido completo (no truncado)
- [ ] El `DB_NAME` en `docker-compose.yml` es único para este cliente
- [ ] Las variables de entorno están configuradas en EasyPanel
- [ ] Hice `git push` y le di Deploy en EasyPanel
- [ ] Entré a `/#blog-admin` y verifiqué el panel de administración
- [ ] Llamé a `POST /api/blog/seed` con el ADMIN_TOKEN para poblar el blog

---

## REFERENCIA: Guía de Deploy

Ver `DEPLOY.md` en la raíz del proyecto. Contiene la guía completa paso a paso para EasyPanel, errores comunes y sus soluciones.
