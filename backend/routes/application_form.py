from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
from models import ApplicationForm, User, Application
from schemas import ApplicationFormResponse, ApplicationFormUpdate, FormQuestion
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
    # current_applicants 값은 초기화 기능을 위해 그대로 사용 (자동 계산하지 않음)
    
    return form

@router.put("", response_model=ApplicationFormResponse)
async def update_application_form(
    form_update: ApplicationFormUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """신청 양식 업데이트 (관리자만)"""
    try:
        print(f"신청 양식 업데이트 요청 받음: {form_update}")
        print(f"현재 사용자: {current_user.id}, {current_user.email}")
        
        form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
        print(f"기존 양식 조회 결과: {form}")
        
        if not form:
            # 새로운 양식 생성 (초기 지원자 수는 0)
            print("새로운 양식 생성 중...")
            form = ApplicationForm(
                is_active=form_update.is_active,
                max_applicants=form_update.max_applicants,
                current_applicants=0,  # 새 양식은 0부터 시작
                form_questions=form_update.form_questions,
                updated_by=current_user.id
            )
            db.add(form)
            print("새로운 양식 추가 완료")
        else:
            # 기존 양식 업데이트 (current_applicants는 유지)
            print("기존 양식 업데이트 중...")
            form.is_active = form_update.is_active
            form.max_applicants = form_update.max_applicants
            # current_applicants는 초기화 기능을 위해 그대로 유지
            form.form_questions = form_update.form_questions
            form.updated_by = current_user.id
            form.updated_at = datetime.utcnow()
            print("기존 양식 업데이트 완료")
        
        db.commit()
        print("DB 커밋 완료")
        db.refresh(form)
        print(f"업데이트된 양식: {form}")
        
        return form
    except Exception as e:
        print(f"신청 양식 업데이트 오류: {str(e)}")
        print(f"오류 타입: {type(e)}")
        import traceback
        print(f"상세 오류: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"신청 양식 업데이트 중 오류가 발생했습니다: {str(e)}"
        )

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
    questions: List[FormQuestion],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """신청 양식 질문들만 업데이트 (관리자만)"""
    try:
        print(f"질문 업데이트 요청 받음: {len(questions)}개 질문")
        print(f"현재 사용자: {current_user.id}, {current_user.email}")
        
        # Pydantic 모델을 딕셔너리로 변환
        questions_dict = [q.dict() for q in questions]
        print(f"변환된 질문 데이터: {questions_dict}")
        
        form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
        
        if not form:
            # 새로운 양식 생성
            print("새로운 양식 생성 중...")
            form = ApplicationForm(
                is_active=True,
                form_questions=json.dumps(questions_dict),
                updated_by=current_user.id
            )
            db.add(form)
            print("새로운 양식 추가 완료")
        else:
            # 기존 양식 업데이트
            print("기존 양식 업데이트 중...")
            form.form_questions = json.dumps(questions_dict)
            form.updated_by = current_user.id
            form.updated_at = datetime.utcnow()
            print("기존 양식 업데이트 완료")
        
        db.commit()
        db.refresh(form)
        print("DB 커밋 완료")
        
        return {"message": "신청 양식이 업데이트되었습니다", "questions": questions_dict}
        
    except Exception as e:
        print(f"질문 업데이트 오류: {str(e)}")
        print(f"오류 타입: {type(e)}")
        import traceback
        print(f"상세 오류: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"질문 업데이트 중 오류가 발생했습니다: {str(e)}"
        )

@router.get("/status")
async def get_application_status(
    db: Session = Depends(get_db)
):
    """지원 가능 여부 확인"""
    # 활성화된 양식이 있는지 확인 (is_active = True)
    form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
    
    if not form:
        # 비활성화된 양식이라도 있는지 확인
        inactive_form = db.query(ApplicationForm).first()
        if inactive_form:
            return {
                "can_apply": False,
                "reason": "지금은 모집 기간이 아닙니다.",
                "max_applicants": inactive_form.max_applicants,
                "current_applicants": inactive_form.current_applicants or 0
            }
        else:
            return {
                "can_apply": False,
                "reason": "지원 양식이 설정되지 않았습니다.",
                "max_applicants": 0,
                "current_applicants": 0
            }
    
    # 저장된 지원자 수 사용 (초기화 기능을 위해)
    current_count = form.current_applicants
    
    # 지원 가능 여부 확인
    if form.max_applicants > 0 and current_count >= form.max_applicants:
        return {
            "can_apply": False,
            "reason": f"선착순 지원이 마감되었습니다. (현재: {current_count}/{form.max_applicants})",
            "max_applicants": form.max_applicants,
            "current_applicants": current_count
        }
    
    return {
        "can_apply": True,
        "reason": "지원 가능합니다.",
        "max_applicants": form.max_applicants,
        "current_applicants": current_count
    }

@router.post("/reset-applicants")
async def reset_applicants_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """지원자 수 초기화 (관리자만)"""
    print(f"지원자 수 초기화 요청 받음 - 사용자: {current_user.id}, {current_user.email}")
    
    form = db.query(ApplicationForm).filter(ApplicationForm.is_active == True).first()
    
    if not form:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="활성화된 지원 양식을 찾을 수 없습니다"
        )
    
    # 지원자 수를 0으로 초기화
    form.current_applicants = 0
    form.updated_at = datetime.utcnow()
    form.updated_by = current_user.id
    
    db.commit()
    db.refresh(form)
    
    print(f"지원자 수 초기화 완료: {form.current_applicants}/{form.max_applicants}")
    
    return {
        "message": "지원자 수가 성공적으로 초기화되었습니다",
        "current_applicants": form.current_applicants,
        "max_applicants": form.max_applicants
    }
