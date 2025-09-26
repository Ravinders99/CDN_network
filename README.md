# CDN Network

A **Content Delivery Network (CDN)** built with FastAPI and Hypercorn. This project demonstrates:

- **Origin server** to prepare content with FFmpeg.
- **Replica servers** to serve HLS video segments.
- **Controller** that manages replicas with round-robin load balancing.
- **Browser client** using HLS.js to stream video.
- **Secure traffic** over HTTPS (HTTP/2).

---

## 🚀 Setup Instructions

### 1. Create a Virtual Environment
```bash
python3 -m venv venv
source venv/bin/activate
```

<!-- Install dependencies -->
### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

---

## 🔑 Certificates

<!-- Create openssl.cnf -->
### 1. Create `openssl.cnf`
Create a file named `openssl.cnf` with the following content:
```ini
[req]
default_bits       = 2048
distinguished_name = req_distinguished_name
x509_extensions    = v3_req
prompt             = no

[req_distinguished_name]
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1  = 127.0.0.1
```

<!-- Generate cert.pem and key.pem -->
### 2. Generate Keys
Run the following command to generate `cert.pem` and `key.pem`:
```bash
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout key.pem \
  -out cert.pem \
  -config openssl.cnf \
  -extensions v3_req
```

<!-- Trust cert.pem on macOS -->
### 3. Trust `cert.pem` (macOS)
1. Open **Keychain Access** (`⌘ + Space → Keychain Access`).
2. Select **System keychain**.
3. Import `cert.pem` (**File → Import Items…**).
4. Double-click the certificate → expand **Trust** → set **Always Trust**.
5. Restart your browser.

---

## 🐳 Docker Deployment

<!-- Build containers -->
### 1. Build Containers
```bash
docker-compose build
```

<!-- Start containers -->
### 2. Start Containers
```bash
docker-compose up
```

<!-- Ports -->
### 3. Ports
- **Controller** → [https://localhost:8000](https://localhost:8000)
- **Replica1** → [https://localhost:8101](https://localhost:8101)
- **Replica2** → [https://localhost:8102](https://localhost:8102)
- **Replica3** → [https://localhost:8103](https://localhost:8103)

<!-- Register replicas -->
### 4. Register Replicas
To register replicas with the Controller, run:
```bash
python3 register_replicas.py
```