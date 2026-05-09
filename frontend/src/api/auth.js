import { apiClient } from './client'

export const authApi = {
  login(credentials) {
    return apiClient.post('/auth/login', credentials)
  }
}
