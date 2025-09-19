import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../lib'

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
  created_at: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
}

interface RegisterData {
  email: string
  username: string
  password: string
  real_name: string
  student_id?: string
  phone_number?: string
  major?: string
  year?: number
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      if (storedToken) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
          const response = await api.get('/auth/me')
          setUser(response.data)
          setToken(storedToken)
        } catch (error) {
          localStorage.removeItem('token')
          delete api.defaults.headers.common['Authorization']
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { access_token } = response.data
      
      localStorage.setItem('token', access_token)
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      const userResponse = await api.get('/auth/me')
      setUser(userResponse.data)
      setToken(access_token)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || '로그인에 실패했습니다')
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      await api.post('/auth/register', userData)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || '회원가입에 실패했습니다')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    setToken(null)
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
