import { Star } from 'lucide-react'
import styles from './StarRating.module.css'

function StarRating({ count = 0, max = 5, size = 14 }) {
  const stars = Math.max(0, Math.min(max, Math.round(count)))

  return (
    <span className={styles.rating} aria-label={`${stars} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < stars ? styles.filled : styles.empty}
          fill={i < stars ? 'currentColor' : 'none'}
          strokeWidth={2}
        />
      ))}
    </span>
  )
}

export default StarRating
