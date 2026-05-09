import { apiClient } from './client'

export const roomsApi = {
  search(params) {
    const query = new URLSearchParams()
    if (params.hotelId) query.append('hotelId', params.hotelId)
    if (params.type) query.append('type', params.type)
    if (params.from) query.append('from', params.from)
    if (params.to) query.append('to', params.to)

    const queryString = query.toString()
    return apiClient.get(`/rooms/search${queryString ? `?${queryString}` : ''}`)
  },

  getById(id) {
    return apiClient.get(`/rooms/${id}`)
  }
}
