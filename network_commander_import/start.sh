#!/bin/bash

# Network Commander Startup Script

echo "Initializing Network Commander..."

# 1. Build Frontend
echo "Building Frontend..."
cd frontend
npm run build
cd ..

# 2. Prepare Static Files
# Ensure backend can see the dist folder
# (FastAPI generic mount should handle it if path is correct)

# 3. Start Backend
echo "Starting Backend Server on 0.0.0.0:5260..."
cd backend
# Run with uvicorn, listening on all interfaces
# Using --reload only for dev, but let's use standard run for "installed" mode
/home/devlopjake/workstation-env/bin/uvicorn main:app --host 0.0.0.0 --port 5260 &
