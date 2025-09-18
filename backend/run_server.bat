@echo off
echo 음샘 밴드 동아리 백엔드 서버 시작
echo.
echo 가상환경을 활성화합니다...
call venv\Scripts\activate
echo.
echo 백엔드 서버를 시작합니다...
uvicorn main:app --reload --host 0.0.0.0 --port 8000
