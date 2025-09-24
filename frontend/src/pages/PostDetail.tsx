import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { api } from '../api'
import { useAuth } from '../contexts/AuthContext'
import { ArrowLeft, Edit, Trash2, Pin, PinOff, MessageSquare, Clock, User } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import toast from 'react-hot-toast'

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

interface Comment {
  id: number
  content: string
  post_id: number
  author_id: number
  created_at: string
  updated_at: string
  author: {
    id: number
    username: string
    real_name: string
  }
}

const PostDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')

  const { data: post, isLoading, error } = useQuery(
    ['post', id],
    async () => {
      const response = await api.get(`/posts/${id}`)
      return response.data as Post
    },
    {
      enabled: !!id && !!user?.is_approved, // 승인된 사용자만 API 호출
      retry: false, // 403 오류 시 재시도하지 않음
      onError: (error: any) => {
        if (error.response?.status === 403) {
          console.log('게시글 조회 권한이 없습니다.')
        }
      }
    }
  )

  // 댓글 목록 조회
  const { data: comments, isLoading: commentsLoading } = useQuery(
    ['comments', id],
    async () => {
      const response = await api.get(`/posts/${id}/comments`)
      return response.data as Comment[]
    },
    {
      enabled: !!id && !!user?.is_approved,
      retry: false
    }
  )

  const deleteMutation = useMutation(
    async () => {
      await api.delete(`/posts/${id}`)
    },
    {
      onSuccess: () => {
        toast.success('게시글이 삭제되었습니다')
        navigate('/board')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || '게시글 삭제에 실패했습니다')
      }
    }
  )

  const togglePinMutation = useMutation(
    async () => {
      await api.post(`/posts/${id}/pin`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['post', id])
        queryClient.invalidateQueries(['posts'])
        toast.success(post?.is_pinned ? '게시글 고정이 해제되었습니다' : '게시글이 고정되었습니다')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || '고정 상태 변경에 실패했습니다')
      }
    }
  )

  const handleDelete = () => {
    if (window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      deleteMutation.mutate()
    }
  }

  const handleTogglePin = () => {
    if (window.confirm(post?.is_pinned ? '게시글 고정을 해제하시겠습니까?' : '게시글을 고정하시겠습니까?')) {
      togglePinMutation.mutate()
    }
  }

  // 댓글 작성
  const createCommentMutation = useMutation(
    async (content: string) => {
      await api.post(`/posts/${id}/comments`, { content })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', id])
        setNewComment('')
        toast.success('댓글이 작성되었습니다')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || '댓글 작성에 실패했습니다')
      }
    }
  )

  // 댓글 수정
  const updateCommentMutation = useMutation(
    async ({ commentId, content }: { commentId: number; content: string }) => {
      await api.put(`/comments/${commentId}`, { content })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', id])
        setEditingCommentId(null)
        setEditingCommentContent('')
        toast.success('댓글이 수정되었습니다')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || '댓글 수정에 실패했습니다')
      }
    }
  )

  // 댓글 삭제
  const deleteCommentMutation = useMutation(
    async (commentId: number) => {
      await api.delete(`/comments/${commentId}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', id])
        toast.success('댓글이 삭제되었습니다')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || '댓글 삭제에 실패했습니다')
      }
    }
  )

  // 댓글 작성 핸들러
  const handleCreateComment = () => {
    if (!newComment.trim()) {
      toast.error('댓글 내용을 입력해주세요')
      return
    }
    createCommentMutation.mutate(newComment)
  }

  // 댓글 수정 시작
  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditingCommentContent(comment.content)
  }

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingCommentContent('')
  }

  // 댓글 수정 완료
  const handleUpdateComment = () => {
    if (!editingCommentContent.trim()) {
      toast.error('댓글 내용을 입력해주세요')
      return
    }
    if (editingCommentId) {
      updateCommentMutation.mutate({ commentId: editingCommentId, content: editingCommentContent })
    }
  }

  // 댓글 삭제
  const handleDeleteComment = (commentId: number) => {
    if (window.confirm('정말로 이 댓글을 삭제하시겠습니까?')) {
      deleteCommentMutation.mutate(commentId)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy년 MM월 dd일 HH:mm', { locale: ko })
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

  // 로그인하지 않았거나 승인받지 않은 사용자는 로딩 상태를 표시하지 않음
  if (isLoading && user?.is_approved) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6DD3C7] mx-auto mb-4"></div>
          <p className="text-[#EAEAEA]">게시글을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 로그인하지 않았거나 승인받지 않은 사용자에게는 접근 제한 메시지 표시
  if (!user?.is_approved) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 헤더 */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/board')}
              className="flex items-center text-[#B0B0B0] hover:text-[#6DD3C7] transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              게시판으로 돌아가기
            </button>
          </div>

          {/* 접근 제한 메시지 */}
          <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-[#6DD3C7] mx-auto mb-6" />
                <h3 className="text-xl font-bold text-[#EAEAEA] mb-4">접근 제한</h3>
                <p className="text-[#B0B0B0] text-lg mb-6">
                  로그인 후 승인받은 회원만 게시글을 읽을 수 있습니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!user ? (
                    <>
                      <Link to="/login" className="btn-primary">
                        로그인하기
                      </Link>
                      <Link to="/application" className="btn-secondary">
                        지원하기
                      </Link>
                    </>
                  ) : !user.is_approved ? (
                    <div className="text-center">
                      <p className="text-[#B0B0B0] mb-4">관리자 승인을 기다리고 있습니다.</p>
                      <Link to="/application" className="btn-primary">
                        지원하기
                      </Link>
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#EAEAEA] mb-4">게시글을 찾을 수 없습니다</h2>
          <p className="text-[#B0B0B0] mb-6">요청하신 게시글이 존재하지 않거나 삭제되었습니다.</p>
          <button onClick={() => navigate('/board')} className="btn-primary">
            게시판으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const canEdit = user && (user.id === post.author_id || user.is_admin)
  const canDelete = user && (user.id === post.author_id || user.is_admin)
  const canPin = user && user.is_admin

  return (
    <div className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/board')}
            className="flex items-center text-[#B0B0B0] hover:text-[#6DD3C7] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            게시판으로 돌아가기
          </button>
        </div>

        {/* 게시글 */}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl shadow-lg overflow-hidden">
          {/* 게시글 헤더 */}
          <div className="border-b border-[#2A2A2A] p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {post.is_pinned && (
                    <Pin className="w-5 h-5 text-red-500" />
                  )}
                  <h1 className={`text-2xl font-bold text-[#EAEAEA] ${
                    post.is_pinned ? 'text-red-400' : ''
                  }`}>
                    {post.title}
                  </h1>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(post.category)}`}>
                    {post.category}
                  </span>
                </div>
              </div>
              
              {/* 관리 버튼 */}
              {(canEdit || canDelete || canPin) && (
                <div className="flex items-center space-x-2">
                  {canPin && (
                    <button
                      onClick={handleTogglePin}
                      className="p-2 text-[#6DD3C7] hover:text-[#4ECDC4] transition-colors"
                      title={post.is_pinned ? '고정 해제' : '고정'}
                    >
                      {post.is_pinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                    </button>
                  )}
                  {canEdit && (
                    <Link
                      to={`/board/${post.id}/edit`}
                      className="p-2 text-[#6DD3C7] hover:text-[#4ECDC4] transition-colors"
                      title="수정"
                    >
                      <Edit className="w-5 h-5" />
                    </Link>
                  )}
                  {canDelete && (
                    <button
                      onClick={handleDelete}
                      className="p-2 text-[#6DD3C7] hover:text-red-400 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* 작성자 정보 */}
            <div className="flex items-center space-x-4 text-sm text-[#6DD3C7]">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{post.author.username} ({post.author.real_name})</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              {post.updated_at !== post.created_at && (
                <span className="text-xs text-[#B0B0B0]">
                  (수정됨)
                </span>
              )}
            </div>
          </div>

          {/* 게시글 내용 */}
          <div className="p-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-[#EAEAEA] leading-relaxed">
                {post.content}
              </div>
            </div>
          </div>
        </div>

        {/* 댓글 섹션 */}
        <div className="mt-8 bg-[#121212] border border-[#2A2A2A] rounded-xl shadow-lg p-6">
          <div className="flex items-center mb-6">
            <MessageSquare className="w-6 h-6 text-[#6DD3C7] mr-2" />
            <h3 className="text-lg font-semibold text-[#EAEAEA]">댓글</h3>
            <span className="ml-2 text-[#B0B0B0]">({comments?.length || 0})</span>
          </div>

          {/* 댓글 작성 */}
          <div className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요..."
              className="w-full p-3 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg text-[#EAEAEA] placeholder-[#B0B0B0] focus:outline-none focus:border-[#6DD3C7] resize-none"
              rows={3}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={handleCreateComment}
                disabled={createCommentMutation.isLoading || !newComment.trim()}
                className="px-4 py-2 bg-[#6DD3C7] text-[#1A1A1A] rounded-lg font-medium hover:bg-[#4ECDC4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {createCommentMutation.isLoading ? '작성 중...' : '댓글 작성'}
              </button>
            </div>
          </div>

          {/* 댓글 목록 */}
          {commentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6DD3C7] mx-auto"></div>
              <p className="text-[#B0B0B0] mt-2">댓글을 불러오는 중...</p>
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-[#6DD3C7] mr-2" />
                      <span className="font-medium text-[#EAEAEA]">{comment.author.real_name}</span>
                      <span className="ml-2 text-[#B0B0B0] text-sm">@{comment.author.username}</span>
                    </div>
                    <div className="flex items-center text-[#B0B0B0] text-sm">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(comment.created_at)}
                    </div>
                  </div>
                  
                  {editingCommentId === comment.id ? (
                    <div className="mt-3">
                      <textarea
                        value={editingCommentContent}
                        onChange={(e) => setEditingCommentContent(e.target.value)}
                        className="w-full p-2 bg-[#121212] border border-[#2A2A2A] rounded text-[#EAEAEA] focus:outline-none focus:border-[#6DD3C7] resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end mt-2 space-x-2">
                        <button
                          onClick={handleUpdateComment}
                          disabled={updateCommentMutation.isLoading || !editingCommentContent.trim()}
                          className="px-3 py-1 bg-[#6DD3C7] text-[#1A1A1A] rounded text-sm font-medium hover:bg-[#4ECDC4] disabled:opacity-50 transition-colors"
                        >
                          {updateCommentMutation.isLoading ? '수정 중...' : '완료'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1 bg-[#2A2A2A] text-[#EAEAEA] rounded text-sm font-medium hover:bg-[#3A3A3A] transition-colors"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[#EAEAEA] whitespace-pre-wrap">{comment.content}</p>
                      {(comment.author_id === user?.id || user?.is_admin) && (
                        <div className="flex justify-end mt-3 space-x-2">
                          {comment.author_id === user?.id && (
                            <button
                              onClick={() => handleStartEdit(comment)}
                              className="text-[#6DD3C7] hover:text-[#4ECDC4] text-sm font-medium transition-colors"
                            >
                              수정
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={deleteCommentMutation.isLoading}
                            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                          >
                            {deleteCommentMutation.isLoading ? '삭제 중...' : '삭제'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-[#6DD3C7] mx-auto mb-4 opacity-50" />
              <p className="text-[#B0B0B0]">아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PostDetail
