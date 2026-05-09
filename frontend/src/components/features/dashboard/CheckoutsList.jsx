import styles from './CheckoutsList.module.css'

function CheckoutsList({ checkouts }) {
  if (!checkouts || checkouts.length === 0) {
    return (
      <p className={styles.empty}>No checkouts scheduled today</p>
    )
  }

  return (
    <div className={styles.list}>
      {checkouts.map((checkout, index) => (
        <div key={index} className={styles.item}>
          <div className={styles.row}>
            <span className={styles.guest}>{checkout.guest}</span>
            <span className={styles.room}>Room {checkout.room}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.hotel}>{checkout.hotel}</span>
            <span className={styles.time}>{checkout.time}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CheckoutsList
