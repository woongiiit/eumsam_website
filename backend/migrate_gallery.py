"""
갤러리 데이터베이스 마이그레이션 스크립트
기존 gallery_items 테이블을 새로운 구조로 변경
"""
import sqlite3
import os
from datetime import datetime

def migrate_gallery():
    # 데이터베이스 파일 경로
    db_path = "eumsaem.db"
    
    if not os.path.exists(db_path):
        print("데이터베이스 파일을 찾을 수 없습니다.")
        return
    
    # 백업 생성
    backup_path = f"eumsaem_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    import shutil
    shutil.copy2(db_path, backup_path)
    print(f"데이터베이스 백업 생성: {backup_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # 1. 기존 gallery_items 테이블의 데이터 백업
        cursor.execute("SELECT * FROM gallery_items")
        old_items = cursor.fetchall()
        
        # 2. 기존 테이블 삭제
        cursor.execute("DROP TABLE IF EXISTS gallery_items")
        
        # 3. 새로운 테이블들 생성
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
        
        # 4. 기존 데이터를 새로운 구조로 마이그레이션
        if old_items:
            print(f"기존 {len(old_items)}개의 갤러리 아이템을 마이그레이션합니다...")
            
            for item in old_items:
                # 각 아이템을 개별 앨범으로 생성
                album_title = f"마이그레이션된 앨범 - {item[1]}"  # title
                album_description = item[2] if item[2] else None  # description
                category = item[4]  # category
                uploader_id = item[5]  # uploader_id
                created_at = item[6]  # created_at
                
                # 앨범 생성
                cursor.execute("""
                    INSERT INTO gallery_albums (title, description, category, uploader_id, created_at)
                    VALUES (?, ?, ?, ?, ?)
                """, (album_title, album_description, category, uploader_id, created_at))
                
                album_id = cursor.lastrowid
                
                # 아이템 생성
                cursor.execute("""
                    INSERT INTO gallery_items (title, file_path, file_type, album_id, uploader_id, created_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (item[1], item[3], item[4], album_id, uploader_id, created_at))
        
        conn.commit()
        print("갤러리 마이그레이션이 완료되었습니다!")
        
    except Exception as e:
        print(f"마이그레이션 중 오류 발생: {e}")
        conn.rollback()
        print("변경사항이 롤백되었습니다.")
        
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_gallery()
