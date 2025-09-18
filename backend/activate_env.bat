@echo off
echo 음샘 밴드 동아리 백엔드 환경 활성화
echo.
echo 가상환경을 활성화합니다...
call venv\Scripts\activate
echo.
echo 가상환경이 활성화되었습니다!
echo 서버를 실행하려면 다음 명령어를 사용하세요:
echo   uvicorn main:app --reload --host 0.0.0.0 --port 8000
echo.
cmd /k
