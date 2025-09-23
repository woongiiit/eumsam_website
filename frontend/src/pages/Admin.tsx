import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../api'
import MembersTab from '../components/MembersTab'
import { Users, UserCheck, UserX, FileText, Camera, Clock, Mail, Phone, ToggleLeft, ToggleRight, Search, ChevronLeft, ChevronRight, ArrowUpDown, ChevronDown, ChevronUp, Trash2, Music } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import toast from 'react-hot-toast'

interface User {
  id: number
  email: string
  username: string
  real_name: string
  student_id?: string
  phone_number?: string
  major?: string
  year?: number
  is_approved: boolean
  is_admin: boolean
  application_status: string
  created_at: string
}

interface Application {
  id: number
  applicant_id: number
  motivation: string
  experience?: string
  instrument?: string
  status: string
  created_at: string
  reviewed_at?: string
  applicant: User
  form_data?: Record<string, any> // 신청 시점의 양식 데이터
  form_questions?: any[] // 신청 시점의 양식 질문들
}


const Admin = () => {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'members' | 'support' | 'form'>('members')

  // 통합 사용자 목록 조회 (지원서 정보 포함)
  const { data: users, isLoading: usersLoading } = useQuery(
    'admin-users',
    async () => {
      const response = await api.get('/users')
      return response.data
    }
  )

  // 사용자 통계 조회
  const { data: userStats } = useQuery('user-stats', async () => {
    const response = await api.get('/users/stats')
    return response.data
  })

  // 지원서 목록 조회
  const { data: applications, isLoading: applicationsLoading } = useQuery(
    'admin-applications',
    async () => {
      const response = await api.get('/applications')
      return response.data
    }
  )




  // 지원 활성화 상태 조회
  const { data: supportSettings, isLoading: supportLoading } = useQuery(
    'support-settings',
    async () => {
      const response = await api.get('/application-form')
      return response.data
    }
  )

  // 신청 양식 질문 조회
  const { data: formQuestions, isLoading: formLoading, refetch: refetchFormQuestions } = useQuery(
    'form-questions',
    async () => {
      try {
        const response = await api.get('/application-form/questions')
        return response.data
      } catch (error) {
        console.error('양식 질문 조회 실패:', error)
        // API 실패 시 로컬 스토리지에서 로드
        const savedQuestions = localStorage.getItem('form_questions')
        if (savedQuestions) {
          return JSON.parse(savedQuestions)
        }
        // 기본 질문들
        return [
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
            options: [
              { value: '', label: '악기를 선택하세요' },
              { value: '기타', label: '기타' },
              { value: '건반', label: '건반' },
              { value: '베이스', label: '베이스' },
              { value: '보컬', label: '보컬' },
              { value: '드럼', label: '드럼' },
              { value: '그 외', label: '그 외' }
            ],
            required: false
          }
        ]
      }
    }
  )

  // 사용자 승인
  const approveUserMutation = useMutation(
    async (userId: number) => {
      await api.post(`/users/${userId}/approve`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users')
        queryClient.invalidateQueries('pending-users')
        toast.success('사용자가 승인되었습니다')
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || error.message || '승인에 실패했습니다'
        toast.error(typeof errorMessage === 'string' ? errorMessage : '승인에 실패했습니다')
      }
    }
  )

  // 사용자 거부
  const rejectUserMutation = useMutation(
    async (userId: number) => {
      await api.post(`/users/${userId}/reject`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users')
        queryClient.invalidateQueries('pending-users')
        toast.success('사용자가 거부되었습니다')
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || error.message || '거부에 실패했습니다'
        toast.error(typeof errorMessage === 'string' ? errorMessage : '거부에 실패했습니다')
      }
    }
  )

  // 회원 삭제
  const deleteUserMutation = useMutation(
    async (userId: number) => {
      await api.delete(`/users/${userId}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users')
        queryClient.invalidateQueries('pending-users')
        toast.success('회원이 삭제되었습니다')
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || error.message || '회원 삭제에 실패했습니다'
        toast.error(typeof errorMessage === 'string' ? errorMessage : '회원 삭제에 실패했습니다')
      }
    }
  )

  // 권한 변경
  const updateUserRoleMutation = useMutation(
    async ({ userId, isAdmin }: { userId: number; isAdmin: boolean }) => {
      await api.put(`/users/${userId}/role`, { is_admin: isAdmin })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-users')
        queryClient.invalidateQueries('pending-users')
        toast.success('권한이 변경되었습니다')
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || error.message || '권한 변경에 실패했습니다'
        toast.error(typeof errorMessage === 'string' ? errorMessage : '권한 변경에 실패했습니다')
      }
    }
  )

  // 입부 신청 상태 업데이트
  const updateApplicationMutation = useMutation(
    async ({ applicationId, status }: { applicationId: number; status: string }) => {
      await api.put(`/applications/${applicationId}`, { status })
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-applications')
        toast.success('신청 상태가 업데이트되었습니다')
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || error.message || '상태 업데이트에 실패했습니다'
        toast.error(typeof errorMessage === 'string' ? errorMessage : '상태 업데이트에 실패했습니다')
      }
    }
  )

  // 입부 신청 삭제
  const deleteApplicationMutation = useMutation(
    async (applicationId: number) => {
      await api.delete(`/applications/${applicationId}`)
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-applications')
        toast.success('입부 신청이 삭제되었습니다')
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || error.message || '신청 삭제에 실패했습니다'
        toast.error(typeof errorMessage === 'string' ? errorMessage : '신청 삭제에 실패했습니다')
      }
    }
  )

  // 지원 활성화 상태 업데이트
  const updateSupportMutation = useMutation(
    async ({ isActive, maxApplicants }: { isActive: boolean; maxApplicants: number }) => {
      const response = await api.put('/application-form', {
        is_active: isActive,
        max_applicants: maxApplicants,
        form_questions: supportSettings?.form_questions
      })
      return response.data
    },
    {
      onSuccess: (data, { isActive, maxApplicants }) => {
        console.log('지원 활성화 상태 업데이트 성공:', data)
        // 쿼리 캐시 즉시 업데이트 (서버 응답 데이터 사용)
        queryClient.setQueryData('support-settings', data)
        toast.success(`지원하기 기능이 ${isActive ? '활성화' : '비활성화'}되었습니다${maxApplicants > 0 ? ` (최대 ${maxApplicants}명)` : ''}`)
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || error.message || '설정 업데이트에 실패했습니다'
        toast.error(typeof errorMessage === 'string' ? errorMessage : '설정 업데이트에 실패했습니다')
      }
    }
  )

  // 지원자 수 초기화
  const resetApplicantsMutation = useMutation(
    async () => {
      const response = await api.post('/application-form/reset-applicants')
      return response.data
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('support-settings')
        toast.success('지원자 수가 초기화되었습니다')
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || error.message || '지원자 수 초기화에 실패했습니다'
        toast.error(typeof errorMessage === 'string' ? errorMessage : '지원자 수 초기화에 실패했습니다')
      }
    }
  )

  // 양식 질문 업데이트
  const updateFormQuestionsMutation = useMutation(
    async (questions: any[]) => {
      try {
        // 서버 API로 업데이트
        const response = await api.put('/application-form/questions', questions)
        return response.data.questions
      } catch (error) {
        console.error('서버 업데이트 실패, 로컬 스토리지에 저장:', error)
        // API 실패 시 로컬 스토리지에 저장
        localStorage.setItem('form_questions', JSON.stringify(questions))
        // 커스텀 이벤트 발생시켜 지원 페이지에 알림
        window.dispatchEvent(new CustomEvent('formQuestionsChanged'))
        return questions
      }
    },
    {
      onSuccess: (data) => {
        console.log('양식 질문 업데이트 성공:', data)
        queryClient.setQueryData('form-questions', data)
        queryClient.invalidateQueries('form-questions')
        // 다른 탭/창에서도 업데이트되도록 커스텀 이벤트 발생
        window.dispatchEvent(new CustomEvent('formQuestionsChanged'))
        toast.success('신청 양식이 업데이트되었습니다')
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail || error.message || '양식 업데이트에 실패했습니다'
        toast.error(typeof errorMessage === 'string' ? errorMessage : '양식 업데이트에 실패했습니다')
      }
    }
  )

  const handleApproveUser = (userId: number) => {
    if (window.confirm('이 사용자를 승인하시겠습니까?')) {
      approveUserMutation.mutate(userId)
    }
  }

  const handleRejectUser = (userId: number) => {
    if (window.confirm('이 사용자를 거부하시겠습니까? 거부된 사용자는 삭제됩니다.')) {
      rejectUserMutation.mutate(userId)
    }
  }

  const handleDeleteUser = (userId: number) => {
    if (window.confirm('이 회원을 완전히 삭제하시겠습니까? 회원의 모든 데이터(게시글, 갤러리, 입부신청 등)가 함께 삭제되며 복구할 수 없습니다.')) {
      deleteUserMutation.mutate(userId)
    }
  }

  const handleUpdateUserRole = (userId: number, isAdmin: boolean) => {
    const action = isAdmin ? '관리자로 승격' : '일반 회원으로 변경'
    if (window.confirm(`이 회원을 ${action}하시겠습니까?`)) {
      updateUserRoleMutation.mutate({ userId, isAdmin })
    }
  }

  const handleUpdateApplication = (applicationId: number, status: string) => {
    if (window.confirm(`신청 상태를 "${status}"로 변경하시겠습니까?`)) {
      updateApplicationMutation.mutate({ applicationId, status })
    }
  }

  const handleDeleteApplication = (applicationId: number) => {
    if (window.confirm('이 입부 신청을 완전히 삭제하시겠습니까? 삭제된 신청은 복구할 수 없습니다.')) {
      deleteApplicationMutation.mutate(applicationId)
    }
  }

  const handleToggleSupport = (isActive: boolean, maxApplicants: number) => {
    // 이미 요청 중이면 중복 호출 방지
    if (updateSupportMutation.isLoading) {
      console.log('이미 요청 중입니다. 중복 호출을 방지합니다.')
      return
    }

    const message = isActive 
      ? `지원하기 기능을 활성화하시겠습니까? 사용자들이 지원 신청을 할 수 있게 됩니다.${maxApplicants > 0 ? ` (최대 ${maxApplicants}명)` : ''}`
      : '지원하기 기능을 비활성화하시겠습니까? 사용자들이 지원 신청을 할 수 없게 됩니다.'
    
    if (window.confirm(message)) {
      console.log('지원 활성화 상태 변경:', isActive, '최대 지원자 수:', maxApplicants)
      updateSupportMutation.mutate({ isActive, maxApplicants })
    }
  }

  const handleAddQuestion = () => {
    if (formQuestions) {
      const newQuestion = {
        id: Math.max(...formQuestions.map((q: any) => q.id)) + 1,
        type: 'textarea',
        label: '새 질문',
        placeholder: '질문에 대한 안내를 입력하세요...',
        required: false
      }
      updateFormQuestionsMutation.mutate([...formQuestions, newQuestion])
    }
  }

  const handleAddSelectQuestion = () => {
    if (formQuestions) {
      const newQuestion = {
        id: Math.max(...formQuestions.map((q: any) => q.id)) + 1,
        type: 'select',
        label: '새 선택 질문',
        placeholder: '선택하세요',
        required: false,
        options: [
          { value: '', label: '선택하세요' }
        ]
      }
      updateFormQuestionsMutation.mutate([...formQuestions, newQuestion])
    }
  }

  const handleUpdateQuestion = (questionId: number, updatedQuestion: any) => {
    if (formQuestions) {
      const updatedQuestions = formQuestions.map((q: any) => 
        q.id === questionId ? { ...q, ...updatedQuestion } : q
      )
      updateFormQuestionsMutation.mutate(updatedQuestions)
    }
  }

  const handleDeleteQuestion = (questionId: number) => {
    if (window.confirm('이 질문을 삭제하시겠습니까?')) {
      if (formQuestions) {
        const updatedQuestions = formQuestions.filter((q: any) => q.id !== questionId)
        updateFormQuestionsMutation.mutate(updatedQuestions)
      }
    }
  }

  const handleMoveQuestion = (dragIndex: number, hoverIndex: number) => {
    if (formQuestions) {
      const updatedQuestions = [...formQuestions]
      const draggedQuestion = updatedQuestions[dragIndex]
      updatedQuestions.splice(dragIndex, 1)
      updatedQuestions.splice(hoverIndex, 0, draggedQuestion)
      updateFormQuestionsMutation.mutate(updatedQuestions)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy/MM/dd HH:mm', { locale: ko })
  }

  // 검토 대기 신청 건수 계산
  const pendingApplicationsCount = applications 
    ? applications.filter((app: Application) => app.status === 'pending').length 
    : 0

  // 미승인 회원 수 계산
  const pendingUsersCount = users 
    ? users.filter((user: User) => !user.is_approved).length 
    : 0

  if (!user || !user.is_admin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h2>
          <p className="text-gray-600">관리자만 접근할 수 있는 페이지입니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            <span className="gradient-text">관리자 페이지</span>
          </h1>
          <p className="text-xl text-gray-600">
            음샘 관리자 페이지입니다.
          </p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {users ? users.length : 0}
            </div>
            <div className="text-sm text-gray-600">총 회원 수</div>
          </div>
          
          <div className="card p-6 text-center">
            <UserCheck className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {users ? users.filter((u: User) => u.is_approved).length : 0}
            </div>
            <div className="text-sm text-gray-600">승인된 회원</div>
          </div>
          
          <div className="card p-6 text-center">
            <UserX className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {pendingUsersCount}
            </div>
            <div className="text-sm text-gray-600">승인 대기</div>
          </div>
          
          <div className="card p-6 text-center">
            <FileText className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {applications ? applications.length : 0}
            </div>
            <div className="text-sm text-gray-600">입부 승인 수</div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('members')}
                className={`py-4 px-1 border-b-2 font-medium text-sm relative ${
                  activeTab === 'members'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>회원 관리</span>
                  {pendingUsersCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-orange-500 rounded-full min-w-[20px] h-5">
                      {pendingUsersCount}
                    </span>
                  )}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('support')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'support'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                지원 활성
              </button>
              <button
                onClick={() => setActiveTab('form')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'form'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                신청 양식 수정
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'members' ? (
              <MembersTab
                users={users}
                applications={applications}
                usersLoading={usersLoading}
                applicationsLoading={applicationsLoading}
                userStats={userStats}
                onApprove={handleApproveUser}
                onReject={handleRejectUser}
                onDelete={handleDeleteUser}
                onUpdateRole={handleUpdateUserRole}
                formatDate={formatDate}
              />
            ) : activeTab === 'support' ? (
              <SupportTab
                supportSettings={supportSettings}
                supportLoading={supportLoading}
                onToggleSupport={handleToggleSupport}
                isUpdating={updateSupportMutation.isLoading}
              />
            ) : activeTab === 'form' ? (
              <FormTab
                formQuestions={formQuestions}
                formLoading={formLoading}
                onAddQuestion={handleAddQuestion}
                onAddSelectQuestion={handleAddSelectQuestion}
                onUpdateQuestion={handleUpdateQuestion}
                onDeleteQuestion={handleDeleteQuestion}
                onMoveQuestion={handleMoveQuestion}
                isUpdating={updateFormQuestionsMutation.isLoading}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}



// 지원 활성 관리 탭
const SupportTab = ({ 
  supportSettings, 
  supportLoading, 
  onToggleSupport, 
  isUpdating 
}: {
  supportSettings: { is_active: boolean; max_applicants: number; current_applicants: number } | undefined
  supportLoading: boolean
  onToggleSupport: (isActive: boolean, maxApplicants: number) => void
  isUpdating: boolean
}) => {
  const [maxApplicants, setMaxApplicants] = useState(0)

  // 설정이 로드되면 상태 업데이트
  useEffect(() => {
    if (supportSettings) {
      setMaxApplicants(supportSettings.max_applicants)
    }
  }, [supportSettings])

  // 서버 상태를 직접 사용
  const isActive = supportSettings?.is_active ?? true

  if (supportLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }

  const currentApplicants = supportSettings?.current_applicants || 0
  const maxApplicantsValue = supportSettings?.max_applicants || 0

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">지원하기 기능 관리</h3>
        <p className="text-gray-600 mb-6">
          사용자들이 음샘에 지원할 수 있는 기능을 활성화하거나 비활성화할 수 있습니다.
        </p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        {/* 현재 상태 표시 */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900">현재 상태</h4>
              <p className="text-sm text-gray-600 mt-1">
                지원 기능: <span className={`font-medium ${isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {isActive ? '활성화됨' : '비활성화됨'}
                </span>
              </p>
              {maxApplicantsValue > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  지원자 수: <span className="font-medium text-blue-600">
                    {currentApplicants}/{maxApplicantsValue}명
                  </span>
                </p>
              )}
            </div>
            <div className="flex items-center">
              {isActive ? (
                <ToggleRight 
                  className="w-8 h-8 text-green-500 cursor-pointer hover:text-green-600 transition-colors" 
                  onClick={() => onToggleSupport(!isActive, maxApplicants)}
                />
              ) : (
                <ToggleLeft 
                  className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-500 transition-colors" 
                  onClick={() => onToggleSupport(!isActive, maxApplicants)}
                />
              )}
            </div>
            </div>
          </div>

        {/* 지원자 수 제한 설정 */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">지원자 수 제한 설정</h4>
          
          <div className="space-y-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                최대 지원자 수
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="number"
                  min="0"
                  value={maxApplicants}
                  onChange={(e) => setMaxApplicants(parseInt(e.target.value) || 0)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0"
                />
                <span className="text-sm text-gray-600">
                  {maxApplicants === 0 ? '(무제한)' : `명`}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                0으로 설정하면 무제한으로 지원을 받을 수 있습니다.
              </p>
            </div>

            {maxApplicants > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>현재 {currentApplicants}명</strong>이 지원했으며, 
                        <strong> {maxApplicants - currentApplicants}명</strong>이 더 지원할 수 있습니다.
                      </p>
                    </div>
                  </div>
                  {currentApplicants > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm('지원자 수를 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다. 새 학기 시작 시에만 사용하세요.')) {
                          resetApplicantsMutation.mutate()
                        }
                      }}
                      disabled={resetApplicantsMutation.isLoading}
                      className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 border border-red-200 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {resetApplicantsMutation.isLoading ? '초기화 중...' : '초기화'}
                    </button>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

        {/* 설정 저장 버튼 */}
      <div className="text-center">
          <button
            onClick={() => onToggleSupport(isActive, maxApplicants)}
            disabled={isUpdating}
            className={`w-full py-3 px-6 rounded-md font-medium transition-colors ${
              'bg-blue-100 text-blue-700 hover:bg-blue-200'
            } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isUpdating ? '처리 중...' : '설정 저장'}
            {maxApplicants > 0 && ` (최대 ${maxApplicants}명)`}
          </button>
        </div>
      </div>
    </div>
  )
}

// 신청 양식 관리 탭
const FormTab = ({ 
  formQuestions, 
  formLoading, 
  onAddQuestion, 
  onAddSelectQuestion,
  onUpdateQuestion, 
  onDeleteQuestion, 
  onMoveQuestion,
  isUpdating 
}: {
  formQuestions: any[] | undefined
  formLoading: boolean
  onAddQuestion: () => void
  onAddSelectQuestion: () => void
  onUpdateQuestion: (questionId: number, updatedQuestion: any) => void
  onDeleteQuestion: (questionId: number) => void
  onMoveQuestion: (dragIndex: number, hoverIndex: number) => void
  isUpdating: boolean
}) => {
  if (formLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">신청 양식 관리</h3>
          <p className="text-gray-600">
            지원자들이 작성할 양식의 질문을 수정할 수 있습니다.
          </p>
          <div className="mt-2 text-sm text-gray-500">
            💡 <strong>팁:</strong> 각 질문 왼쪽의 점들(⋮⋮)을 드래그하여 순서를 변경할 수 있습니다.
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onAddQuestion}
            disabled={isUpdating}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            텍스트 질문 추가
          </button>
          <button
            onClick={onAddSelectQuestion}
            disabled={isUpdating}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
          >
            선택 질문 추가
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {formQuestions && formQuestions.length > 0 ? (
          formQuestions.map((question, index) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={index}
              onUpdate={onUpdateQuestion}
              onDelete={onDeleteQuestion}
              onMove={onMoveQuestion}
              isUpdating={isUpdating}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">질문이 없습니다</h3>
            <p className="text-gray-500">새로운 질문을 추가해보세요.</p>
          </div>
        )}
      </div>

      {/* 미리보기 섹션 */}
      <div className="mt-8">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">양식 미리보기</h4>
        <div className="bg-gray-50 rounded-lg p-6">
          <FormPreview questions={formQuestions} />
        </div>
      </div>
    </div>
  )
}

// 질문 편집기 컴포넌트
const QuestionEditor = ({ 
  question, 
  index, 
  onUpdate, 
  onDelete, 
  onMove,
  isUpdating 
}: {
  question: any
  index: number
  onUpdate: (questionId: number, updatedQuestion: any) => void
  onDelete: (questionId: number) => void
  onMove: (dragIndex: number, hoverIndex: number) => void
  isUpdating: boolean
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(question)
  const [isDragging, setIsDragging] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleSave = () => {
    onUpdate(question.id, editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData(question)
    setIsEditing(false)
  }

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', index.toString())
    e.dataTransfer.effectAllowed = 'move'
    setIsDragging(true)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const dragIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (dragIndex !== index) {
      onMove(dragIndex, index)
    }
  }

  return (
    <div 
      className={`bg-white border rounded-lg p-6 transition-all duration-200 ${
        isDragging 
          ? 'opacity-50 shadow-lg scale-105 border-blue-300' 
          : isDragOver 
            ? 'border-blue-500 bg-blue-50 shadow-md' 
            : 'border-gray-200 hover:shadow-md'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          {/* 드래그 핸들 */}
          <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            className="cursor-move p-2 hover:bg-gray-100 rounded transition-colors group select-none"
            title="드래그하여 순서 변경"
          >
            <div className="flex flex-col space-y-0.5">
              <div className="flex space-x-0.5">
                <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors"></div>
              </div>
              <div className="flex space-x-0.5">
                <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors"></div>
              </div>
              <div className="flex space-x-0.5">
                <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors"></div>
                <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-gray-600 transition-colors"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-gray-500">
              {question.type === 'textarea' ? '텍스트 영역' : 
               question.type === 'select' ? '선택 박스' : question.type}
            </span>
            {question.required && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">
                필수
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                disabled={isUpdating}
                className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                저장
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                편집
              </button>
              <button
                onClick={() => onDelete(question.id)}
                className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
              >
                삭제
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              질문 유형
            </label>
            <select
              value={editData.type}
              onChange={(e) => setEditData({ ...editData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="textarea">텍스트 영역</option>
              <option value="select">선택 박스</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              질문 내용
            </label>
            <input
              type="text"
              value={editData.label}
              onChange={(e) => setEditData({ ...editData, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              안내 문구
            </label>
            <input
              type="text"
              value={editData.placeholder}
              onChange={(e) => setEditData({ ...editData, placeholder: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={`required-${question.id}`}
              checked={editData.required}
              onChange={(e) => setEditData({ ...editData, required: e.target.checked })}
              className="rounded"
            />
            <label htmlFor={`required-${question.id}`} className="text-sm text-gray-700">
              필수 입력 항목
            </label>
          </div>

          {editData.type === 'select' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  선택 옵션
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newOptions = [...(editData.options || []), { value: '', label: '' }]
                    setEditData({ ...editData, options: newOptions })
                  }}
                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                >
                  + 옵션 추가
                </button>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3 bg-gray-50">
                {editData.options?.map((option: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-white rounded border border-gray-200 hover:border-gray-300 transition-colors">
                    <div className="flex flex-col space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (index > 0) {
                            const newOptions = [...(editData.options || [])]
                            const temp = newOptions[index - 1]
                            newOptions[index - 1] = newOptions[index]
                            newOptions[index] = temp
                            setEditData({ ...editData, options: newOptions })
                          }
                        }}
                        disabled={index === 0}
                        className="w-4 h-4 flex items-center justify-center text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="위로 이동"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (index < (editData.options?.length || 0) - 1) {
                            const newOptions = [...(editData.options || [])]
                            const temp = newOptions[index]
                            newOptions[index] = newOptions[index + 1]
                            newOptions[index + 1] = temp
                            setEditData({ ...editData, options: newOptions })
                          }
                        }}
                        disabled={index === (editData.options?.length || 0) - 1}
                        className="w-4 h-4 flex items-center justify-center text-xs text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="아래로 이동"
                      >
                        ↓
                      </button>
                    </div>
                    
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={option.value}
                        onChange={(e) => {
                          const newOptions = [...(editData.options || [])]
                          newOptions[index] = { ...option, value: e.target.value }
                          setEditData({ ...editData, options: newOptions })
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && e.ctrlKey) {
                            e.preventDefault()
                            const newOptions = [...(editData.options || []), { value: '', label: '' }]
                            setEditData({ ...editData, options: newOptions })
                          }
                        }}
                        placeholder="옵션 값"
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        title="Ctrl+Enter로 새 옵션 추가"
                      />
                      <span className="text-gray-400 text-sm">→</span>
                      <input
                        type="text"
                        value={option.label}
                        onChange={(e) => {
                          const newOptions = [...(editData.options || [])]
                          newOptions[index] = { ...option, label: e.target.value }
                          setEditData({ ...editData, options: newOptions })
                        }}
                        placeholder="표시할 텍스트"
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        const newOptions = editData.options?.filter((_: any, i: number) => i !== index) || []
                        setEditData({ ...editData, options: newOptions })
                      }}
                      className="px-2 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                      title="옵션 삭제"
                    >
                      ×
                    </button>
                  </div>
                )) || []}
                
                {(!editData.options || editData.options.length === 0) && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    <p>아직 옵션이 없습니다.</p>
                    <p>'+ 옵션 추가' 버튼을 클릭하여 옵션을 추가하세요.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <div className="text-xs text-blue-800">
                  <div className="font-semibold mb-1">💡 옵션 설정 가이드</div>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>옵션 값:</strong> 폼 제출 시 서버로 전송되는 값 (예: "guitar", "piano")</li>
                    <li>• <strong>표시할 텍스트:</strong> 사용자에게 보여지는 텍스트 (예: "기타", "피아노")</li>
                    <li>• <strong>순서 변경:</strong> ↑↓ 버튼으로 옵션 순서 조정</li>
                    <li>• <strong>빠른 추가:</strong> Ctrl+Enter로 새 옵션 즉시 추가</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">{question.label}</h4>
          <p className="text-sm text-gray-600 mb-3">{question.placeholder}</p>
          {question.type === 'select' && question.options && (
            <div className="text-sm text-gray-500">
              옵션: {question.options.map((opt: any) => opt.label).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// 양식 미리보기 컴포넌트
const FormPreview = ({ questions }: { questions: any[] | undefined }) => {
  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        미리보기할 질문이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div key={question.id} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {question.label}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {question.type === 'textarea' ? (
            <textarea
              rows={4}
              placeholder={question.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled
            />
          ) : question.type === 'select' ? (
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled
            >
              {question.options?.map((option: any) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder={question.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled
            />
          )}
        </div>
      ))}
    </div>
  )
}


export default Admin
