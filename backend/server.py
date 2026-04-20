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
    
    return {
        "success": True,
        "message": "Aplicación enviada exitosamente",
        "id": application_id
    }

@api_router.get("/applications", response_model=List[JobApplicationResponse])
async def get_job_applications():
    applications = await db.job_applications.find({}, {"_id": 0, "cv_data": 0}).to_list(1000)
    for app in applications:
        if isinstance(app.get('created_at'), str):
            app['created_at'] = datetime.fromisoformat(app['created_at'])
    return applications


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
async def seed_blog_articles():
    if os.environ.get("ENVIRONMENT") == "production":
        raise HTTPException(status_code=403, detail="No disponible en producción")
    return await _seed_articles()


async def _seed_articles():
    existing = await db.blog_articles.count_documents({})
    if existing > 0:
        return {"message": "Blog ya tiene artículos", "count": existing}

    articles = [
        {
            "id": str(uuid.uuid4()),
            "title": "Estrategias de Optimización Fiscal 2025",
            "excerpt": "Descubre las mejores estrategias legales para optimizar la carga fiscal de tu empresa este año.",
            "content": "La optimización fiscal es fundamental para el crecimiento empresarial...",
            "category": "empresarios",
            "image_url": "https://images.unsplash.com/photo-1772588627354-ca3617853217?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwxfHx0YXglMjBhY2NvdW50aW5nJTIwZmluYW5jZSUyMGRvY3VtZW50cyUyMHBhcGVyd29ya3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "8 min",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Cambios en el CFDI 4.0",
            "excerpt": "Todo lo que necesitas saber sobre las actualizaciones del Comprobante Fiscal Digital.",
            "content": "El CFDI 4.0 trae cambios importantes en la facturación electrónica...",
            "category": "empresarios",
            "image_url": "https://images.unsplash.com/photo-1772588627474-ae6acc69ac42?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwyfHx0YXglMjBhY2NvdW50aW5nJTIwZmluYW5jZSUyMGRvY3VtZW50cyUyMHBhcGVyd29ya3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "6 min",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Análisis de la Reforma Fiscal 2025",
            "excerpt": "Un análisis técnico profundo de los cambios más relevantes en materia tributaria.",
            "content": "La reforma fiscal 2025 introduce modificaciones sustanciales...",
            "category": "fiscalistas",
            "image_url": "https://images.unsplash.com/photo-1772588627499-baefc8ab0ce7?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjV8MHwxfHNlYXJjaHwzfHx0YXglMjBhY2NvdW50aW5nJTIwZmluYW5jZSUyMGRvY3VtZW50cyUyMHBhcGVyd29ya3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "12 min",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Compliance Fiscal: Evita Multas",
            "excerpt": "Guía práctica para mantener el cumplimiento fiscal y evitar sanciones.",
            "content": "El cumplimiento fiscal es una obligación que no debe tomarse a la ligera...",
            "category": "fiscalistas",
            "image_url": "https://images.unsplash.com/photo-1621510007869-775c2657e580?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwyfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmVzJTIwbWVldGluZyUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsc3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "7 min",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Deducciones Personales: Guía 2025",
            "excerpt": "Conoce todas las deducciones que puedes aplicar en tu declaración anual.",
            "content": "Las deducciones personales son un derecho de todos los contribuyentes...",
            "category": "asalariados",
            "image_url": "https://images.unsplash.com/photo-1758518727401-53823b36c47b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwzfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmVzJTIwbWVldGluZyUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsc3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "5 min",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Tu Primera Declaración Anual",
            "excerpt": "Guía paso a paso para presentar tu primera declaración ante el SAT.",
            "content": "Presentar tu primera declaración anual puede parecer complicado...",
            "category": "asalariados",
            "image_url": "https://images.unsplash.com/photo-1758518730178-6e237bc8b87d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBleGVjdXRpdmVzJTIwbWVldGluZyUyMGJ1c2luZXNzJTIwcHJvZmVzc2lvbmFsc3xlbnwwfHx8fDE3NzU3Nzg4Mjd8MA&ixlib=rb-4.1.0&q=85",
            "read_time": "10 min",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.blog_articles.insert_many(articles)
    return {"message": "Artículos de blog creados", "count": len(articles)}


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
