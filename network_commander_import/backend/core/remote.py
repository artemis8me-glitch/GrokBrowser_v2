import paramiko
import os
from pathlib import Path

class SSHClientManager:
    def __init__(self):
        self.client = None
        self.sftp = None
        self.current_host = None

    def connect(self, hostname, username, password=None, key_filename=None, port=22):
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.client.connect(hostname, port=port, username=username, password=password, key_filename=key_filename)
            self.sftp = self.client.open_sftp()
            self.current_host = hostname
            return {"status": "connected", "host": hostname}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def disconnect(self):
        if self.sftp:
            self.sftp.close()
        if self.client:
            self.client.close()
        self.client = None
        self.sftp = None
        self.current_host = None
        return {"status": "disconnected"}

    def list_files(self, remote_path="."):
        if not self.sftp:
            return {"status": "error", "message": "Not connected"}
        
        try:
            if remote_path == "HOME":
                # Try to resolve home directory
                stdin, stdout, stderr = self.client.exec_command('echo $HOME')
                remote_path = stdout.read().decode().strip()
            
            # Use SFTP to list
            files = []
            for entry in self.sftp.listdir_attr(remote_path):
                is_dir = entry.st_mode & 0o40000
                files.append({
                    "name": entry.filename,
                    "is_dir": bool(is_dir),
                    "size": entry.st_size,
                    "mtime": entry.st_mtime
                })
            
            # Sort: Directories first, then files
            files.sort(key=lambda x: (not x['is_dir'], x['name']))
            
            return {"status": "success", "path": remote_path, "files": files}
        except Exception as e:
            return {"status": "error", "message": str(e)}

    def run_command(self, command):
        if not self.client:
             return {"status": "error", "message": "Not connected"}
        
        try:
            stdin, stdout, stderr = self.client.exec_command(command)
            return {
                "status": "success",
                "stdout": stdout.read().decode(),
                "stderr": stderr.read().decode()
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}

# Global instance for stateful session
ssh_manager = SSHClientManager()
