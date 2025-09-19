import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useEffect } from 'react'
import { api } from '../api'
import { Music, Camera, UserPlus, ArrowRight, Heart, Star, Award, Calendar } from 'lucide-react'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

const Home = () => {
  // 페이지 로드 시 최상단으로 스크롤
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo(0, 0)
    }, 1)
  }, [])

  // 스크롤 애니메이션 훅들 (threshold 값으로 애니메이션 시작 시점 조절)
  const heroAnimation = useScrollAnimation(0.1) // 히어로는 화면에 조금만 보여도 시작
  const aboutAnimation = useScrollAnimation(0.3) // 소개 섹션은 30% 보일 때 시작
  const activitiesAnimation = useScrollAnimation(0.4) // 활동 섹션은 40% 보일 때 시작
  const teamAnimation = useScrollAnimation(0.4) // 팀 섹션은 40% 보일 때 시작
  const achievementsAnimation = useScrollAnimation(0.4) // 성과 섹션은 40% 보일 때 시작
  const ctaAnimation = useScrollAnimation(0.3) // CTA 섹션은 30% 보일 때 시작

  const teamMembers = [
    {
      name: '김음악',
      role: '회장',
      instrument: '기타/보컬',
      description: '음샘의 리더로서 모든 멤버들이 하나가 될 수 있도록 이끌고 있습니다.',
    },
    {
      name: '박리듬',
      role: '부회장',
      instrument: '드럼',
      description: '동아리의 활발한 활동과 멤버들의 소통을 책임집니다.',
    },
    {
      name: '이멜로디',
      role: '총무',
      instrument: '베이스',
      description: '동아리의 재정 관리와 행사 기획을 담당합니다.',
    },
    {
      name: '정하모니',
      role: '기획팀장',
      instrument: '키보드',
      description: '다양한 공연과 이벤트 기획으로 동아리의 활력을 불어넣습니다.',
    }
  ]

  const activities = [
    {
      title: '세션 스터디',
      description: '세션(악기/보컬)을 처음 배우시는 분들을 위한 세션 스터디를 운영합니다.',
      icon: <Music className="w-6 h-6" />,
      schedule: '스터디별 일정 진행'
    },
    {
      title: '각 계절마다 정기 공연',
      description: '봄, 여름, 가을, 겨울마다 정기 공연을 진행합니다.',
      icon: <Star className="w-6 h-6" />,
      schedule: '1월, 4월, 7월, 10월에 진행'
    },
    {
      title: '정기회의 및 친목활동',
      description: '한 달에 1-2회 금요일 6시에 정기 회의 및 친목 활동을 진행합니다.',
      icon: <Award className="w-6 h-6" />,
      schedule: '매달 마지막주 금요일 6시 (변동가능)'
    },
    {
      title: '행사 및 기획',
      description: 'MT 및 번개 모임, 시험기간 간식 나눔 행사, 학기별 악기 초보자들을 위한 신입생 공연 등 다양한 활동이 준비되어 있습니다.',
      icon: <Heart className="w-6 h-6" />,
      schedule: '행사별 상이'
    }
  ]

  const achievements = [
    {
      year: '1',
      title: '선택 참여',
      description: '음샘의 모든 활동은 필수 참여가 아닌 선택 참여입니다. 모든 분들이 부담없이 즐기실 수 있습니다.'
    },
    {
      year: '2',
      title: '오디션 ✕',
      description: '입부하실 때 오디션이나 면접은 진행하지 않습니다.'
    },
    {
      year: '3',
      title: '수평적인 분위기',
      description: '기수제로 운영되지 않으며 모두 같은 위치에서 활동하기 때문에 선후배간, 동기간 편하게 지내실 수 있습니다.'
    },
    {
      year: '4',
      title: '동방 시설 구비',
      description: '음샘 동방에는 여러 악기와 앰프, 관리 용품이 있으니, 악기가 없으시더라도 놀러오셔서 편하게 연주하실 수 있습니다.'
    }
  ]

  // 통계 데이터를 API에서 가져오기
  const { data: statsData, isLoading: statsLoading } = useQuery(
    'homeStats',
    async () => {
      const response = await api.get('/stats')
      return response.data
    }
  )

  const stats = [
    { label: '활동 부원', value: statsData?.active_members ? `${statsData.active_members}명` : '...' },
    { label: '누적 공연 수', value: `${statsData?.monthly_performances || 100}+` },
    { label: 'Since', value: statsData?.founded_year?.toString() || '1988' },
    { label: '누적 부원 수', value: `${statsData?.music_genres || 5000}+` },
  ]

  return (
    <div className="min-h-screen bg-[#1A1A1A]">
      {/* 히어로 섹션 */}
      <section ref={heroAnimation.ref} className="relative bg-[#1A1A1A] min-h-screen flex items-center justify-center py-8 sm:py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center fade-in-section ${heroAnimation.isVisible ? 'visible' : ''}`}>
            <h1 className="text-5xl md:text-6xl font-bold text-[#EAEAEA] mb-6">
              <span className="bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(109,211,199,0.3)]">
                음샘
              </span>
            </h1>
                   <p className="text-xl md:text-2xl text-[#EAEAEA] mb-8 max-w-3xl mx-auto leading-relaxed">
                     함께 즐기며 성장하는 동국대학교 중앙 밴드동아리
                   </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link to="/application" className="bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] text-[#1A1A1A] text-lg px-8 py-4 rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(109,211,199,0.4)] transition-all duration-300 transform hover:scale-105">
                지원하기
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <button 
                onClick={() => {
                  document.getElementById('about')?.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                  })
                }}
                className="border-2 border-[#6DD3C7] text-[#6DD3C7] text-lg px-8 py-4 rounded-lg font-semibold hover:bg-[#6DD3C7] hover:text-[#1A1A1A] transition-all duration-300 transform hover:scale-105"
              >
                동아리 알아보기
              </button>
            </div>
            
            {/* 통계 섹션 통합 */}
            <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 fade-in-section fade-in-delay-2 ${heroAnimation.isVisible ? 'visible' : ''}`}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="text-3xl md:text-4xl font-bold text-[#6DD3C7] mb-2 group-hover:drop-shadow-[0_0_15px_rgba(109,211,199,0.4)] transition-all duration-300">
                    {statsLoading ? (
                      <div className="animate-pulse bg-[#2A2A2A] rounded h-10 w-16 mx-auto"></div>
                    ) : (
                      stat.value
                    )}
                  </div>
                  <div className="text-[#EAEAEA] text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* 동아리 소개 섹션 */}
      <section id="about" ref={aboutAnimation.ref} className="bg-[#121212] min-h-screen flex items-center justify-center py-16 sm:py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-16 fade-in-section ${aboutAnimation.isVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl md:text-4xl font-bold text-[#EAEAEA] mb-4">
              <span className="bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(109,211,199,0.3)]">
                소개
              </span>
            </h2>
                   <p className="text-xl text-[#EAEAEA] max-w-3xl mx-auto leading-relaxed">
                     음악에 대한 열정만 있다면 실력에 상관없이 누구나 함께 어울릴 수 있습니다.
                     <br />
                     같이 합주하고 공연하며, 빛나는 청춘의 한 페이지를 채워나가는 음샘입니다.
                   </p>
          </div>
          
          <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center fade-in-section fade-in-delay-2 ${aboutAnimation.isVisible ? 'visible' : ''}`}>
            <div>
              <h3 className="text-2xl font-bold text-[#EAEAEA] mb-6">우리의 비전</h3>
              <p className="text-lg text-[#B0B0B0] mb-6">
                음샘은 단순한 음악 동아리를 넘어, 음악을 통해 사람과 사람을 연결하고 
                함께 성장하는 공동체를 만들어가고 있습니다. 다양한 장르의 음악을 
                존중하며, 모든 멤버가 자신만의 음악적 색깔을 찾을 수 있도록 돕습니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#6DD3C7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#1A1A1A] text-sm font-bold">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#EAEAEA]">음악적 성장</h4>
                    <p className="text-[#B0B0B0]">개인과 팀의 음악적 역량을 지속적으로 발전시킵니다.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#6DD3C7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#1A1A1A] text-sm font-bold">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#EAEAEA]">소통과 협력</h4>
                    <p className="text-[#B0B0B0]">서로를 존중하고 협력하는 건강한 문화를 만듭니다.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-[#6DD3C7] rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-[#1A1A1A] text-sm font-bold">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#EAEAEA]">창의적 표현</h4>
                    <p className="text-[#B0B0B0]">자유로운 창작과 표현을 통해 음악의 새로운 가능성을 탐구합니다.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-[#EAEAEA] mb-6">공연 영상</h3>
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full rounded-xl"
                    src="https://www.youtube.com/embed/6WcWFLRZ3Sk"
                    title="공연 영상"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 주요 활동 섹션 */}
      <section ref={activitiesAnimation.ref} className="bg-[#1A1A1A] min-h-screen flex items-center justify-center py-16 sm:py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 fade-in-section ${activitiesAnimation.isVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl font-bold text-[#EAEAEA] mb-4">
              <span className="bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(109,211,199,0.3)]">
                주요 활동
              </span>
            </h2>
            <p className="text-xl text-[#B0B0B0]">음샘의 다양한 활동들을 만나보세요</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activities.map((activity, index) => (
              <div key={index} className={`bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 hover:border-[#6DD3C7] transition-all duration-300 fade-in-section fade-in-delay-${index + 1} ${activitiesAnimation.isVisible ? 'visible' : ''}`}>
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#6DD3C7]/20 rounded-lg flex items-center justify-center text-[#6DD3C7] flex-shrink-0">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-[#EAEAEA] mb-2">{activity.title}</h3>
                    <p className="text-[#B0B0B0] mb-3">{activity.description}</p>
                    <div className="flex items-center text-sm text-[#6DD3C7]">
                      <Calendar className="w-4 h-4 mr-2" />
                      {activity.schedule}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* 성과 및 수상 섹션 */}
      <section ref={achievementsAnimation.ref} className="bg-[#121212] min-h-screen flex items-center justify-center py-16 sm:py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 fade-in-section ${achievementsAnimation.isVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl font-bold text-[#EAEAEA] mb-4">
              <span className="bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(109,211,199,0.3)]">
                음샘을 망설이지 않아도 되는 4가지 이유
              </span>
            </h2>
            <p className="text-xl text-[#B0B0B0]">부담없이 음악을 즐길 수 있는 음샘의 장점들</p>
          </div>
          
          <div className="space-y-8">
            {achievements.map((achievement, index) => (
              <div key={index} className={`flex items-start space-x-6 p-6 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl hover:border-[#6DD3C7] transition-all duration-300 fade-in-section fade-in-delay-${index + 1} ${achievementsAnimation.isVisible ? 'visible' : ''}`}>
                <div className="w-16 h-16 bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#1A1A1A] font-bold text-lg">{achievement.year}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#EAEAEA] mb-2">{achievement.title}</h3>
                  <p className="text-[#B0B0B0]">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 운영진 소개 섹션 */}
      <section ref={teamAnimation.ref} className="bg-[#1A1A1A] min-h-screen flex items-center justify-center py-16 sm:py-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-12 fade-in-section ${teamAnimation.isVisible ? 'visible' : ''}`}>
            <h2 className="text-3xl font-bold text-[#EAEAEA] mb-4">
              <span className="bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(109,211,199,0.3)]">
                운영진 소개
              </span>
            </h2>
            <p className="text-xl text-[#B0B0B0]">음샘을 이끌어가는 운영진들을 소개합니다</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className={`bg-[#121212] border border-[#2A2A2A] rounded-xl p-6 text-center hover:border-[#6DD3C7] transition-all duration-300 fade-in-section fade-in-delay-${index + 1} ${teamAnimation.isVisible ? 'visible' : ''}`}>
                <div className="w-32 h-32 rounded-full mx-auto mb-4 overflow-hidden">
                  <img 
                    src={`${import.meta.env.BASE_URL}Manager${index + 1}.jpg`} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold text-[#EAEAEA] mb-1">{member.name}</h3>
                <p className="text-[#6DD3C7] font-medium mb-2">{member.role}</p>
                <p className="text-[#B0B0B0] text-sm mb-3">{member.instrument}</p>
                <p className="text-[#B0B0B0] text-sm">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section ref={ctaAnimation.ref} className="bg-[#1A1A1A] min-h-screen flex items-center justify-center py-16 sm:py-0">
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center fade-in-section ${ctaAnimation.isVisible ? 'visible' : ''}`}>
          <h2 className="text-3xl md:text-4xl font-bold text-[#EAEAEA] mb-6 drop-shadow-[0_0_10px_rgba(109,211,199,0.3)]">
            음샘과 함께 음악 여행을 시작하세요
          </h2>
          <p className="text-xl text-[#EAEAEA] mb-8 max-w-2xl mx-auto leading-relaxed">
            경험과 실력에 관계없이 음악을 사랑하는 모든 분을 환영합니다
          </p>
          <div className={`flex flex-col sm:flex-row gap-4 justify-center fade-in-section fade-in-delay-2 ${ctaAnimation.isVisible ? 'visible' : ''}`}>
            <Link
              to="/application"
              className="bg-[#6DD3C7] text-[#1A1A1A] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#4ECDC4] hover:shadow-[0_0_20px_rgba(109,211,199,0.4)] transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              지금 지원하기
            </Link>
            <Link
              to="/gallery"
              className="border-2 border-[#6DD3C7] text-[#6DD3C7] px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#6DD3C7] hover:text-[#1A1A1A] hover:shadow-[0_0_20px_rgba(109,211,199,0.4)] transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center"
            >
              <Camera className="w-5 h-5 mr-2" />
              활동 사진 보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
