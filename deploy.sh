#!/bin/bash

echo "🚀 음샘 밴드 동아리 베타 배포 시작..."

# 1. 프론트엔드 빌드
echo "📦 프론트엔드 빌드 중..."
cd frontend
npm install
npm run build
cd ..

# 2. 백엔드 의존성 설치
echo "📦 백엔드 의존성 설치 중..."
cd backend
pip install -r requirements.txt
cd ..

# 3. 데이터베이스 초기화
echo "🗄️ 데이터베이스 초기화 중..."
cd backend
python -c "from database import engine, Base; Base.metadata.create_all(bind=engine)"
cd ..

# 4. 서버 실행
echo "🎵 서버 시작 중..."
echo "✅ 배포 완료! http://localhost:8000 에서 확인하세요"
echo "📱 모바일에서 테스트: http://[본인IP]:8000"

cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
