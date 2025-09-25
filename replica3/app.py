from fastapi import FastAPI, UploadFile, File
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os, aiofiles

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://127.0.0.1:5500"] for stricter security
    allow_methods=["*"],
    allow_headers=["*"],
)

# Folder where this replica stores video content
MEDIA_ROOT = os.environ.get("MEDIA_ROOT", "media")
os.makedirs(MEDIA_ROOT, exist_ok=True)

# Serve static files from /videos endpoint
app.mount("/videos", StaticFiles(directory=MEDIA_ROOT), name="videos")

# Health check (optional)
@app.get("/health")
def health():
    return {"status": "Replica is alive"}

# Ingest endpoint for Origin pushes
@app.post("/ingest/{video_id}")
async def ingest(video_id: str, file: UploadFile = File(...)):
    dst = os.path.join(MEDIA_ROOT, video_id)
    os.makedirs(dst, exist_ok=True)

    async with aiofiles.open(os.path.join(dst, file.filename), "wb") as out:
        while chunk := await file.read(1024 * 1024):  # 1 MB chunks
            await out.write(chunk)

    return JSONResponse({"ok": True, "video_id": video_id, "file": file.filename})
