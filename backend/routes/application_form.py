from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
from models import ApplicationForm, User, Application
from schemas import ApplicationFormResponse, ApplicationFormUpdate
from auth import get_current_admin_user
from datetime import datetime
import json

router = APIRouter()

@router.get("", response_model=ApplicationFormResponse)
async def get_application_form(
    db: Session = Depends(get_db)
):
    """신청 양식 조회 (모든 사용자 가능)"""
    form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
    
    if not form:
        # 기본 양식 생성
        form = ApplicationForm(
            is_active=True,
            max_applicants=0,  # 무제한
            current_applicants=0,
            form_questions=json.dumps([
                {
                    "id": 1,
                    "type": "textarea",
                    "label": "입부 동기",
                    "placeholder": "음샘 동아리에 가입하고 싶은 이유를 자유롭게 작성해주세요.",
                    "required": True,
                    "validation": {
                        "minLength": 10,
                        "message": "최소 10자 이상 입력해주세요"
                    }
                },
                {
                    "id": 2,
                    "type": "textarea",
                    "label": "음악 경험",
                    "placeholder": "악기 연주 경험이나 음악 관련 활동 경험을 작성해주세요.",
                    "required": False
                },
                {
                    "id": 3,
                    "type": "select",
                    "label": "주요 악기",
                    "placeholder": "주로 연주하시는 악기를 선택해주세요.",
                    "required": False,
                    "options": [
                        {"value": "guitar", "label": "기타"},
                        {"value": "bass", "label": "베이스"},
                        {"value": "drums", "label": "드럼"},
                        {"value": "keyboard", "label": "키보드"},
                        {"value": "vocal", "label": "보컬"},
                        {"value": "other", "label": "기타"}
                    ]
                }
            ])
        )
        db.add(form)
        db.commit()
        db.refresh(form)
    else:
        # 현재 지원자 수 업데이트
        current_count = db.query(func.count(Application.id)).scalar()
        form.current_applicants = current_count
        db.commit()
        db.refresh(form)
    
    return form

@router.put("", response_model=ApplicationFormResponse)
async def update_application_form(
    form_update: ApplicationFormUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """신청 양식 업데이트 (관리자만)"""
    form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
    
    # 현재 지원자 수 계산
    current_count = db.query(func.count(Application.id)).scalar()
    
    if not form:
        # 새로운 양식 생성
        form = ApplicationForm(
            is_active=form_update.is_active,
            max_applicants=form_update.max_applicants,
            current_applicants=current_count,
            form_questions=form_update.form_questions,
            updated_by=current_user.id
        )
        db.add(form)
    else:
        # 기존 양식 업데이트
        form.is_active = form_update.is_active
        form.max_applicants = form_update.max_applicants
        form.current_applicants = current_count
        form.form_questions = form_update.form_questions
        form.updated_by = current_user.id
        form.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(form)
    
    return form

@router.get("/questions")
async def get_form_questions(
    db: Session = Depends(get_db)
):
    """신청 양식 질문들만 조회 (JSON 파싱된 형태)"""
    form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
    
    if not form or not form.form_questions:
        return []
    
    try:
        questions = json.loads(form.form_questions)
        return questions
    except json.JSONDecodeError:
        return []

@router.put("/questions")
async def update_form_questions(
    questions: list,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """신청 양식 질문들만 업데이트 (관리자만)"""
    form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
    
    if not form:
        # 새로운 양식 생성
        form = ApplicationForm(
            is_active=True,
            form_questions=json.dumps(questions),
            updated_by=current_user.id
        )
        db.add(form)
    else:
        # 기존 양식 업데이트
        form.form_questions = json.dumps(questions)
        form.updated_by = current_user.id
        form.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(form)
    
    return {"message": "신청 양식이 업데이트되었습니다", "questions": questions}

@router.get("/status")
async def get_application_status(
    db: Session = Depends(get_db)
):
    """지원 가능 여부 확인"""
    form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
    
    if not form:
        return {
            "can_apply": False,
            "reason": "지원 양식이 설정되지 않았습니다.",
            "max_applicants": 0,
            "current_applicants": 0
        }
    
    # 현재 지원자 수 계산
    current_count = db.query(func.count(Application.id)).scalar()
    form.current_applicants = current_count
    db.commit()
    
    # 지원 가능 여부 확인
    if form.max_applicants > 0 and current_count >= form.max_applicants:
        return {
            "can_apply": False,
            "reason": f"지원자 수가 한계에 도달했습니다. (현재: {current_count}/{form.max_applicants})",
            "max_applicants": form.max_applicants,
            "current_applicants": current_count
        }
    
    return {
        "can_apply": True,
        "reason": "지원 가능합니다.",
        "max_applicants": form.max_applicants,
        "current_applicants": current_count
    }
