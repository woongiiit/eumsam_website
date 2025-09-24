from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Comment, Post, User
from schemas import CommentCreate, CommentUpdate, CommentResponse
from auth import get_current_active_user

router = APIRouter()

@router.get("/posts/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    post_id: int,
    db: Session = Depends(get_db)
):
    """특정 게시글의 댓글 목록 조회"""
    # 게시글이 존재하는지 확인
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다"
        )
    
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    return comments

@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: int,
    comment_data: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """댓글 작성"""
    # 게시글이 존재하는지 확인
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="게시글을 찾을 수 없습니다"
        )
    
    # 댓글 생성
    comment = Comment(
        content=comment_data.content,
        post_id=post_id,
        author_id=current_user.id
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    return comment

@router.put("/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    comment_id: int,
    comment_update: CommentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """댓글 수정"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="댓글을 찾을 수 없습니다"
        )
    
    # 작성자 또는 관리자만 수정 가능
    if comment.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="댓글을 수정할 권한이 없습니다"
        )
    
    comment.content = comment_update.content
    db.commit()
    db.refresh(comment)
    
    return comment

@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """댓글 삭제"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="댓글을 찾을 수 없습니다"
        )
    
    # 작성자 또는 관리자만 삭제 가능
    if comment.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="댓글을 삭제할 권한이 없습니다"
        )
    
    db.delete(comment)
    db.commit()
    
    return {"message": "댓글이 삭제되었습니다"}
