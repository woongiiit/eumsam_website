from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import User, Application
from schemas import ApplicationCreate, ApplicationResponse, ApplicationUpdate
from auth import get_current_user, get_current_admin_user
from email_service import send_application_approval_email
from datetime import datetime
import asyncio

router = APIRouter()

@router.post("", response_model=ApplicationResponse)
async def create_application(
    application_data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """입부 신청 (로그인한 사용자 모두 가능)"""
    
    # 이미 신청한 적이 있는지 확인
    existing_application = db.query(Application).filter(
        Application.applicant_id == current_user.id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 입부 신청을 하셨습니다"
        )
    
    application = Application(
        applicant_id=current_user.id,
        motivation=application_data.motivation,
        experience=application_data.experience,
        instrument=application_data.instrument
    )
    
    db.add(application)
    db.commit()
    db.refresh(application)
    
    return application

@router.get("/my", response_model=ApplicationResponse)
async def get_my_application(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """내 입부 신청 조회"""
    application = db.query(Application).filter(
        Application.applicant_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="입부 신청 내역이 없습니다"
        )
    
    return application

@router.get("", response_model=List[ApplicationResponse])
async def get_applications(
    skip: int = 0,
    limit: int = 100,
    status_filter: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """입부 신청 목록 조회 (관리자만)"""
    query = db.query(Application)
    
    if status_filter:
        query = query.filter(Application.status == status_filter)
    
    applications = query.order_by(Application.created_at.desc()).offset(skip).limit(limit).all()
    return applications

@router.get("/{application_id}", response_model=ApplicationResponse)
async def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """입부 신청 상세 조회 (관리자만)"""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="입부 신청을 찾을 수 없습니다"
        )
    return application

@router.put("/{application_id}", response_model=ApplicationResponse)
async def update_application_status(
    application_id: int,
    application_update: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """입부 신청 상태 업데이트 (관리자만)"""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="입부 신청을 찾을 수 없습니다"
        )
    
    application.status = application_update.status
    application.reviewed_at = datetime.utcnow()
    
    # 승인된 경우 사용자도 승인 처리
    if application_update.status == "approved":
        user = db.query(User).filter(User.id == application.applicant_id).first()
        if user:
            user.is_approved = True
        
            # 입부승인 이메일 전송 (비동기)
            try:
                application_email_data = {
                    'real_name': application.applicant.real_name,
                    'email': application.applicant.email,
                    'instrument': application.instrument,
                    'motivation': application.motivation
                }
                asyncio.create_task(send_application_approval_email(application_email_data))
            except Exception as e:
                # 이메일 전송 실패는 승인을 막지 않음
                print(f"Email sending failed: {e}")
    
    db.commit()
    db.refresh(application)
    
    return application

@router.delete("/{application_id}")
async def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """입부 신청 삭제 (관리자만)"""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="입부 신청을 찾을 수 없습니다"
        )
    
    db.delete(application)
    db.commit()
    
    return {"message": "입부 신청이 삭제되었습니다"}
