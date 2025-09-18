#!/usr/bin/env python3
"""
베타 테스트용 관리자 계정 생성 스크립트
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from backend.database import SessionLocal
from backend.models import User
from backend.auth import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        # 기존 관리자 확인
        existing_admin = db.query(User).filter(User.email == "admin@eumsaem.com").first()
        if existing_admin:
            print("✅ 관리자 계정이 이미 존재합니다.")
            return
        
        # 관리자 계정 생성
        admin_user = User(
            email="admin@eumsaem.com",
            username="admin",
            real_name="관리자",
            password_hash=get_password_hash("admin123"),
            is_approved=True,
            is_admin=True,
            student_id="2024000000",
            major="컴퓨터공학과",
            year=4
        )
        
        db.add(admin_user)
        db.commit()
        
        print("✅ 관리자 계정이 생성되었습니다!")
        print("📧 이메일: admin@eumsaem.com")
        print("🔑 비밀번호: admin123")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
