import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface PostForm {
  title: string
  content: string
  category: string
}

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

const EditPost = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PostForm>()

  // 게시글 데이터 가져오기
  const { data: post, isLoading, error } = useQuery(
    ['post', id],
    async () => {
      const response = await api.get(`/posts/${id}`)
      return response.data as Post
    },
    {
      enabled: !!id && !!user?.is_approved,
      retry: false,
      onSuccess: (data) => {
        // 폼에 기존 데이터 설정
        reset({
          title: data.title,
          content: data.content,
          category: data.category
        })
      }
    }
  )

  // 게시글 수정 mutation
  const updateMutation = useMutation(
    async (data: PostForm) => {
      await api.put(`/posts/${id}`, data)
    },
    {
      onSuccess: () => {
        toast.success('게시글이 수정되었습니다!')
        queryClient.invalidateQueries(['post', id])
        queryClient.invalidateQueries(['posts'])
        navigate(`/board/${id}`)
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.detail || '게시글 수정에 실패했습니다')
      }
    }
  )

  const categories = [
    { value: '칭찬글', label: '칭찬글' },
    { value: '정보글', label: '정보글' },
    { value: '세션구인', label: '세션구인' },
    { value: '자유글', label: '자유글' }
  ]

  const onSubmit = async (data: PostForm) => {
    if (!user?.is_approved) {
      toast.error('승인된 사용자만 게시글을 수정할 수 있습니다')
      return
    }

    setIsSubmitting(true)
    try {
      await updateMutation.mutateAsync(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  // 권한 체크
  if (!user || !user.is_approved) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#EAEAEA] mb-4">접근 권한이 없습니다</h2>
          <p className="text-[#B0B0B0] mb-6">
            게시글을 수정하시려면 관리자 승인이 필요합니다.
          </p>
          <button
            onClick={() => navigate('/board')}
            className="btn-primary"
          >
            게시판으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  // 로딩 중
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

  // 오류 또는 게시글 없음
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

  // 수정 권한 체크
  if (user.id !== post.author_id && !user.is_admin) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#EAEAEA] mb-4">수정 권한이 없습니다</h2>
          <p className="text-[#B0B0B0] mb-6">
            작성자 또는 관리자만 게시글을 수정할 수 있습니다.
          </p>
          <button
            onClick={() => navigate(`/board/${id}`)}
            className="btn-primary"
          >
            게시글 보기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/board/${id}`)}
            className="flex items-center text-[#B0B0B0] hover:text-[#6DD3C7] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            게시글로 돌아가기
          </button>
          <h1 className="text-3xl font-bold text-[#EAEAEA]">
            <span className="bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] bg-clip-text text-transparent">
              게시글 수정
            </span>
          </h1>
          <p className="text-[#B0B0B0] mt-2">
            게시글을 수정해보세요
          </p>
        </div>

        {/* 수정 폼 */}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                제목 *
              </label>
              <input
                {...register('title', {
                  required: '제목을 입력해주세요',
                  minLength: {
                    value: 2,
                    message: '제목은 최소 2자 이상이어야 합니다'
                  },
                  maxLength: {
                    value: 100,
                    message: '제목은 100자 이하여야 합니다'
                  }
                })}
                type="text"
                className="input-field"
                placeholder="게시글 제목을 입력하세요"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* 카테고리 */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                카테고리 *
              </label>
              <select
                {...register('category', {
                  required: '카테고리를 선택해주세요'
                })}
                className="input-field"
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* 내용 */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                내용 *
              </label>
              <textarea
                {...register('content', {
                  required: '내용을 입력해주세요',
                  minLength: {
                    value: 10,
                    message: '내용은 최소 10자 이상이어야 합니다'
                  }
                })}
                rows={12}
                className="input-field resize-none"
                placeholder="게시글 내용을 입력하세요..."
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
              )}
            </div>

            {/* 카테고리 안내 */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
              <h4 className="font-medium text-[#EAEAEA] mb-2">카테고리 안내</h4>
              <ul className="text-sm text-[#B0B0B0] space-y-1">
                <li><strong>칭찬글:</strong> 멤버들의 좋은 점이나 활동을 칭찬하는 글</li>
                <li><strong>정보글:</strong> 음악, 악기, 연습법 등 유용한 정보를 공유하는 글</li>
                <li><strong>세션구인:</strong> 함께 연주할 멤버를 찾는 글</li>
                <li><strong>자유글:</strong> 자유로운 주제로 소통하는 글</li>
              </ul>
            </div>

            {/* 작성자 정보 */}
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
              <h4 className="font-medium text-[#6DD3C7] mb-1">작성자</h4>
              <p className="text-[#EAEAEA]">{user.real_name} ({user.username})</p>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/board/${id}`)}
                className="btn-secondary"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                {isSubmitting ? '수정 중...' : '게시글 수정'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditPost
