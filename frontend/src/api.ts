import axios from 'axios'

const baseURL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`
console.log('API Base URL:', baseURL)
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL)

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
