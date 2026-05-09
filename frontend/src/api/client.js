import { API_URL } from '../utils/constants'

class ApiError extends Error {
  constructor(response, data) {
    super(data?.message || `HTTP Error ${response.status}`)
    this.status = response.status
    this.data = data
  }
}

async function handleResponse(response) {
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new ApiError(response, data)
  }

  return data
}

function getAuthHeaders() {
  const token = sessionStorage.getItem('hotel_token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

export const apiClient = {
  async get(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    })
    return handleResponse(response)
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async patch(endpoint, data = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  }
}
