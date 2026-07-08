@echo off
setlocal
cd /d C:\Users\brahim\Desktop\stage biat assurance\insurance-ai-assistant\backend
C:\Users\brahim\AppData\Local\Programs\Python\Python314\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000
