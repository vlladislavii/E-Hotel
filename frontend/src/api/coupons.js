import { apiClient } from './client'

export const couponsApi = {
  validate(code) {
    return apiClient.get(`/coupons/validate?code=${encodeURIComponent(code)}`)
  }
}
