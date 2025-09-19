import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Plus, MessageSquare, Pin, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

interface Post {
  id: number
  title: string
  content: string
  category: string
  author_id: number
  is_pinned: boolean
  created_at: string
  updated_at: string
  author: {
    id: number
    username: string
    real_name: string
  }
}

const Board = () => {
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPosts, setTotalPosts] = useState(0)
  
  const postsPerPage = 10

  const categories = [
    { value: '', label: '전체' },
    { value: '칭찬글', label: '칭찬글' },
    { value: '정보글', label: '정보글' },
    { value: '세션구인', label: '세션구인' },
    { value: '자유글', label: '자유글' }
  ]

  const { data: posts, isLoading, refetch } = useQuery(
    ['posts', selectedCategory, currentPage],
    async () => {
      const params = {
        skip: (currentPage - 1) * postsPerPage,
        limit: postsPerPage,
        ...(selectedCategory && { category: selectedCategory })
      }
      const response = await api.get('/posts', { params })
      return response.data
    },
    {
      retry: false, // 403 오류 시 재시도하지 않음
      onError: (error: any) => {
        if (error.response?.status === 403) {
          console.log('게시글 조회 권한이 없습니다.')
        }
      }
    }
  )

  // 전체 게시글 수 조회
  const { data: allPosts } = useQuery(
    ['posts-count', selectedCategory],
    async () => {
      const params = selectedCategory ? { category: selectedCategory, limit: 1000 } : { limit: 1000 }
      const response = await api.get('/posts', { params })
      return response.data
    },
    {
      retry: false, // 403 오류 시 재시도하지 않음
      onError: (error: any) => {
        if (error.response?.status === 403) {
          console.log('게시글 수 조회 권한이 없습니다.')
        }
      }
    }
  )

  // 카테고리 변경 시 첫 페이지로 이동
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory])

  // 전체 게시글 수 업데이트
  useEffect(() => {
    if (allPosts) {
      setTotalPosts(allPosts.length)
    }
  }, [allPosts])

  const totalPages = Math.ceil(totalPosts / postsPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MM/dd HH:mm', { locale: ko })
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '칭찬글':
        return 'bg-yellow-100 text-yellow-800'
      case '정보글':
        return 'bg-blue-100 text-blue-800'
      case '세션구인':
        return 'bg-green-100 text-green-800'
      case '자유글':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6DD3C7] mx-auto mb-4"></div>
          <p className="text-[#EAEAEA]">게시글을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#EAEAEA] mb-4">
            <span className="bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(109,211,199,0.3)]">커뮤니티</span>
          </h1>
          <p className="text-xl text-[#B0B0B0]">
            음샘 멤버들과 소통하고 정보를 공유하는 공간입니다
          </p>
        </div>

        {/* 카테고리 필터 */}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => setSelectedCategory(category.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.value
                    ? 'bg-[#6DD3C7] text-[#1A1A1A]'
                    : 'bg-[#2A2A2A] text-[#EAEAEA] hover:bg-[#3A3A3A]'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* 게시글 작성 버튼 */}
        {user?.is_approved && (
          <div className="mb-6">
            <Link to="/board/create" className="btn-primary inline-flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              글쓰기
            </Link>
          </div>
        )}

        {/* 게시글 목록 */}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl shadow-lg overflow-hidden">
          {posts && posts.length > 0 ? (
            <>
              <div className="divide-y divide-[#2A2A2A]">
                {posts.map((post: Post) => (
                  <Link
                    key={post.id}
                    to={`/board/${post.id}`}
                    className="block p-6 hover:bg-[#1A1A1A] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          {post.is_pinned && (
                            <Pin className="w-4 h-4 text-red-500" />
                          )}
                          <h3 className={`text-lg font-semibold text-[#EAEAEA] ${
                            post.is_pinned ? 'text-red-400' : ''
                          }`}>
                            {post.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(post.category)}`}>
                            {post.category}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-[#6DD3C7]">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{post.author.username}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 text-[#6DD3C7]">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              {/* 페이징 */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-[#1A1A1A] border-t border-[#2A2A2A]">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[#EAEAEA]">
                      총 <span className="font-medium">{totalPosts}</span>개의 게시글 중{' '}
                      <span className="font-medium">
                        {(currentPage - 1) * postsPerPage + 1}-{Math.min(currentPage * postsPerPage, totalPosts)}
                      </span>개 표시
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {/* 이전 버튼 */}
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-[#2A2A2A] text-[#6DD3C7] hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      
                      {/* 페이지 번호들 */}
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-[#6DD3C7] text-[#1A1A1A]'
                                  : 'text-[#EAEAEA] hover:bg-[#2A2A2A]'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        
                        {totalPages > 5 && currentPage < totalPages - 2 && (
                          <>
                            <span className="text-[#6DD3C7]">...</span>
                            <button
                              onClick={() => handlePageChange(totalPages)}
                              className="px-3 py-2 text-sm font-medium text-[#EAEAEA] hover:bg-[#2A2A2A] rounded-lg transition-colors"
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>
                      
                      {/* 다음 버튼 */}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-[#2A2A2A] text-[#6DD3C7] hover:bg-[#2A2A2A] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-[#6DD3C7] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#EAEAEA] mb-2">게시글이 없습니다</h3>
              <p className="text-[#B0B0B0]">
                {selectedCategory 
                  ? `${selectedCategory} 카테고리에 게시글이 없습니다.`
                  : '아직 작성된 게시글이 없습니다.'
                }
              </p>
              {user?.is_approved && (
                <Link to="/board/create" className="btn-primary mt-4 inline-block">
                  첫 번째 글 작성하기
                </Link>
              )}
            </div>
          )}
        </div>

        {/* 안내 메시지 */}
        {!user && (
          <div className="mt-6 bg-[#121212] border border-[#2A2A2A] rounded-lg p-6">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-[#6DD3C7] mx-auto mb-4" />
              <h4 className="font-medium text-[#EAEAEA] mb-2">게시글 내용을 보려면 로그인이 필요합니다</h4>
              <p className="text-[#B0B0B0] text-sm mb-4">
                게시글 목록은 누구나 볼 수 있지만, 내용을 읽으려면 로그인 후 관리자 승인을 받아주세요.
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
          <div className="mt-6 bg-[#121212] border border-[#2A2A2A] rounded-lg p-6">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-[#6DD3C7] mx-auto mb-4" />
              <h4 className="font-medium text-[#EAEAEA] mb-2">게시글 내용을 보려면 승인이 필요합니다</h4>
              <p className="text-[#B0B0B0] text-sm mb-4">
                현재 관리자 승인 대기 중입니다. 승인 후 게시글 내용을 읽을 수 있습니다.
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

export default Board
