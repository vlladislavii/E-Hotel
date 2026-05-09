export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const BOOKING_STATUS = {
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked-in',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
  INVALID: 'invalid'
}

export const ROOM_TYPES = [
  { value: 'single', label: 'Single Room' },
  { value: 'double', label: 'Double Room' }
]
