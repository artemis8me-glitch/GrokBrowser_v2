import psutil
import socket
import subprocess
import shutil

def get_network_interfaces():
    """
    Returns detailed interface information including IPv6 and MAC.
    """
    interfaces = []
    stats = psutil.net_if_stats()
    addrs = psutil.net_if_addrs()

    for iface, addr_list in addrs.items():
        if iface == "lo": continue # Skip loopback for clutter reduction
        
        info = {
            "name": iface,
            "is_up": stats[iface].isup if iface in stats else False,
            "speed": stats[iface].speed if iface in stats else 0,
            "ipv4": [],
            "ipv6": [],
            "mac": ""
        }

        for addr in addr_list:
            if addr.family == socket.AF_INET:
                info["ipv4"].append({"address": addr.address, "netmask": addr.netmask})
            elif addr.family == socket.AF_INET6:
                info["ipv6"].append({"address": addr.address.split('%')[0]}) # Strip scope ID
            elif addr.family == psutil.AF_LINK:
                info["mac"] = addr.address

        interfaces.append(info)
    return interfaces

def scan_bluetooth():
    """
    Attempts to scan for Bluetooth devices using `hcitool` or `bluetoothctl`.
    Requires BlueZ and permissions.
    """
    if not shutil.which("hcitool"):
         return {"error": "hcitool not found. Install bluez."}

    try:
        # hcitool scan is fast and simple for legacy visible devices
        result = subprocess.run(["hcitool", "scan"], capture_output=True, text=True, timeout=5)
        devices = []
        for line in result.stdout.splitlines()[1:]:
            parts = line.split('\t')
            if len(parts) >= 3:
                devices.append({"mac": parts[1], "name": parts[2]})
        return {"status": "success", "devices": devices}
    except Exception as e:
        return {"error": str(e)}

