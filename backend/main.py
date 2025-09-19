from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import uvicorn
import os

from database import SessionLocal, engine, Base
from models import *
from schemas import *
from auth import *
from routes import auth, users, posts, gallery, applications, application_form, email_test
from logging_config import setup_logging

# 로깅 설정 초기화
logger = setup_logging()

# 데이터베이스 테이블 생성
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="음샘 밴드 동아리 API",
    description="대학 밴드 동아리 '음샘' 공식 홈페이지 백엔드 API",
    version="1.0.0"
)

# CORS 설정
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://eumsaem-band.vercel.app").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 정적 파일 서빙
if not os.path.exists("static"):
    os.makedirs("static")
if not os.path.exists("static/gallery"):
    os.makedirs("static/gallery")
app.mount("/static", StaticFiles(directory="static"), name="static")

# 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["인증"])
app.include_router(users.router, prefix="/api/users", tags=["사용자"])
app.include_router(posts.router, prefix="/api/posts", tags=["게시판"])
app.include_router(gallery.router, prefix="/api/gallery", tags=["갤러리"])
app.include_router(applications.router, prefix="/api/applications", tags=["입부신청"])
app.include_router(application_form.router, prefix="/api/application-form", tags=["신청양식"])
app.include_router(email_test.router, prefix="/api/email", tags=["이메일 테스트"])

# 정적 파일 서빙 (프론트엔드 정적 파일들)
app.mount("/", StaticFiles(directory="../frontend/dist", html=True), name="static")

@app.get("/")
async def root():
    return {"message": "음샘 밴드 동아리 API 서버가 정상적으로 실행 중입니다!"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "API 서버가 정상적으로 작동하고 있습니다."}

@app.get("/api/stats")
async def get_stats(db: Session = Depends(get_db)):
    """홈페이지 통계 정보 조회 (공개)"""
    # 승인된 사용자 수 (활성 멤버)
    active_members = db.query(User).filter(User.is_approved == True).count()
    
    return {
        "active_members": active_members,
        "monthly_performances": 100,  # 누적 공연 수
        "founded_year": 1988,  # 고정값
        "music_genres": 5000  # 누적 부원 수
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
