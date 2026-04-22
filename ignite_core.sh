#!/bin/bash

# A. Activate Network Logic (API Heartbeat)
cd "/home/devlopjake/Projects/Empire_Stable_Core"
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
echo "   -> Control Plane: http://$(hostname -I | awk '{print $1}'):5176"
