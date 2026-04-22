#!/bin/bash

echo "🔵 INITIATING SPHERE NODE DEPLOYMENT..."

# 1. System Updates & Dependencies
echo "📦 Installing System Dependencies..."
sudo apt-get update
sudo apt-get install -y python3 python3-venv python3-pip git curl

# 2. Install Ollama (AI Engine)
if ! command -v ollama &> /dev/null; then
    echo "🧠 Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "✅ Ollama already installed."
fi

# 3. Pull Llama 3 Model
echo "📥 Downloading Llama 3 Brain (This may take time)..."
ollama pull llama3

# 4. Setup Python Environment
echo "🐍 Setting up Python Environment..."
mkdir -p ~/SphereNode
cd ~/SphereNode
python3 -m venv venv
source venv/bin/activate

# 5. Install Python Libs
pip install ollama python-dotenv psutil requests flask flask-cors

# 6. Create Ingestor Script (Worker Node Version)
# This script assumes the Shared Storage is mounted at /mnt/shared or similar.
# You MUST edit 'CLOUD_ROOT' below to match the Mirror Computer's path to the data!

cat << 'EOF' > node_ingest.py
import os
import json
import time
import hashlib
import ollama
from dotenv import load_dotenv

# !!! CONFIGURE THIS PATH ON THE MIRROR COMPUTER !!!
CLOUD_ROOT = "/home/devops/Shared_Storage_400GB/SPHERE_CLOUD" 
# Example: "/mnt/network_drive/SPHERE_CLOUD" or "/media/user/MyDrive/SPHERE_CLOUD"

DATA_DIR = os.path.join(CLOUD_ROOT, "data")
REGISTRY_PATH = os.path.join(CLOUD_ROOT, "registry.json")

def get_file_hash(filepath):
    hasher = hashlib.md5()
    try:
        with open(filepath, 'rb') as f:
            buf = f.read()
            hasher.update(buf)
        return hasher.hexdigest()
    except:
        return None

def generate_shape_dna(filepath, content):
    content_snippet = content[:2000]
    prompt = f"""
    You are a SphereOS Worker Node. Analyze this file.
    File: {filepath}
    Content: {content_snippet}
    Return JSON ONLY:
    {{
        "name": "Short Name",
        "type": "Code/Data",
        "geometry": {{ "color": "Hex", "roughness": 0.0-1.0, "metalness": 0.0-1.0, "distort": 0.0-1.0, "speed": 0.0-5.0, "wireframe": true/false }},
        "description": "Summary"
    }}
    """
    try:
        response = ollama.chat(model='llama3', messages=[{'role': 'user', 'content': prompt}], format='json')
        return json.loads(response['message']['content'])
    except Exception as e:
        print(f"AI ERROR: {e}")
        return None

def ingest():
    print(f"🟣 WORKER NODE ACTIVE. Scanning: {DATA_DIR}")
    while True:
        try:
            if not os.path.exists(REGISTRY_PATH):
                print("Waiting for Registry...")
                time.sleep(5)
                continue

            with open(REGISTRY_PATH, 'r') as f:
                registry = json.load(f)

            changes = False
            for root, dirs, files in os.walk(DATA_DIR):
                for file in files:
                    if file.startswith('.'): continue
                    filepath = os.path.join(root, file)
                    file_id = get_file_hash(filepath)
                    
                    if file_id and file_id not in registry:
                        print(f"⚡ PROCESSING: {file}")
                        try:
                            with open(filepath, 'r', errors='ignore') as f:
                                content = f.read()
                            dna = generate_shape_dna(filepath, content)
                            if dna:
                                registry[file_id] = { "path": filepath, "dna": dna, "ingested_at": time.time(), "processor": "MIRROR_NODE" }
                                changes = True
                                print(f"   -> DONE: {dna.get('name')}")
                        except Exception as e:
                            print(f"   -> FAILED: {e}")

            if changes:
                with open(REGISTRY_PATH, 'w') as f:
                    json.dump(registry, f, indent=2)
                print("REGISTRY SYNCED.")

            time.sleep(2)
        except Exception as e:
            print(f"ERROR: {e}")
            time.sleep(5)

if __name__ == "__main__":
    ingest()
EOF

echo "---------------------------------------------------"
echo "✅ NODE SETUP COMPLETE."
echo "1. Ensure your Shared Storage is mounted/accessible."
echo "2. Edit 'node_ingest.py' to point CLOUD_ROOT to that path."
echo "3. Run: source venv/bin/activate && python3 node_ingest.py"
echo "---------------------------------------------------"
