import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api'
import { Music, User, MessageSquare, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface FormQuestion {
  id: number
  type: 'textarea' | 'select' | 'text'
  label: string
  placeholder: string
  required: boolean
  validation?: {
    minLength?: number
    message?: string
  }
  options?: Array<{ value: string; label: string }>
}

interface ApplicationForm {
  [key: string]: string
}

const Application = () => {
  const { user } = useAuth()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formQuestions, setFormQuestions] = useState<FormQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ApplicationForm>()

  // 관리자가 설정한 양식 질문 로드
  useEffect(() => {
    const loadFormQuestions = async () => {
      try {
        // 서버 API에서 양식 질문 조회
        const response = await api.get('/application-form/questions')
        setFormQuestions(response.data)
      } catch (error) {
        console.error('서버에서 양식 질문 조회 실패, 로컬 스토리지에서 로드:', error)
        // API 실패 시 로컬 스토리지에서 로드
        try {
          const savedQuestions = localStorage.getItem('form_questions')
          if (savedQuestions) {
            const questions = JSON.parse(savedQuestions)
            setFormQuestions(questions)
          } else {
            // 기본 질문들 (관리자가 설정하지 않은 경우)
            setFormQuestions([
              {
                id: 1,
                type: 'textarea',
                label: '음샘 동아리에 입부하고 싶은 이유',
                placeholder: '음샘 동아리에 입부하고 싶은 이유를 자세히 적어주세요...',
                required: true,
                validation: {
                  minLength: 10,
                  message: '입부 동기는 최소 10자 이상 입력해주세요'
                }
              },
              {
                id: 2,
                type: 'textarea',
                label: '음악 경험 (악기, 경력 등)',
                placeholder: '연주 가능한 악기, 음악 경력, 참여했던 활동 등을 적어주세요...',
                required: false
              },
              {
                id: 3,
                type: 'select',
                label: '주로 연주하고 싶은 악기',
                placeholder: '악기를 선택하세요',
                required: false,
                options: [
                  { value: '', label: '악기를 선택하세요' },
                  { value: '기타', label: '기타' },
                  { value: '건반', label: '건반' },
                  { value: '베이스', label: '베이스' },
                  { value: '보컬', label: '보컬' },
                  { value: '드럼', label: '드럼' },
                  { value: '그 외', label: '그 외' }
                ]
              }
            ])
          }
        } catch (localError) {
          console.error('로컬 스토리지 로드 실패:', localError)
          setFormQuestions([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadFormQuestions()

    // 로컬 스토리지 변경 감지 (백업용)
    const handleStorageChange = () => {
      loadFormQuestions()
    }

    // 커스텀 이벤트 감지 (관리자 페이지에서 양식 변경 시)
    const handleCustomStorageChange = () => {
      loadFormQuestions()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('formQuestionsChanged', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('formQuestionsChanged', handleCustomStorageChange)
    }
  }, [])

  const onSubmit = async (data: ApplicationForm) => {
    try {
      console.log('전송할 기본 데이터:', data)
      console.log('현재 양식 질문들:', formQuestions)
      
      // 질문이 없는 경우 최소 필수 데이터로 전송
      if (!formQuestions || formQuestions.length === 0) {
        const minimalData = {
          motivation: '', // 서버가 요구하는 필수 필드 (빈 값)
          experience: '',
          instrument: ''
        }
        console.log('질문이 없어서 최소 필수 데이터로 전송:', minimalData)
        const response = await api.post('/applications', minimalData)
        console.log('서버 응답:', response.data)
      } else {
        // 질문이 있는 경우 매핑하여 전송
        const basicData = {
          motivation: data.question_1 || data.motivation || '음샘 동아리에 가입하고 싶습니다.',
          experience: data.question_2 || data.experience || '',
          instrument: data.question_3 || data.instrument || ''
        }
        
        console.log('매핑된 기본 데이터:', basicData)
        const response = await api.post('/applications', basicData)
        console.log('서버 응답:', response.data)
      }
      
      setIsSubmitted(true)
      toast.success('입부 신청이 완료되었습니다!')
    } catch (error: any) {
      console.error('입부 신청 오류:', error)
      console.error('오류 응답:', error.response?.data)
      
      // 422 오류의 경우 상세한 오류 메시지 표시
      if (error.response?.status === 422) {
        const errorData = error.response.data
        
        // FastAPI validation error format 처리
        if (Array.isArray(errorData)) {
          const errorMessages = errorData.map((err: any) => {
            if (typeof err === 'string') return err
            if (err.msg) return err.msg
            if (err.message) return err.message
            if (err.loc && err.msg) return `${err.loc.join('.')}: ${err.msg}`
            return '입력 오류'
          }).join(', ')
          toast.error(`입력 오류: ${errorMessages}`)
        } else if (typeof errorData === 'object') {
          if (errorData.detail) {
            toast.error(`입력 오류: ${errorData.detail}`)
          } else {
            toast.error('입력 데이터에 오류가 있습니다. 다시 확인해주세요.')
          }
        } else {
          toast.error('입력 데이터에 오류가 있습니다. 다시 확인해주세요.')
        }
      } else {
        const errorMessage = error.response?.data?.detail || error.message || '입부 신청에 실패했습니다'
        toast.error(typeof errorMessage === 'string' ? errorMessage : '입부 신청에 실패했습니다')
      }
    }
  }

  // 동적 양식 필드 렌더링 함수
  const renderFormField = (question: FormQuestion) => {
    const fieldName = `question_${question.id}`
    
    const commonProps = {
      ...register(fieldName, {
        required: question.required ? `${question.label}을(를) 입력해주세요` : false,
        ...(question.validation && {
          minLength: question.validation.minLength ? {
            value: question.validation.minLength,
            message: question.validation.message || `최소 ${question.validation.minLength}자 이상 입력해주세요`
          } : undefined
        })
      }),
      className: 'input-field',
      placeholder: question.placeholder
    }

    switch (question.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
          />
        )
      case 'select':
        return (
          <select {...commonProps}>
            {question.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )
      case 'text':
      default:
        return (
          <input
            {...commonProps}
            type="text"
          />
        )
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-[#121212] border border-[#2A2A2A] py-8 px-6 shadow-xl rounded-2xl">
            <Music className="w-16 h-16 text-[#6DD3C7] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#EAEAEA] mb-4">로그인이 필요합니다</h2>
            <p className="text-[#B0B0B0] mb-6">
              입부 신청을 하시려면 먼저 로그인해주세요.
            </p>
            <a href="/login" className="btn-primary">
              로그인하기
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-[#121212] border border-[#2A2A2A] py-8 px-6 shadow-xl rounded-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6DD3C7] mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-[#EAEAEA] mb-2">양식을 불러오는 중...</h2>
            <p className="text-[#B0B0B0]">
              잠시만 기다려주세요.
            </p>
          </div>
        </div>
      </div>
    )
  }


  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="bg-[#121212] border border-[#2A2A2A] py-8 px-6 shadow-xl rounded-2xl">
            <CheckCircle className="w-16 h-16 text-[#6DD3C7] mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#EAEAEA] mb-4">신청 완료!</h2>
            <p className="text-[#B0B0B0] mb-6">
              입부 신청이 성공적으로 제출되었습니다.
              <br />
              관리자 검토 후 결과를 알려드리겠습니다.
            </p>
            <a href="/" className="btn-primary">
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] rounded-2xl flex items-center justify-center">
              <Music className="w-8 h-8 text-[#1A1A1A]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-[#EAEAEA] mb-4">
            음샘 동아리 입부 신청
          </h1>
          <p className="text-xl text-[#B0B0B0]">
            음샘 동아리에 입부하고 싶으시다면 아래 양식을 작성해주세요
          </p>
        </div>

        <div className="bg-[#121212] border border-[#2A2A2A] py-8 px-6 shadow-xl rounded-2xl">
          <div className="mb-6 p-4 bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg">
            <div className="flex items-center mb-2">
              <User className="w-5 h-5 text-[#6DD3C7] mr-2" />
              <h3 className="font-semibold text-[#EAEAEA]">신청자 정보</h3>
            </div>
            <p className="text-[#B0B0B0]">
              <strong>이름:</strong> {user.real_name} ({user.username})
              <br />
              <strong>이메일:</strong> {user.email}
              {user.student_id && (
                <>
                  <br />
                  <strong>학번:</strong> {user.student_id}
                </>
              )}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {formQuestions.map((question) => (
              <div key={question.id}>
                <label htmlFor={`question_${question.id}`} className="block text-sm font-medium text-[#EAEAEA] mb-2">
                  {question.label}
                  {question.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderFormField(question)}
                {errors[`question_${question.id}`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`question_${question.id}`]?.message}</p>
                )}
              </div>
            ))}

            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-4">
              <div className="flex items-start">
                <MessageSquare className="w-5 h-5 text-[#6DD3C7] mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-[#EAEAEA] mb-1">안내사항</h4>
                  <ul className="text-sm text-[#B0B0B0] space-y-1">
                    <li>• 입부 신청 후 관리자 검토를 거쳐 승인됩니다</li>
                    <li>• 검토 결과는 이메일로 안내드립니다</li>
                    <li>• 승인 후 동아리 활동에 참여할 수 있습니다</li>
                    <li>• 문의사항이 있으시면 연락주시기 바랍니다</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '신청 중...' : '입부 신청하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Application
