#!/bin/bash

# Define paths - adjust these to match your actual file structure
FRONTEND_DIR="$HOME/SecureGate/frontend"
API_DIR="$HOME/SecureGate/api"
LOGS_DIR="$HOME/SecureGate/logs"

# Create logs directory if it doesn't exist
mkdir -p "$LOGS_DIR"

# Create or clear log files
touch "$LOGS_DIR/frontend.log"
touch "$LOGS_DIR/api.log"
touch "$LOGS_DIR/securegate_frontend_pids.log"
touch "$LOGS_DIR/securegate_api_pids.log"
touch "$LOGS_DIR/startup.log"

# Log startup time
echo "$(date '+%d-%m-%Y::%H:%M:%S') -::- SecureGate starting at $(date)" > "$LOGS_DIR/startup.log"

# Start the frontend in the background without a visible terminal
cd "$FRONTEND_DIR" && npm run dev > "$LOGS_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Start the API in the background without a visible terminal
cd "$API_DIR" && source .venv/bin/activate && python3 main.py > "$LOGS_DIR/api.log" 2>&1 &
API_PID=$!

# Log the PIDs for debugging
echo "$(date '+%d-%m-%Y::%H:%M:%S') -::- Frontend PID: $FRONTEND_PID" > "$LOGS_DIR/securegate_frontend_pids.log"
echo "$(date '+%d-%m-%Y::%H:%M:%S') -::- API PID: $API_PID" > "$LOGS_DIR/securegate_api_pids.log"

# Wait for services to initialize (adjust time as needed)
echo "$(date '+%d-%m-%Y::%H:%M:%S') -::- Waiting for services to start..." >> "$LOGS_DIR/startup.log"
sleep 3

# Log Firefox startup
echo "$(date '+%d-%m-%Y::%H:%M:%S') -::- Starting Firefox at $(date)" >> "$LOGS_DIR/startup.log"

# Launch Firefox in kiosk (full screen) mode
firefox --kiosk http://localhost:5173/