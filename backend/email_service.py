from fastapi_mail import MessageSchema
from email_config import fastmail, email_settings
from email_templates import (
    get_welcome_email_template, 
    get_approval_email_template, 
    get_application_approval_email_template
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

async def send_application_approval_email(application_data: dict):
    """입부신청 승인 이메일 전송"""
    # 이메일 기능이 비활성화된 경우
    if not email_settings or not email_settings.MAIL_ENABLED:
        logger.info("Email functionality is disabled.")
        return False
    
    try:
        # 필수 데이터 검증
        if not all(key in application_data for key in ['real_name', 'email']):
            logger.error("Required application data is missing.")
            return False
        
        template = get_application_approval_email_template()
        html_content = template.render(
            real_name=application_data['real_name'],
            instrument=application_data.get('instrument', '미지정'),
            motivation=application_data.get('motivation', '')
        )
        
        message = MessageSchema(
            subject="🎉 동국대학교 음샘 입부 승인 완료",
            recipients=[application_data['email']],
            body=html_content,
            subtype="html"
        )
        
        await fastmail.send_message(message)
        logger.info(f"Application approval email sent successfully: {application_data['email']}")
        return True
        
    except Exception as e:
        logger.error(f"Application approval email sending failed: {e}")
        return False