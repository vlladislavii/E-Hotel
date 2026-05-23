import { Inbox } from 'lucide-react'
import styles from './EmptyState.module.css'

function EmptyState({ icon: Icon = Inbox, title, message }) {
  return (
    <div className={styles.empty}>
      <div className={styles.iconWrap}>
        <Icon size={28} />
      </div>
      {title && <p className={styles.title}>{title}</p>}
      {message && <p className={styles.message}>{message}</p>}
    </div>
  )
}

export default EmptyState
