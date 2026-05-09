import styles from './StatusBadge.module.css'

function StatusBadge({ status }) {
  const statusClass = styles[status.replace('-', '')] || styles.default

  return (
    <span className={`${styles.badge} ${statusClass}`}>
      {status}
    </span>
  )
}

export default StatusBadge
