import styles from './Loading.module.css'

function Loading({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className={styles.fullPage}>
        <div className={styles.spinner} />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
    </div>
  )
}

export default Loading
