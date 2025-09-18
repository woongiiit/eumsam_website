import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { Music, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

interface RegisterForm {
  email: string
  username: string
  password: string
  confirmPassword: string
  real_name: string
  student_id?: string
  phone_number?: string
  major?: string
  year?: number
}

const Register = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<RegisterForm>()

  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    try {
      const { confirmPassword, ...userData } = data
      await registerUser(userData)
      toast.success('회원가입이 완료되었습니다! 관리자 승인 후 로그인할 수 있습니다.')
      navigate('/login')
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-r from-[#6DD3C7] to-[#4ECDC4] rounded-2xl flex items-center justify-center">
              <Music className="w-8 h-8 text-[#1A1A1A]" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-[#EAEAEA]">
            음샘 동아리에 가입하세요
          </h2>
          <p className="mt-2 text-sm text-[#B0B0B0]">
            이미 계정이 있으신가요?{' '}
            <Link to="/login" className="font-medium text-[#6DD3C7] hover:text-[#4ECDC4]">
              로그인하기
            </Link>
          </p>
        </div>

        <div className="bg-[#121212] border border-[#2A2A2A] py-8 px-6 shadow-xl rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                  이메일 주소 *
                </label>
                <input
                  {...register('email', {
                    required: '이메일을 입력해주세요',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: '올바른 이메일 형식이 아닙니다'
                    }
                  })}
                  type="email"
                  className="input-field"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                  사용자명 *
                </label>
                <input
                  {...register('username', {
                    required: '사용자명을 입력해주세요',
                    minLength: {
                      value: 2,
                      message: '사용자명은 최소 2자 이상이어야 합니다'
                    }
                  })}
                  type="text"
                  className="input-field"
                  placeholder="사용자명을 입력하세요"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="real_name" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                  실명 *
                </label>
                <input
                  {...register('real_name', {
                    required: '실명을 입력해주세요'
                  })}
                  type="text"
                  className="input-field"
                  placeholder="실명을 입력하세요"
                />
                {errors.real_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.real_name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="student_id" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                  학번
                </label>
                <input
                  {...register('student_id')}
                  type="text"
                  className="input-field"
                  placeholder="학번을 입력하세요"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone_number" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                  전화번호
                </label>
                <input
                  {...register('phone_number')}
                  type="tel"
                  className="input-field"
                  placeholder="010-1234-5678"
                />
              </div>

              <div>
                <label htmlFor="year" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                  학년
                </label>
                <select
                  {...register('year', { valueAsNumber: true })}
                  className="input-field"
                >
                  <option value="">학년을 선택하세요</option>
                  <option value={1}>1학년</option>
                  <option value={2}>2학년</option>
                  <option value={3}>3학년</option>
                  <option value={4}>4학년</option>
                  <option value={5}>대학원생</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="major" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                전공
              </label>
              <input
                {...register('major')}
                type="text"
                className="input-field"
                placeholder="전공을 입력하세요"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                비밀번호 *
              </label>
              <div className="relative">
                <input
                  {...register('password', {
                    required: '비밀번호를 입력해주세요',
                    minLength: {
                      value: 6,
                      message: '비밀번호는 최소 6자 이상이어야 합니다'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="비밀번호를 입력하세요"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[#6DD3C7]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#6DD3C7]" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#EAEAEA] mb-2">
                비밀번호 확인 *
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: '비밀번호 확인을 입력해주세요',
                    validate: value => value === password || '비밀번호가 일치하지 않습니다'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="비밀번호를 다시 입력하세요"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-[#6DD3C7]" />
                  ) : (
                    <Eye className="h-5 w-5 text-[#6DD3C7]" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-[#EAEAEA]">
                <span className="text-[#6DD3C7]">개인정보 처리방침</span> 및{' '}
                <span className="text-[#6DD3C7]">이용약관</span>에 동의합니다
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '가입 중...' : '회원가입'}
              </button>
            </div>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-[#B0B0B0]">
            회원가입 후 관리자 승인을 받아야 로그인할 수 있습니다.
            <br />
            승인까지 1-2일 정도 소요될 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
