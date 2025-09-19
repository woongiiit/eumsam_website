from fastapi import FastAPI, HTTPException, Depends, status, Request
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
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,https://eumsaem-band.vercel.app,https://eumsamfrontend-production.up.railway.app").split(",")
print(f"CORS 허용된 Origin들: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
)

# 정적 파일 서빙
if not os.path.exists("static"):
    os.makedirs("static")
if not os.path.exists("static/gallery"):
    os.makedirs("static/gallery")

# 정적 파일 요청 로깅을 위한 미들웨어
@app.middleware("http")
async def log_static_requests(request: Request, call_next):
    if request.url.path.startswith("/static/"):
        print(f"정적 파일 요청: {request.url.path}")
        print(f"정적 파일 전체 URL: {request.url}")
    elif request.url.path.startswith("/gallery/"):
        print(f"갤러리 파일 요청 (리다이렉트): {request.url.path}")
        print(f"갤러리 파일 전체 URL: {request.url}")
    
    response = await call_next(request)
    return response

# 정적 파일 마운트
app.mount("/static", StaticFiles(directory="static"), name="static")

# 갤러리 파일 요청을 정적 파일로 리다이렉트 (제거됨)
# 프론트엔드에서 직접 /static/ 경로로 요청하도록 수정

# 라우터 등록
app.include_router(auth.router, prefix="/api/auth", tags=["인증"])
app.include_router(users.router, prefix="/api/users", tags=["사용자"])
app.include_router(posts.router, prefix="/api/posts", tags=["게시판"])
app.include_router(gallery.router, prefix="/api/gallery", tags=["갤러리"])
app.include_router(applications.router, prefix="/api/applications", tags=["입부신청"])
app.include_router(application_form.router, prefix="/api/application-form", tags=["신청양식"])
app.include_router(email_test.router, prefix="/api/email", tags=["이메일 테스트"])

# 정적 파일 서빙 (프론트엔드 정적 파일들)
# Railway에서 프론트엔드 요청이 백엔드로 라우팅되는 경우를 대비
import os
import shutil

# 프론트엔드 빌드 파일을 백엔드로 복사
frontend_dist_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')
backend_static_path = os.path.join(os.path.dirname(__file__), 'frontend_dist')

if os.path.exists(frontend_dist_path):
    # 프론트엔드 빌드 파일을 백엔드 디렉토리로 복사
    if os.path.exists(backend_static_path):
        shutil.rmtree(backend_static_path)
    shutil.copytree(frontend_dist_path, backend_static_path)
    app.mount("/", StaticFiles(directory=backend_static_path, html=True), name="frontend")

# 프론트엔드 요청을 백엔드로 리다이렉트하는 임시 해결책
@app.get("/eumsamwebsite-production.up.railway.app/api/{path:path}")
async def proxy_frontend_requests(path: str):
    """프론트엔드에서 잘못된 URL로 요청이 올 때 리다이렉트"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"/api/{path}", status_code=301)

# POST 요청도 처리
@app.post("/eumsamwebsite-production.up.railway.app/api/{path:path}")
async def proxy_frontend_post_requests(path: str, request: Request):
    """프론트엔드 POST 요청을 백엔드로 리다이렉트"""
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"/api/{path}", status_code=307)

# 프론트엔드에서 직접 API 호출하는 경우 처리
# 복잡한 핸들러를 제거하고 기존 API 라우터들이 자동으로 처리하도록 함

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
