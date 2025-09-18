# 🎵 음샘 밴드 동아리 웹사이트

동국대학교 중앙 밴드동아리 '음샘'의 공식 웹사이트입니다.

## 🚀 빠른 시작

### 로컬 개발 환경 설정

```bash
# 1. 저장소 클론
git clone [repository-url]
cd eumsaem-band

# 2. 백엔드 설정
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\\Scripts\\activate
pip install -r requirements.txt

# 3. 프론트엔드 설정
cd ../frontend
npm install

# 4. 환경 변수 설정
cp env.example .env
# .env 파일을 편집하여 필요한 설정 추가

# 5. 데이터베이스 초기화
cd ../backend
python -c "from database import engine, Base; Base.metadata.create_all(bind=engine)"

# 6. 서버 실행
# 터미널 1: 백엔드
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 터미널 2: 프론트엔드
cd frontend
npm run dev
```

### 배포

#### 방법 1: Docker 사용
```bash
# Docker로 전체 애플리케이션 실행
docker-compose up --build
```

#### 방법 2: 배포 스크립트 사용
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

## 📱 베타 테스트

### 테스트 계정
- **관리자**: admin@eumsaem.com / admin123
- **일반 사용자**: user@test.com / user123

### 주요 기능
- ✅ 회원가입/로그인
- ✅ 동아리 소개 및 활동 정보
- ✅ 입부 신청 (관리자 승인 필요)
- ✅ 커뮤니티 게시판
- ✅ 갤러리 (사진/영상 업로드)
- ✅ 관리자 페이지 (회원 관리, 신청 관리, 양식 수정)

### 테스트 시나리오
1. **회원가입** → **로그인** → **입부 신청**
2. **관리자 로그인** → **회원 승인** → **신청 관리**
3. **게시판 글쓰기** → **갤러리 업로드**
4. **마이페이지** → **정보 수정**

## 🛠️ 기술 스택

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- React Router
- React Query
- Lucide React

### Backend
- FastAPI
- SQLAlchemy
- SQLite
- JWT Authentication
- Pydantic

## 📞 문의사항

베타 테스트 중 문제가 발생하면 다음으로 연락주세요:
- 이메일: eumsaem@dongguk.edu
- GitHub Issues: [repository-url]/issues

## 📄 라이선스

MIT License