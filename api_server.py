import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import sys
import os
import time

# Add the 'Tournament&dashboard' directory to the path so we can import the modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'Tournament&dashboard'))

# Import the refactored engines
# from engine_dashboard import get_dashboard_stats (Missing)
# from fantasyfinance import get_fantasy_engine_data (Missing)

def get_dashboard_stats():
    # Mock fallback
    return {
        "status": "active", 
        "uptime": "99.9%",
        "active_nodes": 42
    }

def get_fantasy_engine_data():
    # Mock fallback
    return {
        "arena_status": "open",
        "teams": ["Alpha", "Beta", "Omega"],
        "scores": [1200, 1150, 980]
    }

app = FastAPI(title="Helmsdeep API", version="2025.1.0")
START_TIME = time.time()

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import xAI SDK
try:
    from xai_sdk import Client
    from xai_sdk.chat import user, system, assistant
except ImportError:
    print("⚠️ xai-sdk not found. Falling back to requests (will fail for Grok 3 if SDK required).")
    Client = None

class GrokRequest(BaseModel):
    apiKey: str
    messages: list
    model: str = "grok-beta"
    temperature: float = 0.7

@app.get("/")
def read_root():
    return {"status": "Helmsdeep API Online", "system": "Optimal"}


@app.get("/health")
def health():
    """
    Lightweight health endpoint consumed by the Electron UI.
    Returns uptime and placeholder resource metrics.
    """
    uptime_seconds = int(time.time() - START_TIME)
    return {
        "status": "ok",
        "cpu_percent": 12.5, # Placeholder mocked value
        "memory_percent": 45.2, # Placeholder mocked value
        "uptime_seconds": uptime_seconds,
        "active_bots": 3,
    }

@app.get("/api/bots")
def get_active_bots():
    """
    Returns a list of active trading bots (mocked for now).
    """
    return [
        { "id": "b1", "name": "Alpha-1", "strategy": "Scalp", "pair": "BTC/USD", "pnl": "+$120.50", "status": "RUNNING", "tier": "Enterprise" },
        { "id": "b2", "name": "Beta-X", "strategy": "Grid", "pair": "ETH/USD", "pnl": "+$45.20", "status": "RUNNING", "tier": "Basic" },
        { "id": "b3", "name": "Gamma-Ray", "strategy": "Arbitrage", "pair": "SOL/USD", "pnl": "-$12.00", "status": "PAUSED", "tier": "Pro" }
    ]

@app.post("/api/grok")
async def proxy_grok(req: GrokRequest):  # Made async to allow FastAPI to handle concurrency better
    """
    Proxies requests using xAI SDK (preferred) or HTTP fallback.
    """
    import asyncio
    
    def _do_proxy():
        # Method 1: SDK (Preferred for Grok 3)
        if Client:
            try:
                client = Client(api_key=req.apiKey)
                # Create chat session
                # Note: SDK might behave differently depending on exact version.
                # Assuming standard blocking client based on user snippet.
                chat = client.chat.create(model=req.model, temperature=req.temperature)
                
                for msg in req.messages:
                    content = msg.get('content', '')
                    role = msg.get('role', 'user')

                    if role == 'system':
                        chat.append(system(content))
                    elif role == 'user':
                        chat.append(user(content))
                    elif role == 'assistant':
                        chat.append(assistant(content))

                # Generate response
                response = chat.sample()

                return {
                    "choices": [
                        { "message": { "role": "assistant", "content": response.content } }
                    ]
                }
            except Exception as sdk_error:
                print(f"⚠️ SDK Error: {sdk_error}. Trying HTTP fallback...")
                # Fallthrough to HTTP request if SDK fails (e.g. version mismatch)

        # Method 2: HTTP Raw Request (Fallback)
        url = "https://api.x.ai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {req.apiKey}"
        }
        payload = {
            "messages": req.messages,
            "model": req.model,
            "stream": False,
            "temperature": req.temperature
        }

        try:
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            if response.status_code != 200:
                 raise HTTPException(status_code=response.status_code, detail=response.text)
            return response.json()
        except Exception as e:
            print(f"❌ GROK PROXY ERROR: {e}")
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=str(e))
            
    return await asyncio.to_thread(_do_proxy)


@app.get("/api/grok/models")
def list_grok_models(apiKey: str):
    """
    Lists available models from xAI.
    """
    url = "https://api.x.ai/v1/models"
    headers = {
        "Authorization": f"Bearer {apiKey}"
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/dashboard")
def api_dashboard():
    """Returns core dashboard metrics."""
    base_stats = get_dashboard_stats()
    base_stats.update({
        "total_trades": 12420,
        "global_win_rate": 68.5,
        "db_size": "2.1 GB",
        "last_vacuum": "15m ago"
    })
    return base_stats

@app.get("/api/fantasy")
def api_fantasy():
    """Returns fantasy arena game state."""
    return get_fantasy_engine_data()

@app.get("/api/live-trading/pnl")
def api_live_pnl():
    return {
        "current_pnl": 4500.25,
        "daily_change": 350.10,
        "win_rate": 0.75,
        "history": [3200, 3400, 3350, 3600, 4200, 4100, 4500]
    }

@app.get("/api/decisions/latest")
def api_latest_decision():
    import random
    import datetime
    
    signals = ['LONG', 'SHORT', 'HOLD']
    reasons = ['RSI Divergence', 'MACD Crossover', 'Volume Spike', 'Zone Rejection', 'Whale Alert', 'Sentiment Shift']
    symbols = ['BTC/USD', 'ETH/USD', 'SOL/USD', 'DOGE/USD']
    
    return {
        "type": random.choice(signals),
        "confidence": random.randint(75, 99),
        "reason": random.choice(reasons),
        "timestamp": datetime.datetime.now().isoformat(),
        "meta": {
            "symbol": random.choice(symbols),
            "price": random.uniform(20000, 60000)
        }
    }

@app.post("/command")
def execute_system_command(payload: dict):
    cmd = payload.get('cmd', '').strip()
    print(f"\n[SYSTEM SENTINEL] Received: {cmd}")
    
    # Logic to change sphere state via file hook (because the engine polls this file)
    if "red" in cmd.lower() or "alert" in cmd.lower():
        update_sphere_dna(name="RED ALERT", color="#ef4444", speed=3.0, distort=0.8, progress=90)
        return {"msg": "red_alert_active", "status": "executed"}
        
    if "blue" in cmd.lower() or "calm" in cmd.lower():
        update_sphere_dna(name="SYSTEM CALM", color="#06b6d4", speed=1.0, distort=0.1, progress=20)
        return {"msg": "system_calm", "status": "executed"}
        
    if "purge" in cmd.lower():
        return {"msg": "purge_sequence_initiated", "status": "executed"}

    return {"msg": "command_logged", "status": "standby"}

def update_sphere_dna(name="EMPIRE", color="#06b6d4", speed=1.0, distort=0.2, progress=50, roughness=0.1, metalness=0.9, wireframe=True):
    import json
    dna = {
        "name": name,
        "color": color,
        "speed": speed,
        "distort": distort,
        "progress": progress,
        "roughness": roughness,
        "metalness": metalness,
        "wireframe": wireframe
    }
    # Write to the file that the frontend polls
    # Ensure this path matches where the frontend looks (public/shape_dna.json)
    with open("public/shape_dna.json", "w") as f:
        json.dump(dna, f)
    print(f"[DNA] Updated geometry to: {name}")


# -------------------------------------------------------------------------------
#  NETWORK COMMANDER MODULE (Integrated)
# -------------------------------------------------------------------------------

import subprocess
import socket
import threading
from concurrent.futures import ThreadPoolExecutor

@app.get("/api/connect/interfaces")
def get_network_interfaces():
    """
    Returns active network interfaces and their IP addresses.
    """
    interfaces = []
    try:
        # Use 'ip -j addr' for JSON output if available, else standard parsing
        result = subprocess.run(["ip", "-j", "addr"], capture_output=True, text=True)
        import json
        if result.returncode == 0:
            data = json.loads(result.stdout)
            for iface in data:
                name = iface['ifname']
                is_up = "UP" in iface['flags']
                mac = iface.get('address', 'N/A')
                
                ipv4 = [
                    {"address": addr['local'], "netmask": addr.get('prefixlen', 24)} 
                    for addr in iface.get('addr_info', []) 
                    if addr['family'] == 'inet'
                ]
                
                ipv6 = [
                    {"address": addr['local']} 
                    for addr in iface.get('addr_info', []) 
                    if addr['family'] == 'inet6'
                ]
                
                interfaces.append({
                    "name": name,
                    "is_up": is_up,
                    "mac": mac,
                    "ipv4": ipv4,
                    "ipv6": ipv6
                })
    except Exception as e:
        print(f"Interface fetch error: {e}")
        # Fallback Mock
        return [
            {"name": "eth0", "is_up": True, "ipv4": [{"address": "192.168.1.145"}], "mac": "AA:BB:CC:DD:EE:FF"},
            {"name": "lo", "is_up": True, "ipv4": [{"address": "127.0.0.1"}], "mac": "00:00:00:00:00:00"}
        ]

    return interfaces

def ping_host(ip):
    try:
        # Fast ping: 1 packet, 0.5s timeout
        res = subprocess.run(["ping", "-c", "1", "-W", "0.5", ip], stdout=subprocess.DEVNULL)
        if res.returncode == 0:
            try:
                hostname = socket.gethostbyaddr(ip)[0]
            except:
                hostname = "Unknown Device"
            return {"ip": ip, "hostname": hostname, "status": "Online"}
    except:
        pass
    return None

@app.get("/api/connect/peers")
def scan_network_peers():
    """
    Massive Scan: Sweeps the local subnet (assumed 192.168.1.x) for active devices.
    Uses threaded execution for speed.
    """
    # Detect local subnet from 'ip route' or just assume standard home network 192.168.1.x for now
    # Ideally we parse the interface IP, but for speed we'll check valid ranges.
    
    active_peers = []
    base_ip = "192.168.1" # Default assumption
    
    # Try to find real base IP
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        base_ip = ".".join(local_ip.split(".")[:3])
        s.close()
    except:
        pass

    # Scan 1-254
    ips_to_scan = [f"{base_ip}.{i}" for i in range(1, 255)]
    
    with ThreadPoolExecutor(max_workers=50) as executor:
        results = executor.map(ping_host, ips_to_scan)
        
    for r in results:
        if r:
            active_peers.append(r)
            
    return active_peers

@app.post("/api/system/shutdown")
def system_shutdown():
    """
    Gracefully shuts down the API server (and theoretically the machine if authorized).
    """
    print("⚠️ SHUTDOWN COMMAND RECEIVED")
    # In a container/dev env, we just kill the server
    os._exit(0)
    return {"status": "Shutting down..."}

if __name__ == "__main__":
    # HOST ON 0.0.0.0 TO BE ACCESSIBLE TO THE NETWORK
    port = int(os.environ.get("EMPIRE_API_PORT", "5000")) # Changed default to 5000 to match frontend
    print(f"🚀 Launching Helmsdeep API Server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
