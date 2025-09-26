FROM python:3.13-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    libsm6 libxext6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["hypercorn", "controller.app:app", "--bind", "0.0.0.0:8000", "--certfile=cert.pem", "--keyfile=key.pem"]
