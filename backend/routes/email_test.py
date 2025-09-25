from fastapi import APIRouter, Depends, HTTPException
from email_service import send_welcome_email
from auth import get_current_admin_user
from models import User
from email_config import email_settings
import smtplib
import ssl

router = APIRouter()

@router.post("/test-welcome-email")
async def test_welcome_email(
    email: str,
    name: str = "테스트 사용자",
    current_user: User = Depends(get_current_admin_user)
):
    """환영 이메일 테스트 (관리자만)"""
    try:
        user_data = {
            'real_name': name,
            'username': 'test_user',
            'email': email,
            'student_id': 'TEST001',
            'major': '테스트 전공'
        }
        
        result = await send_welcome_email(user_data)
        
        if result:
            return {"message": "Test email sent successfully"}
        else:
            return {"message": "Email sending failed. Please check the logs"}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email test failed: {str(e)}")

@router.get("/smtp-test")
async def test_smtp_connection(
    current_user: User = Depends(get_current_admin_user)
):
    """SMTP 연결 테스트 (관리자만)"""
    if not email_settings:
        raise HTTPException(
            status_code=500,
            detail="이메일 설정이 초기화되지 않았습니다"
        )
    
    try:
        # SMTP 서버 연결 테스트
        if email_settings.MAIL_SSL_TLS:
            # SSL 사용
            context = ssl.create_default_context()
            server = smtplib.SMTP_SSL(email_settings.MAIL_SERVER, email_settings.MAIL_PORT, context=context)
        else:
            # STARTTLS 사용
            server = smtplib.SMTP(email_settings.MAIL_SERVER, email_settings.MAIL_PORT)
            if email_settings.MAIL_STARTTLS:
                server.starttls()
        
        # 인증
        server.login(email_settings.MAIL_USERNAME, email_settings.MAIL_PASSWORD)
        server.quit()
        
        return {
            "message": "SMTP 연결 성공",
            "server": email_settings.MAIL_SERVER,
            "port": email_settings.MAIL_PORT,
            "username": email_settings.MAIL_USERNAME,
            "ssl": email_settings.MAIL_SSL_TLS,
            "starttls": email_settings.MAIL_STARTTLS
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"SMTP 연결 실패: {str(e)}"
        )
