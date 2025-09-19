import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib'
import { ArrowLeft, Save } from 'lucide-react'
import toast from 'react-hot-toast'

interface PostForm {
  title: string
  content: string
  category: string
}

const CreatePost = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<PostForm>()

  const categories = [
    { value: '칭찬글', label: '칭찬글' },
    { value: '정보글', label: '정보글' },
    { value: '세션구인', label: '세션구인' },
    { value: '자유글', label: '자유글' }
  ]

  const onSubmit = async (data: PostForm) => {
    if (!user?.is_approved) {
      toast.error('승인된 사용자만 게시글을 작성할 수 있습니다')
      return
    }

    setIsSubmitting(true)
    try {
      await api.post('/posts', data)
      toast.success('게시글이 작성되었습니다!')
      navigate('/board')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || '게시글 작성에 실패했습니다')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user || !user.is_approved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-white py-8 px-6 shadow-xl rounded-2xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h2>
            <p className="text-gray-600 mb-6">
              게시글을 작성하시려면 관리자 승인이 필요합니다.
            </p>
            <button
              onClick={() => navigate('/board')}
              className="btn-primary"
            >
              게시판으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/board')}
            className="flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            게시판으로 돌아가기
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            <span className="gradient-text">게시글 작성</span>
          </h1>
          <p className="text-gray-600 mt-2">
            음샘 멤버들과 소통할 수 있는 게시글을 작성해보세요
          </p>
        </div>

        {/* 작성 폼 */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
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
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
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
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">카테고리 안내</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li><strong>칭찬글:</strong> 멤버들의 좋은 점이나 활동을 칭찬하는 글</li>
                <li><strong>정보글:</strong> 음악, 악기, 연습법 등 유용한 정보를 공유하는 글</li>
                <li><strong>세션구인:</strong> 함께 연주할 멤버를 찾는 글</li>
                <li><strong>자유글:</strong> 자유로운 주제로 소통하는 글</li>
              </ul>
            </div>

            {/* 작성자 정보 */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-1">작성자</h4>
              <p className="text-blue-800">{user.real_name} ({user.username})</p>
            </div>

            {/* 버튼 */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/board')}
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
                {isSubmitting ? '작성 중...' : '게시글 작성'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatePost
