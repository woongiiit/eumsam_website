import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/index'
import { toast } from 'react-hot-toast'
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Calendar, 
  Edit3, 
  Lock, 
  Trash2, 
  Save, 
  X,
  Eye,
  EyeOff
} from 'lucide-react'

interface UserInfo {
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
  created_at: string
}

const MyPage = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showDeletePassword, setShowDeletePassword] = useState(false)

  // 폼 데이터
  const [formData, setFormData] = useState({
    username: '',
    real_name: '',
    phone_number: '',
    major: '',
    year: ''
  })

  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })

  const [deleteData, setDeleteData] = useState({
    password: ''
  })

  // 사용자 정보 로드
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const response = await api.get('/auth/me')
        setUserInfo(response.data)
        setFormData({
          username: response.data.username || '',
          real_name: response.data.real_name || '',
          phone_number: response.data.phone_number || '',
          major: response.data.major || '',
          year: response.data.year?.toString() || ''
        })
      } catch (error) {
        console.error('사용자 정보 로드 실패:', error)
        toast.error('사용자 정보를 불러올 수 없습니다')
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadUserInfo()
    }
  }, [user])

  // 사용자 정보 수정
  const handleUpdateUser = async () => {
    try {
      const updateData = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : undefined
      }

      const response = await api.put('/users/me', updateData)
      setUserInfo(response.data)
      setIsEditing(false)
      toast.success('정보가 성공적으로 수정되었습니다')
    } catch (error: any) {
      console.error('사용자 정보 수정 실패:', error)
      const errorMessage = error.response?.data?.detail || '정보 수정에 실패했습니다'
      toast.error(errorMessage)
    }
  }

  // 비밀번호 변경
  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('새 비밀번호가 일치하지 않습니다')
      return
    }

    if (passwordData.new_password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다')
      return
    }

    try {
      await api.put('/users/me/password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      })
      
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      setIsChangingPassword(false)
      toast.success('비밀번호가 성공적으로 변경되었습니다')
    } catch (error: any) {
      console.error('비밀번호 변경 실패:', error)
      const errorMessage = error.response?.data?.detail || '비밀번호 변경에 실패했습니다'
      toast.error(errorMessage)
    }
  }

  // 회원 탈퇴
  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 회원 탈퇴를 하시겠습니까?\n모든 데이터가 삭제되며 복구할 수 없습니다.')) {
      return
    }

    try {
      await api.delete('/users/me', {
        data: { password: deleteData.password }
      })
      
      toast.success('계정이 성공적으로 삭제되었습니다')
      logout()
      navigate('/')
    } catch (error: any) {
      console.error('회원 탈퇴 실패:', error)
      const errorMessage = error.response?.data?.detail || '회원 탈퇴에 실패했습니다'
      toast.error(errorMessage)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6DD3C7] mx-auto mb-4"></div>
          <p className="text-[#EAEAEA]">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user || !userInfo) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#EAEAEA] mb-4">로그인이 필요합니다</h1>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#6DD3C7] text-[#1A1A1A] px-6 py-2 rounded-lg hover:bg-[#5BC4B8] transition-colors"
          >
            로그인하기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 헤더 */}
        <div className="bg-[#2A2A2A] rounded-2xl p-8 mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-[#6DD3C7] rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-[#1A1A1A]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#EAEAEA]">{userInfo.real_name}</h1>
              <p className="text-[#B0B0B0]">@{userInfo.username}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  userInfo.is_approved 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {userInfo.is_approved ? '승인됨' : '승인 대기'}
                </span>
                {userInfo.is_admin && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    관리자
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 기본 정보 */}
          <div className="bg-[#2A2A2A] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#EAEAEA] flex items-center">
                <User className="w-5 h-5 mr-2" />
                기본 정보
              </h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-1 px-3 py-2 bg-[#6DD3C7] text-[#1A1A1A] rounded-lg hover:bg-[#5BC4B8] transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>수정</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleUpdateUser}
                    className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>저장</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        username: userInfo.username || '',
                        real_name: userInfo.real_name || '',
                        phone_number: userInfo.phone_number || '',
                        major: userInfo.major || '',
                        year: userInfo.year?.toString() || ''
                      })
                    }}
                    className="flex items-center space-x-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>취소</span>
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* 이메일 (수정 불가) */}
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-[#6DD3C7]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#B0B0B0] mb-1">이메일</label>
                  <p className="text-[#EAEAEA]">{userInfo.email}</p>
                </div>
              </div>

              {/* 닉네임 */}
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-[#6DD3C7]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#B0B0B0] mb-1">닉네임</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#EAEAEA] focus:border-[#6DD3C7] focus:outline-none"
                    />
                  ) : (
                    <p className="text-[#EAEAEA]">{userInfo.username}</p>
                  )}
                </div>
              </div>

              {/* 실명 */}
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-[#6DD3C7]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#B0B0B0] mb-1">실명</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.real_name}
                      onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#EAEAEA] focus:border-[#6DD3C7] focus:outline-none"
                    />
                  ) : (
                    <p className="text-[#EAEAEA]">{userInfo.real_name}</p>
                  )}
                </div>
              </div>

              {/* 학번 */}
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-[#6DD3C7]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#B0B0B0] mb-1">학번</label>
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="text"
                        value={(formData as any).student_id || ''}
                        disabled
                        className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-[#B0B0B0] cursor-not-allowed opacity-60"
                      />
                      <div className="absolute inset-0 flex items-center justify-end pr-3">
                        <span className="text-xs text-[#B0B0B0] bg-[#1A1A1A] px-2 py-1 rounded">
                          수정 불가
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[#EAEAEA]">{userInfo.student_id || '미입력'}</p>
                  )}
                </div>
              </div>

              {/* 전화번호 */}
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-[#6DD3C7]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#B0B0B0] mb-1">전화번호</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#EAEAEA] focus:border-[#6DD3C7] focus:outline-none"
                    />
                  ) : (
                    <p className="text-[#EAEAEA]">{userInfo.phone_number || '미입력'}</p>
                  )}
                </div>
              </div>

              {/* 전공 */}
              <div className="flex items-center space-x-3">
                <GraduationCap className="w-5 h-5 text-[#6DD3C7]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#B0B0B0] mb-1">전공</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#EAEAEA] focus:border-[#6DD3C7] focus:outline-none"
                    />
                  ) : (
                    <p className="text-[#EAEAEA]">{userInfo.major || '미입력'}</p>
                  )}
                </div>
              </div>

              {/* 학년 */}
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-[#6DD3C7]" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-[#B0B0B0] mb-1">학년</label>
                  {isEditing ? (
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#EAEAEA] focus:border-[#6DD3C7] focus:outline-none"
                    >
                      <option value="">선택하세요</option>
                      <option value="1">1학년</option>
                      <option value="2">2학년</option>
                      <option value="3">3학년</option>
                      <option value="4">4학년</option>
                      <option value="5">5학년 이상</option>
                    </select>
                  ) : (
                    <p className="text-[#EAEAEA]">{userInfo.year ? `${userInfo.year}학년` : '미입력'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 보안 설정 */}
          <div className="bg-[#2A2A2A] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-[#EAEAEA] flex items-center mb-6">
              <Lock className="w-5 h-5 mr-2" />
              보안 설정
            </h2>

            <div className="space-y-6">
              {/* 비밀번호 변경 */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-[#EAEAEA]">비밀번호 변경</h3>
                  <button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    className="px-4 py-2 bg-[#6DD3C7] text-[#1A1A1A] rounded-lg hover:bg-[#5BC4B8] transition-colors"
                  >
                    {isChangingPassword ? '취소' : '변경'}
                  </button>
                </div>

                {isChangingPassword && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B0] mb-1">현재 비밀번호</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.current_password}
                          onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                          className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#EAEAEA] focus:border-[#6DD3C7] focus:outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] hover:text-[#EAEAEA]"
                        >
                          {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B0] mb-1">새 비밀번호</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                          className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#EAEAEA] focus:border-[#6DD3C7] focus:outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] hover:text-[#EAEAEA]"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B0] mb-1">새 비밀번호 확인</label>
                      <input
                        type="password"
                        value={passwordData.confirm_password}
                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                        className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#EAEAEA] focus:border-[#6DD3C7] focus:outline-none"
                      />
                    </div>

                    <button
                      onClick={handleChangePassword}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      비밀번호 변경
                    </button>
                  </div>
                )}
              </div>

              {/* 회원 탈퇴 */}
              <div className="border-t border-[#3A3A3A] pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-[#EAEAEA]">회원 탈퇴</h3>
                  <button
                    onClick={() => setIsDeleting(!isDeleting)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {isDeleting ? '취소' : '탈퇴'}
                  </button>
                </div>

                {isDeleting && (
                  <div className="space-y-4">
                    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                      <p className="text-red-300 text-sm">
                        ⚠️ 회원 탈퇴 시 모든 데이터(게시글, 갤러리, 입부신청 등)가 삭제되며 복구할 수 없습니다.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#B0B0B0] mb-1">비밀번호 확인</label>
                      <div className="relative">
                        <input
                          type={showDeletePassword ? 'text' : 'password'}
                          value={deleteData.password}
                          onChange={(e) => setDeleteData({ ...deleteData, password: e.target.value })}
                          className="w-full px-3 py-2 bg-[#1A1A1A] border border-[#3A3A3A] rounded-lg text-[#EAEAEA] focus:border-red-500 focus:outline-none pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowDeletePassword(!showDeletePassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#B0B0B0] hover:text-[#EAEAEA]"
                        >
                          {showDeletePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleDeleteAccount}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>계정 삭제</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyPage
