import os
import json
import math
import random

# CONFIGURATION
PROJECT_ROOT = "/home/devlopjake/Projects/Empire_Stable_Core"
OUTPUT_FILE = os.path.join(PROJECT_ROOT, "public/registry.json")
IGNORE_DIRS = {
    "node_modules", ".git", "dist", "venv", "__pycache__", ".DS_Store", 
    "devops_backup", "Archive", "coverage", "build"
}
IGNORE_EXTS = {".png", ".jpg", ".jpeg", ".ico", ".svg", ".zip", ".tar.gz", ".map"}

def get_golden_spiral_coords(index):
    """
    Generates 3D coordinates based on a spherical distribution (Fibonacci Sphere).
    Scaled up by 100 because the frontend scales down by 0.01.
    """
    phi = math.acos(1 - 2 * (index + 0.5) / 1000.0) # Inclination
    theta = math.pi * (1 + 5**0.5) * (index + 0.5)  # Azimuth (Golden Angle)
    
    # Radius expands slightly as we add more files to create a cloud effect
    base_radius = 800 + (index * 0.5) 
    
    x = base_radius * math.sin(phi) * math.cos(theta)
    y = base_radius * math.sin(phi) * math.sin(theta)
    z = base_radius * math.cos(phi)

    # Add some randomness/noise to make it look organic
    x += random.uniform(-50, 50)
    y += random.uniform(-50, 50)
    z += random.uniform(-50, 50)
    
    return {"x": int(x), "y": int(y), "z": int(z)}

def scan_project():
    print(f"🔵 Scanning Empire Core: {PROJECT_ROOT}")
    registry = {}
    file_count = 0

    for root, dirs, files in os.walk(PROJECT_ROOT):
        # Filter unwanted directories in-place
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            if any(file.endswith(ext) for ext in IGNORE_EXTS):
                continue
                
            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, PROJECT_ROOT)
            
            # Simple metadata
            file_stats = os.stat(filepath)
            
            # Calculate Galaxy Coordinates
            coords = get_golden_spiral_coords(file_count)
            
            # Determine "Type" for color coding (This can be used by frontend later)
            ext = os.path.splitext(file)[1].lower()
            file_type = "code"
            if ext in ['.json', '.md', '.txt', '.xml']: file_type = "data"
            if ext in ['.js', '.jsx', '.ts', '.tsx', '.py', '.sh']: file_type = "logic"

            # Entry Key: Use relative path as ID
            registry[rel_path] = {
                "name": file,
                "path": rel_path,
                "type": file_type,
                "size": file_stats.st_size,
                "coords": coords
            }
            file_count += 1

    print(f"✅ Scan Complete. Found {file_count} files.")
    
    # Write to Registry
    with open(OUTPUT_FILE, 'w') as f:
        json.dump(registry, f, indent=2)
    
    print(f"💾 Registry Saved: {OUTPUT_FILE}")

if __name__ == "__main__":
    scan_project()
