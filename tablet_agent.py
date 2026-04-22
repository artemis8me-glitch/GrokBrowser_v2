import requests
import time
import random
import platform
import uuid

# --- CONFIGURATION ---
# Replace this with your Main PC's Tailscale IP if not on local WiFi
# Example: SERVER_URL = "http://100.x.y.z:9002"
SERVER_URL = "http://192.168.1.155:9002" 
AGENT_NAME = f"Agent-{platform.node()}"
AGENT_ID = str(uuid.uuid4())[:8]

def get_strategy():
    strategies = ["Sentiment Analysis", "DEX Scraper", "Arbitrage Scanner", "Chain Validator"]
    return strategies[hash(AGENT_ID) % len(strategies)]

def generate_pnl():
    # Simulate some fluctuation
    val = random.uniform(-5.0, 25.0)
    return f"{'+' if val >= 0 else ''}${abs(val):.2f}"

def main():
    print(f"[*] Booting Empire Agent: {AGENT_NAME} ({AGENT_ID})")
    print(f"[*] Target Command: {SERVER_URL}")
    print("[*] Status: ONLINE")

    # Interactive setup if URL is default
    target = input(f"Enter Server URL [default: {SERVER_URL}]: ").strip()
    final_url = target if target else SERVER_URL
    
    print(f"[*] Locking on to {final_url}...")

    while True:
        try:
            payload = {
                "id": AGENT_ID,
                "name": AGENT_NAME,
                "strategy": get_strategy(),
                "pair": "SOL/USDC", # Dynamic in future
                "pnl": generate_pnl(),
                "status": "printing",
                "tier": "Standard"
            }
            
            endpoint = f"{final_url}/api/bots/heartbeat"
            res = requests.post(endpoint, json=payload, timeout=2)
            
            if res.status_code == 200:
                print(f"[HEARTBEAT] Sent payload | PnL: {payload['pnl']}")
            else:
                print(f"[ERROR] Server rejected: {res.status_code}")
                
        except Exception as e:
            print(f"[CONNECTION LOST] Is the server running? {e}")
        
        time.sleep(3)

if __name__ == "__main__":
    main()
