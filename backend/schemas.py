from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# 사용자 관련 스키마
class UserBase(BaseModel):
    email: EmailStr
    username: str
    real_name: str
    student_id: Optional[str] = None
    phone_number: Optional[str] = None
    major: Optional[str] = None
    year: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    is_approved: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    real_name: Optional[str] = None
    phone_number: Optional[str] = None
    major: Optional[str] = None
    year: Optional[int] = None

class UserRoleUpdate(BaseModel):
    is_admin: bool

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserDelete(BaseModel):
    password: str

# 게시글 관련 스키마
class PostBase(BaseModel):
    title: str
    content: str
    category: str

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    author_id: int
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    author: UserResponse
    
    class Config:
        from_attributes = True

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

# 갤러리 관련 스키마
# 갤러리 아이템 관련 스키마
class GalleryItemBase(BaseModel):
    title: str

class GalleryItemCreate(GalleryItemBase):
    file_type: str

class GalleryItemResponse(GalleryItemBase):
    id: int
    file_path: str
    file_type: str
    album_id: int
    uploader_id: int
    created_at: datetime
    uploader: UserResponse
    
    class Config:
        from_attributes = True

# 갤러리 앨범 관련 스키마
class GalleryAlbumBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str

class GalleryAlbumCreate(GalleryAlbumBase):
    pass

class GalleryAlbumResponse(GalleryAlbumBase):
    id: int
    uploader_id: int
    created_at: datetime
    uploader: UserResponse
    items: List[GalleryItemResponse]
    
    class Config:
        from_attributes = True

# 입부신청 관련 스키마
class ApplicationBase(BaseModel):
    motivation: str
    experience: Optional[str] = None
    instrument: Optional[str] = None
    form_data: Optional[str] = None  # JSON 문자열

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationResponse(ApplicationBase):
    id: int
    applicant_id: int
    status: str
    created_at: datetime
    reviewed_at: Optional[datetime]
    reviewed_by: Optional[int]
    applicant: UserResponse
    
    class Config:
        from_attributes = True

class ApplicationUpdate(BaseModel):
    status: str

# 통합 지원/가입 스키마
class IntegratedApplicationCreate(BaseModel):
    # 회원가입 정보
    email: EmailStr
    username: str
    password: str
    real_name: str
    student_id: Optional[str] = None
    phone_number: Optional[str] = None
    major: Optional[str] = None
    year: Optional[int] = None
    
    # 지원서 정보
    motivation: str
    experience: Optional[str] = None
    instrument: Optional[str] = None
    form_data: Optional[str] = None  # JSON 문자열

# 신청 양식 관련 스키마
class ApplicationFormBase(BaseModel):
    is_active: bool = True
    max_applicants: int = 0  # 0이면 무제한
    current_applicants: int = 0
    form_questions: Optional[str] = None  # JSON 문자열

class ApplicationFormCreate(ApplicationFormBase):
    pass

class ApplicationFormUpdate(ApplicationFormBase):
    pass

class ApplicationFormResponse(ApplicationFormBase):
    id: int
    created_at: datetime
    updated_at: datetime
    updated_by: Optional[int] = None
    
    class Config:
        from_attributes = True

# 스터디 그룹 관련 스키마
class StudyGroupBase(BaseModel):
    name: str
    description: Optional[str] = None
    max_participants: int = 10

class StudyGroupCreate(StudyGroupBase):
    pass

class StudyGroupResponse(StudyGroupBase):
    id: int
    leader_id: int
    current_participants: int
    is_active: bool
    created_at: datetime
    leader: UserResponse
    
    class Config:
        from_attributes = True

# 토큰 관련 스키마
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
