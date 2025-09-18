import logging
import sys

def setup_logging():
    """로깅 설정"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('eumsaem.log', encoding='utf-8')
        ]
    )
    
    # 이메일 관련 로깅 레벨 조정
    logging.getLogger('email_service').setLevel(logging.INFO)
    logging.getLogger('email_config').setLevel(logging.INFO)
    
    return logging.getLogger(__name__)
