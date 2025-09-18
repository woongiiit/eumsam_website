"""
새로운 갤러리 테이블 생성 스크립트
"""
import sqlite3
import os
from datetime import datetime

def create_new_tables():
    # 데이터베이스 파일 경로
    db_path = "eumsaem.db"
    
    if not os.path.exists(db_path):
        print("데이터베이스 파일을 찾을 수 없습니다.")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 기존 gallery_items 테이블이 있는지 확인
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='gallery_items'")
        if cursor.fetchone():
            print("기존 gallery_items 테이블을 삭제합니다...")
            cursor.execute("DROP TABLE gallery_items")
        
        # 새로운 테이블들 생성
        print("새로운 갤러리 테이블들을 생성합니다...")
        
        cursor.execute("""
            CREATE TABLE gallery_albums (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR NOT NULL,
                description TEXT,
                category VARCHAR NOT NULL,
                uploader_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (uploader_id) REFERENCES users (id)
            )
        """)
        
        cursor.execute("""
            CREATE TABLE gallery_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title VARCHAR NOT NULL,
                file_path VARCHAR NOT NULL,
                file_type VARCHAR NOT NULL,
                album_id INTEGER NOT NULL,
                uploader_id INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (album_id) REFERENCES gallery_albums (id),
                FOREIGN KEY (uploader_id) REFERENCES users (id)
            )
        """)
        
        conn.commit()
        print("새로운 갤러리 테이블들이 성공적으로 생성되었습니다!")
        
        # 테이블 확인
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        print("현재 데이터베이스의 테이블들:")
        for table in tables:
            print(f"  - {table[0]}")
        
    except Exception as e:
        print(f"테이블 생성 중 오류 발생: {e}")
        conn.rollback()
        
    finally:
        conn.close()

if __name__ == "__main__":
    create_new_tables()
