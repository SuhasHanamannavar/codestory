#!/bin/bash
echo "=========================================="
echo "Starting TurnoverGuard Locally (No Docker)"
echo "=========================================="

# Run Backend
echo "[1/2] Starting Backend in synchronous mode..."
cd backend || exit
pip install -r requirements.txt
export USE_BACKGROUND_INGEST=0
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Run Frontend
echo "[2/2] Starting Frontend..."
cd frontend || exit
npm install
export VITE_API_URL=http://localhost:8000
npm run dev &
FRONTEND_PID=$!
cd ..

echo "=========================================="
echo "Services are running! Press Ctrl+C to stop."
echo "=========================================="
wait $BACKEND_PID $FRONTEND_PID
