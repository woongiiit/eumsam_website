from fastapi_mail import MessageSchema
from email_config import fastmail, email_settings
from email_templates import (
    get_welcome_email_template, 
    get_approval_email_template, 
    get_integrated_approval_email_template
)
import logging

logger = logging.getLogger(__name__)

async def send_welcome_email(user_data: dict):
    """회원가입 환영 이메일 전송"""
    # 이메일 기능이 비활성화된 경우
    if not email_settings or not email_settings.MAIL_ENABLED:
        logger.info("Email functionality is disabled.")
        return False
    
    try:
        # 필수 데이터 검증
        if not all(key in user_data for key in ['real_name', 'username', 'email']):
            logger.error("Required user data is missing.")
            return False
        
        template = get_welcome_email_template()
        html_content = template.render(
            real_name=user_data['real_name'],
            username=user_data['username'],
            email=user_data['email'],
            student_id=user_data.get('student_id', ''),
            major=user_data.get('major', '')
        )
        
        message = MessageSchema(
            subject="🎵 동국대학교 음샘 홈페이지 가입 완료",
            recipients=[user_data['email']],
            body=html_content,
            subtype="html"
        )
        
        await fastmail.send_message(message)
        logger.info(f"Welcome email sent successfully: {user_data['email']}")
        return True
        
    except Exception as e:
        logger.error(f"Welcome email sending failed: {e}")
        return False

async def send_approval_email(user_data: dict):
    """가입 승인 이메일 전송"""
    # 이메일 기능이 비활성화된 경우
    if not email_settings or not email_settings.MAIL_ENABLED:
        logger.info("Email functionality is disabled.")
        return False
    
    try:
        # 필수 데이터 검증
        if not all(key in user_data for key in ['real_name', 'username', 'email']):
            logger.error("Required user data is missing.")
            return False
        
        template = get_approval_email_template()
        html_content = template.render(
            real_name=user_data['real_name'],
            username=user_data['username'],
            email=user_data['email']
        )
        
        message = MessageSchema(
            subject="🎉 동국대학교 음샘 홈페이지 가입 승인 완료",
            recipients=[user_data['email']],
            body=html_content,
            subtype="html"
        )
        
        await fastmail.send_message(message)
        logger.info(f"Approval email sent successfully: {user_data['email']}")
        return True
        
    except Exception as e:
        logger.error(f"Approval email sending failed: {e}")
        return False

async def send_integrated_approval_email(user_data: dict):
    """통합 가입/지원 승인 이메일 전송"""
    # 이메일 기능이 비활성화된 경우
    if not email_settings or not email_settings.MAIL_ENABLED:
        logger.info("Email functionality is disabled.")
        return False
    
    try:
        # 필수 데이터 검증
        if not all(key in user_data for key in ['real_name', 'email']):
            logger.error("Required user data is missing.")
            return False
        
        template = get_integrated_approval_email_template()
        html_content = template.render(
            real_name=user_data['real_name'],
            username=user_data.get('username', ''),
            email=user_data['email'],
            student_id=user_data.get('student_id', ''),
            major=user_data.get('major', ''),
            instrument=user_data.get('instrument', '미지정')
        )
        
        message = MessageSchema(
            subject="🎉 동국대학교 음샘 가입 및 지원 승인 완료",
            recipients=[user_data['email']],
            body=html_content,
            subtype="html"
        )
        
        await fastmail.send_message(message)
        logger.info(f"Integrated approval email sent successfully: {user_data['email']}")
        return True
        
    except Exception as e:
        logger.error(f"Integrated approval email sending failed: {e}")
        return False