import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api'
import { Camera, Upload, Plus, Trash2, Image as ImageIcon, Video, User, Clock, Grid3X3 } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

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

const Gallery = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showUploadModal, setShowUploadModal] = useState(false)

  // ScrollToTop 컴포넌트가 전역적으로 처리하므로 제거

  const categories = [
    { value: '', label: '전체' },
    { value: '공연', label: '공연' },
    { value: 'MT', label: 'MT' },
    { value: '연습', label: '연습' },
    { value: '기타', label: '기타' }
  ]

  const { data: albums, isLoading } = useQuery(
    ['gallery', selectedCategory],
    async () => {
      const params = selectedCategory ? { category: selectedCategory } : {}
      const response = await api.get('/gallery', { params })
      // API 응답이 배열인지 확인하고, 아니면 빈 배열 반환
      return Array.isArray(response.data) ? response.data : []
    },
    {
      retry: false, // 403 오류 시 재시도하지 않음
      onError: (error: any) => {
        if (error.response?.status === 403) {
          console.log('갤러리 조회 권한이 없습니다.')
        }
      }
    }
  )

  const deleteMutation = useMutation(
    async (albumId: number) => {
      await api.delete(`/gallery/${albumId}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['gallery'])
        toast.success('갤러리 앨범이 삭제되었습니다')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || '삭제에 실패했습니다')
      }
    }
  )

  const handleDelete = (albumId: number) => {
    if (window.confirm('정말로 이 앨범을 삭제하시겠습니까? 앨범의 모든 사진이 함께 삭제됩니다.')) {
      deleteMutation.mutate(albumId)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MM/dd', { locale: ko })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '공연':
        return 'bg-rose-100 text-rose-700 border border-rose-200'
      case 'MT':
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      case '연습':
        return 'bg-sky-100 text-sky-700 border border-sky-200'
      case '기타':
        return 'bg-amber-100 text-amber-700 border border-amber-200'
      default:
        return 'bg-orange-100 text-orange-700 border border-orange-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6DD3C7] mx-auto mb-4"></div>
          <p className="text-[#EAEAEA] font-light">추억들을 불러오고 있어요...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-[#EAEAEA] mb-4">
            <span className="bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(109,211,199,0.3)]">갤러리</span>
          </h1>
          <p className="text-lg text-[#B0B0B0] font-light leading-relaxed max-w-2xl mx-auto">
            따뜻한 추억들이 담긴 음샘의 이야기를 함께 나누어요
          </p>
          <div className="mt-6 h-px bg-gradient-to-r from-transparent via-[#6DD3C7] to-transparent"></div>
        </div>

        {/* 카테고리 필터 */}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.value
                    ? 'bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] text-[#1A1A1A] shadow-md transform scale-105'
                    : 'bg-[#2A2A2A] text-[#EAEAEA] hover:bg-[#3A3A3A] hover:text-[#6DD3C7] border border-[#2A2A2A]'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 업로드 버튼 */}
        {user?.is_admin && (
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] text-[#1A1A1A] rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              새로운 추억 추가하기
            </button>
          </div>
        )}

        {/* 갤러리 그리드 */}
        {albums && Array.isArray(albums) && albums.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {albums.map((album: GalleryAlbum) => (
              <div key={album.id} className="bg-[#121212] border border-[#2A2A2A] rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg hover:bg-[#1A1A1A] transition-all duration-500">
                <Link to={`/gallery/${album.id}`}>
                  <div className="relative aspect-square bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A]">
                    {album.items && album.items.length > 0 ? (
                      <>
                        {album.items[0].file_type === 'image' ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/static/gallery/${album.id}/${album.items[0].file_path.split('/').pop()}`}
                            alt={album.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 ease-out"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTk5OTkiPuaXoOazleiDveWKoOi9vTwvdGV4dD48L3N2Zz4='
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800">
                            <Video className="w-12 h-12 text-white" />
                          </div>
                        )}
                        
                         {/* 사진 개수 표시 */}
                         {album.items.length > 1 && (
                           <div className="absolute top-3 right-3 bg-[#1A1A1A]/90 backdrop-blur-sm text-[#6DD3C7] px-3 py-1.5 rounded-full text-sm flex items-center shadow-sm border border-[#2A2A2A]">
                             <Grid3X3 className="w-4 h-4 mr-1" />
                             {album.items.length}
                           </div>
                         )}
                      </>
                     ) : (
                       <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A]">
                         <Camera className="w-12 h-12 text-[#6DD3C7]" />
                       </div>
                     )}
                    
                    {/* 삭제 버튼 */}
                    {user?.is_admin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDelete(album.id)
                        }}
                        className="absolute top-3 left-3 p-2 bg-red-500/90 backdrop-blur-sm text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600/90 border border-red-400/30 shadow-lg"
                        title="앨범 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </Link>
                
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-[#EAEAEA] truncate text-lg">{album.title}</h3>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(album.category)}`}>
                      {album.category}
                    </span>
                  </div>
                  
                  {album.description && (
                    <p className="text-sm text-[#B0B0B0] mb-4 line-clamp-2 leading-relaxed">
                      {album.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-[#6DD3C7] pt-2 border-t border-[#2A2A2A]">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3 text-[#6DD3C7]" />
                      <span className="font-medium">{album.uploader.username}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-[#6DD3C7]" />
                      <span>{formatDate(album.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-[#121212] border border-[#2A2A2A] rounded-2xl shadow-sm">
            <Camera className="w-16 h-16 text-[#6DD3C7] mx-auto mb-6" />
            <h3 className="text-xl font-light text-[#EAEAEA] mb-3">아직 추억이 없어요</h3>
            <p className="text-[#B0B0B0] font-light leading-relaxed max-w-md mx-auto">
              {selectedCategory 
                ? `${selectedCategory} 카테고리의 따뜻한 이야기를 기다리고 있어요.`
                : '음샘의 소중한 순간들을 담아서 공유해보세요.'
              }
            </p>
            {user?.is_admin && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] text-[#1A1A1A] rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                첫 번째 추억 만들기
              </button>
            )}
          </div>
        )}

        {/* 업로드 모달 */}
        {showUploadModal && user?.is_admin && (
          <UploadModal
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false)
              queryClient.invalidateQueries(['gallery'])
            }}
          />
        )}

        {/* 안내 메시지 */}
        {!user && (
          <div className="mt-6 bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6">
            <div className="text-center">
              <Camera className="w-12 h-12 text-[#6DD3C7] mx-auto mb-4" />
              <h4 className="font-medium text-[#EAEAEA] mb-2">앨범을 보려면 로그인이 필요합니다</h4>
              <p className="text-[#B0B0B0] text-sm mb-4">
                앨범 목록은 누구나 볼 수 있지만, 내용을 보려면 로그인 후 관리자 승인을 받아주세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/login" className="btn-primary">
                  로그인하기
                </Link>
                <Link to="/register" className="btn-secondary">
                  회원가입하기
                </Link>
              </div>
            </div>
          </div>
        )}

        {user && !user.is_approved && (
          <div className="mt-6 bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6">
            <div className="text-center">
              <Camera className="w-12 h-12 text-[#6DD3C7] mx-auto mb-4" />
              <h4 className="font-medium text-[#EAEAEA] mb-2">앨범을 보려면 승인이 필요합니다</h4>
              <p className="text-[#B0B0B0] text-sm mb-4">
                현재 관리자 승인 대기 중입니다. 승인 후 앨범 내용을 볼 수 있습니다.
              </p>
              <Link to="/application" className="btn-primary">
                지원하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 업로드 모달 컴포넌트
const UploadModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [files, setFiles] = useState<File[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('기타')
  const [isUploading, setIsUploading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!files.length || !title) {
      toast.error('파일과 제목을 입력해주세요')
      return
    }

    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)
      
      files.forEach((file) => {
        formData.append('files', file)
      })

      await api.post('/gallery', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      toast.success('업로드가 완료되었습니다!')
      onSuccess()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '업로드에 실패했습니다')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    
    if (selectedFiles.length === 0) return
    
    // 파일 크기 체크 (10MB)
    const oversizedFiles = selectedFiles.filter(file => file.size > 10 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      toast.error('파일 크기는 10MB 이하여야 합니다')
      return
    }
    
    // 파일 타입 체크
    const invalidFiles = selectedFiles.filter(file => 
      !file.type.startsWith('image/') && !file.type.startsWith('video/')
    )
    if (invalidFiles.length > 0) {
      toast.error('이미지 또는 비디오 파일만 업로드 가능합니다')
      return
    }
    
    setFiles(selectedFiles)
    if (!title) {
      setTitle(selectedFiles[0].name.split('.')[0])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-amber-100">
        <div className="p-8">
          <h2 className="text-2xl font-light text-gray-800 mb-2 text-center">
            <span className="font-serif italic text-amber-700">새로운 추억 만들기</span>
          </h2>
          <p className="text-center text-gray-500 text-sm mb-6">소중한 순간들을 담아서 공유해보세요</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                파일들 * (여러 파일 선택 가능)
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="input-field"
                required
              />
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700 truncate">
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                앨범 제목 *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field"
                placeholder="앨범 제목을 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                설명
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="앨범 설명을 입력하세요 (선택사항)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-field"
              >
                <option value="공연">공연</option>
                <option value="MT">MT</option>
                <option value="연습">연습</option>
                <option value="기타">기타</option>
              </select>
            </div>

             <div className="flex justify-center space-x-4 pt-6">
               <button
                 type="button"
                 onClick={onClose}
                 className="px-6 py-3 bg-white/50 text-gray-600 rounded-full font-medium border border-gray-200 hover:bg-gray-50 transition-all duration-300"
               >
                 취소
               </button>
               <button
                 type="submit"
                 disabled={isUploading || !files.length || !title}
                 className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-full font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
               >
                 {isUploading ? '추억을 담는 중...' : '추억 저장하기'}
               </button>
             </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Gallery