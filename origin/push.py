import httpx, pathlib, sys

# List of replicas (update ports if you run them differently)
REPLICAS = [
    "http://127.0.0.1:8101",  # replica1
    "http://127.0.0.1:8102",  # replica2
    "http://127.0.0.1:8103",  # replica3
]

# Function to push all files in a folder to all replicas
def push_folder(video_id: str, folder: pathlib.Path):
    """Push all files for one video to every replica."""
    if not folder.exists():
        print(f"[ERROR] HLS folder not found: {folder}")
        return
    # Iterate over replicas and upload files
    for replica in REPLICAS:
        print(f"[INFO] Uploading {video_id} to {replica}")
        with httpx.Client() as c:
            for file in folder.iterdir():
                if file.is_file():
                    files = {"file": (file.name, file.open("rb"), "application/octet-stream")}
                    url = f"{replica}/ingest/{video_id}"
                    r = c.post(url, files=files, timeout=None)
                    if r.status_code == 200:
                        print(f"  ✔ {file.name} uploaded to {replica}")
                    else:
                        print(f"  ✘ Failed {file.name} to {replica}: {r.status_code}")

if __name__ == "__main__":
    base_dir = pathlib.Path(__file__).parent / "hls_out"

    if len(sys.argv) == 2:
        # Upload a single video
        video_id = sys.argv[1]
        push_folder(video_id, base_dir / video_id)
    else:
        # Upload ALL videos in hls_out
        for folder in base_dir.iterdir():
            if folder.is_dir():
                push_folder(folder.name, folder)
