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
from models import Base, User, Post, GalleryAlbum, GalleryItem, Application
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
        
        # 갤러리 앨범 데이터 마이그레이션
        logger.info("갤러리 앨범 데이터 마이그레이션 시작...")
        try:
            sqlite_cursor.execute("SELECT * FROM gallery_albums")
            gallery_albums = sqlite_cursor.fetchall()
            
            for album in gallery_albums:
                try:
                    db.execute(text("""
                        INSERT INTO gallery_albums (id, title, description, category, uploader_id, created_at)
                        VALUES (:id, :title, :description, :category, :uploader_id, :created_at)
                        ON CONFLICT (id) DO NOTHING
                    """), {
                        'id': album[0],
                        'title': album[1],
                        'description': album[2],
                        'category': album[3],
                        'uploader_id': album[4],
                        'created_at': album[5]
                    })
                except Exception as e:
                    logger.warning(f"갤러리 앨범 {album[1]} 마이그레이션 실패: {e}")
        except Exception as e:
            logger.info("갤러리 앨범 테이블이 없습니다. 건너뜁니다.")
        
        # 갤러리 아이템 데이터 마이그레이션
        logger.info("갤러리 아이템 데이터 마이그레이션 시작...")
        try:
            sqlite_cursor.execute("SELECT * FROM gallery_items")
            gallery_items = sqlite_cursor.fetchall()
            
            for item in gallery_items:
                try:
                    db.execute(text("""
                        INSERT INTO gallery_items (id, title, file_path, file_type, album_id, uploader_id, created_at)
                        VALUES (:id, :title, :file_path, :file_type, :album_id, :uploader_id, :created_at)
                        ON CONFLICT (id) DO NOTHING
                    """), {
                        'id': item[0],
                        'title': item[1],
                        'file_path': item[2],
                        'file_type': item[3],
                        'album_id': item[4],
                        'uploader_id': item[5],
                        'created_at': item[6]
                    })
                except Exception as e:
                    logger.warning(f"갤러리 아이템 {item[1]} 마이그레이션 실패: {e}")
        except Exception as e:
            logger.info("갤러리 아이템 테이블이 없습니다. 건너뜁니다.")
        
        # 입부신청 데이터 마이그레이션
        logger.info("입부신청 데이터 마이그레이션 시작...")
        try:
            sqlite_cursor.execute("SELECT * FROM applications")
            applications = sqlite_cursor.fetchall()
            
            for app in applications:
                try:
                    db.execute(text("""
                        INSERT INTO applications (id, applicant_id, motivation, experience, instrument, status, created_at, reviewed_at)
                        VALUES (:id, :applicant_id, :motivation, :experience, :instrument, :status, :created_at, :reviewed_at)
                        ON CONFLICT (id) DO NOTHING
                    """), {
                        'id': app[0],
                        'applicant_id': app[1],
                        'motivation': app[2],
                        'experience': app[3],
                        'instrument': app[4],
                        'status': app[5],
                        'created_at': app[6],
                        'reviewed_at': app[7]
                    })
                except Exception as e:
                    logger.warning(f"입부신청 {app[0]} 마이그레이션 실패: {e}")
        except Exception as e:
            logger.info("입부신청 테이블이 없습니다. 건너뜁니다.")
        
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
