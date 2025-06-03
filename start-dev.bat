@echo off
echo Starting development servers...
echo.

echo Starting backend server...
start "Backend Server" cmd /c "cd back && npm run start:dev"

echo Waiting for backend to start...
timeout /t 5 /nobreak

echo Starting frontend server...
start "Frontend Server" cmd /c "cd front && npm start"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
pause
