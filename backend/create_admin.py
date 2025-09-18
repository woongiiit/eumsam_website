#!/usr/bin/env python3
"""
관리자 계정 생성 스크립트
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import User
from auth import get_password_hash
import sys

def create_admin():
    """관리자 계정 생성"""
    db = SessionLocal()
    
    try:
        # 기존 관리자 계정 확인
        existing_admin = db.query(User).filter(User.email == "admin@eumsaem.com").first()
        if existing_admin:
            print("❌ 관리자 계정이 이미 존재합니다!")
            print(f"이메일: {existing_admin.email}")
            print(f"사용자명: {existing_admin.username}")
            return
        
        # 새 관리자 계정 생성
        admin_user = User(
            email="admin@eumsaem.com",
            username="admin",
            password_hash=get_password_hash("admin123!"),
            real_name="관리자",
            student_id="ADMIN001",
            phone_number="010-0000-0000",
            major="관리자",
            year=1,
            is_approved=True,
            is_admin=True
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ 관리자 계정이 성공적으로 생성되었습니다!")
        print("=" * 50)
        print("🔑 관리자 로그인 정보:")
        print(f"이메일: admin@eumsaem.com")
        print(f"비밀번호: admin123!")
        print("=" * 50)
        print("⚠️  보안을 위해 로그인 후 비밀번호를 변경해주세요!")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
