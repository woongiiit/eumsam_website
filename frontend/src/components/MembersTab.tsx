import React, { useState } from 'react'
import { 
  UserX, 
  UserCheck,
  Users,
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Trash2 
} from 'lucide-react'

interface User {
  id: number
  username: string
  email: string
  real_name: string
  student_id?: string
  major?: string
  year?: number
  phone_number?: string
  is_approved: boolean
  is_admin: boolean
  is_deleted: boolean
  deleted_at?: string
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
}

interface MembersTabProps {
  users: User[] | undefined
  applications: Application[] | undefined
  usersLoading: boolean
  applicationsLoading: boolean
  onApprove: (id: number) => void
  onReject: (id: number) => void
  onDelete: (id: number) => void
  onUpdateRole: (id: number, isAdmin: boolean) => void
  formatDate: (date: string) => string
}

const MembersTab: React.FC<MembersTabProps> = ({
  users,
  applications,
  usersLoading,
  applicationsLoading,
  onApprove,
  onReject,
  onDelete,
  onUpdateRole,
  formatDate
}) => {
  const [expandedUser, setExpandedUser] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<'name' | 'email' | 'created_at' | 'status'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  if (usersLoading || applicationsLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-gray-600">로딩 중...</p>
      </div>
    )
  }

  // 사용자와 지원서를 연결
  const usersWithApplications = users?.map(user => {
    const userApplication = applications?.find(app => app.applicant_id === user.id)
    return {
      ...user,
      application: userApplication
    }
  }) || []

  // 필터링 및 정렬 로직
  const filteredUsers = usersWithApplications.filter(user => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      user.real_name.toLowerCase().includes(searchLower) ||
      user.username.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.student_id && user.student_id.toLowerCase().includes(searchLower)) ||
      (user.major && user.major.toLowerCase().includes(searchLower))
    )
  })

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue: string | number = ''
    let bValue: string | number = ''

    switch (sortField) {
      case 'name':
        aValue = a.real_name.toLowerCase()
        bValue = b.real_name.toLowerCase()
        break
      case 'email':
        aValue = a.email.toLowerCase()
        bValue = b.email.toLowerCase()
        break
      case 'created_at':
        aValue = new Date(a.created_at).getTime()
        bValue = new Date(b.created_at).getTime()
        break
      case 'status':
        aValue = a.is_approved ? 'approved' : 'pending'
        bValue = b.is_approved ? 'approved' : 'pending'
        break
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
    }
  })

  // 페이징 로직
  const totalPages = Math.ceil(sortedUsers.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + pageSize)


  const handleSort = (field: 'name' | 'email' | 'created_at' | 'status') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  const getStatusBadge = (user: any) => {
    if (user.is_admin) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          관리자
        </span>
      )
    } else if (user.is_approved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          승인됨
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          대기중
        </span>
      )
    }
  }


  return (
    <div className="space-y-6">

      {/* 검색 및 필터 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="이름, 이메일, 학번, 전공으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value={10}>10개씩</option>
              <option value={20}>20개씩</option>
              <option value={50}>50개씩</option>
            </select>
          </div>
        </div>
      </div>

      {/* 회원 목록 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center space-x-1">
                    <span>이름</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center space-x-1">
                    <span>이메일</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  학번/전공
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-1">
                    <span>상태</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center space-x-1">
                    <span>가입일</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  액션
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map((user) => (
                <>
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-600">
                              {user.real_name.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.real_name}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.student_id || '-'}</div>
                      <div className="text-sm text-gray-500">{user.major || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="상세보기"
                        >
                          {expandedUser === user.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {!user.is_approved && !user.is_admin && (
                          <>
                            <button
                              onClick={() => onApprove(user.id)}
                              className="text-green-600 hover:text-green-900"
                              title="승인"
                            >
                              <UserCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onReject(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title="거절"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => onUpdateRole(user.id, !user.is_admin)}
                          className={`${user.is_admin ? 'text-purple-600 hover:text-purple-900' : 'text-gray-600 hover:text-gray-900'}`}
                          title={user.is_admin ? '관리자 권한 제거' : '관리자 권한 부여'}
                        >
                          <Users className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* 펼쳐진 상세 정보 */}
                  {expandedUser === user.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          {/* 인적사항 */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">인적사항</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-600">실명:</span>
                                <span className="ml-2 text-gray-900">{user.real_name}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">사용자명:</span>
                                <span className="ml-2 text-gray-900">@{user.username}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">이메일:</span>
                                <span className="ml-2 text-gray-900">{user.email}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">학번:</span>
                                <span className="ml-2 text-gray-900">{user.student_id || '-'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">전공:</span>
                                <span className="ml-2 text-gray-900">{user.major || '-'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">학년:</span>
                                <span className="ml-2 text-gray-900">{user.year || '-'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">전화번호:</span>
                                <span className="ml-2 text-gray-900">{user.phone_number || '-'}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-600">가입일:</span>
                                <span className="ml-2 text-gray-900">{formatDate(user.created_at)}</span>
                              </div>
                            </div>
                          </div>

                          {/* 지원서 내용 */}
                          {user.application && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">지원서 내용</h4>
                              <div className="space-y-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600">입부 동기:</span>
                                  <p className="mt-1 text-gray-900 bg-white p-3 rounded border">
                                    {user.application.motivation}
                                  </p>
                                </div>
                                {user.application.experience && (
                                  <div>
                                    <span className="font-medium text-gray-600">음악 경험:</span>
                                    <p className="mt-1 text-gray-900 bg-white p-3 rounded border">
                                      {user.application.experience}
                                    </p>
                                  </div>
                                )}
                                {user.application.instrument && (
                                  <div>
                                    <span className="font-medium text-gray-600">주요 악기:</span>
                                    <p className="mt-1 text-gray-900 bg-white p-3 rounded border">
                                      {user.application.instrument}
                                    </p>
                                  </div>
                                )}
                                <div className="flex items-center space-x-4">
                                  <div>
                                    <span className="font-medium text-gray-600">지원일:</span>
                                    <span className="ml-2 text-gray-900">{formatDate(user.application.created_at)}</span>
                                  </div>
                                </div>
                                
                              </div>
                            </div>
                          )}

                          {!user.application && (
                            <div className="text-sm text-gray-500 italic">
                              지원서가 없습니다.
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이징 */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                이전
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                다음
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>
                  {' - '}
                  <span className="font-medium">
                    {Math.min(currentPage * pageSize, sortedUsers.length)}
                  </span>
                  {' / '}
                  <span className="font-medium">{sortedUsers.length}</span>
                  {' 개 결과'}
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === currentPage
                          ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MembersTab
