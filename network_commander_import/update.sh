#!/bin/bash

# Network Commander Updater
echo "Updating Network Commander..."

# 1. Pull latest changes (if git)
# git pull

# 2. Rebuild Frontend
echo "Rebuilding Frontend..."
cd frontend
npm run build
cd ..

# 3. Restart Service
echo "Restarting Service..."
sudo systemctl restart network-commander.service

echo "Update Complete! App restarted."
