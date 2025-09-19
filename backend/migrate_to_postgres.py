#!/usr/bin/env python3
"""
SQLite에서 PostgreSQL로 데이터 마이그레이션 스크립트
Railway 배포 시 사용
"""

import sqlite3
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from models import Base, User, Post, Gallery, Application
import logging

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_sqlite_to_postgres():
    """SQLite 데이터를 PostgreSQL로 마이그레이션"""
    
    # SQLite 파일 존재 확인
    if not os.path.exists('eumsaem.db'):
        logger.info("SQLite 파일이 없습니다. 마이그레이션을 건너뛰고 PostgreSQL 테이블만 생성합니다.")
        # PostgreSQL 연결만 하고 테이블 생성
        database_url = os.getenv('DATABASE_URL')
        if not database_url:
            logger.error("DATABASE_URL 환경 변수가 설정되지 않았습니다.")
            return
        
        engine = create_engine(database_url)
        Base.metadata.create_all(bind=engine)
        logger.info("PostgreSQL 테이블 생성 완료!")
        return
    
    # SQLite 연결
    sqlite_conn = sqlite3.connect('eumsaem.db')
    sqlite_cursor = sqlite_conn.cursor()
    
    # PostgreSQL 연결
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        logger.error("DATABASE_URL 환경 변수가 설정되지 않았습니다.")
        return
    
    # PostgreSQL 엔진 생성
    engine = create_engine(database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # 테이블 생성
    Base.metadata.create_all(bind=engine)
    
    try:
        # 사용자 데이터 마이그레이션
        logger.info("사용자 데이터 마이그레이션 시작...")
        sqlite_cursor.execute("SELECT * FROM users")
        users = sqlite_cursor.fetchall()
        
        db = SessionLocal()
        for user in users:
            try:
                db.execute(text("""
                    INSERT INTO users (id, username, email, hashed_password, is_active, is_admin, is_approved, created_at, updated_at)
                    VALUES (:id, :username, :email, :hashed_password, :is_active, :is_admin, :is_approved, :created_at, :updated_at)
                    ON CONFLICT (id) DO NOTHING
                """), {
                    'id': user[0],
                    'username': user[1],
                    'email': user[2],
                    'hashed_password': user[3],
                    'is_active': user[4],
                    'is_admin': user[5],
                    'is_approved': user[6] if len(user) > 6 else True,  # 기본값 True
                    'created_at': user[7] if len(user) > 7 else user[6],
                    'updated_at': user[8] if len(user) > 8 else user[7]
                })
            except Exception as e:
                logger.warning(f"사용자 {user[1]} 마이그레이션 실패: {e}")
        
        # 게시글 데이터 마이그레이션
        logger.info("게시글 데이터 마이그레이션 시작...")
        sqlite_cursor.execute("SELECT * FROM posts")
        posts = sqlite_cursor.fetchall()
        
        for post in posts:
            try:
                db.execute(text("""
                    INSERT INTO posts (id, title, content, author_id, created_at, updated_at)
                    VALUES (:id, :title, :content, :author_id, :created_at, :updated_at)
                    ON CONFLICT (id) DO NOTHING
                """), {
                    'id': post[0],
                    'title': post[1],
                    'content': post[2],
                    'author_id': post[3],
                    'created_at': post[4],
                    'updated_at': post[5]
                })
            except Exception as e:
                logger.warning(f"게시글 {post[1]} 마이그레이션 실패: {e}")
        
        # 갤러리 데이터 마이그레이션
        logger.info("갤러리 데이터 마이그레이션 시작...")
        sqlite_cursor.execute("SELECT * FROM gallery")
        gallery_items = sqlite_cursor.fetchall()
        
        for item in gallery_items:
            try:
                db.execute(text("""
                    INSERT INTO gallery (id, title, description, image_path, uploaded_by, created_at, updated_at)
                    VALUES (:id, :title, :description, :image_path, :uploaded_by, :created_at, :updated_at)
                    ON CONFLICT (id) DO NOTHING
                """), {
                    'id': item[0],
                    'title': item[1],
                    'description': item[2],
                    'image_path': item[3],
                    'uploaded_by': item[4],
                    'created_at': item[5],
                    'updated_at': item[6]
                })
            except Exception as e:
                logger.warning(f"갤러리 아이템 {item[1]} 마이그레이션 실패: {e}")
        
        # 입부신청 데이터 마이그레이션
        logger.info("입부신청 데이터 마이그레이션 시작...")
        sqlite_cursor.execute("SELECT * FROM applications")
        applications = sqlite_cursor.fetchall()
        
        for app in applications:
            try:
                db.execute(text("""
                    INSERT INTO applications (id, name, student_id, major, phone, email, motivation, experience, status, created_at, updated_at)
                    VALUES (:id, :name, :student_id, :major, :phone, :email, :motivation, :experience, :status, :created_at, :updated_at)
                    ON CONFLICT (id) DO NOTHING
                """), {
                    'id': app[0],
                    'name': app[1],
                    'student_id': app[2],
                    'major': app[3],
                    'phone': app[4],
                    'email': app[5],
                    'motivation': app[6],
                    'experience': app[7],
                    'status': app[8],
                    'created_at': app[9],
                    'updated_at': app[10]
                })
            except Exception as e:
                logger.warning(f"입부신청 {app[1]} 마이그레이션 실패: {e}")
        
        db.commit()
        logger.info("데이터 마이그레이션 완료!")
        
    except Exception as e:
        logger.error(f"마이그레이션 중 오류 발생: {e}")
        db.rollback()
    finally:
        db.close()
        sqlite_conn.close()

if __name__ == "__main__":
    migrate_sqlite_to_postgres()
