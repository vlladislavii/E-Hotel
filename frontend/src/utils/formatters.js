export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

export function formatDateForInput(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toISOString().split('T')[0]
}

export function formatCurrency(amount) {
  return `$${parseFloat(amount).toFixed(2)}`
}

export function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function calculateNights(checkIn, checkOut) {
  const start = new Date(checkIn)
  const end = new Date(checkOut)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1
}

export function getMinDate() {
  return new Date().toISOString().split('T')[0]
}

export function isGracePeriodExpired(gracePeriodEnd) {
  if (!gracePeriodEnd) return true
  return new Date() > new Date(gracePeriodEnd)
}
