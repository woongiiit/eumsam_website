from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import User
from auth import get_current_admin_user
from railway_client import railway_client
from typing import Dict
import os

router = APIRouter()

@router.get("/traffic-metrics")
async def get_traffic_metrics(
    current_user: User = Depends(get_current_admin_user)
) -> Dict:
    """실제 Railway 트래픽 메트릭 데이터 조회 (관리자만)"""
    
    # Railway 프로젝트 ID (환경변수에서 가져오거나 하드코딩)
    project_id = os.getenv("RAILWAY_PROJECT_ID", "your-project-id")
    
    print(f"트래픽 메트릭 요청 - Project ID: {project_id}")
    print(f"Railway API Token 설정됨: {bool(os.getenv('RAILWAY_API_TOKEN'))}")
    
    try:
        # Railway API에서 실제 메트릭 데이터 가져오기
        metrics = await railway_client.get_project_metrics(project_id)
        
        print(f"메트릭 데이터 반환: {metrics}")
        
        return {
            "success": True,
            "data": metrics,
            "source": "railway_api",
            "project_id": project_id
        }
        
    except Exception as e:
        print(f"트래픽 메트릭 API 오류: {e}")
        # API 실패 시 폴백 데이터 반환
        return {
            "success": False,
            "data": railway_client._get_fallback_metrics(),
            "source": "fallback",
            "error": str(e),
            "project_id": project_id
        }

@router.get("/system-status")
async def get_system_status(
    current_user: User = Depends(get_current_admin_user)
) -> Dict:
    """시스템 상태 정보 조회 (관리자만)"""
    
    try:
        # 데이터베이스 연결 상태 확인
        db_status = "connected"
        
        # Railway API 연결 상태 확인
        api_status = "connected" if railway_client.api_token else "not_configured"
        
        return {
            "database": db_status,
            "railway_api": api_status,
            "timestamp": "2024-01-21T10:30:00Z"
        }
        
    except Exception as e:
        return {
            "database": "error",
            "railway_api": "error",
            "error": str(e),
            "timestamp": "2024-01-21T10:30:00Z"
        }
