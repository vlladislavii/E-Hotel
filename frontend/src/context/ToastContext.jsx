import { createContext, useState, useCallback } from 'react'
import ToastViewport from '../components/common/ToastViewport'

export const ToastContext = createContext(null)

let nextId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message, type = 'info', duration = 4500) => {
      const id = ++nextId
      setToasts((prev) => [...prev, { id, message, type }])
      if (duration > 0) {
        setTimeout(() => dismissToast(id), duration)
      }
      return id
    },
    [dismissToast]
  )

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}
