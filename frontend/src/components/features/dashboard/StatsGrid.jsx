import { Calendar, Users, DollarSign, TrendingUp, Hotel, Bed, CreditCard, BarChart3 } from 'lucide-react'
import Card from '../../common/Card'
import styles from './StatsGrid.module.css'

const iconMap = {
  calendar: Calendar,
  users: Users,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  hotel: Hotel,
  bed: Bed,
  'credit-card': CreditCard,
  'bar-chart-3': BarChart3
}

function StatsGrid({ stats }) {
  if (!stats || stats.length === 0) return null

  return (
    <div className={styles.grid}>
      {stats.map((stat, index) => {
        const Icon = iconMap[stat.icon] || Calendar

        return (
          <Card key={index} variant="stat">
            <div className={styles.inner}>
              <div>
                <p className={styles.title}>{stat.title}</p>
                <p className={styles.value}>{stat.value}</p>
                {stat.change && (
                  <p className={styles.change}>{stat.change}</p>
                )}
              </div>
              <div
                className={styles.iconBox}
                style={{ backgroundColor: stat.color || '#3b82f6' }}
              >
                <Icon size={24} />
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}

export default StatsGrid
