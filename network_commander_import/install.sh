#!/bin/bash

# Network Commander Installer
# This script sets up the systemd service and desktop shortcut.

SERVICE_NAME="network-commander.service"
DESKTOP_FILE="network-commander.desktop"
INSTALL_DIR="/home/devlopjake/Terminal/NetworkCommander"
USER="devlopjake"
ICON_PATH="$INSTALL_DIR/frontend/public/vite.svg" # Using generic vite icon for now

echo "Streamlining Network Commander..."

# 1. Create Systemd Service
echo "Creating Systemd Service..."
sudo bash -c "cat > /etc/systemd/system/$SERVICE_NAME" <<EOL
[Unit]
Description=Network Commander Service
After=network.target

[Service]
User=$USER
WorkingDirectory=$INSTALL_DIR/backend
ExecStart=/home/devlopjake/workstation-env/bin/uvicorn main:app --host 0.0.0.0 --port 5260
Restart=always

[Install]
WantedBy=multi-user.target
EOL

# 2. Enable and Start Service
echo "Enabling Service..."
sudo systemctl daemon-reload
sudo systemctl enable $SERVICE_NAME
sudo systemctl start $SERVICE_NAME

# 3. Create Desktop Entry
echo "Creating Desktop Shortcut..."
cat > $INSTALL_DIR/$DESKTOP_FILE <<EOL
[Desktop Entry]
Name=Network Commander
Comment=Network Management & Diagnostics
Exec=/home/devlopjake/Terminal/NetworkCommander/native_launch.sh
Icon=$ICON_PATH
Terminal=false
Type=Application
Categories=Utility;Network;
EOL

# Install Desktop Entry
mkdir -p /home/devlopjake/.local/share/applications
cp $INSTALL_DIR/$DESKTOP_FILE /home/devlopjake/.local/share/applications/

echo "Done! You can now:"
echo "1. Find 'Network Commander' in your app drawer."
echo "2. Access it anytime at http://localhost:5260 (Service is auto-started)."
