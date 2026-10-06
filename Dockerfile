FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install backend dependencies
COPY api-vorix/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source (main.py + modules/) into /app
COPY api-vorix/ ./

EXPOSE 8000

# Railway injects $PORT; fallback 8000 for local docker
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
