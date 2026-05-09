import { apiClient } from './client'

export const hotelsApi = {
  getAll() {
    return apiClient.get('/hotels')
  }
}
