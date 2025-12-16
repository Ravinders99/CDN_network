# origin/push.py
from pathlib import Path
import shutil

PROJECT_ROOT = Path(__file__).resolve().parents[1]
ORIGIN_VIDEOS = PROJECT_ROOT / "origin" / "videos"

REPLICA_VIDEO_ROOTS = [
    PROJECT_ROOT / "replica1" / "videos",
    PROJECT_ROOT / "replica2" / "videos",
    PROJECT_ROOT / "replica3" / "videos",
]


def sync_to_replicas():
    if not ORIGIN_VIDEOS.exists():
        print("No origin/videos directory yet.")
        return

    video_dirs = [p for p in ORIGIN_VIDEOS.iterdir() if p.is_dir()]
    if not video_dirs:
        print("No videos found in origin/videos.")
        return

    for replica_root in REPLICA_VIDEO_ROOTS:
        replica_root.mkdir(parents=True, exist_ok=True)
        print(f"Syncing to {replica_root}")

        for src in video_dirs:
            dest = replica_root / src.name
            if dest.exists():
                shutil.rmtree(dest)
            shutil.copytree(src, dest)
            print(f"  -> {dest}")


if __name__ == "__main__":
    sync_to_replicas()
