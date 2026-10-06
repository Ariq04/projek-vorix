FROM python:3.10-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY api-vorix/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application files
COPY api-vorix/ ./api-vorix/

# Expose default port
EXPOSE 8000

# Start FastAPI server using shell expansion for Railway $PORT
CMD ["sh", "-c", "exec uvicorn api-vorix.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
