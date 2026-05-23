import { AlertTriangle } from 'lucide-react'
import Button from './Button'
import styles from './ConfirmDialog.module.css'

function ConfirmDialog({ isOpen, options, onConfirm, onCancel }) {
  if (!isOpen) return null

  const {
    title = 'Are you sure?',
    message = '',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
  } = options

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onCancel()
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.dialog} role="alertdialog" aria-modal="true">
        <div className={`${styles.iconWrap} ${styles[variant] || styles.danger}`}>
          <AlertTriangle size={26} />
        </div>
        <h3 className={styles.title}>{title}</h3>
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.actions}>
          <Button variant="ghost" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
