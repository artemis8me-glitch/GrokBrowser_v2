import subprocess
import shutil
from typing import Dict, Any, List, Optional

class NetworkTools:
    @staticmethod
    def run_command(command: List[str]) -> Dict[str, Any]:
        """Generic wrapper to run system commands safely."""
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=30  # Timeout to prevent hanging
            )
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode
            }
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Command timed out"}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def ping(host: str, count: int = 4) -> Dict[str, Any]:
        """Ping a host."""
        # Detect OS for correct ping count flag (Linux uses -c)
        cmd = ["ping", "-c", str(count), host]
        return NetworkTools.run_command(cmd)

    @staticmethod
    def curl(url: str, method: str = "GET", headers: Optional[List[str]] = None) -> Dict[str, Any]:
        """Wrapper for curl."""
        cmd = ["curl", "-X", method, "-s", "-v"] # -s silent (but -v verbose for headers usually? Let's use -i for headers + body)
        # Actually, let's just use -i to include protocol headers in the output
        cmd = ["curl", "-i", "-s", "-X", method]
        
        if headers:
            for h in headers:
                cmd.extend(["-H", h])
        
        cmd.append(url)
        return NetworkTools.run_command(cmd)

    @staticmethod
    def check_port(host: str, port: int) -> Dict[str, Any]:
        """Check if a port is open using nc (netcat)."""
        # nc -zv host port
        cmd = ["nc", "-zv", "-w", "2", host, str(port)]
        return NetworkTools.run_command(cmd)

    @staticmethod
    def list_ports() -> Dict[str, Any]:
        """List listening ports on the current machine (requires sudo often, or just user owned)."""
        # ss -tuln
        cmd = ["ss", "-tuln"]
        return NetworkTools.run_command(cmd)

    @staticmethod
    def listen_port(port: int) -> Dict[str, Any]:
        """Start a listener on a port (blocking, so needs to be backgrounded in real usage, 
        but for this tool we might just start it with a timeout or detach).
        For simplicity in this MVP, we'll run it with a timeout to prove it works, or return the pid?
        Actually, 'adjust settings' implies keeping it open. 
        We'll use Popen to start it in background and return PID."""
        try:
            # nc -l -p port -k (keep alive)
            # This is risky as it persists. We need a way to kill it.
            # For MVP, let's just use timeout (run for 10s) to "test" opening.
            # OR better, use run_command with a very short timeout just to see if it starts? 
            # No, nc -l blocks.
            # We'll spawn it.
            proc = subprocess.Popen(["nc", "-l", "-k", "-p", str(port)], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            return {"success": True, "message": f"Listening on {port}", "pid": proc.pid}
        except Exception as e:
            return {"success": False, "error": str(e)}

    @staticmethod
    def stop_listener(pid: int) -> Dict[str, Any]:
        try:
            import os
            import signal
            os.kill(pid, signal.SIGTERM)
            return {"success": True, "message": f"Killed process {pid}"}
        except Exception as e:
            return {"success": False, "error": str(e)}

