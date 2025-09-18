from fastapi import APIRouter, Depends, HTTPException
from email_service import send_welcome_email
from auth import get_current_admin_user
from models import User

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
