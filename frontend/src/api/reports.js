import { apiClient } from './client'
import { API_URL } from '../utils/constants'

export const reportsApi = {
  getAll() {
    return apiClient.get('/reports')
  },

  generate(yearMonth) {
    return apiClient.post('/reports/generate', { yearMonth })
  },

  getDownloadUrl(id) {
    return `${API_URL}/reports/${id}/download`
  }
}
