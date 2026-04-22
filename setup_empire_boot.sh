#!/bin/bash

# EMPIRE OS: IGNITION SEQUENCE
# This script prepares the current Ubuntu environment to act as the EmpireOS Host.

echo "🟣 INITIALIZING EMPIRE IGNITION SEQUENCE..."

# 1. Define Paths
EMPIRE_ROOT="/home/devlopjake/Projects/Empire_Stable_Core"
ARCHIVE_OS_PATH="/home/devlopjake/Archives/project_overflow/Chaosterminal/Echo The Grok/EmpireOS"

echo "📂 Target Root: $EMPIRE_ROOT"

# 2. Migrate Core OS Files (Janus & Hydra)
echo "⚡ Retreiving Kernel Modules (Janus) and Shell (Hydra)..."
mkdir -p "$EMPIRE_ROOT/EmpireOS_Kernel"
cp "$ARCHIVE_OS_PATH/janus.c" "$EMPIRE_ROOT/EmpireOS_Kernel/"
cp "$ARCHIVE_OS_PATH/hydra.py" "$EMPIRE_ROOT/EmpireOS_Kernel/"
cp "$ARCHIVE_OS_PATH/Makefile" "$EMPIRE_ROOT/EmpireOS_Kernel/"

echo "✅ Core Files Locked."

# 3. Setup Autostart (Simulated Boot)
# This ensures that when this machine starts, the Empire Environment launches.

SYSTEMD_SERVICE_FILE="/etc/systemd/system/empire_core.service"

if [ -f "$SYSTEMD_SERVICE_FILE" ]; then
    echo "⚠️ Service already exists. Creating local launch script instead."
else
    echo "🔧 Creating SystemD Service Template (Requires Sudo to Install)..."
    cat <<EOF > "$EMPIRE_ROOT/empire_core.service"
[Unit]
Description=Empire Stable Core - The Exo System Host
After=network.target

[Service]
Type=simple
User=devlopjake
WorkingDirectory=$EMPIRE_ROOT
ExecStart=/bin/bash $EMPIRE_ROOT/ignite_core.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOF
fi

# 4. Create the Ignition Script (Everything running at once)
cat <<EOF > "$EMPIRE_ROOT/ignite_core.sh"
#!/bin/bash

# A. Activate Network Logic (API Heartbeat)
cd "$EMPIRE_ROOT"
source venv/bin/activate
nohup python api_server.py > api_server.log 2>&1 &
echo "❤️ Heartbeat Online (Port 5000)"

# B. Activate Visual Core (React/Vite)
# Using 'nohup' to keep it running in background
nohup npm run dev > visual_core.log 2>&1 &
echo "👁️ Visual Cortex Online (Port 5176)"

# C. Activate Hydra (Terminal Interface - If needed)
# python3 EmpireOS_Kernel/hydra.py

echo "🚀 EMPIRE SYSTEM FULLY ONLINE."
echo "   -> Control Plane: http://\$(hostname -I | awk '{print \$1}'):5176"
EOF

chmod +x "$EMPIRE_ROOT/ignite_core.sh"

echo "✅ Ignition Script Created: $EMPIRE_ROOT/ignite_core.sh"
echo "-------------------------------------------------------"
echo "To START THE EMPIRE immediately on boot, run:"
echo "   sudo cp $EMPIRE_ROOT/empire_core.service /etc/systemd/system/"
echo "   sudo systemctl enable empire_core"
echo "   sudo systemctl start empire_core"
echo "-------------------------------------------------------"
echo "To START MANUALLY now:"
echo "   $EMPIRE_ROOT/ignite_core.sh"
