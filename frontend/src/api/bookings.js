import { apiClient } from './client'

export const bookingsApi = {
  getAll(search) {
    return apiClient.get(`/bookings${search ? `?search=${encodeURIComponent(search)}` : ''}`)
  },

  create(data) {
    return apiClient.post('/bookings', data)
  },

  checkIn(number) {
    return apiClient.patch(`/bookings/${number}/check-in`)
  },

  checkOut(number, paymentMethod) {
    return apiClient.patch(`/bookings/${number}/check-out`, { paymentMethod })
  },

  extend(number, newCheckOutDate) {
    return apiClient.patch(`/bookings/${number}/extend`, { newCheckOutDate })
  },

  cancel(number) {
    return apiClient.patch(`/bookings/${number}/cancel`)
  },

  markInvalid(number) {
    return apiClient.patch(`/bookings/${number}/invalid`)
  }
}
