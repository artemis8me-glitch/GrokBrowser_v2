
#!/bin/bash
# ignite.sh - Empire Terminal Ignition
LOCK_FILE="empire_terminal.lock"

# Check for existing lock file
if [ -f "$LOCK_FILE" ]; then
    PID=$(cat "$LOCK_FILE")
    if ps -p "$PID" > /dev/null 2>&1; then
        echo "[ERROR] Empire Terminal is already running (PID $PID)"
        exit 1
    fi
    echo "[WARNING] Stale lock file found - removing"
    rm -f "$LOCK_FILE"
fi

# Create new lock file with current PID
echo $$ > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT

echo "Igniting Empire Terminal..."
echo "Flags: $@"

# Ensure dependencies are installed (fast check)
if [ ! -d "node_modules" ]; then
    echo "[IGNITION] Installing dependencies..."
    npm install
fi

# Start the application
echo "[IGNITION] Spawning process..."
npm run electron:dev