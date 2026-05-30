@echo off
echo ==========================================
echo Starting TurnoverGuard Locally (No Docker)
echo ==========================================

echo [1/2] Setting up Backend...
cd backend
echo Installing python dependencies...
call pip install -r requirements.txt

start "CodeStory Backend" cmd /c "uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
cd ..

echo [2/2] Setting up Frontend...
cd frontend
echo Installing node dependencies...
call npm install
set VITE_API_URL=http://localhost:8000
start "TurnoverGuard Frontend" cmd /c "npm run dev"
cd ..

echo ==========================================
echo Services are starting in separate windows!
echo - Frontend will be at: http://localhost:3000 (or 5173)
echo - Backend will be at:  http://localhost:8000
echo ==========================================
