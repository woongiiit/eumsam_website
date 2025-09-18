@echo off
echo ========================================
echo 음샘 밴드 동아리 웹사이트 Railway 배포
echo ========================================

echo.
echo 1. Git 상태 확인 중...
git status

echo.
echo 2. 변경사항 커밋 중...
git add .
git commit -m "Deploy to Railway - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"

echo.
echo 3. Railway에 푸시 중...
git push origin main

echo.
echo ========================================
echo 배포 완료!
echo ========================================
echo.
echo 다음 단계:
echo 1. Railway 대시보드에서 환경 변수 설정
echo 2. PostgreSQL 데이터베이스 연결 확인
echo 3. 도메인 설정 (선택사항)
echo.
echo Railway 대시보드: https://railway.app/dashboard
echo.
pause
