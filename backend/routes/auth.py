from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import User, Application, ApplicationForm
from schemas import UserCreate, UserLogin, UserResponse, Token, IntegratedApplicationCreate
from auth import verify_password, get_password_hash, create_access_token, get_current_user
from email_service import send_welcome_email
import asyncio

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """회원가입"""
    print(f"회원가입 요청 받음: {user_data.email}")
    
    # 이메일 중복 확인
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        print(f"이메일 중복: {user_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 가입된 이메일입니다"
        )
    
    # 사용자명 중복 확인
    existing_username = db.query(User).filter(User.username == user_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 사용자명입니다"
        )
    
    # 새 사용자 생성
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password,
        real_name=user_data.real_name,
        student_id=user_data.student_id,
        phone_number=user_data.phone_number,
        major=user_data.major,
        year=user_data.year
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    print(f"사용자 생성 완료: {db_user.id}, {db_user.email}")
    
    # 환영 이메일 전송 (비동기)
    try:
        user_email_data = {
            'real_name': db_user.real_name,
            'username': db_user.username,
            'email': db_user.email,
            'student_id': db_user.student_id,
            'major': db_user.major
        }
        asyncio.create_task(send_welcome_email(user_email_data))
    except Exception as e:
        # 이메일 전송 실패는 회원가입을 막지 않음
        print(f"Email sending failed: {e}")
    
    return db_user

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """로그인"""
    user = db.query(User).filter(User.email == user_credentials.email).first()
    
    if not user or not verify_password(user_credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="이메일 또는 비밀번호가 올바르지 않습니다"
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/integrated-application", response_model=UserResponse)
async def create_integrated_application(application_data: IntegratedApplicationCreate, db: Session = Depends(get_db)):
    """통합 지원/가입 (회원가입 + 지원서)"""
    print(f"통합 지원/가입 요청 받음: {application_data.email}")
    
    # 지원 가능 여부 확인
    form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
    if form and form.max_applicants > 0:
        current_count = db.query(func.count(Application.id)).scalar()
        if current_count >= form.max_applicants:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"지원자 수가 한계에 도달했습니다. (현재: {current_count}/{form.max_applicants})"
            )
    
    # 이메일 중복 확인
    existing_user = db.query(User).filter(User.email == application_data.email).first()
    if existing_user:
        print(f"이메일 중복: {application_data.email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 가입된 이메일입니다"
        )
    
    # 사용자명 중복 확인
    existing_username = db.query(User).filter(User.username == application_data.username).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 사용 중인 사용자명입니다"
        )
    
    # 학번 중복 확인 (학번이 있는 경우)
    if application_data.student_id:
        existing_student_id = db.query(User).filter(User.student_id == application_data.student_id).first()
        if existing_student_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미 사용 중인 학번입니다"
            )
    
    # 새 사용자 생성 (승인 대기 상태)
    hashed_password = get_password_hash(application_data.password)
    db_user = User(
        email=application_data.email,
        username=application_data.username,
        password_hash=hashed_password,
        real_name=application_data.real_name,
        student_id=application_data.student_id,
        phone_number=application_data.phone_number,
        major=application_data.major,
        year=application_data.year,
        is_approved=False  # 관리자 승인 필요
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    print(f"사용자 생성 완료: {db_user.id}, {db_user.email}")
    
    # 지원서 생성
    db_application = Application(
        applicant_id=db_user.id,
        motivation=application_data.motivation,
        experience=application_data.experience,
        instrument=application_data.instrument,
        form_data=application_data.form_data,
        status="pending"
    )
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    print(f"지원서 생성 완료: {db_application.id}")
    
    # ApplicationForm의 current_applicants 증가
    from models import ApplicationForm
    form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
    if form:
        form.current_applicants += 1
        db.commit()
        print(f"지원자 수 증가: {form.current_applicants}")
    
    # 환영 이메일 전송 (비동기)
    try:
        user_email_data = {
            'real_name': db_user.real_name,
            'username': db_user.username,
            'email': db_user.email,
            'student_id': db_user.student_id,
            'major': db_user.major
        }
        asyncio.create_task(send_welcome_email(user_email_data))
    except Exception as e:
        # 이메일 전송 실패는 지원/가입을 막지 않음
        print(f"Email sending failed: {e}")
    
    return db_user

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """현재 사용자 정보 조회"""
    return current_user
