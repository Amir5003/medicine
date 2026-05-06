import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

// Response interceptor: unwrap response.data or reject with error message
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong'
    return Promise.reject(new Error(message))
  }
)

// Request interceptor placeholder
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

export default api
