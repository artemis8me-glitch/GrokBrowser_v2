import threading
import time
import os
import re
from collections import deque

# In-memory buffer for logs (rolling 1000 lines)
SECURITY_LOG_BUFFER = deque(maxlen=1000)
AUTH_LOG_PATH = "/var/log/auth.log" # Ubuntu/Debian standard

# Regex patterns for common events
PATTERNS = {
    "ssh_fail_password": re.compile(r"Failed password for (invalid user )?(\w+) from ([\d\.]+) port \d+ ssh2"),
    "ssh_accepted": re.compile(r"Accepted password for (\w+) from ([\d\.]+) port \d+ ssh2"),
    "ssh_disconnect": re.compile(r"Disconnected from (?:user )?(\w+ )?([\d\.]+) port \d+"),
    "sudo_auth": re.compile(r"sudo:.*COMMAND=(.*)")
}

class LogWatcher:
    def __init__(self):
        self.running = False
        self.thread = None
    
    def start(self):
        if self.running: return
        self.running = True
        self.thread = threading.Thread(target=self._watch_loop, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False

    def _watch_loop(self):
        # Initial read (tail last 50 lines)
        if not os.path.exists(AUTH_LOG_PATH):
            self._add_event("system", "Log file not found: " + AUTH_LOG_PATH, "error")
            # Create dummy data for demo if log doesn't exist (e.g. non-root or non-linux)
            self._start_demo_mode()
            return

        try:
            f = open(AUTH_LOG_PATH, 'r')
            # Seek to end
            f.seek(0, os.SEEK_END)
            
            while self.running:
                line = f.readline()
                if not line:
                    time.sleep(1)
                    continue
                
                self._parse_line(line)
        except PermissionError:
             self._add_event("system", "Permission Denied: Cannot read " + AUTH_LOG_PATH + " (Try sudo)", "critical")
        except Exception as e:
             self._add_event("system", f"Log Watcher Error: {e}", "critical")

    def _parse_line(self, line):
        line = line.strip()
        timestamp = line[:15] # approximate syslog timestamp
        
        # Check patterns
        if "Failed password" in line:
            m = PATTERNS["ssh_fail_password"].search(line)
            if m:
                user = m.group(2)
                ip = m.group(3)
                self._add_event("auth_fail", f"Failed login for '{user}' from {ip}", "warning", ip=ip)
        
        elif "Accepted password" in line:
            m = PATTERNS["ssh_accepted"].search(line)
            if m:
                user = m.group(1)
                ip = m.group(2)
                self._add_event("auth_success", f"Successful login for '{user}' from {ip}", "success", ip=ip)

        elif "sudo" in line and "COMMAND" in line:
             self._add_event("sudo", f"Sudo Command: {line.split('COMMAND=')[1]}", "info")

    def _add_event(self, type, message, severity, ip=None):
        event = {
            "timestamp": time.time(),
            "type": type,
            "message": message,
            "severity": severity,
            "ip": ip
        }
        SECURITY_LOG_BUFFER.append(event)

    def _start_demo_mode(self):
         # Simulating events for demonstration if can't read logs
         while self.running:
             import random
             time.sleep(random.randint(2, 5))
             types = ["auth_fail", "port_scan", "auth_success"]
             t = random.choice(types)
             if t == "auth_fail":
                 self._add_event("auth_fail", "Failed password for root from 192.168.1.55", "warning", "192.168.1.55")
             elif t == "port_scan":
                  self._add_event("firewall", "Blocked connection to port 22 from 10.0.0.50", "error", "10.0.0.50")

def get_security_logs():
    return list(SECURITY_LOG_BUFFER)

# Global Instance
log_watcher = LogWatcher()
