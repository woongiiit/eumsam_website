from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
from models import User, Post, GalleryItem, Application
from schemas import UserResponse, UserUpdate, PasswordChange, UserDelete, UserRoleUpdate
from auth import get_current_user, get_current_admin_user, verify_password, get_password_hash
from email_service import send_integrated_approval_email
import asyncio

router = APIRouter()

@router.get("", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """모든 사용자 조회 (관리자만) - 삭제된 사용자 제외"""
    try:
        # is_deleted 필드가 있는지 확인
        users = db.query(User).filter(User.is_deleted == False).offset(skip).limit(limit).all()
    except Exception as e:
        # is_deleted 필드가 없으면 모든 사용자 조회
        print(f"is_deleted 필드 없음, 모든 사용자 조회: {e}")
        users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/pending", response_model=List[UserResponse])
async def get_pending_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """승인 대기 사용자 조회 (관리자만) - 삭제된 사용자 제외"""
    try:
        # is_deleted 필드가 있는지 확인
        pending_users = db.query(User).filter(
            User.is_approved == False, 
            User.is_deleted == False
        ).all()
    except Exception as e:
        # is_deleted 필드가 없으면 승인 대기 사용자만 조회
        print(f"is_deleted 필드 없음, 승인 대기 사용자만 조회: {e}")
        pending_users = db.query(User).filter(User.is_approved == False).all()
    return pending_users

@router.post("/{user_id}/approve")
async def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """사용자 승인 (관리자만)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    user.is_approved = True
    db.commit()
    
    # 통합 승인 이메일 전송 (비동기) - 가입 및 지원 모두 승인됨
    try:
        # 사용자의 지원서 정보도 함께 포함
        application = db.query(Application).filter(Application.applicant_id == user.id).first()
        user_email_data = {
            'real_name': user.real_name,
            'username': user.username,
            'email': user.email,
            'student_id': user.student_id,
            'major': user.major,
            'instrument': application.instrument if application else '미지정'
        }
        asyncio.create_task(send_integrated_approval_email(user_email_data))
    except Exception as e:
        # 이메일 전송 실패는 승인을 막지 않음
        print(f"Email sending failed: {e}")
    
    return {"message": "사용자가 승인되었습니다"}

@router.post("/{user_id}/reject")
async def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """사용자 거부 (관리자만)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    db.delete(user)
    db.commit()
    
    return {"message": "사용자가 거부되었습니다"}

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """현재 사용자 정보 수정"""
    update_data = user_update.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.put("/me/password")
async def change_password(
    password_data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """비밀번호 변경"""
    # 현재 비밀번호 확인
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="현재 비밀번호가 올바르지 않습니다"
        )
    
    # 새 비밀번호로 변경
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "비밀번호가 성공적으로 변경되었습니다"}

@router.delete("/me")
async def delete_current_user(
    delete_data: UserDelete,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """현재 사용자 계정 삭제 (회원 탈퇴)"""
    # 비밀번호 확인
    if not verify_password(delete_data.password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="비밀번호가 올바르지 않습니다"
        )
    
    # 관련 데이터 삭제
    # 게시글 삭제
    db.query(Post).filter(Post.author_id == current_user.id).delete()
    
    # 갤러리 아이템 삭제
    db.query(GalleryItem).filter(GalleryItem.uploader_id == current_user.id).delete()
    
    # 입부 신청 삭제
    db.query(Application).filter(Application.applicant_id == current_user.id).delete()
    
    # 사용자 삭제
    db.delete(current_user)
    db.commit()
    
    return {"message": "계정이 성공적으로 삭제되었습니다"}

@router.put("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: int,
    role_update: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """사용자 권한 변경 (관리자만)"""
    # 자신의 권한은 변경할 수 없음
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="자신의 권한은 변경할 수 없습니다"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    user.is_admin = role_update.is_admin
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """회원 삭제 (관리자만)"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="사용자를 찾을 수 없습니다"
        )
    
    # 자기 자신은 삭제할 수 없음
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="자기 자신은 삭제할 수 없습니다"
        )
    
    # 관리자 계정은 삭제할 수 없음
    if user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="관리자 계정은 삭제할 수 없습니다"
        )
    
    # 이미 삭제된 사용자인지 확인
    if user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 삭제된 사용자입니다"
        )
    
    # 소프트 삭제 실행
    from datetime import datetime
    user.is_deleted = True
    user.deleted_at = datetime.utcnow()
    db.commit()
    
    return {"message": "회원이 성공적으로 삭제되었습니다"}

@router.get("/stats")
async def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """사용자 통계 조회 (관리자만)"""
    try:
        # 현재 회원 수 (승인되고 삭제되지 않은 사용자)
        current_members = db.query(func.count(User.id)).filter(
            User.is_approved == True,
            User.is_deleted == False
        ).scalar()
        
        # 총 회원 수 (삭제된 사용자 포함, 승인 여부 무관)
        total_members = db.query(func.count(User.id)).scalar()
        
        # 승인 대기 수
        pending_members = db.query(func.count(User.id)).filter(
            User.is_approved == False,
            User.is_deleted == False
        ).scalar()
    except Exception as e:
        # is_deleted 필드가 없으면 기본 통계
        print(f"is_deleted 필드 없음, 기본 통계 사용: {e}")
        current_members = db.query(func.count(User.id)).filter(User.is_approved == True).scalar()
        total_members = db.query(func.count(User.id)).scalar()
        pending_members = db.query(func.count(User.id)).filter(User.is_approved == False).scalar()
    
    return {
        "current_members": current_members,
        "total_members": total_members,
        "pending_members": pending_members
    }
