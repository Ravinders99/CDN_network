from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import itertools
import httpx

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

REPLICAS = [
    "/replica1",
    "/replica2",
    "/replica3",
]

ORIGIN = "/origin"

rr = itertools.cycle(REPLICAS)

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ORIGIN_VIDEOS = PROJECT_ROOT / "origin" / "videos"


@app.get("/videos")
def list_videos():
    videos = []

    if ORIGIN_VIDEOS.exists():
        for folder in ORIGIN_VIDEOS.iterdir():
            if folder.is_dir() and (folder / "master.m3u8").exists():
                videos.append(folder.name)

    return {"videos": sorted(videos)}


async def replica_is_healthy(client, replica: str) -> bool:
    try:
        r = await client.get(
            f"https://localhost{replica}/health",
            timeout=1.0
        )
        print(f"Health {replica}: {r.status_code}")
        return r.status_code == 200
    except Exception as e:
        print(f"Health check failed for {replica}: {e}")
        return False


@app.get("/play/{video_id}")
async def play(video_id: str):
    tried = set()

    # 🔥 TLS verification disabled HERE
    async with httpx.AsyncClient(verify=False) as client:
        for _ in range(len(REPLICAS)):
            replica = next(rr)

            if replica in tried:
                continue
            tried.add(replica)

            if await replica_is_healthy(client, replica):
                redirect = f"{replica}/videos/{video_id}/master.m3u8"
                print(f"✔ RR selected replica: {redirect}")
                return {"redirect": redirect}

    # 🚨 FALLBACK
    redirect = f"{ORIGIN}/videos/{video_id}/master.m3u8"
    print(f"⚠ All replicas down → origin: {redirect}")
    return {"redirect": redirect}
