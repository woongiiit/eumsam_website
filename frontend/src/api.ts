import axios from 'axios'

// Railway 환경에서는 절대 URL 사용, 로컬에서는 상대 URL 사용
const isProduction = import.meta.env.PROD
const baseURL = isProduction 
  ? `${import.meta.env.VITE_API_URL || 'https://eumsamwebsite-production.up.railway.app'}/api`
  : '/api'

console.log('API Base URL:', baseURL)
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('Is Production:', isProduction)

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터
api.interceptors.request.use(
  (config) => {
    console.log('API Request URL:', config.url)
    console.log('Full URL:', `${config.baseURL}${config.url}`)
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
