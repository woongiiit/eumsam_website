from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import ApplicationForm, User
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
    
    return form

@router.put("", response_model=ApplicationFormResponse)
async def update_application_form(
    form_update: ApplicationFormUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """신청 양식 업데이트 (관리자만)"""
    form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
    
    if not form:
        # 새로운 양식 생성
        form = ApplicationForm(
            is_active=form_update.is_active,
            form_questions=form_update.form_questions,
            updated_by=current_user.id
        )
        db.add(form)
    else:
        # 기존 양식 업데이트
        form.is_active = form_update.is_active
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
