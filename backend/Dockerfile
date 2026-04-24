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
