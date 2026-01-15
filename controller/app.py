from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
import itertools, time

from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # or restrict to your web client
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# --- Add this ---
@app.get("/health")
def health():
    return {"status": "Controller is alive"}
# ----------------

replicas = {}
replica_cycle = None

class Register(BaseModel):
    replica_id: str
    base_url: str

@app.post("/register")
def register(r: Register):
    global replica_cycle
    replicas[r.replica_id] = {"base": r.base_url, "last": time.time()}
    replica_cycle = itertools.cycle(replicas.values())
    return {"ok": True, "registered": r.replica_id}

@app.get("/play/{video_id}")
def play(video_id: str):
    global replica_cycle
    if not replicas:
        raise HTTPException(503, "No replicas registered")

    info = next(replica_cycle)
    base = info["base"]

    return RedirectResponse(url=f"{base}/videos/{video_id}/index.m3u8", status_code=302)

@app.get("/videos")
async def get_videos():
    """Fetch list of available videos from replicas"""
    if not replicas:
        raise HTTPException(503, "No replicas registered")

    import httpx
    all_videos = set()

    # Query first available replica
    for replica_id, info in replicas.items():
        try:
            async with httpx.AsyncClient(verify=False) as client:
                response = await client.get(f"{info['base']}/list", timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    all_videos.update(data.get("videos", []))
                    break  # Got videos from one replica, that's enough
        except Exception as e:
            print(f"Failed to fetch videos from {replica_id}: {e}")
            continue

    return {"videos": sorted(list(all_videos)), "count": len(all_videos)}
