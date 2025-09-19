import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { ArrowLeft, User, Clock, Grid3X3, ChevronLeft, ChevronRight, X, Camera } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface GalleryAlbum {
  id: number
  title: string
  description: string
  category: string
  uploader_id: number
  created_at: string
  uploader: {
    id: number
    username: string
    real_name: string
  }
  items: GalleryItem[]
}

interface GalleryItem {
  id: number
  title: string
  file_path: string
  file_type: string
  album_id: number
  uploader_id: number
  created_at: string
  uploader: {
    id: number
    username: string
    real_name: string
  }
}

const GalleryDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)

  const { data: album, isLoading, error } = useQuery(
    ['gallery', id],
    async () => {
      const response = await api.get(`/gallery/${id}`)
      return response.data as GalleryAlbum
    },
    {
      enabled: !!id && !!user?.is_approved, // 승인된 사용자만 API 호출
      retry: false, // 403 오류 시 재시도하지 않음
      onError: (error: any) => {
        if (error.response?.status === 403) {
          console.log('앨범 조회 권한이 없습니다.')
        }
      }
    }
  )

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MM/dd HH:mm', { locale: ko })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '공연':
        return 'bg-red-100 text-red-800'
      case 'MT':
        return 'bg-green-100 text-green-800'
      case '연습':
        return 'bg-blue-100 text-blue-800'
      case '기타':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-purple-100 text-purple-800'
    }
  }

  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setShowLightbox(true)
  }

  const closeLightbox = () => {
    setShowLightbox(false)
  }

  const nextImage = () => {
    if (album?.items) {
      setCurrentIndex((prev) => (prev + 1) % album.items.length)
    }
  }

  const prevImage = () => {
    if (album?.items) {
      setCurrentIndex((prev) => (prev - 1 + album.items.length) % album.items.length)
    }
  }

  // ESC 키로 라이트박스 닫기
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showLightbox) {
        closeLightbox()
      }
    }

    if (showLightbox) {
      document.addEventListener('keydown', handleKeyDown)
      // 스크롤 방지
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [showLightbox])

  // 로그인하지 않았거나 승인받지 않은 사용자는 로딩 상태를 표시하지 않음
  if (isLoading && user?.is_approved) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6DD3C7] mx-auto mb-4"></div>
          <p className="text-[#EAEAEA]">앨범을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않았거나 승인받지 않은 사용자에게는 접근 제한 메시지 표시
  if (!user?.is_approved) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/gallery')}
              className="inline-flex items-center text-[#B0B0B0] hover:text-[#6DD3C7] mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              갤러리로 돌아가기
            </button>
          </div>

          {/* 접근 제한 메시지 */}
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="text-center py-12">
                <Camera className="w-16 h-16 text-[#6DD3C7] mx-auto mb-6" />
                <h3 className="text-xl font-bold text-[#EAEAEA] mb-4">회원만 접근 가능합니다</h3>
                <p className="text-[#B0B0B0] text-lg mb-6">
                  로그인 후 승인받은 회원만 앨범을 볼 수 있습니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!user ? (
                    <>
                      <button
                        onClick={() => navigate('/login')}
                        className="btn-primary"
                      >
                        로그인하기
                      </button>
                      <button
                        onClick={() => navigate('/register')}
                        className="btn-secondary"
                      >
                        회원가입하기
                      </button>
                    </>
                  ) : !user.is_approved ? (
                    <div className="text-center">
                      <p className="text-[#B0B0B0] mb-4">관리자 승인을 기다리고 있습니다.</p>
                      <button
                        onClick={() => navigate('/application')}
                        className="btn-primary"
                      >
                        지원하기
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !album) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#EAEAEA] mb-4">앨범을 찾을 수 없습니다</h2>
          <button
            onClick={() => navigate('/gallery')}
            className="btn-primary"
          >
            갤러리로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/gallery')}
            className="inline-flex items-center text-[#B0B0B0] hover:text-[#6DD3C7] mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            갤러리로 돌아가기
          </button>
          
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-[#EAEAEA] mb-2">{album.title}</h1>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(album.category)}`}>
                  {album.category}
                </span>
              </div>
            </div>
            
            {album.description && (
              <p className="text-[#B0B0B0] mb-4">{album.description}</p>
            )}
            
            <div className="flex items-center space-x-6 text-sm text-[#6DD3C7]">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{album.uploader.username}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(album.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Grid3X3 className="w-4 h-4" />
                <span>{album.items.length}장</span>
              </div>
            </div>
          </div>
        </div>

        {/* 이미지 그리드 */}
        {album.items && album.items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {album.items.map((item, index) => (
              <div
                key={item.id}
                className="aspect-square bg-[#2A2A2A] rounded-lg overflow-hidden cursor-pointer group"
                onClick={() => openLightbox(index)}
              >
                {item.file_type === 'image' ? (
                  <img
                    src={`http://localhost:8000/${item.file_path}`}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPuaXoOazleiDveWKoOi9vTwvdGV4dD48L3N2Zz4='
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#1A1A1A]">
                    <div className="text-center text-white">
                      <div className="w-12 h-12 mx-auto mb-2 bg-[#2A2A2A] rounded-full flex items-center justify-center">
                        <span className="text-lg">▶</span>
                      </div>
                      <p className="text-xs">비디오</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#121212] border border-[#2A2A2A] rounded-xl shadow-lg">
            <Grid3X3 className="w-16 h-16 text-[#6DD3C7] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[#EAEAEA] mb-2">이미지가 없습니다</h3>
            <p className="text-[#B0B0B0]">이 앨범에는 이미지가 없습니다.</p>
          </div>
        )}

        {/* 라이트박스 */}
        {showLightbox && album.items && album.items[currentIndex] && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            onClick={closeLightbox}
          >
            <div 
              className="relative max-w-4xl max-h-full p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white hover:text-gray-300 z-10 rounded-full p-2 transition-all duration-200"
              >
                <X className="w-6 h-6" />
              </button>
              
              {album.items[currentIndex].file_type === 'image' ? (
                <img
                  src={`http://localhost:8000/${album.items[currentIndex].file_path}`}
                  alt={album.items[currentIndex].title}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={`http://localhost:8000/${album.items[currentIndex].file_path}`}
                  controls
                  className="max-w-full max-h-full"
                />
              )}
              
              {/* 네비게이션 버튼 */}
              {album.items.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
              
              {/* 이미지 정보 */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="bg-black bg-opacity-50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-1">
                    {album.items[currentIndex].title}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {currentIndex + 1} / {album.items.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GalleryDetail
