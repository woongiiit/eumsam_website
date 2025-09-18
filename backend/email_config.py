from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from pydantic_settings import BaseSettings
import os
import logging

logger = logging.getLogger(__name__)

class EmailSettings(BaseSettings):
    MAIL_USERNAME: str = "eumsaem.band@gmail.com"
    MAIL_PASSWORD: str = "your-app-password"
    MAIL_FROM: str = "eumsaem.band@gmail.com"
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True
    MAIL_ENABLED: bool = True  # 이메일 기능 활성화/비활성화

    class Config:
        env_file = ".env"
        extra = "ignore"  # 추가 필드 무시

try:
    email_settings = EmailSettings()
    
    # 이메일 설정 검증
    if email_settings.MAIL_PASSWORD == "your-app-password":
        logger.warning("Email password is default value. Please configure in .env file.")
        email_settings.MAIL_ENABLED = False
    
    conf = ConnectionConfig(
        MAIL_USERNAME=email_settings.MAIL_USERNAME,
        MAIL_PASSWORD=email_settings.MAIL_PASSWORD,
        MAIL_FROM=email_settings.MAIL_FROM,
        MAIL_PORT=email_settings.MAIL_PORT,
        MAIL_SERVER=email_settings.MAIL_SERVER,
        MAIL_STARTTLS=email_settings.MAIL_STARTTLS,
        MAIL_SSL_TLS=email_settings.MAIL_SSL_TLS,
        USE_CREDENTIALS=email_settings.USE_CREDENTIALS,
        VALIDATE_CERTS=email_settings.VALIDATE_CERTS,
    )

    fastmail = FastMail(conf)
    
except Exception as e:
    logger.error(f"Email configuration initialization failed: {e}")
    email_settings = None
    fastmail = None
