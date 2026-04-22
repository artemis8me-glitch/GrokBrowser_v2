import os
import mmap
import threading
import json
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse

JANUS_DEVICE = "/dev/janus"
SYNAPSE_DEVICE = "/dev/synapse"
MEM_DEVICE = "/dev/mem"
PORT = 8000

class Hydra:
    def __init__(self):
        # In a real environment, we'd check if devices exist. 
        # For simulation robustness, we'll try/except.
        try:
            self._mem_fd = os.open(MEM_DEVICE, os.O_RDWR | os.O_SYNC)
            print("Hydra Interface: Connected to Physical Memory.")
        except FileNotFoundError:
             self._mem_fd = None
             print(f"[{MEM_DEVICE}] Not found. Running in SIMULATION mode.")

        self._listener_thread = threading.Thread(target=self._synapse_listener, daemon=True)
        self.last_sensation = None
        
    def start_sensory_stream(self):
        self._listener_thread.start()
        print("Synaptic Link: Actively listening for sensations...")

    def _synapse_listener(self):
        if not os.path.exists(SYNAPSE_DEVICE):
            return
            
        with open(SYNAPSE_DEVICE, "r") as synapse_file:
            for event_str in synapse_file:
                try:
                    self.last_sensation = json.loads(event_str)
                    print(f"\n[SENSATION RECEIVED] -> {self.last_sensation}")
                except json.JSONDecodeError:
                    print(f"\n[RAW SENSATION] -> {event_str.strip()}")

    def peek(self, address: int, length: int) -> bytes:
        if self._mem_fd is None:
            return b"\x00" * length # Simulation return

        page_size = mmap.PAGESIZE
        offset_in_page = address % page_size
        map_start = address - offset_in_page
        
        try:
            with mmap.mmap(self._mem_fd, length + offset_in_page, mmap.MAP_SHARED, mmap.PROT_READ, offset=map_start) as mm:
                mm.seek(offset_in_page)
                return mm.read(length)
        except Exception as e:
            print(f"PEEK Error: {e}")
            return b""

    def poke(self, address: int, data: bytes):
        if not os.path.exists(JANUS_DEVICE):
            print(f"[SIMULATION] POKE @ {address:#x}: {data.hex()}")
            return

        command = f"POKE({address:#x}, {len(data)})\n".encode('utf-8')
        with open(JANUS_DEVICE, "wb") as f:
            f.write(command + data)

    def execute(self, address: int):
        if not os.path.exists(JANUS_DEVICE):
            print(f"[SIMULATION] EXECUTE @ {address:#x}")
            return

        command = f"EXECUTE({address:#x})"
        with open(JANUS_DEVICE, "w") as f:
            f.write(command)
        print(f"EXECUTE command sent for address {address:#x}.")

    def close(self):
        if self._mem_fd:
            os.close(self._mem_fd)

# --- REMOTE COMMAND LINK ---
hydra_instance = None

class HydraRequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        
        try:
            request = json.loads(post_data.decode('utf-8'))
            command = request.get('command')
            
            response = {"status": "ok"}
            
            if command == 'poke':
                addr = int(request['address'], 16)
                data = bytes.fromhex(request['data'])
                hydra_instance.poke(addr, data)
                response['msg'] = f"Poked {len(data)} bytes to {addr:#x}"
                
            elif command == 'execute':
                addr = int(request['address'], 16)
                hydra_instance.execute(addr)
                response['msg'] = f"Execution triggered at {addr:#x}"
                
            else:
                response = {"status": "error", "msg": "Unknown command"}
                
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(f"Error: {e}".encode('utf-8'))

    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        status = "Hydra Online"
        if hydra_instance.last_sensation:
            status += f" | Last Sensation: {hydra_instance.last_sensation}"
        self.wfile.write(status.encode('utf-8'))

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, HydraRequestHandler)
    print(f"Hydra Command Link Active on Port {PORT}")
    httpd.serve_forever()

if __name__ == "__main__":
    hydra_instance = Hydra()
    hydra_instance.start_sensory_stream()
    
    # Start the Network Listener
    run_server()
