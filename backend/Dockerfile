FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install redis psycopg2-binary httpx authlib
# Also install rq (for redis queue) if we're using it, or we can use a simple custom worker.
RUN pip install rq sqlalchemy databases asyncpg uvicorn fastapi

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
