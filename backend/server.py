from fastapi import FastAPI, APIRouter, UploadFile, File, Form, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import hmac
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import base64
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Job Application Models
class JobApplication(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nombre: str
    edad: int
    puesto: str
    grado_academico: Optional[str] = None
    salario_deseado: Optional[str] = None
    cv_filename: Optional[str] = None
    cv_data: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class JobApplicationResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    nombre: str
    edad: int
    puesto: str
    grado_academico: Optional[str] = None
    salario_deseado: Optional[str] = None
    cv_filename: Optional[str] = None
    created_at: datetime
    status: str = "pendiente"

# Blog Models
class BlogArticle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    excerpt: str
    content: str
    category: str  # empresarios, fiscalistas, asalariados
    image_url: Optional[str] = None
    read_time: str = "5 min"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class BlogArticleCreate(BaseModel):
    title: str
    excerpt: str
    content: str
    category: str
    image_url: Optional[str] = None
    read_time: str = "5 min"

class BlogArticleUpdate(BaseModel):
    title: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    image_url: Optional[str] = None
    read_time: Optional[str] = None

class AdminLogin(BaseModel):
    password: str


# Auth helpers
async def verify_admin(x_admin_token: Optional[str] = Header(None)):
    expected = os.environ.get("ADMIN_TOKEN")
    if not expected or not x_admin_token or not hmac.compare_digest(x_admin_token, expected):
        raise HTTPException(status_code=401, detail="No autorizado")


async def send_application_email(nombre, edad, puesto, grado_academico, salario_deseado, cv_filename, cv_content):
    smtp_host = os.environ.get("SMTP_HOST")
    smtp_port = int(os.environ.get("SMTP_PORT", 587))
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    smtp_from = os.environ.get("SMTP_FROM", smtp_user)
    notify_email = os.environ.get("NOTIFY_EMAIL", "contacto@refmex.com")

    if not all([smtp_host, smtp_user, smtp_password]):
        logging.warning("SMTP no configurado, se omite envío de correo")
        return

    msg = MIMEMultipart()
    msg["From"] = smtp_from
    msg["To"] = notify_email
    msg["Subject"] = f"Nueva postulación: {puesto} — {nombre}"

    body = f"""
Nueva postulación recibida en REFMEX

Nombre:           {nombre}
Edad:             {edad}
Puesto solicitado: {puesto}
Grado académico:  {grado_academico or 'No especificado'}
Salario deseado:  {salario_deseado or 'No especificado'}
CV adjunto:       {'Sí — ' + cv_filename if cv_filename else 'No'}
    """.strip()

    msg.attach(MIMEText(body, "plain"))

    if cv_content and cv_filename:
        part = MIMEBase("application", "octet-stream")
        part.set_payload(cv_content)
        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f'attachment; filename="{cv_filename}"')
        msg.attach(part)

    try:
        import aiosmtplib
        await aiosmtplib.send(msg, hostname=smtp_host, port=smtp_port, username=smtp_user, password=smtp_password, start_tls=True)
    except ImportError:
        logging.warning("aiosmtplib no instalado, se omite envío de correo")
    except Exception as e:
        logging.error(f"Error enviando correo de postulación: {e}")


# Routes
@api_router.get("/")
async def root():
    return {"message": "REFMEX API - Red de Estudios Fiscales de México"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# Job Applications Routes
@api_router.post("/applications")
async def create_job_application(
    nombre: str = Form(...),
    edad: int = Form(...),
    puesto: str = Form(...),
    grado_academico: str = Form(None),
    salario_deseado: str = Form(None),
    cv: UploadFile = File(None)
):
    application_id = str(uuid.uuid4())
    cv_filename = None
    cv_data = None
    
    if cv:
        cv_content = await cv.read()
        cv_filename = cv.filename
        cv_data = base64.b64encode(cv_content).decode('utf-8')
    
    doc = {
        "id": application_id,
        "nombre": nombre,
        "edad": edad,
        "puesto": puesto,
        "grado_academico": grado_academico,
        "salario_deseado": salario_deseado,
        "cv_filename": cv_filename,
        "cv_data": cv_data,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.job_applications.insert_one(doc)

    raw_cv = base64.b64decode(cv_data) if cv_data else None
    await send_application_email(nombre, edad, puesto, grado_academico, salario_deseado, cv_filename, raw_cv)

    return {
        "success": True,
        "message": "Aplicación enviada exitosamente",
        "id": application_id
    }

@api_router.get("/applications", response_model=List[JobApplicationResponse])
async def get_job_applications(admin=Depends(verify_admin)):
    applications = await db.job_applications.find({}, {"_id": 0, "cv_data": 0}).to_list(1000)
    for app in applications:
        if isinstance(app.get('created_at'), str):
            app['created_at'] = datetime.fromisoformat(app['created_at'])
    return applications

@api_router.patch("/applications/{application_id}/status")
async def update_application_status(application_id: str, body: dict, admin=Depends(verify_admin)):
    status = body.get("status")
    if status not in ("pendiente", "contactado", "descartado"):
        raise HTTPException(status_code=400, detail="Status inválido")
    result = await db.job_applications.update_one({"id": application_id}, {"$set": {"status": status}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Postulación no encontrada")
    return {"success": True}

@api_router.get("/applications/{application_id}/cv")
async def download_cv(application_id: str, admin=Depends(verify_admin)):
    from fastapi.responses import Response
    app = await db.job_applications.find_one({"id": application_id}, {"_id": 0})
    if not app or not app.get("cv_data"):
        raise HTTPException(status_code=404, detail="CV no encontrado")
    cv_bytes = base64.b64decode(app["cv_data"])
    filename = app.get("cv_filename", "cv.pdf")
    return Response(content=cv_bytes, media_type="application/octet-stream",
                    headers={"Content-Disposition": f'attachment; filename="{filename}"'})


# Admin auth endpoint
@api_router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    admin_password = os.environ.get("ADMIN_PASSWORD")
    admin_token = os.environ.get("ADMIN_TOKEN")
    if not admin_password or not admin_token:
        raise HTTPException(status_code=500, detail="Admin no configurado")
    if not hmac.compare_digest(credentials.password, admin_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return {"token": admin_token}


# Blog Routes
@api_router.post("/blog", response_model=BlogArticle)
async def create_blog_article(article: BlogArticleCreate, _=Depends(verify_admin)):
    article_obj = BlogArticle(**article.model_dump())
    doc = article_obj.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    doc['updated_at'] = doc['updated_at'].isoformat()
    await db.blog_articles.insert_one(doc)
    return article_obj

@api_router.get("/blog", response_model=List[BlogArticle])
async def get_blog_articles(category: Optional[str] = None):
    query = {}
    if category:
        query['category'] = category
    articles = await db.blog_articles.find(query, {"_id": 0}).to_list(100)
    for article in articles:
        if isinstance(article.get('created_at'), str):
            article['created_at'] = datetime.fromisoformat(article['created_at'])
        if isinstance(article.get('updated_at'), str):
            article['updated_at'] = datetime.fromisoformat(article['updated_at'])
    return articles

@api_router.get("/blog/{article_id}", response_model=BlogArticle)
async def get_blog_article(article_id: str):
    article = await db.blog_articles.find_one({"id": article_id}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    if isinstance(article.get('created_at'), str):
        article['created_at'] = datetime.fromisoformat(article['created_at'])
    if isinstance(article.get('updated_at'), str):
        article['updated_at'] = datetime.fromisoformat(article['updated_at'])
    return article

@api_router.put("/blog/{article_id}", response_model=BlogArticle)
async def update_blog_article(article_id: str, article_update: BlogArticleUpdate, _=Depends(verify_admin)):
    update_data = {k: v for k, v in article_update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")
    
    update_data['updated_at'] = datetime.now(timezone.utc).isoformat()
    
    result = await db.blog_articles.update_one(
        {"id": article_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    
    return await get_blog_article(article_id)

@api_router.delete("/blog/{article_id}")
async def delete_blog_article(article_id: str, _=Depends(verify_admin)):
    result = await db.blog_articles.delete_one({"id": article_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    return {"success": True, "message": "Artículo eliminado"}


# Seed initial blog articles (solo en no-producción)
@api_router.post("/blog/seed")
async def seed_blog_articles(_=Depends(verify_admin)):
    return await _seed_articles()


async def _seed_articles():
    articles = [
        {
            "title": "Estrategias de Optimización Fiscal 2025",
            "excerpt": "Descubre las mejores estrategias legales para optimizar la carga fiscal de tu empresa este año.",
            "content": """La optimización fiscal es fundamental para el crecimiento empresarial sostenible. En REFMEX entendemos que pagar impuestos es una obligación, pero hacerlo de forma inteligente es un derecho de todo contribuyente.

¿Qué es la optimización fiscal?
La optimización fiscal consiste en aplicar, dentro del marco legal vigente, todas las deducciones, estímulos y beneficios que el SAT pone a disposición de personas físicas y morales. No se trata de evadir, sino de planear.

Principales estrategias para 2025:

1. Depreciación acelerada de activos
Las empresas pueden deducir hasta el 100% del costo de ciertos activos en el ejercicio de adquisición, en lugar de hacerlo de forma gradual. Esto reduce la base gravable de forma significativa en el año de mayor inversión.

2. Deducción inmediata de inversiones
Aplica especialmente para empresas ubicadas en zonas prioritarias o que inviertan en sectores estratégicos. Consúltanos para saber si tu empresa califica.

3. Estímulos fiscales por contratación
Existen deducciones adicionales del 25% sobre el salario de trabajadores con discapacidad y adultos mayores. Si tu nómina incluye estos perfiles, puedes reducir tu ISR de forma legal.

4. Consolidación de pérdidas fiscales
Las pérdidas de ejercicios anteriores pueden amortizarse contra utilidades futuras hasta por 10 años. Llevar un registro ordenado de estas pérdidas es clave para aprovecharlas en el momento oportuno.

5. Regímenes especiales: RESICO y RIF
El Régimen Simplificado de Confianza (RESICO) ofrece tasas reducidas para personas físicas y morales que no superen ciertos límites de ingresos. Evaluar si tu empresa puede migrar a este régimen puede representar un ahorro considerable.

Planificación fiscal a largo plazo
La clave no está en reaccionar al cierre del ejercicio, sino en planear desde enero. En REFMEX acompañamos a nuestros clientes durante todo el año fiscal, revisando mensualmente su situación para anticipar obligaciones y maximizar beneficios.

Agenda una asesoría con nuestro equipo y descubre cuánto puede ahorrar tu empresa este 2025.""",
            "category": "empresarios",
            "image_url": "https://images.unsplash.com/photo-1772588627354-ca3617853217?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHx0YXglMjBhY2NvdW50aW5nJTIwZmluYW5jZSUyMGRvY3VtZW50cyUyMHBhcGVyd29ya3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "8 min",
        },
        {
            "title": "Cambios en el CFDI 4.0",
            "excerpt": "Todo lo que necesitas saber sobre las actualizaciones del Comprobante Fiscal Digital.",
            "content": """El CFDI 4.0 representa la actualización más importante en facturación electrónica de los últimos años. Desde su entrada en vigor obligatoria, muchos contribuyentes siguen teniendo dudas sobre su correcta aplicación.

¿Qué cambió respecto al CFDI 3.3?

1. Datos del receptor obligatorios
A diferencia de la versión anterior, el CFDI 4.0 exige que el nombre del receptor coincida exactamente con el registrado en el RFC ante el SAT. Un error en el nombre puede invalidar la factura como comprobante fiscal.

2. Código postal del receptor
Ahora es obligatorio incluir el código postal del domicilio fiscal del receptor, no del lugar de entrega. Este dato debe estar actualizado en el RFC.

3. Exportación e información aduanera
Se añadieron nuevos campos para operaciones de comercio exterior: tipo de operación (definitiva, temporal), clave de pedimento y número de pedimento aduanal.

4. Régimen fiscal del receptor
Por primera vez, el CFDI debe incluir el régimen fiscal bajo el cual tributa el receptor. Esto obliga a que emisor y receptor compartan información fiscal antes de emitir la factura.

5. Uso del CFDI más detallado
Los catálogos de "Uso del CFDI" se ampliaron. Es responsabilidad del receptor indicar correctamente el uso que dará al comprobante (G01 Adquisición de mercancias, D01 Honorarios médicos, etc.).

Complemento de Carta Porte
Para el traslado de mercancías por territorio nacional, el complemento de Carta Porte es obligatorio desde 2022. Con el CFDI 4.0, su correcta emisión se volvió aún más crítica para evitar multas en operativos de la SCT y el SAT.

Complemento de Nómina 1.2
La nómina digital también debe cumplir con los lineamientos del CFDI 4.0. Asegúrate de que tu sistema de nómina esté actualizado y que los datos de cada trabajador coincidan con su RFC.

¿Qué pasa si emito un CFDI con errores?
El SAT puede rechazarlo como deducción y, en casos graves, iniciar una auditoría. La cancelación y re-emisión es posible, pero tiene restricciones y plazos que debes conocer.

En REFMEX te ayudamos a revisar tus procesos de facturación y a capacitar a tu equipo para emitir CFDIs correctos desde el primer intento.""",
            "category": "empresarios",
            "image_url": "https://images.unsplash.com/photo-1772588627474-ae6acc69ac42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHx0YXglMjBhY2NvdW50aW5nJTIwZmluYW5jZSUyMGRvY3VtZW50cyUyMHBhcGVyd29ya3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "6 min",
        },
        {
            "title": "Análisis de la Reforma Fiscal 2025",
            "excerpt": "Un análisis técnico profundo de los cambios más relevantes en materia tributaria.",
            "content": """La Reforma Fiscal 2025 introduce modificaciones sustanciales al Código Fiscal de la Federación, la Ley del ISR y la Ley del IVA. A continuación presentamos un análisis técnico de los puntos más relevantes para despachos y contribuyentes especializados.

Cambios en el Código Fiscal de la Federación (CFF)

Nuevas facultades de comprobación digital
El SAT amplió sus facultades para revisar buzón tributario, contratos digitales y operaciones realizadas a través de plataformas tecnológicas. Los contribuyentes deben mantener su buzón activo y atender notificaciones en un plazo máximo de 3 días hábiles.

Presunción de operaciones inexistentes (EFOS/EDOS)
Se endureció el procedimiento para contribuyentes publicados en las listas del artículo 69-B del CFF. La presunción de inexistencia ahora se extiende a terceros que hayan deducido operaciones con estos contribuyentes hasta por 5 años atrás.

Modificaciones al ISR

Tasa corporativa y retenciones
La tasa general del 30% se mantiene, pero se modificaron los parámetros para la retención a residentes en el extranjero con ingresos de fuente de riqueza en México. Se reducen las tasas preferenciales de ciertos tratados para evitar su abuso.

Precios de Transferencia
Se actualizaron los márgenes de utilidad de referencia para los análisis de comparabilidad. Las empresas con operaciones intercompany deberán revisar sus estudios de precios de transferencia para el ejercicio 2025.

Cambios en el IVA

Acreditamiento en operaciones mixtas
Se modificó la metodología para el cálculo del IVA acreditable en empresas que realizan tanto actividades gravadas como exentas. La nueva fórmula puede resultar en un menor acreditamiento para ciertos sectores.

Plataformas digitales
Se refuerza la obligación de retención para plataformas tecnológicas que operen en México. Las personas físicas que presten servicios a través de estas plataformas deben verificar que las retenciones sean correctamente reportadas.

Implicaciones prácticas para despachos
Los contadores y asesores fiscales deben actualizar sus procesos de dictamen, revisión de estados financieros y elaboración de declaraciones para incorporar los nuevos criterios. La capacitación continua del equipo es indispensable.

En REFMEX estamos listos para acompañarte en la interpretación y aplicación de estos cambios.""",
            "category": "fiscalistas",
            "image_url": "https://images.unsplash.com/photo-1772588627499-baefc8ab0ce7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwzfHx0YXglMjBhY2NvdW50aW5nJTIwZmluYW5jZSUyMGRvY3VtZW50cyUyMHBhcGVyd29ya3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "12 min",
        },
        {
            "title": "Compliance Fiscal: Evita Multas",
            "excerpt": "Guía práctica para mantener el cumplimiento fiscal y evitar sanciones.",
            "content": """El cumplimiento fiscal es una obligación que no debe tomarse a la ligera. Las multas del SAT pueden representar desde el 55% hasta el 75% del impuesto omitido, sin contar recargos y actualizaciones. Aquí te presentamos una guía práctica para mantener tu empresa en regla.

Calendario fiscal: el punto de partida
El primer paso es conocer con exactitud las fechas límite de cada obligación:

- Declaraciones mensuales de IVA e ISR provisional: día 17 del mes siguiente
- Declaración anual de personas morales: marzo del año siguiente
- Declaración anual de personas físicas: abril del año siguiente
- DIOT (Declaración Informativa de Operaciones con Terceros): día 17 del mes siguiente
- Declaración informativa de sueldos y salarios: febrero

Un error común es confundir las fechas del calendario bancario con las del SAT. Asegúrate de verificar siempre en el portal oficial.

Buzón tributario activo
Desde 2020 es obligatorio para todos los contribuyentes. El SAT envía notificaciones, requerimientos y resoluciones a través de él. Si no lo atiendes, las notificaciones se tienen por legalmente entregadas y los plazos corren aunque no las hayas leído.

Conciliación contable-fiscal mensual
Muchas multas provienen de diferencias entre lo declarado en DIOT y lo registrado contablemente. Una conciliación mensual entre:
- Ingresos contables vs. ingresos declarados en IVA
- Compras y gastos vs. IVA acreditado
- Nómina contable vs. CFDI de nómina emitidos

...permite detectar inconsistencias antes de que el SAT las detecte.

Revisión de proveedores en listas negras
Antes de deducir cualquier factura, verifica que tu proveedor no aparezca en las listas del artículo 69-B del CFF (EFOS). Una deducción con un proveedor en lista negra puede ser rechazada y generar un crédito fiscal a tu cargo.

Corrección espontánea: una herramienta subestimada
Si detectas un error en una declaración ya presentada, puedes corregirlo espontáneamente antes de que el SAT lo detecte. La corrección espontánea reduce o elimina las multas. No esperes a que llegue una auditoría.

Acuerdos Conclusivos
Si ya iniciaste una revisión con el SAT y existen diferencias, los Acuerdos Conclusivos ante PRODECON son una alternativa eficaz para regularizar tu situación con reducción de multas del 100% en la primera oportunidad.

En REFMEX te acompañamos en cada paso del proceso de cumplimiento fiscal para que puedas enfocarte en hacer crecer tu negocio.""",
            "category": "fiscalistas",
            "image_url": "https://images.unsplash.com/photo-1621510007869-775c2657e580?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwyfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmVzJTIwbWVldGluZyUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsc3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "7 min",
        },
        {
            "title": "Deducciones Personales: Guía 2025",
            "excerpt": "Conoce todas las deducciones que puedes aplicar en tu declaración anual.",
            "content": """Las deducciones personales son un derecho de todos los contribuyentes asalariados. Aplicarlas correctamente en tu declaración anual puede significar la diferencia entre pagar impuestos adicionales o recibir una devolución.

¿Quién puede aplicar deducciones personales?
Cualquier persona física que presente declaración anual ante el SAT, incluyendo asalariados con ingresos superiores a $400,000 pesos anuales y quienes obtengan ingresos de otras fuentes además de su salario.

Deducciones personales permitidas en 2025:

1. Honorarios médicos y dentales
Son deducibles los pagos realizados a médicos, dentistas, psicólogos, nutriólogos y otros profesionales de la salud con título reconocido. También aplican los gastos hospitalarios, análisis clínicos, estudios de imagen y compra de lentes ópticos graduados (hasta $2,500 pesos).

Requisito clave: deben pagarse con tarjeta de débito, crédito, transferencia o cheque. Los pagos en efectivo NO son deducibles.

2. Primas de seguros de gastos médicos
Las primas pagadas por seguros de gastos médicos mayores para ti, tu cónyuge, hijos y ascendientes son 100% deducibles, sin límite de monto (sujeto al límite global).

3. Colegiaturas
Aplica para pagos de educación básica (preescolar, primaria, secundaria), bachillerato y educación profesional técnica, con los siguientes límites anuales:
- Preescolar: $14,200
- Primaria: $12,900
- Secundaria: $19,900
- Profesional técnico: $17,100
- Bachillerato: $24,500

4. Intereses reales de crédito hipotecario
Los intereses pagados a instituciones financieras por créditos hipotecarios destinados a tu casa habitación son deducibles. Solo aplica el componente "real" (descontando inflación).

5. Donativos
Los donativos a instituciones autorizadas por el SAT son deducibles hasta el 7% de tus ingresos acumulables del año anterior.

6. Aportaciones complementarias al retiro
Las aportaciones voluntarias a tu Afore o a planes personales de retiro (PPR) son deducibles hasta el 10% de tus ingresos acumulables, con un máximo de 5 UMAs anuales elevadas al año.

Límite global de deducciones
El total de tus deducciones personales no puede exceder el equivalente a 5 UMAs anuales o el 15% de tus ingresos totales, lo que resulte menor. Para 2025, esto representa aproximadamente $213,400 pesos.

¿Cómo maximizar tus deducciones?
- Solicita siempre CFDI por todos tus gastos médicos
- Paga con medios electrónicos, nunca en efectivo
- Guarda todos tus comprobantes durante al menos 5 años
- Revisa en el SAT que los CFDIs emitidos a tu nombre estén correctos

En REFMEX te ayudamos a preparar tu declaración anual y a identificar todas las deducciones a las que tienes derecho.""",
            "category": "asalariados",
            "image_url": "https://images.unsplash.com/photo-1758518727401-53823b36c47b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwzfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmVzJTIwbWVldGluZyUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsc3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "5 min",
        },
        {
            "title": "Tu Primera Declaración Anual",
            "excerpt": "Guía paso a paso para presentar tu primera declaración ante el SAT.",
            "content": """Presentar tu primera declaración anual puede parecer complicado, pero con la información correcta es un proceso manejable. Esta guía te lleva paso a paso desde cero.

¿Quién está obligado a presentar declaración anual?
Como asalariado, estás obligado a presentar declaración anual si:
- Tuviste ingresos por salarios superiores a $400,000 pesos en el año
- Trabajaste para dos o más empleadores de forma simultánea
- Obtuviste ingresos de fuentes distintas al salario (arrendamiento, honorarios, etc.)
- Comunicaste por escrito a tu patrón que presentarías declaración por tu cuenta

¿Cuándo presentarla?
La declaración anual de personas físicas debe presentarse en abril del año siguiente al ejercicio que se declara. Por ejemplo, la declaración del ejercicio 2024 se presenta en abril de 2025.

Paso 1: Ingresa al portal del SAT
Ve a sat.gob.mx e ingresa con tu RFC y Contraseña o con tu e.firma (firma electrónica). Si no tienes contraseña, puedes generarla en el mismo portal o en cualquier oficina del SAT con tu RFC y CURP.

Paso 2: Accede a "Declaraciones" → "Anuales"
En el menú principal busca la sección de declaraciones anuales y selecciona el ejercicio fiscal que vas a declarar.

Paso 3: Verifica la información prellenada
El SAT prellenará automáticamente tu declaración con:
- Los ingresos reportados por tu(s) empleador(es) mediante CFDI de nómina
- Las retenciones de ISR que te aplicaron durante el año
- Los CFDIs de deducciones personales vinculados a tu RFC

Revisa cuidadosamente que toda la información sea correcta. Si hay errores en los CFDIs de tu nómina, deberás pedirle a tu empleador que los corrija antes de presentar.

Paso 4: Captura tus deducciones personales
Agrega manualmente las deducciones que el sistema no haya prellenado: colegiaturas, donativos, aportaciones al retiro. Para cada una necesitas el RFC del emisor y el folio del CFDI.

Paso 5: Calcula el resultado
El sistema calculará automáticamente si tienes:
- Saldo a favor: el SAT te devuelve el exceso retenido (en promedio tarda 3 a 5 días hábiles si solicitas devolución a cuenta bancaria)
- Impuesto a cargo: deberás pagar la diferencia antes del 30 de abril

Paso 6: Envía y descarga el acuse
Una vez revisada, envía tu declaración y descarga el acuse de recibo. Guárdalo; es tu comprobante de cumplimiento.

Errores comunes en la primera declaración
- No verificar que los CFDIs de nómina estén correctamente emitidos
- Olvidar deducciones pagadas en efectivo (no son deducibles)
- No capturar deducciones de los primeros meses del año
- Proporcionar una CLABE interbancaria incorrecta para la devolución

¿Tienes dudas? En REFMEX te asesoramos para presentar tu declaración correctamente y aprovechar al máximo tus deducciones.""",
            "category": "asalariados",
            "image_url": "https://images.unsplash.com/photo-1758518730178-6e237bc8b87d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmVzJTIwbWVldGluZyUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsc3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "10 min",
        },
    ]

    updated = 0
    inserted = 0
    for article in articles:
        existing = await db.blog_articles.find_one({"title": article["title"]})
        now = datetime.now(timezone.utc).isoformat()
        if existing:
            await db.blog_articles.update_one(
                {"title": article["title"]},
                {"$set": {"content": article["content"], "excerpt": article["excerpt"], "updated_at": now}}
            )
            updated += 1
        else:
            article["id"] = str(uuid.uuid4())
            article["created_at"] = now
            article["updated_at"] = now
            await db.blog_articles.insert_one(article)
            inserted += 1

    return {"message": "Artículos actualizados", "updated": updated, "inserted": inserted}


# Include the router in the main app
app.include_router(api_router)


@app.on_event("startup")
async def startup_event():
    await _seed_articles()

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
