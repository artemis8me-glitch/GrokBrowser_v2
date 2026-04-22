# EMPIRE TABLET FLEET SETUP GUIDE (LAN CLOUD MODE)

## CORE CONCEPT: The Local Cloud
We are leveraging your **2.5Gbps Local Network** to offload all processing to the Main PC. The tablets act as **Thin Clients**—they display the interface, but the Main PC does the heavy lifting.

**Stable Core Server:** `http://192.168.1.145:5176` (or `.143`)

---

## PHASE 1: CONNECTIVITY CHECK
Ensure all tablets are connected to the same Wi-Fi network as the Main PC.
(Note: If on 5G/External, revert to Tailscale IP: `100.x.y.z:5176`).

## PHASE 2: LAUNCHING THE CLIENT (Tablets)
You do **NOT** need to run code on the tablets anymore.

1.  Open **Chromium** or **Kiosk Browser** on the Tablet.
2.  Navigate to: `http://192.168.1.145:5176`
3.  **Result:** You will see the full **Empire Terminal v2.1** running instantly.
    *   No `node_modules` needed on tablet.
    *   No storage used on tablet.
    *   Instant load times.

## PHASE 3: AGENT INTEGRATION (Optional)
If you need the tablet to perform local hardware tasks (camera/sensors):

1.  **On Tablet (Termux/Ubuntu):**
    ```bash
    # Only if you need hardware access
    mkdir -p ~/empire_client
    cd ~/empire_client
    nano agent.py
    # (Paste the light client code)
    python3 agent.py
    ```
2.  **Point it to:** `http://192.168.1.145:9002` (API Port)

## STATUS MONITORING
*   **Main PC:** Runs `npm run dev` in `Empire_Stable_Core`.
*   **Web Interface:** Port `5176`.
*   **Engine API:** Port `9002`.

**Current Live Address:**
`http://192.168.1.145:5176`

