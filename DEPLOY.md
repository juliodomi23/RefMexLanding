# Guía de Deploy en EasyPanel

Guía basada en el deploy de RefMex. Usar como referencia para futuros proyectos con la misma arquitectura (React + FastAPI + MongoDB).

## Arquitectura

```
Internet → EasyPanel (Traefik) → frontend (nginx:80)
                                       ↓ proxy /api
                               backend (FastAPI:8001)
                                       ↓
                               mongo (MongoDB:27017)
```

El frontend sirve la app React Y hace de proxy al backend en `/api`. El usuario solo ve un solo dominio.

---

## Archivos clave — copiar igual en cada proyecto nuevo

### docker-compose.yml

Reglas importantes para EasyPanel:
- **Sin** `ports:` en ningún servicio (Traefik maneja el enrutamiento)
- **Con** la red `easypanel` externa en frontend y backend (sin esto hay 502)
- Variables sensibles con `${VAR}` (se configuran en la UI de EasyPanel)

```yaml
services:

  mongo:
    image: mongo:7
    restart: unless-stopped
    volumes:
      - mongo_data:/data/db

  backend:
    build: ./backend
    restart: unless-stopped
    environment:
      MONGO_URL: mongodb://mongo:27017
      DB_NAME: nombre_db
      CORS_ORIGINS: "*"
      ENVIRONMENT: production
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      ADMIN_TOKEN: ${ADMIN_TOKEN}
    depends_on:
      - mongo
    networks:
      - default
      - easypanel

  frontend:
    build: ./frontend
    restart: unless-stopped
    depends_on:
      - backend
    networks:
      - default
      - easypanel

networks:
  easypanel:
    external: true

volumes:
  mongo_data:
```

### frontend/nginx.conf

El `resolver 127.0.0.11` es el DNS interno de Docker. Sin él, nginx cachea el backend al arrancar y falla si el backend no estaba listo todavía.

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        resolver 127.0.0.11 valid=10s;
        set $backend http://backend:8001;
        proxy_pass $backend;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_read_timeout 60s;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### backend/Dockerfile

Fijar `pymongo==4.8.0` — versiones más nuevas rompen `motor 3.3.1`.

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir \
    fastapi==0.110.1 \
    uvicorn==0.25.0 \
    python-dotenv>=1.0.1 \
    motor==3.3.1 \
    pymongo==4.8.0 \
    pydantic>=2.6.4 \
    python-multipart>=0.0.9 \
    email-validator>=2.2.0 \
    python-jose>=3.3.0 \
    bcrypt==4.1.3 \
    passlib>=1.7.4
COPY server.py .
EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

---

## Pasos para hacer el deploy

### 1. Subir el código a GitHub
El repo debe ser público o EasyPanel debe tener acceso configurado.

### 2. Crear el proyecto en EasyPanel

1. Entrar a EasyPanel → **New Project** → ponerle nombre al cliente
2. Dentro del proyecto → **+ Service** → **App**
3. Elegir **Docker Compose** como fuente → conectar el repo de GitHub
4. EasyPanel detecta el `docker-compose.yml` automáticamente

### 3. Configurar variables de entorno

En EasyPanel, dentro del proyecto, agregar las siguientes variables. **Sin espacios alrededor del `=`** o no se leen bien.

| Variable | Valor |
|----------|-------|
| `ADMIN_PASSWORD` | contraseña para el panel admin del blog |
| `ADMIN_TOKEN` | token largo y random (usar un UUID) |
| `DB_NAME` | nombre de la base de datos (ej. `refmex`) |
| `CORS_ORIGINS` | `*` |

### 4. Deploy

Clic en el botón verde **Deploy**. EasyPanel hace build de las imágenes y levanta los 3 contenedores.

Primera vez tarda ~3-5 minutos (build de React + dependencias de Python).

### 5. Verificar que funciona

- El dominio asignado por EasyPanel (ej. `https://cliente.servidor.easypanel.host`) debe cargar el sitio
- Entrar a `https://dominio/#blog-admin` para verificar el admin del blog

---

## Actualizaciones después del deploy

Cada vez que haya cambios en el código:

1. Hacer `git push` al repo de GitHub
2. En EasyPanel clic en **Deploy** (botón verde) — esto hace rebuild completo
3. EasyPanel NO tiene "hot reload", siempre hay que hacer Deploy manualmente

> Los datos de MongoDB se conservan en el volumen `mongo_data` — no se borran al redesplegar.

---

## Admin del Blog

- URL: `https://tu-dominio/#blog-admin`
- O clic en el link "Administración" al pie de la página (casi invisible, se ilumina al pasar el cursor)
- Contraseña: la definida en `ADMIN_PASSWORD`

Desde ahí se crean, editan y eliminan artículos sin tocar código.

---

## Errores comunes y solución

| Error | Causa | Solución |
|-------|-------|----------|
| `port is already allocated` | Se usó `ports:` en el compose | Quitar `ports:`, EasyPanel maneja el enrutamiento |
| `502` en el dominio | Traefik no llega al contenedor | Agregar red `easypanel` externa en el compose |
| `no live upstreams` en nginx | nginx cacheó DNS al arrancar | Agregar `resolver 127.0.0.11` en nginx.conf |
| `ImportError: _QUERY_OPTIONS` | Incompatibilidad motor/pymongo | Fijar `pymongo==4.8.0` en Dockerfile |
| `KeyError: DB_NAME` | Variable de entorno no llegó | Revisar que no haya espacios en las vars de EasyPanel |

---

## Variables de entorno — referencia completa

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGO_URL` | Conexión a MongoDB (no cambiar) | `mongodb://mongo:27017` |
| `DB_NAME` | Nombre de la base de datos | `refmex` |
| `CORS_ORIGINS` | Dominios permitidos | `*` |
| `ENVIRONMENT` | Entorno | `production` |
| `ADMIN_PASSWORD` | Contraseña del panel de blog | `MiPassword123!` |
| `ADMIN_TOKEN` | Token secreto para operaciones CRUD | `uuid-largo` |
