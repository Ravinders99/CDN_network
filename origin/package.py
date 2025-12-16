# origin/package.py
from pathlib import Path
import subprocess
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
INPUT_DIR = PROJECT_ROOT / "videos_input"
OUTPUT_DIR = PROJECT_ROOT / "origin" / "videos"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def package_video(input_file: Path) -> Path:
    """Convert input mp4 into an HLS set at origin/videos/<video_id>/."""
    if not input_file.exists():
        raise FileNotFoundError(input_file)

    video_id = input_file.stem
    target_dir = OUTPUT_DIR / video_id
    target_dir.mkdir(parents=True, exist_ok=True)

    master_path = target_dir / "master.m3u8"

    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(input_file),
        "-codec:v",
        "libx264",
        "-codec:a",
        "aac",
        "-ac",
        "2",
        "-b:v",
        "2000k",
        "-hls_time",
        "4",
        "-hls_playlist_type",
        "vod",
        "-hls_segment_filename",
        str(target_dir / "segment_%03d.ts"),
        str(master_path),
    ]

    print("Running:", " ".join(cmd))
    subprocess.run(cmd, check=True)
    print(f"Packaged {input_file.name} -> {master_path}")
    return target_dir


if __name__ == "__main__":
    if len(sys.argv) == 2:
        input_path = Path(sys.argv[1])
        package_video(input_path)
    else:
        mp4s = sorted(INPUT_DIR.glob("*.mp4"))
        if not mp4s:
            print(f"No .mp4 files in {INPUT_DIR}")
            sys.exit(1)
        for f in mp4s:
            package_video(f)
