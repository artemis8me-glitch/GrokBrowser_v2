import socket
import json
import time
import threading
import uuid

BEACON_PORT = 5269
BEACON_INTERVAL = 3.0
MAGIC_STRING = "ANTIGRAVITY_COMMANDER"

class PeerDiscovery:
    def __init__(self):
        self.peers = {} # {id: {ip, hostname, last_seen}}
        self.my_id = str(uuid.uuid4())
        self.hostname = socket.gethostname()
        self.running = False
        self.socket = None

    def start(self):
        if self.running: return
        self.running = True
        
        # Setup UDP socket
        self.socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            self.socket.bind(('', BEACON_PORT))
        except Exception as e:
            print(f"Discovery Bind Error: {e}")

        # Start threads
        threading.Thread(target=self._broadcast_loop, daemon=True).start()
        threading.Thread(target=self._listen_loop, daemon=True).start()

    def stop(self):
        self.running = False
        if self.socket:
            self.socket.close()

    def get_peers(self):
        # Clean up old peers (timeout > 10s)
        now = time.time()
        to_remove = [uid for uid, p in self.peers.items() if now - p['last_seen'] > 10]
        for uid in to_remove:
            del self.peers[uid]
        return list(self.peers.values())

    def _broadcast_loop(self):
        while self.running:
            try:
                msg = {
                    "magic": MAGIC_STRING,
                    "id": self.my_id,
                    "hostname": self.hostname,
                    "type": "server"
                }
                data = json.dumps(msg).encode('utf-8')
                self.socket.sendto(data, ('<broadcast>', BEACON_PORT))
            except Exception as e:
                pass # Network might be down, ignore
            time.sleep(BEACON_INTERVAL)

    def _listen_loop(self):
        while self.running:
            try:
                data, addr = self.socket.recvfrom(1024)
                msg = json.loads(data.decode('utf-8'))
                
                if msg.get("magic") == MAGIC_STRING and msg.get("id") != self.my_id:
                    self.peers[msg["id"]] = {
                        "ip": addr[0],
                        "hostname": msg.get("hostname", "Unknown"),
                        "last_seen": time.time()
                    }
            except:
                pass

discovery_service = PeerDiscovery()
