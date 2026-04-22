import socket
import requests
from functools import lru_cache

# Cache results to avoid spamming APIs
@lru_cache(maxsize=1024)
def get_ip_info(ip_address):
    """
    Returns dict with keys: ip, hostname, country, city, isp, lat, lon
    """
    info = {
        "ip": ip_address, 
        "hostname": "Unknown", 
        "country": "Unknown", 
        "city": "Unknown", 
        "isp": "Unknown",
        "type": "Unknown"
    }

    # 1. Local Network Check
    if ip_address.startswith("127.") or ip_address == "::1":
        info["type"] = "Localhost"
        info["hostname"] = socket.gethostname()
        return info
    
    if ip_address.startswith("192.168.") or ip_address.startswith("10."):
        info["type"] = "LAN"
        try:
           # Try reverse DNS lookup
           host = socket.gethostbyaddr(ip_address)[0]
           info["hostname"] = host
        except:
           pass
        return info

    # 2. Public Network Check (GeoIP)
    info["type"] = "WAN" # Assumed WAN if not private/local
    try:
        # Using free ip-api.com (check their rate limits: 45 req/min)
        response = requests.get(f"http://ip-api.com/json/{ip_address}?fields=status,message,country,city,isp,lat,lon", timeout=2)
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "success":
                info["country"] = data.get("country", "Unknown")
                info["city"] = data.get("city", "Unknown")
                info["isp"] = data.get("isp", "Unknown")
                info["lat"] = data.get("lat")
                info["lon"] = data.get("lon")
    except Exception as e:
        print(f"GeoIP lookup failed for {ip_address}: {e}")

    return info
