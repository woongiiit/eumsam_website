import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Music, Menu, X, User, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSupportActive, setIsSupportActive] = useState(true)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  // 지원 활성화 상태 확인
  useEffect(() => {
    const checkSupportStatus = () => {
      const savedStatus = localStorage.getItem('support_active')
      if (savedStatus !== null) {
        const isActive = JSON.parse(savedStatus)
        console.log('Navbar - 로컬 스토리지에서 지원 상태 로드:', isActive)
        setIsSupportActive(isActive)
      } else {
        // 기본값은 활성화
        console.log('Navbar - 기본값 사용 (활성화)')
        setIsSupportActive(true)
      }
    }
    
    checkSupportStatus()
    
    // 로컬 스토리지 변경 감지 (다른 탭에서의 변경)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'support_active') {
        setIsSupportActive(e.newValue ? JSON.parse(e.newValue) : true)
      }
    }
    
    // 같은 탭 내에서의 변경 감지를 위한 커스텀 이벤트
    const handleCustomStorageChange = () => {
      const savedStatus = localStorage.getItem('support_active')
      const isActive = savedStatus ? JSON.parse(savedStatus) : true
      console.log('Navbar - 커스텀 이벤트로 지원 상태 변경:', isActive)
      setIsSupportActive(isActive)
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('supportStatusChanged', handleCustomStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('supportStatusChanged', handleCustomStorageChange)
    }
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleApplicationClick = (e: React.MouseEvent) => {
    if (!isSupportActive) {
      e.preventDefault()
      alert('지금은 음샘 지원 기간이 아닙니다!')
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  const navItems = [
    { path: '/', label: '홈' },
    { path: '/board', label: '커뮤니티' },
    { path: '/gallery', label: '갤러리' },
    { path: '/application', label: '지원하기' },
  ]

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 */}
          <Link 
            to="/" 
            onClick={(e) => {
              if (location.pathname === '/') {
                e.preventDefault()
                window.location.reload()
              }
              // 다른 페이지에서는 Link의 기본 동작(홈으로 이동)을 사용
            }}
            className="flex items-center"
          >
            <img 
              src="/EUMSAM_LOGO.jpg" 
              alt="음샘 로고" 
              className="w-32 h-32 object-contain"
              onError={(e) => {
                // 로고 이미지가 없을 경우 기본 아이콘으로 대체
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  const fallback = document.createElement('div')
                  fallback.className = 'w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center'
                  fallback.innerHTML = '<svg class="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>'
                  parent.insertBefore(fallback, target)
                }
              }}
            />
          </Link>

          {/* 데스크톱 네비게이션 */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={item.path === '/application' ? handleApplicationClick : undefined}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-white bg-[#6DD3C7]'
                    : 'text-black hover:text-white hover:bg-[#6DD3C7]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* 사용자 메뉴 */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {user.is_admin && (
                  <Link
                    to="/admin"
                    className="px-4 py-2 text-sm font-medium text-black hover:text-white hover:bg-[#6DD3C7] transition-colors"
                  >
                    관리자
                  </Link>
                )}
                <Link
                  to="/mypage"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-black hover:text-white hover:bg-[#6DD3C7] transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>{user.username}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-black hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-black hover:text-white hover:bg-[#6DD3C7] transition-colors"
                >
                  로그인
                </Link>
                <Link to="/register" className="btn-primary text-sm px-4 py-2">
                  회원가입
                </Link>
              </div>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-black hover:text-[#6DD3C7] transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-[#2A2A2A]">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={(e) => {
                    if (item.path === '/application') {
                      handleApplicationClick(e)
                    } else {
                      setIsMenuOpen(false)
                    }
                  }}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? 'text-white bg-[#6DD3C7]'
                      : 'text-black hover:text-white hover:bg-[#6DD3C7]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* 모바일 사용자 메뉴 */}
              <div className="pt-4 border-t border-[#2A2A2A]">
                {user ? (
                  <div className="space-y-2">
                    {user.is_admin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-3 py-2 text-base font-medium text-black hover:text-white hover:bg-[#6DD3C7] transition-colors"
                      >
                        관리자
                      </Link>
                    )}
                    <Link
                      to="/mypage"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center px-3 py-2 text-base font-medium text-black hover:text-white hover:bg-[#6DD3C7] transition-colors"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {user.username}
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      로그아웃
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-black hover:text-white hover:bg-[#6DD3C7] transition-colors"
                    >
                      로그인
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-white bg-[#6DD3C7] rounded-md"
                    >
                      회원가입
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
