import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Download, FileBarChart, AlertCircle } from 'lucide-react'
import { reportsApi } from '../api/reports'
import { formatMonth, formatDateTime, formatCurrency } from '../utils/formatters'
import Header from '../components/layout/Header'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import StatusBadge from '../components/common/StatusBadge'
import EmptyState from '../components/common/EmptyState'
import styles from './PerformanceReportPage.module.css'

function toMonthString(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function currentMonth() {
  return toMonthString(new Date())
}

function defaultMonth() {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - 1)
  return toMonthString(d)
}

function PerformanceReportPage() {
  const queryClient = useQueryClient()
  const [month, setMonth] = useState(defaultMonth())

  const { data: reports = [], isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: reportsApi.getAll
  })

  const generateMutation = useMutation({
    mutationFn: (yearMonth) => reportsApi.generate(yearMonth),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reports'] })
  })

  const handleGenerate = () => {
    if (month) generateMutation.mutate(month)
  }

  const handleDownload = (id) => {
    window.open(reportsApi.getDownloadUrl(id), '_blank', 'noopener')
  }

  return (
    <div>
      <Header
        title="Performance Reports"
        subtitle="Monthly room earnings, booking trends, and cancellations across the resort"
      />

      <Card header={<h3>Generate Monthly Report</h3>} className={styles.generateCard}>
        <p className={styles.generateHint}>
          Select a calendar month to aggregate its statistics into the archive. Re-generating an
          existing month refreshes its data.
        </p>
        <div className={styles.generateRow}>
          <input
            type="month"
            className={styles.monthInput}
            value={month}
            max={currentMonth()}
            onChange={(e) => setMonth(e.target.value)}
          />
          <Button
            icon={FileBarChart}
            onClick={handleGenerate}
            disabled={!month || generateMutation.isPending}
          >
            {generateMutation.isPending ? 'Generating...' : 'Generate Report'}
          </Button>
        </div>
        {generateMutation.isError && (
          <p className={styles.errorText}>
            <AlertCircle size={16} />
            {generateMutation.error?.data?.message || 'Failed to generate report'}
          </p>
        )}
      </Card>

      <Card header={<h3>Historical Reports</h3>} className={styles.tableCard}>
        {isLoading ? (
          <Loading />
        ) : error ? (
          <p className={styles.errorText}>
            <AlertCircle size={16} />
            Failed to load reports
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Generated</th>
                  <th>Room Earnings</th>
                  <th>Cancellations</th>
                  <th>Popular Type</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState
                        icon={FileBarChart}
                        title="No reports yet"
                        message="Generate a report for a month above to start building your archive."
                      />
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id}>
                      <td className={styles.period}>{formatMonth(report.yearMonth)}</td>
                      <td>{formatDateTime(report.timeStamp)}</td>
                      <td>{formatCurrency(report.totalRoomEarnings)}</td>
                      <td>{report.totalCancelations}</td>
                      <td>
                        <StatusBadge status={report.popularRoomType} />
                      </td>
                      <td>
                        <Button
                          variant="outline"
                          size="small"
                          icon={Download}
                          onClick={() => handleDownload(report.id)}
                        >
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

export default PerformanceReportPage
