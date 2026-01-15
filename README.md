# CDN Network

A **Content Delivery Network (CDN)** built with FastAPI and Hypercorn. This project demonstrates:

- **Origin server** to prepare content with FFmpeg.
- **Replica servers** to serve HLS video segments.
- **Controller** that manages replicas with round-robin load balancing.
- **Browser client** using HLS.js to stream video.
- **Secure traffic** over HTTPS (HTTP/2).

---

## ✨ Features

### Video Streaming
- **HLS (HTTP Live Streaming)** for adaptive bitrate streaming
- **Load Balanced Delivery** via round-robin controller
- **Multiple Replica Servers** for distributed content delivery
- **Real-time Server Selection** - Choose specific replica or use auto load balancing

### Thumbnail System
- **Automatic Thumbnail Generation** from video segments using FFmpeg
- **Real Video Frames** extracted from HLS `.ts` files
- **Cached Thumbnails** served via `/thumbnails` endpoint
- **Fallback Support** to placeholder images when thumbnails unavailable

### Web Interface
- **Netflix-style UI** with responsive carousel
- **Video Search** with real-time filtering
- **Dark/Light Theme** toggle
- **Manual Server Selection** in video player
- **Numbered Video Titles** (Video 1, Video 2, etc.)

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

### 3. Install FFmpeg (Required for Thumbnails)
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Or use static binary
curl -L https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip -o ffmpeg.zip
unzip ffmpeg.zip
sudo mv ffmpeg /usr/local/bin/
chmod +x /usr/local/bin/ffmpeg
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

---

## 🎬 Running the CDN (Without Docker)

### 1. Start All Servers
```bash
# Activate virtual environment
source venv/bin/activate

# Start controller (port 8001)
cd controller && hypercorn app:app --bind 0.0.0.0:8001 &

# Start replica servers
cd ../replica1 && hypercorn app:app --bind 0.0.0.0:8101 &
cd ../replica2 && hypercorn app:app --bind 0.0.0.0:8102 &
cd ../replica3 && hypercorn app:app --bind 0.0.0.0:8103 &
cd ..

# Wait for servers to start
sleep 3
```

### 2. Register Replicas
```bash
python3 register_replicas.py
```

### 3. Generate Thumbnails
```bash
# Extract video frames from HLS segments
python3 generate_thumbnails.py
```

This will:
- Scan all replica `media/` directories
- Extract thumbnail from first segment (`segment_000.ts`) of each video
- Save thumbnails to `replica*/thumbnails/{video_id}.jpg`
- Handle YUV color space conversion for JPEG compatibility

### 4. Access Web Client
```bash
# Option 1: Direct file access
open web/app.html

# Option 2: Use HTTP server
cd web && python3 -m http.server 5500
# Then visit http://localhost:5500/app.html
```

---

## 🎮 Using the Web Interface

### Video Player Features
- **Auto Load Balancing** - Default mode uses controller's round-robin
- **Manual Server Selection** - Click server buttons in player to:
  - **Auto (Load Balanced)** → `http://localhost:8001/play/{videoId}`
  - **Server 1** → Direct from replica 1 (port 8101)
  - **Server 2** → Direct from replica 2 (port 8102)
  - **Server 3** → Direct from replica 3 (port 8103)
- **Seamless Switching** - Change servers while video is playing (preserves playback position)

### Keyboard Shortcuts
- `Space` - Play/Pause
- `F` - Toggle fullscreen
- `Escape` - Close player/modals
- `/` - Focus search input

---

## 📡 API Endpoints

### Controller (Port 8001)
- `POST /register` - Register replica server
- `GET /play/{video_id}` - Get video URL (load balanced)
- `GET /videos` - List available videos
- `GET /health` - Controller health check

### Replica Servers (Ports 8101-8103)
- `GET /videos/{video_id}/index.m3u8` - HLS playlist
- `GET /videos/{video_id}/segment_*.ts` - Video segments
- `GET /thumbnails/{video_id}.jpg` - Video thumbnail
- `GET /list` - List videos on this replica
- `GET /health` - Replica health check
- `POST /ingest/{video_id}` - Upload video content (for origin push)

---