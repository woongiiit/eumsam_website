from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import User, GalleryAlbum, GalleryItem
from schemas import GalleryAlbumCreate, GalleryAlbumResponse, GalleryItemResponse
from auth import get_current_active_user, get_current_user_optional
import os
import uuid
from datetime import datetime

# 환경변수로 스토리지 경로 설정 (Railway Volume 사용 시)
GALLERY_STORAGE_PATH = os.getenv("GALLERY_STORAGE_PATH", "static/gallery")

router = APIRouter()

@router.get("", response_model=List[GalleryAlbumResponse])
async def get_gallery_albums(
    skip: int = 0,
    limit: int = 20,
    category: str = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """갤러리 앨범 목록 조회 (누구나 조회 가능)"""
    
    query = db.query(GalleryAlbum)
    
    if category:
        query = query.filter(GalleryAlbum.category == category)
    
    albums = query.order_by(GalleryAlbum.created_at.desc()).offset(skip).limit(limit).all()
    return albums

@router.get("/{album_id}", response_model=GalleryAlbumResponse)
async def get_gallery_album(
    album_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """갤러리 앨범 상세 조회 (승인된 사용자만)"""
    # 승인된 사용자만 조회 가능
    if not current_user.is_approved:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자 승인 후 갤러리를 이용할 수 있습니다"
        )
    
    album = db.query(GalleryAlbum).filter(GalleryAlbum.id == album_id).first()
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="갤러리 앨범을 찾을 수 없습니다"
        )
    return album

@router.post("", response_model=GalleryAlbumResponse)
async def create_gallery_album(
    title: str = Form(...),
    description: str = Form(None),
    category: str = Form("기타"),
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """갤러리 앨범 생성 (관리자만)"""
    # 관리자만 업로드 가능
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="관리자만 갤러리 업로드가 가능합니다"
        )
    
    if not files or len(files) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="최소 1개 이상의 파일을 업로드해야 합니다"
        )
    
    # 파일 검증
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4', '.avi', '.mov', '.wmv'}
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    for file in files:
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="파일명이 없는 파일이 있습니다"
            )
        
        # 파일 타입 확인
        file_type = file.content_type
        if not file_type or not file_type.startswith(('image/', 'video/')):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="이미지 또는 비디오 파일만 업로드 가능합니다"
            )
        
        # 파일 확장자 검증
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"지원하지 않는 파일 형식입니다. 허용된 형식: {', '.join(allowed_extensions)}"
            )
    
    # 앨범 생성
    album = GalleryAlbum(
        title=title,
        description=description,
        category=category,
        uploader_id=current_user.id
    )
    
    db.add(album)
    db.commit()
    db.refresh(album)
    
    # 디렉토리 생성 (환경변수 사용)
    album_dir = f"{GALLERY_STORAGE_PATH}/{album.id}"
    print(f"앨범 디렉토리 생성: {album_dir}")
    os.makedirs(album_dir, exist_ok=True)
    print(f"디렉토리 생성 완료: {os.path.exists(album_dir)}")
    
    uploaded_files = []
    
    try:
        # 각 파일 처리
        for file in files:
            print(f"파일 처리 시작: {file.filename}")
            
            # 파일 크기 확인
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"파일 크기는 10MB 이하여야 합니다: {file.filename}"
                )
            
            # 파일 저장 경로 생성
            file_extension = os.path.splitext(file.filename)[1].lower()
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            file_path = f"{album_dir}/{unique_filename}"
            
            # 데이터베이스에 저장할 상대 경로 (정적 파일 경로)
            db_file_path = f"gallery/{album.id}/{unique_filename}"
            
            print(f"파일 저장 경로: {file_path}")
            
            # 파일 저장
            with open(file_path, "wb") as buffer:
                buffer.write(content)
            
            print(f"파일 저장 완료: {os.path.exists(file_path)}")
            print(f"파일 크기: {os.path.getsize(file_path)} bytes")
            
            # 데이터베이스에 저장
            gallery_item = GalleryItem(
                title=os.path.splitext(file.filename)[0],  # 확장자 제거한 파일명
                file_path=db_file_path,  # 데이터베이스에는 상대 경로 저장
                file_type="image" if file.content_type.startswith('image/') else "video",
                album_id=album.id,
                uploader_id=current_user.id
            )
            
            db.add(gallery_item)
            uploaded_files.append(file_path)
        
        db.commit()
        db.refresh(album)
        
        return album
        
    except Exception as e:
        # 파일 저장 실패 시 생성된 파일들 삭제
        for file_path in uploaded_files:
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # 앨범 디렉토리 삭제
        if os.path.exists(album_dir):
            os.rmdir(album_dir)
        
        # 데이터베이스에서 앨범 삭제
        db.delete(album)
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"파일 업로드 중 오류가 발생했습니다: {str(e)}"
        )

@router.delete("/{album_id}")
async def delete_gallery_album(
    album_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """갤러리 앨범 삭제"""
    album = db.query(GalleryAlbum).filter(GalleryAlbum.id == album_id).first()
    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="갤러리 앨범을 찾을 수 없습니다"
        )
    
    # 업로더 또는 관리자만 삭제 가능
    if album.uploader_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="갤러리 앨범을 삭제할 권한이 없습니다"
        )
    
    # 파일들 삭제
    album_dir = f"{GALLERY_STORAGE_PATH}/{album.id}"
    if os.path.exists(album_dir):
        for item in album.items:
            if os.path.exists(item.file_path):
                os.remove(item.file_path)
        os.rmdir(album_dir)
    
    # 데이터베이스에서 삭제 (cascade로 items도 함께 삭제됨)
    db.delete(album)
    db.commit()
    
    return {"message": "갤러리 앨범이 삭제되었습니다"}