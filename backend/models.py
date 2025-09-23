from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    real_name = Column(String, nullable=False)
    student_id = Column(String, unique=True, index=True)
    phone_number = Column(String)
    major = Column(String)
    year = Column(Integer)  # 학년
    is_approved = Column(Boolean, default=False)
    is_admin = Column(Boolean, default=False)
    application_status = Column(String, default="none")  # none, pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    posts = relationship("Post", back_populates="author")
    applications = relationship("Application", back_populates="applicant")

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String, nullable=False)  # 칭찬글, 정보글, 세션구인
    author_id = Column(Integer, ForeignKey("users.id"))
    is_pinned = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 관계 설정
    author = relationship("User", back_populates="posts")

class GalleryAlbum(Base):
    __tablename__ = "gallery_albums"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    category = Column(String, nullable=False)  # 공연, MT, 연습
    uploader_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    uploader = relationship("User")
    items = relationship("GalleryItem", back_populates="album", cascade="all, delete-orphan")

class GalleryItem(Base):
    __tablename__ = "gallery_items"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # image, video
    album_id = Column(Integer, ForeignKey("gallery_albums.id"))
    uploader_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    uploader = relationship("User")
    album = relationship("GalleryAlbum", back_populates="items")

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    applicant_id = Column(Integer, ForeignKey("users.id"))
    motivation = Column(Text, nullable=False)
    experience = Column(Text)
    instrument = Column(String)
    form_data = Column(Text)  # JSON 형태로 추가 질문 답변 저장
    status = Column(String, default="pending")  # pending, approved, rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime)
    reviewed_by = Column(Integer, ForeignKey("users.id"))  # 검토한 관리자 ID
    
    # 관계 설정
    applicant = relationship("User", back_populates="applications", foreign_keys=[applicant_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])

class StudyGroup(Base):
    __tablename__ = "study_groups"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text)
    leader_id = Column(Integer, ForeignKey("users.id"))
    max_participants = Column(Integer, default=10)
    current_participants = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 관계 설정
    leader = relationship("User")

class ApplicationForm(Base):
    __tablename__ = "application_forms"
    
    id = Column(Integer, primary_key=True, index=True)
    is_active = Column(Boolean, default=True)  # 지원 활성화 여부
    form_questions = Column(Text)  # JSON 형태로 질문들 저장
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    updated_by = Column(Integer, ForeignKey("users.id"))  # 마지막 수정자
    
    # 관계 설정
    updater = relationship("User")
