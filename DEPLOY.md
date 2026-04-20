# Guía de Despliegue — REFMEX

## Requisitos del servidor

- Docker y Docker Compose instalados
- Puerto 80 disponible (o 443 si usas HTTPS)
- Git

---

## 1. Primera vez en el servidor

```bash
git clone <tu-repo-url> refmex
cd refmex
```

Edita las variables de entorno de producción:

```bash
nano backend/.env
```

Cambia estos valores:

```env
MONGO_URL=mongodb://mongo:27017        # NO cambiar, apunta al contenedor
DB_NAME=refmex_db
CORS_ORIGINS=https://tu-dominio.com    # ← tu dominio real
ENVIRONMENT=production

ADMIN_PASSWORD=TuPasswordSeguro123!   # ← cambia esto
ADMIN_TOKEN=un-token-largo-aleatorio  # ← cambia esto
```

Levanta todo:

```bash
docker compose up -d --build
```

La app queda disponible en `http://tu-servidor`.

---

## 2. Actualizar el sitio

```bash
git pull
docker compose up -d --build
```

Los datos de MongoDB se conservan en un volumen persistente — no se borran al actualizar.

---

## 3. Conectar Calendly

1. Crea cuenta en [calendly.com](https://calendly.com)
2. Crea un tipo de evento (ej: *Asesoría REFMEX — 30 min*)
3. Copia tu URL (ej: `https://calendly.com/tu-usuario/asesoria`)
4. Edita `frontend/src/App.js` línea ~22:
   ```js
   const CALENDLY_URL = "https://calendly.com/tu-usuario/asesoria";
   ```
5. Redespliega: `docker compose up -d --build`

---

## 4. Administración del Blog

Accede al panel de admin desde el sitio:

- Abre `https://tu-dominio.com/#blog-admin`
- O haz clic en el link **Administración** al pie de la página (casi invisible, se ilumina al pasar el cursor)
- Ingresa con la contraseña definida en `ADMIN_PASSWORD` del `.env`

Desde ahí puedes crear, editar y eliminar artículos del blog sin tocar código.

---

## 5. Comandos útiles

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver logs solo del backend
docker compose logs -f backend

# Reiniciar un servicio
docker compose restart backend

# Detener todo
docker compose down

# Detener y borrar datos (¡cuidado!)
docker compose down -v
```

---

## 6. Agregar HTTPS (recomendado para producción)

Con Certbot + nginx en el servidor host:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d tu-dominio.com
```

O usa Cloudflare como proxy con SSL automático (opción más sencilla).

---

## 7. Variables de entorno — referencia completa

| Variable | Descripción | Ejemplo |
|---|---|---|
| `MONGO_URL` | Conexión a MongoDB | `mongodb://mongo:27017` |
| `DB_NAME` | Nombre de la base de datos | `refmex_db` |
| `CORS_ORIGINS` | Dominios permitidos | `https://refmex.com` |
| `ENVIRONMENT` | Entorno (`development` / `production`) | `production` |
| `ADMIN_PASSWORD` | Contraseña del panel de blog | `MiPassword123!` |
| `ADMIN_TOKEN` | Token secreto para operaciones CRUD | `token-largo-aleatorio` |
