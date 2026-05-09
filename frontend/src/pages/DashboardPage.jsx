import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Building2, Search, CalendarCheck } from 'lucide-react'
import { dashboardApi } from '../api/dashboard'
import Header from '../components/layout/Header'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import StatsGrid from '../components/features/dashboard/StatsGrid'
import ActivityList from '../components/features/dashboard/ActivityList'
import CheckoutsList from '../components/features/dashboard/CheckoutsList'
import styles from './DashboardPage.module.css'

function DashboardPage() {
  const navigate = useNavigate()

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardApi.getStats
  })

  if (isLoading) return <Loading />

  if (error) {
    return (
      <div className={styles.error}>
        <p>Failed to load dashboard data</p>
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="Welcome to E-Hotel Resort Cashier Management"
      />

      <StatsGrid stats={data?.stats || []} />

      <div className={styles.mainContent}>
        <Card
          header={<h3>Recent Activity</h3>}
        >
          <ActivityList activity={data?.activity || []} />
        </Card>

        <Card
          header={<h3>Upcoming Checkouts</h3>}
        >
          <CheckoutsList checkouts={data?.checkouts || []} />
        </Card>

        <Card
          header={<h3>Quick Actions</h3>}
        >
          <div className={styles.actions}>
            <Button
              variant="outline"
              icon={Building2}
              onClick={() => navigate('/hotels')}
            >
              View Hotels
            </Button>
            <Button
              variant="outline"
              icon={Search}
              onClick={() => navigate('/search')}
            >
              Search Rooms
            </Button>
            <Button
              variant="outline"
              icon={CalendarCheck}
              onClick={() => navigate('/stays')}
            >
              Process Checkout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage
