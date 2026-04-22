#!/bin/bash

# EMPIRE OS: ZERO-DISK IGNITION
# This script transforms the local graphical environment into a lightweight Kiosk
# that acts purely as a window to the Empire Cloud Core.

echo "🌌 INITIALIZING ZERO-DISK PROTOCOL..."
echo "Connection: 192.168.1.145:5176 (Empire Cloud Core)"

# 1. Define the Kiosk Startup Script
# This will be placed in the user's autostart to override the desktop.

KIOSK_SCRIPT="$HOME/.empire_kiosk.sh"

cat <<EOF > "$KIOSK_SCRIPT"
#!/bin/bash

# A. Hide the Mouse Cursor (Unclutter)
# unclutter -idle 0.1 -root &

# B. Disable Screen Saving / Energy Saving
xset s off
xset -dpms
xset s noblank

# C. Launch Chromium in Kiosk Mode (Full Screen, No Bars)
# Pointing directly to the LOCAL CLOUD IP
chromium-browser \
    --no-first-run \
    --kiosk \
    --disable-restore-session-state \
    --disable-translate \
    --disable-infobars \
    --autoplay-policy=no-user-gesture-required \
    "http://192.168.1.145:5176"

EOF

chmod +x "$KIOSK_SCRIPT"
echo "✅ Kiosk Script Created: $KIOSK_SCRIPT"

# 2. Setup Desktop Autostart (GNOME/Ubuntu)
AUTOSTART_DIR="$HOME/.config/autostart"
mkdir -p "$AUTOSTART_DIR"

cat <<EOF > "$AUTOSTART_DIR/empire-kiosk.desktop"
[Desktop Entry]
Type=Application
Name=Empire Kiosk
Exec=$KIOSK_SCRIPT
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
Comment=Boot directly into Empire Cloud Core
EOF

echo "✅ Autostart Entry Created: $AUTOSTART_DIR/empire-kiosk.desktop"

# 3. (Optional) Disable GNOME Shell UI Elements
# This hides the top bar and dock to create the illusion of a pure OS.
# Note: Requires GNOME Extensions (Just Perfection or similar).
# For now, we rely on Chromium Kiosk mode to cover them up.

echo "---------------------------------------------------"
echo "🚀 PROTOCOL READY."
echo "On the next reboot/login, this machine will bypass "
echo "the desktop and launch directly into:"
echo "THE EMPIRE GEOMETRY KERNEL."
echo "---------------------------------------------------"
echo "To TEST now, run: $KIOSK_SCRIPT"
