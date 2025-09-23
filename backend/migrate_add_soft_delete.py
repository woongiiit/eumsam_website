#!/usr/bin/env python3
"""
데이터베이스 마이그레이션 스크립트
is_deleted와 deleted_at 필드를 추가합니다.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# 환경 변수에서 데이터베이스 URL 가져오기
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("DATABASE_URL 환경 변수가 설정되지 않았습니다.")
    sys.exit(1)

# PostgreSQL URL을 SQLAlchemy 형식으로 변환
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def migrate_add_soft_delete():
    """소프트 삭제 필드를 추가하는 마이그레이션"""
    try:
        with engine.connect() as connection:
            # 트랜잭션 시작
            trans = connection.begin()
            
            try:
                # is_deleted 컬럼 추가 (기본값 false)
                print("is_deleted 컬럼 추가 중...")
                connection.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE
                """))
                
                # deleted_at 컬럼 추가 (nullable)
                print("deleted_at 컬럼 추가 중...")
                connection.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP
                """))
                
                # 기존 데이터의 is_deleted를 false로 설정
                print("기존 데이터 업데이트 중...")
                connection.execute(text("""
                    UPDATE users 
                    SET is_deleted = FALSE 
                    WHERE is_deleted IS NULL
                """))
                
                # 트랜잭션 커밋
                trans.commit()
                print("마이그레이션 완료!")
                
            except Exception as e:
                # 오류 발생 시 롤백
                trans.rollback()
                print(f"마이그레이션 실패: {e}")
                raise
                
    except Exception as e:
        print(f"데이터베이스 연결 실패: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate_add_soft_delete()
