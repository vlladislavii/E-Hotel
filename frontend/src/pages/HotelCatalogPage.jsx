import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { MapPin, Search } from 'lucide-react'
import { hotelsApi } from '../api/hotels'
import Header from '../components/layout/Header'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import styles from './HotelCatalogPage.module.css'

const STAR_FILTERS = [5, 4, 3]
const AMENITY_FILTERS = ['Breakfast', 'Parking', 'Gym', 'Internet', 'Dinner']

function HotelCatalogPage() {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState('')
  const [selectedStars, setSelectedStars] = useState([])
  const [selectedAmenities, setSelectedAmenities] = useState([])

  const { data: hotels = [], isLoading, error } = useQuery({
    queryKey: ['hotels'],
    queryFn: hotelsApi.getAll
  })

  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      const name = (hotel.name || '').toLowerCase()
      const address = (hotel.address || '').toLowerCase()
      const stars = hotel.numberOfStars || 0
      const services = hotel.hotelServices || []

      const matchesSearch = searchText === '' ||
        name.includes(searchText.toLowerCase()) ||
        address.includes(searchText.toLowerCase())

      const matchesStars = selectedStars.length === 0 ||
        selectedStars.includes(stars)

      const matchesAmenities = selectedAmenities.length === 0 ||
        selectedAmenities.every(amenity =>
          services.some(s => (s.name || '').toLowerCase().includes(amenity.toLowerCase()))
        )

      return matchesSearch && matchesStars && matchesAmenities
    })
  }, [hotels, searchText, selectedStars, selectedAmenities])

  const handleStarChange = (star) => {
    setSelectedStars(prev =>
      prev.includes(star)
        ? prev.filter(s => s !== star)
        : [...prev, star]
    )
  }

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    )
  }

  const clearFilters = () => {
    setSearchText('')
    setSelectedStars([])
    setSelectedAmenities([])
  }

  const goToSearch = (hotelName) => {
    navigate(`/search?hotel=${encodeURIComponent(hotelName)}`)
  }

  if (isLoading) return <Loading />

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error loading hotels. Please try again later.</p>
      </div>
    )
  }

  return (
    <div>
      <Header
        title="Hotel Catalog"
        subtitle="Browse all resort hotels and services"
      />

      <div className={styles.layout}>
        <aside className={styles.filtersSidebar}>
          <div className={styles.filterGroup}>
            <h4>Star Rating</h4>
            {STAR_FILTERS.map(star => (
              <label key={star} className={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={selectedStars.includes(star)}
                  onChange={() => handleStarChange(star)}
                />
                {'⭐'.repeat(star)}
              </label>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <h4>Amenities</h4>
            {AMENITY_FILTERS.map(amenity => (
              <label key={amenity} className={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity)}
                  onChange={() => handleAmenityChange(amenity)}
                />
                {amenity}
              </label>
            ))}
          </div>

          <Button variant="ghost" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </aside>

        <main className={styles.main}>
          <div className={styles.searchBar}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search hotels by name or address..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {filteredHotels.length === 0 ? (
            <div className={styles.noResults}>
              No hotels found matching your filters.
            </div>
          ) : (
            <div className={styles.grid}>
              {filteredHotels.map(hotel => (
                <Card key={hotel.id} className={styles.hotelCard}>
                  <h3 className={styles.hotelName}>{hotel.name}</h3>
                  <div className={styles.stars}>
                    {'⭐'.repeat(hotel.numberOfStars || 0)}
                  </div>
                  <p className={styles.address}>
                    <MapPin size={12} />
                    {hotel.address}
                  </p>
                  <div className={styles.services}>
                    {(hotel.hotelServices || []).map(service => (
                      <span key={service.id} className={styles.serviceTag}>
                        ✓ {service.name}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    onClick={() => goToSearch(hotel.name)}
                    className={styles.viewBtn}
                  >
                    View Available Rooms
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default HotelCatalogPage
