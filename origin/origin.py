from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
VIDEOS_ROOT = BASE_DIR / "videos"
THUMBNAILS_ROOT = BASE_DIR / "thumbnails"

VIDEOS_ROOT.mkdir(parents=True, exist_ok=True)
THUMBNAILS_ROOT.mkdir(parents=True, exist_ok=True)

app.mount("/videos", StaticFiles(directory=VIDEOS_ROOT), name="videos")
app.mount("/thumbnails", StaticFiles(directory=THUMBNAILS_ROOT), name="thumbnails")

# 🔹 List available videos
@app.get("/list")
def list_videos():
    videos = [
        d.name
        for d in VIDEOS_ROOT.iterdir()
        if d.is_dir() and (d / "master.m3u8").exists()
    ]
    return {"videos": videos}

@app.get("/")
def root():
    return {"origin": "OK"}
