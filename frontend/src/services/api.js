// Shared Axios instance for calling backend APIs.
// All other service modules can import this instance to keep baseURL and interceptors centralized.

import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Example request interceptor for auth token
api.interceptors.request.use((config) => {
  // TODO: wire in access token from context/storage
  return config
})

export default api
