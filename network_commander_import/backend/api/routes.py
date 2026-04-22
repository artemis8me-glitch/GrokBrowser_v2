from fastapi import APIRouter, File, UploadFile
from core.networking import NetworkTools
from core.files import FileManager
from core.system_info import get_active_ports
from core.remote import ssh_manager
from fastapi.responses import FileResponse
from pydantic import BaseModel

router = APIRouter()

# --- Request Models ---
class PingRequest(BaseModel):
    host: str

class CurlRequest(BaseModel):
    url: str
    method: str = "GET"
    headers: dict = {}

class PortCheckRequest(BaseModel):
    host: str
    port: int

class ListenerRequest(BaseModel):
    port: int

class KillProcessRequest(BaseModel):
    pid: int

class SSHConnectRequest(BaseModel):
    host: str
    username: str
    password: str = None
    port: int = 22

class SSHCommandRequest(BaseModel):
    command: str

class SSHListRequest(BaseModel):
    path: str = "."

# --- Networking Routes ---
@router.post("/ping")
def run_ping(req: PingRequest):
    return NetworkTools.ping(req.host)

@router.post("/curl")
def run_curl(req: CurlRequest):
    return NetworkTools.curl(req.url, req.method, list(req.headers.values()))

@router.post("/check-port")
def check_port_route(req: PortCheckRequest):
    return NetworkTools.check_port(req.host, req.port)

@router.get("/list-ports")
def list_ports_route():
    return NetworkTools.list_ports()

@router.post("/listener/start")
def start_listener_route(req: ListenerRequest):
    return NetworkTools.listen_port(req.port)

@router.post("/listener/stop")
def stop_listener_route(req: KillProcessRequest): # It expects a PID, not a port.
    return NetworkTools.stop_listener(req.pid)

# --- File Routes ---
@router.post("/files/upload")
async def upload_file(file: UploadFile = File(...)):
    return await FileManager.save_upload(file)

@router.get("/files/list")
def list_files_route():
    return FileManager.list_files()

@router.get("/files/download/{filename}")
def download_file_route(filename: str):
    path = FileManager.get_file_path(filename)
    if not path.exists():
         return {"error": "File not found"}
    return FileResponse(path)

# --- System/Port Manager Routes ---
@router.get("/system/connections")
def get_connections():
    return get_active_ports()

@router.post("/system/kill")
def kill_process(req: KillProcessRequest):
    success_dict = NetworkTools.stop_listener(req.pid) # Renamed to stop_listener, expects pid
    if success_dict.get("success"):
        return {"status": "success", "message": f"Process {req.pid} killed."}
    return {"status": "error", "message": success_dict.get("error", f"Failed to kill process {req.pid}")}

# --- Remote SSH Routes ---
@router.post("/remote/connect")
def remote_connect(req: SSHConnectRequest):
    return ssh_manager.connect(req.host, req.username, req.password, port=req.port)

@router.post("/remote/disconnect")
def remote_disconnect():
    return ssh_manager.disconnect()

@router.post("/remote/list")
def remote_list(req: SSHListRequest):
    return ssh_manager.list_files(req.path)

@router.post("/remote/command")
def remote_command(req: SSHCommandRequest):
    return ssh_manager.run_command(req.command)

# --- Security Center Routes ---
@router.get("/security/logs")
def get_security_logs_route():
    from core.security import get_security_logs
    return get_security_logs()

class IPInfoRequest(BaseModel):
    ip: str

@router.post("/security/ip-info")
def get_ip_info_route(req: IPInfoRequest):
    from core.intel import get_ip_info
    return get_ip_info(req.ip)

# --- Phase 4: Discovery & Advanced Connectivity ---
@router.get("/connect/peers")
def get_peers_route():
    from core.discovery import discovery_service
    return discovery_service.get_peers()

@router.get("/connect/interfaces")
def get_interfaces_route():
    from core.networking_advanced import get_network_interfaces
    return get_network_interfaces()

@router.get("/connect/bluetooth")
def get_bluetooth_route():
    from core.networking_advanced import scan_bluetooth
    return scan_bluetooth()
