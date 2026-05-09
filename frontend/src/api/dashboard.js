import { apiClient } from './client'

export const dashboardApi = {
  getStats() {
    return apiClient.get('/dashboard/stats')
  }
}
