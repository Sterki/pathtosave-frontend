import { useAuth } from '../contexts/AuthContext'

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000'

export const useApi = () => {
  const { getAccessToken } = useAuth()

  const apiCall = async (
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> => {
    const token = getAccessToken()
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    return response
  }

  const get = async (url: string) => {
    return apiCall(url, { method: 'GET' })
  }

  const post = async (url: string, data?: any) => {
    return apiCall(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  const put = async (url: string, data?: any) => {
    return apiCall(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  const del = async (url: string) => {
    return apiCall(url, { method: 'DELETE' })
  }

  return {
    apiCall,
    get,
    post,
    put,
    delete: del,
  }
}
