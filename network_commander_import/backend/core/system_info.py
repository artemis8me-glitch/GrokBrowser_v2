import psutil
import socket

def get_active_ports():
    """
    Returns a list of all active network connections (LISTEN, ESTABLISHED).
    Includes PID and Process Name if available.
    """
    connections = []
    try:
        # iterate over all connections
        for conn in psutil.net_connections(kind='inet'):
            try:
                process = psutil.Process(conn.pid)
                process_name = process.name()
            except (psutil.NoSuchProcess, psutil.AccessDenied, AttributeError):
                process_name = "Unknown"

            conn_info = {
                "fd": conn.fd,
                "family": str(conn.family),
                "type": str(conn.type),
                "laddr": f"{conn.laddr.ip}:{conn.laddr.port}" if conn.laddr else "",
                "raddr": f"{conn.raddr.ip}:{conn.raddr.port}" if conn.raddr else "",
                "status": conn.status,
                "pid": conn.pid,
                "process_name": process_name
            }
            connections.append(conn_info)
    except Exception as e:
        print(f"Error scanning ports: {e}")
    
    return sorted(connections, key=lambda x: x['laddr'])

def kill_process_by_pid(pid: int):
    """Kills a process by its PID."""
    try:
        p = psutil.Process(pid)
        p.terminate()  # Try graceful termination first
        p.wait(timeout=3)
        return True
    except psutil.NoSuchProcess:
        return False
    except psutil.TimeoutExpired:
        p.kill() # Force kill
        return True
    except Exception as e:
        raise e
