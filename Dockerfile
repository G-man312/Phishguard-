FROM python:3.11-slim

WORKDIR /app

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps from ml-backend
COPY ml-backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r /app/requirements.txt

# Copy the backend source
COPY ml-backend /app

ENV PYTHONUNBUFFERED=1
ENV PORT=5000

EXPOSE 5000

# Use gunicorn for production serving
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app", "--workers", "2"]
