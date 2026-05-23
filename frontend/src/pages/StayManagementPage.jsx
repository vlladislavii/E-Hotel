import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, CreditCard, Banknote, CheckCircle, Receipt, AlertCircle, Moon, CalendarCheck, Archive } from 'lucide-react'
import { bookingsApi } from '../api/bookings'
import { formatDate, isGracePeriodExpired, formatCurrency } from '../utils/formatters'
import { useToast } from '../hooks/useToast'
import { useConfirm } from '../hooks/useConfirm'
import Header from '../components/layout/Header'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import StatusBadge from '../components/common/StatusBadge'
import Modal from '../components/common/Modal'
import Loading from '../components/common/Loading'
import EmptyState from '../components/common/EmptyState'
import styles from './StayManagementPage.module.css'

function StayManagementPage() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const confirm = useConfirm()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [extendModalOpen, setExtendModalOpen] = useState(false)
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('Card')
  const [issuedBill, setIssuedBill] = useState(null)
  const [newCheckoutDate, setNewCheckoutDate] = useState('')

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingsApi.getAll()
  })

  const checkInMutation = useMutation({
    mutationFn: (number) => bookingsApi.checkIn(number),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err) => showToast(err.message, 'error')
  })

  const checkOutMutation = useMutation({
    mutationFn: ({ number, paymentMethod }) => bookingsApi.checkOut(number, paymentMethod),
    onSuccess: (data, variables) => {
      setIssuedBill({
        billNumber: data.billNumber,
        totalPaid: data.totalPaid,
        paymentMethod: variables.paymentMethod
      })
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    }
  })

  const extendMutation = useMutation({
    mutationFn: ({ number, newCheckOutDate }) => bookingsApi.extend(number, newCheckOutDate),
    onSuccess: (data, variables) => {
      setExtendModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      showToast(`Stay ${variables.number} extended successfully!`, 'success')
    },
    onError: (err) => showToast(err.message, 'error')
  })

  const cancelMutation = useMutation({
    mutationFn: (number) => bookingsApi.cancel(number),
    onSuccess: () => {
      setDetailsModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err) => showToast(err.message, 'error')
  })

  const invalidMutation = useMutation({
    mutationFn: (number) => bookingsApi.markInvalid(number),
    onSuccess: () => {
      setDetailsModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
    },
    onError: (err) => showToast(err.message, 'error')
  })

  const filteredBookings = useMemo(() => {
    if (!searchTerm) return bookings

    const term = searchTerm.toLowerCase()
    return bookings.filter(b =>
      b.number.toLowerCase().includes(term) ||
      (b.CreditCard?.Tourist?.name || '').toLowerCase().includes(term)
    )
  }, [bookings, searchTerm])

  const activeBookings = useMemo(() =>
    filteredBookings.filter(b => ['confirmed', 'checked-in'].includes(b.status)),
    [filteredBookings]
  )

  const pastBookings = useMemo(() =>
    filteredBookings.filter(b => ['completed', 'canceled', 'invalid'].includes(b.status)),
    [filteredBookings]
  )

  const handleCheckIn = (number) => {
    checkInMutation.mutate(number)
  }

  const handleOpenCheckout = (booking) => {
    setSelectedBooking(booking)
    setPaymentMethod('Card')
    setIssuedBill(null)
    checkOutMutation.reset()
    setCheckoutModalOpen(true)
  }

  const handleConfirmCheckout = () => {
    if (!selectedBooking || !paymentMethod) return
    checkOutMutation.mutate({
      number: selectedBooking.number,
      paymentMethod
    })
  }

  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking)
    setDetailsModalOpen(true)
  }

  const handleOpenExtend = (booking) => {
    setSelectedBooking(booking)
    setNewCheckoutDate(booking.checkOutDate.split('T')[0])
    setExtendModalOpen(true)
  }

  const handleConfirmExtend = () => {
    if (!selectedBooking) return
    extendMutation.mutate({
      number: selectedBooking.number,
      newCheckOutDate: newCheckoutDate
    })
  }

  const handleCancel = async () => {
    if (!selectedBooking) return
    const ok = await confirm({
      title: 'Cancel Reservation',
      message: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      confirmText: 'Cancel Reservation',
      cancelText: 'Keep Booking',
      variant: 'danger',
    })
    if (ok) {
      cancelMutation.mutate(selectedBooking.number)
    }
  }

  const handleMarkInvalid = async () => {
    if (!selectedBooking) return
    const ok = await confirm({
      title: 'Mark as Invalid',
      message: 'Mark this booking as invalid? This action cannot be undone.',
      confirmText: 'Mark as Invalid',
      cancelText: 'Go Back',
      variant: 'danger',
    })
    if (ok) {
      invalidMutation.mutate(selectedBooking.number)
    }
  }

  const extendPreview = useMemo(() => {
    if (!selectedBooking || !newCheckoutDate) return null

    const oldDate = new Date(selectedBooking.checkOutDate)
    const newDate = new Date(newCheckoutDate)
    const diffTime = newDate - oldDate
    const extraNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (extraNights <= 0) return { error: true }

    const pricePerNight = parseFloat(selectedBooking.Room?.price || 0)
    const extraCharge = extraNights * pricePerNight
    const newTotal = parseFloat(selectedBooking.totalCost) + extraCharge

    return { extraNights, extraCharge, newTotal }
  }, [selectedBooking, newCheckoutDate])

  if (isLoading) return <Loading />

  return (
    <div>
      <Header
        title="Stay Management & Billing"
        subtitle="Manage current stays and view history"
      />

      {/* Search */}
      <div className={styles.searchBar}>
        <Search size={20} className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search by code or guest name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Active Bookings */}
      <Card className={styles.tableCard}>
        <h3 className={styles.tableTitle}>Active Bookings ({activeBookings.length})</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Guest</th>
                <th>Hotel</th>
                <th>Room</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeBookings.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={CalendarCheck}
                      title="No active bookings"
                      message="Confirmed and checked-in stays will appear here."
                    />
                  </td>
                </tr>
              ) : (
                activeBookings.map(booking => (
                  <tr key={booking.number}>
                    <td>
                      <button
                        className={styles.codeLink}
                        onClick={() => handleOpenDetails(booking)}
                      >
                        {booking.number}
                      </button>
                    </td>
                    <td>{booking.CreditCard?.Tourist?.name || 'N/A'}</td>
                    <td>{booking.Room?.Hotel?.name || 'N/A'}</td>
                    <td>#{booking.Room?.number || 'N/A'}</td>
                    <td>{formatDate(booking.checkInDate)}</td>
                    <td>{formatDate(booking.checkOutDate)}</td>
                    <td><StatusBadge status={booking.status} /></td>
                    <td>
                      <div className={styles.actions}>
                        <Button
                          size="small"
                          variant="outline"
                          onClick={() => handleOpenExtend(booking)}
                        >
                          Extend
                        </Button>
                        {booking.status === 'confirmed' && (
                          <Button
                            size="small"
                            variant="success"
                            onClick={() => handleCheckIn(booking.number)}
                          >
                            Check-in
                          </Button>
                        )}
                        {booking.status === 'checked-in' && (
                          <Button
                            size="small"
                            variant="primary"
                            onClick={() => handleOpenCheckout(booking)}
                          >
                            Checkout
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Past Bookings */}
      <Card className={styles.tableCard}>
        <h3 className={styles.tableTitle}>Past Bookings ({pastBookings.length})</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Guest</th>
                <th>Hotel</th>
                <th>Room</th>
                <th>Check-In</th>
                <th>Check-Out</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pastBookings.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState
                      icon={Archive}
                      title="No past bookings"
                      message="Completed, canceled, and invalid stays will be archived here."
                    />
                  </td>
                </tr>
              ) : (
                pastBookings.map(booking => (
                  <tr key={booking.number}>
                    <td>
                      <button
                        className={styles.codeLink}
                        onClick={() => handleOpenDetails(booking)}
                      >
                        {booking.number}
                      </button>
                    </td>
                    <td>{booking.CreditCard?.Tourist?.name || 'N/A'}</td>
                    <td>{booking.Room?.Hotel?.name || 'N/A'}</td>
                    <td>#{booking.Room?.number || 'N/A'}</td>
                    <td>{formatDate(booking.checkInDate)}</td>
                    <td>{formatDate(booking.checkOutDate)}</td>
                    <td><StatusBadge status={booking.status} /></td>
                    <td></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details Modal */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={`Booking Info: ${selectedBooking?.number || ''}`}
      >
        {selectedBooking && (
          <div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Guest Name:</span>
              <span className={styles.detailValue}>
                {selectedBooking.CreditCard?.Tourist?.name}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Stay Period:</span>
              <span className={styles.detailValue}>
                {formatDate(selectedBooking.checkInDate)} - {formatDate(selectedBooking.checkOutDate)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Grace Period Until:</span>
              <span
                className={styles.detailValue}
                style={{
                  color: isGracePeriodExpired(selectedBooking.gracePeriodEndTimeStamp)
                    ? '#991b1b'
                    : '#166534'
                }}
              >
                {formatDate(selectedBooking.gracePeriodEndTimeStamp)}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Total Cost:</span>
              <span className={styles.detailValue} style={{ color: 'var(--blue)', fontWeight: 'bold' }}>
                {formatCurrency(selectedBooking.totalCost)}
              </span>
            </div>

            {selectedBooking.Bill && (
              <div className={styles.billInfo}>
                <p className={styles.billTitle}>Invoice Issued</p>
                <p>Bill Number: <strong>#{selectedBooking.Bill.number}</strong></p>
                <p>Final Amount: <strong>{formatCurrency(selectedBooking.Bill.totalPayAmount)}</strong></p>
              </div>
            )}

            {selectedBooking.status === 'confirmed' && (
              <div className={styles.cancelSection}>
                <p className={styles.cancelWarning}>
                  {isGracePeriodExpired(selectedBooking.gracePeriodEndTimeStamp)
                    ? <span style={{ color: '#991b1b' }}>Grace period expired. Full charge applies!</span>
                    : <span style={{ color: '#166534' }}>Grace period active. Free cancellation.</span>
                  }
                </p>
                <div className={styles.cancelActions}>
                  <Button variant="danger" onClick={handleCancel}>
                    Cancel Reservation
                  </Button>
                  <Button variant="ghost" onClick={handleMarkInvalid}>
                    Mark as Invalid
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Extend Modal */}
      <Modal
        isOpen={extendModalOpen}
        onClose={() => setExtendModalOpen(false)}
        title="Extend Stay"
      >
        {selectedBooking && (
          <div>
            <div className={styles.currentStay}>
              <span className={styles.currentStayLabel}>Current checkout</span>
              <span className={styles.currentStayValue}>
                {formatDate(selectedBooking.checkOutDate)}
              </span>
            </div>

            <div className={styles.extendField}>
              <label>New Checkout Date</label>
              <input
                type="date"
                value={newCheckoutDate}
                min={selectedBooking.checkOutDate.split('T')[0]}
                onChange={(e) => setNewCheckoutDate(e.target.value)}
                className={styles.dateInput}
              />
            </div>

            {extendPreview && !extendPreview.error && (
              <div className={styles.extendPreview}>
                <div className={styles.previewRow}>
                  <span className={styles.previewLabel}>
                    <Moon size={15} /> Additional nights
                  </span>
                  <strong>{extendPreview.extraNights}</strong>
                </div>
                <div className={`${styles.previewRow} ${styles.previewCharge}`}>
                  <span className={styles.previewLabel}>Extra charge</span>
                  <strong>+{formatCurrency(extendPreview.extraCharge)}</strong>
                </div>
                <div className={styles.previewDivider} />
                <div className={`${styles.previewRow} ${styles.previewTotal}`}>
                  <span>New total cost</span>
                  <strong>{formatCurrency(extendPreview.newTotal)}</strong>
                </div>
              </div>
            )}

            {extendPreview?.error && (
              <div className={styles.extendWarning}>
                <AlertCircle size={18} />
                <span>Choose a date later than the current checkout date.</span>
              </div>
            )}

            <div className={styles.extendActions}>
              <Button variant="ghost" onClick={() => setExtendModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmExtend}
                disabled={!extendPreview || extendPreview.error || extendMutation.isPending}
              >
                {extendMutation.isPending ? 'Processing...' : 'Approve'}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Checkout / Payment Modal */}
      <Modal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        title={issuedBill ? 'Payment Complete' : `Checkout: ${selectedBooking?.number || ''}`}
      >
        {selectedBooking && !issuedBill && (
          <div>
            <div className={styles.checkoutSummary}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Guest:</span>
                <span className={styles.detailValue}>
                  {selectedBooking.CreditCard?.Tourist?.name || 'N/A'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Room:</span>
                <span className={styles.detailValue}>
                  #{selectedBooking.Room?.number} · {selectedBooking.Room?.Hotel?.name}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Stay Period:</span>
                <span className={styles.detailValue}>
                  {formatDate(selectedBooking.checkInDate)} - {formatDate(selectedBooking.checkOutDate)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Amount Due:</span>
                <span className={styles.amountDue}>
                  {formatCurrency(selectedBooking.totalCost)}
                </span>
              </div>
            </div>

            <p className={styles.paymentLabel}>Select Payment Method</p>
            <div className={styles.paymentOptions}>
              <button
                type="button"
                className={`${styles.paymentOption} ${paymentMethod === 'Card' ? styles.paymentOptionSelected : ''}`}
                onClick={() => setPaymentMethod('Card')}
              >
                <CreditCard size={28} />
                <span>Card</span>
              </button>
              <button
                type="button"
                className={`${styles.paymentOption} ${paymentMethod === 'Cash' ? styles.paymentOptionSelected : ''}`}
                onClick={() => setPaymentMethod('Cash')}
              >
                <Banknote size={28} />
                <span>Cash</span>
              </button>
            </div>

            {checkOutMutation.isError && (
              <p className={styles.extendError}>
                {checkOutMutation.error?.message || 'Checkout failed'}
              </p>
            )}

            <div className={styles.extendActions}>
              <Button variant="ghost" onClick={() => setCheckoutModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmCheckout}
                disabled={!paymentMethod || checkOutMutation.isPending}
              >
                {checkOutMutation.isPending
                  ? 'Processing...'
                  : `Pay ${formatCurrency(selectedBooking.totalCost)}`}
              </Button>
            </div>
          </div>
        )}

        {issuedBill && (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>
              <CheckCircle size={48} />
            </div>
            <h3 className={styles.successTitle}>Payment Successful</h3>
            <p className={styles.successSub}>Paid via {issuedBill.paymentMethod}</p>

            <div className={styles.billCard}>
              <div className={styles.billCardTitle}>
                <Receipt size={16} />
                <span>Invoice Issued</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Bill Number:</span>
                <span className={styles.detailValue}>#{issuedBill.billNumber}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Total Paid:</span>
                <span className={styles.detailValue} style={{ color: 'var(--green)', fontWeight: 'bold' }}>
                  {formatCurrency(issuedBill.totalPaid)}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={() => setCheckoutModalOpen(false)}
              className={styles.fullWidthBtn}
            >
              Done
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StayManagementPage
