import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { MapPin, Bed, SearchX } from 'lucide-react'
import { hotelsApi } from '../api/hotels'
import { roomsApi } from '../api/rooms'
import { ROOM_TYPES } from '../utils/constants'
import { getMinDate } from '../utils/formatters'
import { useToast } from '../hooks/useToast'
import Header from '../components/layout/Header'
import Card from '../components/common/Card'
import Select from '../components/common/Select'
import Input from '../components/common/Input'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import StarRating from '../components/common/StarRating'
import EmptyState from '../components/common/EmptyState'
import styles from './SearchAvailabilityPage.module.css'

function SearchAvailabilityPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useToast()

  const [hotelId, setHotelId] = useState('all')
  const [roomType, setRoomType] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const { data: hotels = [], isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: hotelsApi.getAll
  })

  const searchQuery = useQuery({
    queryKey: ['rooms', 'search', { hotelId, roomType, dateFrom, dateTo }],
    queryFn: () => roomsApi.search({
      hotelId: hotelId !== 'all' ? hotelId : undefined,
      type: roomType || undefined,
      from: dateFrom || undefined,
      to: dateTo || undefined
    }),
    enabled: true
  })

  useEffect(() => {
    const hotelName = searchParams.get('hotel')
    if (hotelName && hotels.length > 0) {
      const hotel = hotels.find(h => h.name === hotelName)
      if (hotel) {
        setHotelId(String(hotel.id))
        setHasSearched(true)
      }
    }
  }, [searchParams, hotels])

  const hotelOptions = useMemo(() => [
    { value: 'all', label: 'All Hotels' },
    ...hotels.map(h => ({ value: String(h.id), label: h.name }))
  ], [hotels])

  const isFilterComplete = useMemo(() => {
    return hotelId !== 'all' && dateFrom && dateTo && roomType
  }, [hotelId, dateFrom, dateTo, roomType])

  const handleSearch = () => {
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      showToast('Check-out date must be after check-in date!', 'error')
      return
    }
    setHasSearched(true)
    searchQuery.refetch()
  }

  const handleReset = () => {
    setHotelId('all')
    setRoomType('')
    setDateFrom('')
    setDateTo('')
    setHasSearched(false)
  }

  const goToBooking = (roomId) => {
    const params = new URLSearchParams()
    params.append('roomId', roomId)
    if (dateFrom) params.append('from', dateFrom)
    if (dateTo) params.append('to', dateTo)
    navigate(`/booking?${params.toString()}`)
  }

  if (hotelsLoading) return <Loading />

  const rooms = searchQuery.data || []

  return (
    <div>
      <Header
        title="Search Availability"
        subtitle="Find available rooms across all hotels"
      />

      <Card className={styles.searchCard}>
        <div className={styles.searchForm}>
          <Select
            label="Hotel"
            name="hotel"
            value={hotelId}
            onChange={(e) => setHotelId(e.target.value)}
            options={hotelOptions}
          />

          <div className={styles.dateGroup}>
            <Input
              label="Date From"
              type="date"
              name="dateFrom"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              min={getMinDate()}
            />
            <span className={styles.dateSeparator}>—</span>
            <Input
              label="Date To"
              type="date"
              name="dateTo"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || getMinDate()}
            />
          </div>

          <Select
            label="Room Type"
            name="roomType"
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            options={ROOM_TYPES}
            placeholder="Select type"
          />

          <div className={styles.actions}>
            <Button variant="primary" onClick={handleSearch}>
              Search
            </Button>
            {hasSearched && (
              <Button variant="ghost" onClick={handleReset}>
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className={styles.resultsHeader}>
        <h2 className={styles.resultsTitle}>
          {hasSearched ? 'Search Results' : 'All Available Rooms'}
        </h2>
        <span className={styles.resultsCount}>
          {rooms.length} rooms available
        </span>
      </div>

      {searchQuery.isLoading ? (
        <Loading />
      ) : rooms.length === 0 ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title="No rooms available"
            message="No rooms match the selected criteria. Try different dates or another hotel."
          />
        </Card>
      ) : (
        <div className={styles.roomsList}>
          {rooms.map(room => (
            <Card key={room.id} className={styles.roomCard}>
              <div className={styles.roomInfo}>
                <div className={styles.hotelHeader}>
                  <h4 className={styles.hotelName}>{room.Hotel?.name || 'Unknown Hotel'}</h4>
                  <StarRating count={room.Hotel?.numberOfStars || 0} size={14} />
                </div>
                <div className={styles.location}>
                  <MapPin size={14} />
                  {room.Hotel?.address || 'No address provided'}
                </div>
                <div className={styles.roomDetails}>
                  <span className={styles.roomType}>
                    <Bed size={14} />
                    {room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room
                  </span>
                  <span>Room #{room.number}</span>
                </div>
              </div>

              <div className={styles.priceSection}>
                <div className={styles.priceBox}>
                  <span className={styles.priceLabel}>Price per night</span>
                  <span className={styles.priceValue}>${room.price}</span>
                </div>
                <Button
                  variant="primary"
                  disabled={!isFilterComplete}
                  onClick={() => goToBooking(room.id)}
                >
                  Book Room
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchAvailabilityPage
