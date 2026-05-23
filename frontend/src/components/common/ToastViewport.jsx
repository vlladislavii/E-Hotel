import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import styles from './ToastViewport.module.css'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) return null

  return (
    <div className={styles.viewport}>
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info
        return (
          <div
            key={toast.id}
            className={`${styles.toast} ${styles[toast.type] || styles.info}`}
            role="alert"
          >
            <Icon size={20} className={styles.icon} />
            <p className={styles.message}>{toast.message}</p>
            <button
              className={styles.close}
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default ToastViewport
