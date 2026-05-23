import { useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Calendar } from 'lucide-react'
import { roomsApi } from '../api/rooms'
import { bookingsApi } from '../api/bookings'
import { couponsApi } from '../api/coupons'
import { calculateNights, formatCurrency } from '../utils/formatters'
import { useToast } from '../hooks/useToast'
import Header from '../components/layout/Header'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import styles from './BookingPage.module.css'

function BookingPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  const roomId = searchParams.get('roomId')
  const dateFrom = searchParams.get('from') || ''
  const dateTo = searchParams.get('to') || ''

  const [guestName, setGuestName] = useState('')
  const [personalId, setPersonalId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [selectedServices, setSelectedServices] = useState([])
  const [couponCode, setCouponCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [couponMessage, setCouponMessage] = useState({ text: '', isError: false })

  const { data: room, isLoading, error } = useQuery({
    queryKey: ['rooms', roomId],
    queryFn: () => roomsApi.getById(roomId),
    enabled: !!roomId
  })

  const createBooking = useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: (data) => {
      showToast(`Booking ${data.bookingNumber} confirmed!`, 'success')
      navigate('/stays')
    },
    onError: (error) => {
      showToast(error.message || 'Booking failed', 'error')
    }
  })

  useEffect(() => {
    if (!roomId) {
      showToast('Missing Room ID. Returning to catalog…', 'error')
      navigate('/hotels')
    }
  }, [roomId, navigate, showToast])

  const nights = useMemo(() => {
    if (dateFrom && dateTo) {
      return calculateNights(dateFrom, dateTo)
    }
    return 1
  }, [dateFrom, dateTo])

  const pricing = useMemo(() => {
    if (!room) return { base: 0, services: 0, subtotal: 0, discount: 0, total: 0 }

    const basePrice = parseFloat(room.price) * nights
    const servicesPrice = selectedServices.reduce((sum, sId) => {
      const service = room.Hotel?.hotelServices?.find(s => s.id === sId)
      return sum + (service ? parseFloat(service.price) : 0)
    }, 0) * nights

    const subtotal = basePrice + servicesPrice
    const discountAmount = (subtotal * discountPercent) / 100
    const total = subtotal - discountAmount

    return {
      base: basePrice,
      services: servicesPrice,
      subtotal,
      discount: discountAmount,
      total
    }
  }, [room, nights, selectedServices, discountPercent])

  const handleServiceToggle = (serviceId) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    try {
      const data = await couponsApi.validate(couponCode.trim())
      setDiscountPercent(data.percentage)
      setCouponMessage({ text: `Coupon applied! -${data.percentage}%`, isError: false })
    } catch (err) {
      setDiscountPercent(0)
      setCouponMessage({ text: err.message || 'Invalid coupon', isError: true })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    createBooking.mutate({
      roomId: parseInt(roomId),
      checkInDate: dateFrom,
      checkOutDate: dateTo,
      tourist: {
        CNP: personalId,
        name: guestName
      },
      payment: {
        cardNumber: cardNumber.replace(/\s/g, ''),
        expiryDate: expiry,
        cvv: cvv
      },
      services: selectedServices,
      couponCode: discountPercent > 0 ? couponCode.trim() : null
    })
  }

  if (isLoading) return <Loading />

  if (error || !room) {
    return (
      <div className={styles.error}>
        <p>Failed to load room details</p>
        <Button onClick={() => navigate('/search')}>Back to Search</Button>
      </div>
    )
  }

  const hotel = room.Hotel || {}
  const services = hotel.hotelServices || []

  return (
    <div>
      <Header
        title="New Booking"
        subtitle={`Booking for ${hotel.name}`}
      />

      {/* Selected Room Card */}
      <Card variant="blue" className={styles.roomCard}>
        <div className={styles.roomInfo}>
          <div>
            <h3 className={styles.roomType}>
              {room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room (Number #{room.number})
            </h3>
            <p className={styles.hotelName}>{hotel.name}</p>
            {dateFrom && dateTo && (
              <p className={styles.dates}>
                <Calendar size={14} />
                {dateFrom} — {dateTo} ({nights} nights)
              </p>
            )}
          </div>
          <div className={styles.pricePerNight}>
            ${room.price}<span>/night</span>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGrid}>
          <div className={styles.leftColumn}>
            {/* Tourist Information */}
            <Card>
              <h3 className={styles.sectionTitle}>Tourist Information</h3>
              <div className={styles.formFields}>
                <Input
                  label="Full Name"
                  name="name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                />
                <Input
                  label="ID Number (CNP)"
                  name="personalId"
                  value={personalId}
                  onChange={(e) => setPersonalId(e.target.value)}
                  required
                />
              </div>

              {services.length > 0 && (
                <>
                  <h4 className={styles.servicesTitle}>Additional Services</h4>
                  <div className={styles.servicesList}>
                    {services.map(service => (
                      <label key={service.id} className={styles.serviceItem}>
                        <input
                          type="checkbox"
                          checked={selectedServices.includes(service.id)}
                          onChange={() => handleServiceToggle(service.id)}
                        />
                        <span>{service.name} (+${service.price}/day)</span>
                      </label>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Payment Details */}
            <Card>
              <h3 className={styles.sectionTitle}>Payment Details</h3>
              <div className={styles.formFields}>
                <Input
                  label="Credit Card Number"
                  name="cardNumber"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  required
                />
                <div className={styles.paymentRow}>
                  <Input
                    label="Expiry Date"
                    name="expiry"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    required
                  />
                  <Input
                    label="CVV"
                    name="cvv"
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    required
                  />
                </div>
              </div>
            </Card>

            {/* Promo Code */}
            <Card>
              <h3 className={styles.sectionTitle}>Promo Code</h3>
              <div className={styles.couponRow}>
                <Input
                  name="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter coupon code"
                />
                <Button type="button" variant="outline" onClick={handleApplyCoupon}>
                  Apply
                </Button>
              </div>
              {couponMessage.text && (
                <p className={couponMessage.isError ? styles.couponError : styles.couponSuccess}>
                  {couponMessage.text}
                </p>
              )}
            </Card>
          </div>

          <div className={styles.rightColumn}>
            {/* Booking Summary */}
            <Card variant="blue" className={styles.summaryCard}>
              <h3 className={styles.sectionTitle}>Booking Summary</h3>

              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Hotel:</span>
                <span className={styles.summaryValue}>{hotel.name}</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Room:</span>
                <span className={styles.summaryValue}>{room.type} (#{room.number})</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Stay Duration:</span>
                <span className={styles.summaryValue}>{nights} nights</span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryLabel}>Guest:</span>
                <span className={styles.summaryValue}>{guestName || '—'}</span>
              </div>

              {selectedServices.length > 0 && (
                <div className={styles.servicesSection}>
                  {selectedServices.map(sId => {
                    const service = services.find(s => s.id === sId)
                    return service ? (
                      <div key={sId} className={styles.serviceSummaryItem}>
                        <span>+ {service.name}</span>
                        <span>${service.price}/day</span>
                      </div>
                    ) : null
                  })}
                </div>
              )}

              {discountPercent > 0 && (
                <div className={styles.discountRow}>
                  <span>Discount:</span>
                  <strong>-{formatCurrency(pricing.discount)}</strong>
                </div>
              )}

              <div className={styles.totalRow}>
                <span>Total Amount:</span>
                <strong className={styles.totalValue}>{formatCurrency(pricing.total)}</strong>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className={styles.actionButtons}>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? 'Processing...' : 'Confirm Booking'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default BookingPage
