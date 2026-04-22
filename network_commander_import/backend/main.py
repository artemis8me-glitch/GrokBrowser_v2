from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router as api_router
import os
import threading
import uvicorn
from pathlib import Path

# Robust Path Resolution
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIST = BASE_DIR.parent / "frontend" / "dist"

app = FastAPI(title="Network Commander")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Network Commander is online"}

# Serve Static Files (Frontend Build)
# Fallback for SPA routing: If 404, serve index.html? 
# For now, standard serving.
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="static")
else:
    print(f"WARNING: Frontend dist not found at {FRONTEND_DIST}")

# State
SERVER_PORT = 5260
SERVER_HOST = "0.0.0.0"

def find_available_port(start_port, end_port):
    import socket
    for port in range(start_port, end_port + 1):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('localhost', port)) != 0:
                return port
    return None

def start_server(port):
    """Start uvicorn server programmatically."""
    uvicorn.run(app, host=SERVER_HOST, port=port, log_level="info")

@app.post("/api/system/shutdown")
def shutdown_app():
    # In a real desktop app, we might want to kill the whole process
    # os._exit(0) is drastic but effective for "Stop Everything"
    # Threading timer to allow response to return
    def kill():
        time.sleep(1)
        os._exit(0)
    
    threading.Thread(target=kill).start()
    return {"status": "shutting_down"}

if __name__ == "__main__":
    import webview
    import sys
    import requests
    import time

    print("Starting Antigravity's Ultimate Network Commander...")

    # Start Security Watcher
    from core.security import log_watcher
    log_watcher.start()

    # Start Peer Discovery
    from core.discovery import discovery_service
    discovery_service.start()

    # Dynamic Port Binding
    target_port = find_available_port(5260, 5269)
    
    if target_port:
        print(f"Binding to port {target_port}...")
        SERVER_PORT = target_port
        
        # Start server in thread
        t = threading.Thread(target=start_server, args=(SERVER_PORT,), daemon=True)
        t.start()
        
        # Wait for server to be responsive
        retries = 10
        while retries > 0:
            try:
                requests.get(f"http://localhost:{SERVER_PORT}/api/health", timeout=1)
                break
            except:
                time.sleep(0.5)
                retries -= 1
    else:
        print("ERROR: No ports available in range 5260-5269!")
        # Fallback to checking if 5260 is ours (existing instance)
        # But for now, we assume if all busy, we can't start a NEW instance 
        # unless we connect to the old one.
        # Let's try connecting to 5260 just in case it's an existing instance
        try:
             requests.get(f"http://localhost:5260/api/health", timeout=1)
             SERVER_PORT = 5260
             print("Connected to existing background server on 5260.")
        except:
             sys.exit(1)

    # Launch Native Window
    webview.create_window(
        "Network Commander", 
        f"http://localhost:{SERVER_PORT}",
        width=1200,
        height=800,
        resizable=True,
        text_select=True
    )
    webview.start()

