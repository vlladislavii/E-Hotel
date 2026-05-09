import StatusBadge from '../../common/StatusBadge'
import styles from './ActivityList.module.css'

function ActivityList({ activity }) {
  if (!activity || activity.length === 0) {
    return (
      <p className={styles.empty}>No recent activity</p>
    )
  }

  return (
    <div className={styles.list}>
      {activity.map((item, index) => (
        <div key={index} className={styles.item}>
          <div className={styles.header}>
            <strong className={styles.guest}>{item.guest}</strong>
            <StatusBadge status={item.type} />
          </div>
          <div className={styles.meta}>
            {item.hotel} &bull; {item.time}
          </div>
        </div>
      ))}
    </div>
  )
}

export default ActivityList
