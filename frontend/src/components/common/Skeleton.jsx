import styles from './Skeleton.module.css'

function Skeleton({ width = '100%', height = 16, radius, className = '', style }) {
  return (
    <span
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius: radius ?? 'var(--radius-sm)',
        ...style,
      }}
    />
  )
}

export default Skeleton
