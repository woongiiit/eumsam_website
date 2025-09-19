import { Music, Mail, MapPin, Phone } from 'lucide-react'
import { useState, useEffect } from 'react'

const Footer = () => {
  const [isSupportActive, setIsSupportActive] = useState(true)

  // 지원하기 활성화 상태 확인
  useEffect(() => {
    const checkSupportStatus = () => {
      const savedStatus = localStorage.getItem('support_active')
      if (savedStatus !== null) {
        const isActive = JSON.parse(savedStatus)
        setIsSupportActive(isActive)
      } else {
        setIsSupportActive(true) // 기본값은 활성화
      }
    }
    
    checkSupportStatus()
    
    // 로컬 스토리지 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'support_active') {
        setIsSupportActive(e.newValue ? JSON.parse(e.newValue) : true)
      }
    }
    
    // 커스텀 이벤트 감지
    const handleCustomStorageChange = () => {
      const savedStatus = localStorage.getItem('support_active')
      const isActive = savedStatus ? JSON.parse(savedStatus) : true
      setIsSupportActive(isActive)
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('supportStatusChanged', handleCustomStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('supportStatusChanged', handleCustomStorageChange)
    }
  }, [])
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 로고 및 소개 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img 
                src="/EUMSAM_LOGO.jpg" 
                alt="음샘 로고" 
                className="w-16 h-16 object-contain"
                onError={(e) => {
                  // 로고 이미지가 없을 경우 기본 아이콘으로 대체
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  const parent = target.parentElement
                  if (parent) {
                    const fallback = document.createElement('div')
                    fallback.className = 'w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center'
                    fallback.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>'
                    parent.insertBefore(fallback, target)
                  }
                }}
              />
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              동국대학교 중앙 밴드동아리 음샘은 음악을 사랑하는 사람들이 모여 함께 성장하고 소통하는 공간입니다. 
              다양한 장르의 음악을 통해 우리만의 색깔을 만들어가고 있습니다.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.youtube.com/channel/UCHocL7ZAfdehuExWnNjZ1Vw" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com/eumsaim_official/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary-500 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 링크</h3>
            <ul className="space-y-2">
              <li><a href="/board" className="text-gray-600 hover:text-primary-600 transition-colors">커뮤니티</a></li>
              <li><a href="/gallery" className="text-gray-600 hover:text-primary-600 transition-colors">갤러리</a></li>
              <li>
                {isSupportActive ? (
                  <a href="/application" className="text-gray-600 hover:text-primary-600 transition-colors">지원하기</a>
                ) : (
                  <span 
                    className="text-gray-400 cursor-not-allowed"
                    onClick={() => alert('지금은 음샘 지원 기간이 아닙니다!')}
                    title="지원 기간이 아닙니다"
                  >
                    지원하기 (비활성화)
                  </span>
                )}
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">연락처</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-2 text-primary-500" />
                <span>eumsaem@university.ac.kr</span>
              </li>
              <li className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-primary-500" />
                <span>010-1234-5678</span>
              </li>
              <li className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2 text-primary-500" />
                <span>동국대학교 학생회관 4층</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 동국대학교 밴드 동아리 음샘. All rights reserved.
            </p>
            <p className="text-gray-500 text-sm mt-2 md:mt-0">
              Developed by Team.FuwaFuwa
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
