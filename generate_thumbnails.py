#!/usr/bin/env python3
"""
Generate thumbnails for all videos in the replica directories
"""
import os
import subprocess
from pathlib import Path

def generate_thumbnail(video_path, output_path, timestamp="00:00:02", width=300, height=450):
    """
    Generate a thumbnail from a video file

    Args:
        video_path: Path to the video file
        output_path: Where to save the thumbnail
        timestamp: Time position to capture frame (format: HH:MM:SS)
        width: Thumbnail width in pixels
        height: Thumbnail height in pixels
    """
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    cmd = [
        'ffmpeg',
        '-i', str(video_path),
        '-ss', timestamp,
        '-vframes', '1',
        '-vf', f'scale={width}:{height}:force_original_aspect_ratio=increase,crop={width}:{height}',
        '-y',  # Overwrite output file if exists
        str(output_path)
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            print(f"✓ Generated thumbnail: {output_path}")
            return True
        else:
            print(f"✗ Failed to generate thumbnail for {video_path}")
            print(f"  Error: {result.stderr}")
            return False
    except subprocess.TimeoutExpired:
        print(f"✗ Timeout generating thumbnail for {video_path}")
        return False
    except FileNotFoundError:
        print("✗ FFmpeg not found. Please install FFmpeg:")
        print("  macOS: brew install ffmpeg")
        print("  Ubuntu: sudo apt-get install ffmpeg")
        return False

def process_replica_videos(replica_path):
    """
    Process all videos in a replica directory

    Args:
        replica_path: Path to the replica directory (e.g., replica1)
    """
    videos_dir = Path(replica_path) / 'videos'
    thumbnails_dir = Path(replica_path) / 'thumbnails'

    if not videos_dir.exists():
        print(f"✗ Videos directory not found: {videos_dir}")
        return

    print(f"\n📁 Processing {replica_path}...")

    # Find all video directories
    video_count = 0
    success_count = 0

    for video_dir in videos_dir.iterdir():
        if not video_dir.is_dir():
            continue

        video_id = video_dir.name

        # Look for .ts files (HLS segments) or .mp4 files
        video_files = list(video_dir.glob('*.ts')) + list(video_dir.glob('*.mp4'))

        if not video_files:
            print(f"  ⚠ No video files found in {video_id}")
            continue

        # Use the first video file found
        video_file = video_files[0]
        thumbnail_path = thumbnails_dir / f"{video_id}.jpg"

        video_count += 1

        # Generate thumbnail
        if generate_thumbnail(video_file, thumbnail_path):
            success_count += 1

    print(f"\n✓ Processed {replica_path}: {success_count}/{video_count} thumbnails generated")

def main():
    """Main function to process all replicas"""
    base_dir = Path(__file__).parent

    print("🎬 Video Thumbnail Generator")
    print("=" * 50)

    # Find all replica directories
    replica_dirs = [d for d in base_dir.iterdir()
                   if d.is_dir() and d.name.startswith('replica')]

    if not replica_dirs:
        print("✗ No replica directories found")
        print("  Looking for directories like: replica1, replica2, etc.")
        return

    print(f"Found {len(replica_dirs)} replica directories")

    for replica_dir in sorted(replica_dirs):
        process_replica_videos(replica_dir)

    print("\n" + "=" * 50)
    print("✓ Thumbnail generation complete!")

if __name__ == '__main__':
    main()
