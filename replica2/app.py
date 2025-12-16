# # replica1/app.py   (copy the same file into replica2/app.py & replica3/app.py)
# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from pathlib import Path

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# BASE_DIR = Path(__file__).resolve().parent
# VIDEOS_ROOT = BASE_DIR / "videos"
# VIDEOS_ROOT.mkdir(parents=True, exist_ok=True)

# # This makes:
# #   /videos/1sFLfFCnGgk/master.m3u8
# #   /videos/1sFLfFCnGgk/segment_000.ts
# app.mount("/replica2/videos", StaticFiles(directory=VIDEOS_ROOT), name="videos")


# @app.get("/health")
# def health():
#     return {"status": "replica alive"}
# replica1/app.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pathlib import Path
import aiofiles
import os

# ---------------------------------------------------
# REPLICA CONFIG
# ---------------------------------------------------
REPLICA_ID = "replica2"   # change to replica2 / replica3 in other replicas

BASE_DIR = Path(__file__).resolve().parent
VIDEOS_DIR = BASE_DIR / "videos"       # HLS video folder
THUMB_DIR = BASE_DIR / "thumbnails"    # thumbnails folder

VIDEOS_DIR.mkdir(parents=True, exist_ok=True)
THUMB_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------
# FASTAPI APP
# ---------------------------------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Caddy terminates SSL → safe
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------
@app.get("/health")
def health():
    return {"replica": REPLICA_ID, "status": "alive"}

# ---------------------------------------------------
# LIST ALL VIDEOS
# ---------------------------------------------------
@app.get("/list")
def list_videos():
    videos = []

    for folder in VIDEOS_DIR.iterdir():
        if folder.is_dir() and (folder / "master.m3u8").exists():
            videos.append(folder.name)

    return {"replica": REPLICA_ID, "videos": videos, "count": len(videos)}

# ---------------------------------------------------
# INGEST - ORIGIN PUSHES SEGMENTS / MASTER FILES
# ---------------------------------------------------
@app.post("/ingest/{video_id}")
async def ingest(video_id: str, file: UploadFile = File(...)):
    dst_dir = VIDEOS_DIR / video_id
    dst_dir.mkdir(parents=True, exist_ok=True)

    dst_file = dst_dir / file.filename

    async with aiofiles.open(dst_file, "wb") as out:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            await out.write(chunk)

    return JSONResponse({
        "ok": True,
        "replica": REPLICA_ID,
        "saved": str(dst_file)
    })


# ---------------------------------------------------
# STATIC SERVING (CRITICAL)
# ---------------------------------------------------
# Caddy reverse-proxy accesses:  /replica1/videos/<id>/master.m3u8
# Static serving (NO replica prefix here)
app.mount("/videos", StaticFiles(directory=VIDEOS_DIR), name="videos")
# app.mount("/thumbnails", StaticFiles(directory=THUMB_DIR), name="thumbnails")

