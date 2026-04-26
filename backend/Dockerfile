FROM python:3.9-slim

WORKDIR /app

# Install dependencies needed for psycopg2 (if needed) and asyncpg
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt .
RUN pip install --default-timeout=1000 --no-cache-dir -r requirements.txt

# Copy backend and model directories into /app
COPY backend /app/backend
COPY model /app/model

WORKDIR /app/backend

# Expose port and run uvicorn
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
