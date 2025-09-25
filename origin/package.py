import subprocess, pathlib

videos_dir = pathlib.Path("/Users/ravindersingh/Desktop/cdn_network/cdn/videos")
output_dir = pathlib.Path("hls_out")
output_dir.mkdir(parents=True, exist_ok=True)

for video in videos_dir.glob("*.mp4"):
    video_id = video.stem  # e.g. movie1.mp4 -> movie1
    target_dir = output_dir / video_id
    target_dir.mkdir(parents=True, exist_ok=True)

    print(f"Processing {video.name} -> {target_dir}")
    cmd = [
        "ffmpeg",
        "-i", str(video),
        "-profile:v", "main",
        "-level", "4.0",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-hls_time", "4",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", str(target_dir / "segment_%03d.ts"),
        str(target_dir / "index.m3u8"),
    ]
    subprocess.run(cmd, check=True)
