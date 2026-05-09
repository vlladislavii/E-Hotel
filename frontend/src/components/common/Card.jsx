import styles from './Card.module.css'

function Card({ children, className = '', variant = 'default', header }) {
  const classes = [
    styles.card,
    variant !== 'default' && styles[variant],
    className
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {header && (
        <div className={styles.header}>
          {header}
        </div>
      )}
      {children}
    </div>
  )
}

export default Card
